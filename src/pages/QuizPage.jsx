import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Zap,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Clock,
  Flag,
  BookmarkCheck,
  Check,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { SectionHeading } from '../components/ui/SectionHeading';
import { questionBank, getQuestions, getQuestionFilters } from '../data/questions';

export function QuizPage({ data }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    exam: 'All exams',
    subject: 'All subjects',
    topic: params.get('topic') || 'All topics',
    difficulty: 'Adaptive',
    count: 5,
    mode: 'Practice', // 'Practice' or 'Mock Exam'
    negativeMarking: true,
  });

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('All');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState('');

  // Mock exam timer
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const finishQuizRef = useRef(null);

  const filters = getQuestionFilters();

  const finishQuiz = useCallback((autoSubmitted = false) => {
    setShowConfirmModal(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (!quiz) return;

    let correctCount = 0;
    let incorrectCount = 0;
    let scoreTotal = 0;

    quiz.forEach((q, idx) => {
      const selected = answers[idx];
      if (selected !== undefined) {
        if (selected === q.correctAnswer) {
          correctCount++;
          scoreTotal += settings.negativeMarking ? 4 : 1;
        } else {
          incorrectCount++;
          scoreTotal += settings.negativeMarking ? -1 : 0;
        }
      }
    });

    const maxScore = quiz.length * (settings.negativeMarking ? 4 : 1);
    const percentage = Math.max(0, Math.round((correctCount / quiz.length) * 100));

    const attempt = {
      id: `attempt-${Date.now()}`,
      title: `${settings.subject === 'All subjects' ? settings.exam : settings.subject} ${settings.mode}`,
      subject: settings.subject === 'All subjects' ? (quiz[0]?.subject || 'General') : settings.subject,
      score: percentage,
      rawScore: scoreTotal,
      maxScore,
      correctCount,
      incorrectCount,
      unansweredCount: quiz.length - (correctCount + incorrectCount),
      total: quiz.length,
      mode: settings.mode,
      date: new Date().toISOString(),
      questions: quiz.map((q, idx) => ({
        ...q,
        selected: answers[idx],
        correct: answers[idx] === q.correctAnswer,
        unanswered: answers[idx] === undefined,
      })),
    };

    data.setAttempts([attempt, ...data.attempts]);
    setSubmitted(true);
    if (autoSubmitted) {
      data.notify('Mock Exam time expired! Auto-submitted successfully.');
    } else {
      data.notify('Quiz submitted! Results calculated.');
    }
  }, [quiz, answers, settings, data]);

  useEffect(() => {
    finishQuizRef.current = finishQuiz;
  }, [finishQuiz]);

  const startQuiz = () => {
    setError('');
    const effectiveDiff =
      settings.difficulty === 'Adaptive'
        ? data.personalization.recommendedDifficulty
        : settings.difficulty;

    const selectedQuestions = getQuestions({
      exam: settings.exam,
      subject: settings.subject,
      topic: settings.topic,
      difficulty: effectiveDiff,
      count: Number(settings.count),
      seed: Date.now(),
    });

    if (!selectedQuestions.length) {
      setError('No questions match these filters. Try selecting "All exams" or "All topics".');
      return;
    }

    setQuiz(selectedQuestions);
    setAnswers({});
    setMarked({});
    setCurrent(0);
    setSubmitted(false);

    if (settings.mode === 'Mock Exam') {
      const allocatedSeconds = selectedQuestions.length * 90; // 1.5 minutes per question
      setTimeLeft(allocatedSeconds);
    } else {
      setTimeLeft(0);
    }
  };

  // Timer countdown for Mock Exam
  useEffect(() => {
    if (settings.mode !== 'Mock Exam' || !quiz || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          finishQuizRef.current?.(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [quiz, submitted, settings.mode]);

  const selectAnswer = (idx) => {
    setAnswers({ ...answers, [current]: idx });
  };

  const toggleMarkForReview = (idx = current) => {
    setMarked({ ...marked, [idx]: !marked[idx] });
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!quiz) {
    return (
      <div>
        <div className="page-intro">
          <div>
            <span className="eyebrow">PRACTICE & MOCK EXAM LAB</span>
            <h1>Turn deliberate practice into exam mastery.</h1>
            <p>
              Curated questions with adaptive difficulty, live countdown timers, and in-depth error
              classification.
            </p>
          </div>
          <Badge tone="amber">
            <Zap size={13} /> {questionBank.length}+ Questions in Bank
          </Badge>
        </div>

        <Card className="quiz-setup">
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button
              type="button"
              className={`choice-chip ${settings.mode === 'Practice' ? 'selected' : ''}`}
              onClick={() => setSettings({ ...settings, mode: 'Practice' })}
            >
              Practice Mode (Untimed)
            </button>
            <button
              type="button"
              className={`choice-chip ${settings.mode === 'Mock Exam' ? 'selected' : ''}`}
              onClick={() => setSettings({ ...settings, mode: 'Mock Exam' })}
            >
              Mock Exam Mode (Timed + Nav Palette)
            </button>
          </div>

          <div className="form-grid quiz-fields">
            <label className="field">
              <span>Exam</span>
              <select
                value={settings.exam}
                onChange={(e) => setSettings({ ...settings, exam: e.target.value })}
              >
                <option>All exams</option>
                {filters.exams.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Subject</span>
              <select
                value={settings.subject}
                onChange={(e) => setSettings({ ...settings, subject: e.target.value })}
              >
                <option>All subjects</option>
                {filters.subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Topic</span>
              <select
                value={settings.topic}
                onChange={(e) => setSettings({ ...settings, topic: e.target.value })}
              >
                <option>All topics</option>
                {filters.topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Difficulty</span>
              <select
                value={settings.difficulty}
                onChange={(e) => setSettings({ ...settings, difficulty: e.target.value })}
              >
                {['Adaptive', 'Easy', 'Medium', 'Hard'].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Questions</span>
              <select
                value={settings.count}
                onChange={(e) => setSettings({ ...settings, count: Number(e.target.value) })}
              >
                {[3, 5, 8, 10, 15, 20].map((num) => (
                  <option key={num} value={num}>
                    {num} questions
                  </option>
                ))}
              </select>
            </label>

            {settings.mode === 'Mock Exam' && (
              <label className="field">
                <span>Scoring Format</span>
                <select
                  value={settings.negativeMarking ? 'jee' : 'standard'}
                  onChange={(e) =>
                    setSettings({ ...settings, negativeMarking: e.target.value === 'jee' })
                  }
                >
                  <option value="jee">JEE/NEET (+4 correct, -1 incorrect)</option>
                  <option value="standard">Standard (+1 correct, 0 incorrect)</option>
                </select>
              </label>
            )}
          </div>

          {error && (
            <div className="form-error">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <div style={{ marginTop: 22 }}>
            <Button icon={Play} onClick={startQuiz}>
              {settings.mode === 'Mock Exam' ? 'Start Timed Mock Exam' : 'Begin Practice Set'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Submitted view / Results review
  if (submitted) {
    const correctCount = quiz.filter((q, idx) => answers[idx] === q.correctAnswer).length;
    const score = Math.round((correctCount / quiz.length) * 100);

    const errorBreakdown = {
      'concept gap': 0,
      'careless mistake': 0,
      'formula memory': 0,
      'unanswered': 0,
    };

    quiz.forEach((q, idx) => {
      if (answers[idx] === undefined) {
        errorBreakdown['unanswered']++;
      } else if (answers[idx] !== q.correctAnswer) {
        const type = q.commonMistakeType || 'concept gap';
        errorBreakdown[type] = (errorBreakdown[type] || 0) + 1;
      }
    });

    const filteredReview = quiz
      .map((q, idx) => ({ q, idx }))
      .filter(({ q, idx }) => {
        if (reviewFilter === 'All') return true;
        if (reviewFilter === 'Correct') return answers[idx] === q.correctAnswer;
        if (reviewFilter === 'Incorrect') return answers[idx] !== q.correctAnswer && answers[idx] !== undefined;
        if (reviewFilter === 'Unanswered') return answers[idx] === undefined;
        if (reviewFilter === 'Concept Gap')
          return answers[idx] !== q.correctAnswer && q.commonMistakeType === 'concept gap';
        if (reviewFilter === 'Careless Mistake')
          return answers[idx] !== q.correctAnswer && q.commonMistakeType === 'careless mistake';
        return true;
      });

    return (
      <div>
        <div className="page-intro">
          <div>
            <span className="eyebrow">SET COMPLETE</span>
            <h1>
              {score >= 80 ? 'Outstanding performance!' : score >= 50 ? 'Solid progress.' : 'Clear areas to strengthen.'}
            </h1>
            <p>
              You got {correctCount} out of {quiz.length} questions correct ({score}% accuracy).
            </p>
          </div>
          <Badge tone={score >= 75 ? 'teal' : score >= 50 ? 'amber' : 'red'}>
            {score}% overall score
          </Badge>
        </div>

        {/* Error Classification Summary */}
        <div className="stat-grid" style={{ marginBottom: 20 }}>
          <Card className="stat-card">
            <div className="stat-icon teal"><CheckCircle2 size={19} /></div>
            <div>
              <span>Correct</span>
              <strong>{correctCount}</strong>
              <small>solid understanding</small>
            </div>
          </Card>
          <Card className="stat-card">
            <div className="stat-icon amber"><AlertCircle size={19} /></div>
            <div>
              <span>Careless Mistakes</span>
              <strong>{errorBreakdown['careless mistake']}</strong>
              <small>execution checks needed</small>
            </div>
          </Card>
          <Card className="stat-card">
            <div className="stat-icon orange"><Zap size={19} /></div>
            <div>
              <span>Concept Gaps</span>
              <strong>{errorBreakdown['concept gap']}</strong>
              <small>core theory revision</small>
            </div>
          </Card>
          <Card className="stat-card">
            <div className="stat-icon indigo"><Clock size={19} /></div>
            <div>
              <span>Unanswered</span>
              <strong>{errorBreakdown['unanswered']}</strong>
              <small>time management</small>
            </div>
          </Card>
        </div>

        <Card className="review-card">
          <SectionHeading
            eyebrow="DETAILED QUESTION REVIEW"
            title="Reasoning & Explanations"
            action={
              <div className="segmented">
                {['All', 'Correct', 'Incorrect', 'Concept Gap', 'Careless Mistake'].map((item) => (
                  <button
                    className={reviewFilter === item ? 'selected' : ''}
                    key={item}
                    onClick={() => setReviewFilter(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            }
          />

          <div style={{ marginTop: 20 }}>
            {filteredReview.map(({ q, idx }) => {
              const chosen = answers[idx];
              const isCorrect = chosen === q.correctAnswer;
              const isUnanswered = chosen === undefined;

              return (
                <div className="review-item" key={q.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: '#35415a' }}>
                        Q{idx + 1}.
                      </span>
                      <Badge tone={isCorrect ? 'teal' : isUnanswered ? 'neutral' : 'amber'}>
                        {isCorrect ? 'Correct' : isUnanswered ? 'Skipped' : q.commonMistakeType || 'Incorrect'}
                      </Badge>
                      <Badge tone="indigo">{q.subject}</Badge>
                      <small style={{ color: '#8d99aa' }}>{q.topic}</small>
                    </div>
                  </div>

                  <h3>{q.question}</h3>

                  <div style={{ margin: '10px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {q.options.map((opt, oIdx) => {
                      const isOptionCorrect = oIdx === q.correctAnswer;
                      const isOptionSelected = oIdx === chosen;
                      return (
                        <div
                          key={opt}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 6,
                            fontSize: 12,
                            background: isOptionCorrect
                              ? '#e4faf7'
                              : isOptionSelected
                              ? '#ffebee'
                              : '#f8f9fb',
                            border: `1px solid ${
                              isOptionCorrect
                                ? '#2dd4bf'
                                : isOptionSelected
                                ? '#e45d6b'
                                : '#e8ecf4'
                            }`,
                            color: isOptionCorrect ? '#14746f' : isOptionSelected ? '#c62828' : '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>{String.fromCharCode(65 + oIdx)}.</span>
                          <span>{opt}</span>
                          {isOptionCorrect && <Check size={14} style={{ marginLeft: 'auto' }} />}
                        </div>
                      );
                    })}
                  </div>

                  <p style={{ marginTop: 8 }}>
                    <strong>Explanation: </strong>
                    {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <Button variant="secondary" icon={RotateCcw} onClick={() => setQuiz(null)}>
            New practice set
          </Button>
          <Button icon={Play} onClick={() => navigate('/chat')}>
            Discuss with AI Tutor
          </Button>
        </div>
      </div>
    );
  }

  // Active Runner View
  const question = quiz[current];
  const progressPercent = Math.round(((current + 1) / quiz.length) * 100);
  const answeredCount = Object.keys(answers).length;

  return (
    <div>
      <div className="page-intro">
        <div>
          <span className="eyebrow">
            QUESTION {current + 1} OF {quiz.length} · {settings.mode.toUpperCase()}
          </span>
          <h1>Stay focused, stay precise.</h1>
        </div>

        {settings.mode === 'Mock Exam' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: timeLeft < 120 ? '#ffeaed' : '#f0f1ff',
              color: timeLeft < 120 ? '#e45d6b' : '#5b5bf7',
              padding: '8px 14px',
              borderRadius: 8,
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            <Clock size={16} />
            <span>Time Left: {formatTimer(timeLeft)}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18 }}>
        <Card className="quiz-runner" style={{ margin: 0, maxWidth: '100%' }}>
          <ProgressBar value={progressPercent} color="indigo" />

          <div className="question-meta" style={{ marginTop: 20 }}>
            <Badge tone="indigo">{question.subject}</Badge>
            <Badge tone="amber">{question.topic}</Badge>
            <Badge>{question.difficulty}</Badge>
            {marked[current] && <Badge tone="red">Marked for Review</Badge>}
          </div>

          <h2 style={{ marginTop: 14 }}>{question.question}</h2>

          <div className="answer-options" style={{ marginTop: 20 }}>
            {question.options.map((option, idx) => (
              <button
                className={`answer-option ${answers[current] === idx ? 'selected' : ''}`}
                key={option}
                onClick={() => selectAnswer(idx)}
              >
                <span>{String.fromCharCode(65 + idx)}</span>
                {option}
                {answers[current] === idx && <Check size={16} />}
              </button>
            ))}
          </div>

          <div className="quiz-controls" style={{ marginTop: 30 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                variant="ghost"
                icon={ChevronLeft}
                disabled={current === 0}
                onClick={() => setCurrent(current - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                icon={Flag}
                onClick={() => toggleMarkForReview(current)}
              >
                {marked[current] ? 'Unmark' : 'Mark for Review'}
              </Button>
            </div>

            {current < quiz.length - 1 ? (
              <Button icon={ChevronRight} onClick={() => setCurrent(current + 1)}>
                Next
              </Button>
            ) : (
              <Button
                icon={CheckCircle2}
                onClick={() => setShowConfirmModal(true)}
              >
                Submit set
              </Button>
            )}
          </div>
        </Card>

        {/* Interactive Question Palette */}
        <Card style={{ padding: 18, height: 'fit-content' }}>
          <SectionHeading eyebrow="PALETTE" title="Questions" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
              marginTop: 14,
            }}
          >
            {quiz.map((q, idx) => {
              const isAnswered = answers[idx] !== undefined;
              const isCurrent = current === idx;
              const isMarked = marked[idx];

              let bg = '#f4f6fb';
              let color = '#475569';
              let borderColor = '#e2e8f0';

              if (isMarked) {
                bg = '#fff4db';
                color = '#ae781d';
                borderColor = '#f6b84b';
              } else if (isAnswered) {
                bg = '#e4faf7';
                color = '#14746f';
                borderColor = '#2dd4bf';
              }

              if (isCurrent) {
                borderColor = '#5b5bf7';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrent(idx)}
                  style={{
                    border: `2px solid ${borderColor}`,
                    background: bg,
                    color: color,
                    fontWeight: 700,
                    borderRadius: 7,
                    height: 38,
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isCurrent ? '0 0 0 2px rgba(91,91,247,0.3)' : 'none',
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 18,
              fontSize: 10,
              color: '#718096',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, background: '#e4faf7', border: '1px solid #2dd4bf', borderRadius: 2 }} />
              <span>Answered ({answeredCount})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, background: '#fff4db', border: '1px solid #f6b84b', borderRadius: 2 }} />
              <span>Marked for review ({Object.values(marked).filter(Boolean).length})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, background: '#f4f6fb', border: '1px solid #e2e8f0', borderRadius: 2 }} />
              <span>Not answered ({quiz.length - answeredCount})</span>
            </div>
          </div>

          <div style={{ marginTop: 22 }}>
            <Button
              className="button-full"
              style={{ width: '100%' }}
              icon={BookmarkCheck}
              onClick={() => setShowConfirmModal(true)}
            >
              Submit test
            </Button>
          </div>
        </Card>
      </div>

      {showConfirmModal && (
        <Modal title="Submit practice set?" onClose={() => setShowConfirmModal(false)}>
          <p style={{ lineHeight: 1.6, color: '#475569' }}>
            You have answered <strong>{answeredCount}</strong> of <strong>{quiz.length}</strong> questions.
            {quiz.length - answeredCount > 0 && (
              <span style={{ display: 'block', marginTop: 8, color: '#e45d6b' }}>
                ⚠️ You still have {quiz.length - answeredCount} unanswered question(s).
              </span>
            )}
          </p>

          <div className="modal-actions" style={{ marginTop: 20 }}>
            <Button variant="ghost" onClick={() => setShowConfirmModal(false)}>
              Keep answering
            </Button>
            <Button icon={CheckCircle2} onClick={() => finishQuiz(false)}>
              Confirm & Submit
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default QuizPage;
