function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function average(values, fallback = 50) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;
}

export function calculatePersonalization({ profile, tasks = [], attempts = [], studySessions = [], diagnostic = null, questions = [] }) {
  const subjects = profile?.subjects?.length ? profile.subjects : ['Mathematics', 'Physics', 'Chemistry'];
  const mastery = Object.fromEntries(subjects.map((subject) => {
    const confidence = Number(profile?.confidence?.[subject] ?? 50);
    const subjectAttempts = attempts.filter((attempt) => attempt.subject === subject || attempt.subjects?.includes(subject));
    const quizScore = average(subjectAttempts.map((attempt) => Number(attempt.score)), confidence);
    const completed = tasks.filter((task) => task.done && task.subject === subject).length;
    return [subject, clamp(confidence * 0.55 + quizScore * 0.35 + Math.min(completed * 3, 10))];
  }));

  const weakSubjects = Object.entries(mastery).sort(([, a], [, b]) => a - b).map(([subject]) => subject).slice(0, 2);
  const topicScores = {};
  attempts.flatMap((attempt) => attempt.questions || []).forEach((answer) => {
    if (!answer.topic) return;
    topicScores[answer.topic] ??= [];
    topicScores[answer.topic].push(answer.correct ? 100 : 0);
  });
  const weakTopics = Object.entries(topicScores).map(([topic, values]) => ({ topic, score: clamp(average(values)) })).sort((a, b) => a.score - b.score).slice(0, 5);
  const overall = average(Object.values(mastery), average(attempts.map((attempt) => Number(attempt.score)), 50));
  const recommendedDifficulty = overall < 50 ? 'Easy' : overall < 75 ? 'Medium' : 'Hard';
  const completedMinutes = tasks.filter((task) => task.done).reduce((sum, task) => sum + Number(task.minutes || task.durationMinutes || 0), 0);
  const focusedMinutes = studySessions.reduce((sum, session) => sum + Number(session.minutes || 0), 0);
  const dailyTarget = Math.max(1, Math.min(12, Number(profile?.dailyHours || 2) + (overall < 55 ? 0.5 : 0)));
  const nextSubject = weakSubjects[0] || subjects[0];
  const nextAction = weakTopics[0] ? `Practice ${weakTopics[0].topic}` : `Complete a ${recommendedDifficulty.toLowerCase()} ${nextSubject} set`;
  const recommendationReason = `Your local score combines profile confidence (55%), recent quiz results (35%), and completed practice (10%). ${nextSubject} is currently the lowest-confidence subject at ${mastery[nextSubject]}%, so the next action targets it at ${recommendedDifficulty} difficulty.`;

  return {
    mastery,
    weakSubjects,
    weakTopics,
    overall: clamp(overall),
    recommendedDifficulty,
    dailyTarget,
    nextAction,
    recommendationReason,
    completedMinutes,
    focusedMinutes,
    diagnostic,
    questionCount: questions.length,
  };
}

export function getAdaptiveDifficulty({ currentDifficulty = 'Medium', wasCorrect }) {
  const order = ['Easy', 'Medium', 'Hard'];
  const index = order.indexOf(currentDifficulty);
  if (wasCorrect) return order[Math.min(order.length - 1, index + 1)];
  return order[Math.max(0, index - 1)];
}

export function buildRecommendationExplanation(result) {
  return `${result.recommendationReason} A ${result.dailyTarget}-hour target keeps the plan aligned with your profile while leaving room for focused review.`;
}

export { clamp };
