import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Play,
  ArrowRight,
  CheckCircle2,
  CalendarDays,
  ListChecks,
  RotateCcw,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SectionHeading } from '../components/ui/SectionHeading';
import { getQuestions } from '../data/questions';
import { getAdaptiveDifficulty } from '../services/personalizationService';

export function Diagnostic({ data }) {
  const { profile, setDiagnostic, notify } = data;
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    exam: profile?.exam || 'JEE',
    subject: profile?.subjects?.[0] || 'Mathematics',
  });

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [difficulty, setDifficulty] = useState('Medium');
  const [result, setResult] = useState(data.diagnostic || null);

  const startDiagnostic = () => {
    const questions = getQuestions({
      exam: settings.exam,
      subject: settings.subject,
      count: 9,
      difficulty: 'Adaptive',
      seed: Date.now(),
    });

    const fallbackQuestions = questions.length
      ? questions
      : getQuestions({ subject: settings.subject, count: 9 });

    setQuiz(fallbackQuestions);
    setAnswers({});
    setCurrent(0);
    setDifficulty('Medium');
    setResult(null);
  };

  const handleSelectOption = (optionIndex) => {
    setAnswers({ ...answers, [current]: optionIndex });
  };

  const handleNext = () => {
    const question = quiz[current];
    const isCorrect = answers[current] === question.correctAnswer;
    const nextDiff = getAdaptiveDifficulty({
      currentDifficulty: question.difficulty,
      wasCorrect: isCorrect,
    });
    setDifficulty(nextDiff);

    if (current === quiz.length - 1) {
      // Calculate results
      const total = quiz.length;
      const correctCount = Object.entries(answers).filter(
        ([idx, chosen]) => chosen === quiz[Number(idx)]?.correctAnswer
      ).length;

      const score = Math.round((correctCount / total) * 100);

      const strengths = [
        ...new Set(
          quiz
            .filter((item, idx) => answers[idx] === item.correctAnswer)
            .map((item) => item.topic)
        ),
      ];

      const weakTopics = [
        ...new Set(
          quiz
            .filter((item, idx) => answers[idx] !== item.correctAnswer)
            .map((item) => item.topic)
        ),
      ];

      const diagnosticResult = {
        score,
        level:
          score >= 80
            ? 'Strong foundation'
            : score >= 55
            ? 'Building confidence'
            : 'Foundation first',
        strengths,
        weakTopics,
        exam: settings.exam,
        subject: settings.subject,
        date: new Date().toISOString(),
      };

      setDiagnostic(diagnosticResult);
      setResult(diagnosticResult);
      notify('Diagnostic complete! Baseline calibration saved.');
    } else {
      setCurrent(current + 1);
    }
  };

  if (result && !quiz) {
    return (
      <div>
        <div className="page-intro">
          <div>
            <span className="eyebrow">DIAGNOSTIC BASELINE</span>
            <h1>{result.level}</h1>
            <p>
              Your local study plan automatically prioritizes topics identified in this diagnostic.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Badge tone="teal">{result.score}% baseline score</Badge>
            <Button
              variant="secondary"
              icon={RotateCcw}
              onClick={() => setResult(null)}
            >
              Retake test
            </Button>
          </div>
        </div>

        <div className="result-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18 }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div className="stat-icon teal">
                <Trophy size={24} />
              </div>
              <div>
                <span className="eyebrow">DIAGNOSTIC SCORE</span>
                <h2 style={{ margin: 0, fontSize: 32 }}>{result.score}%</h2>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <strong>Verified Strengths:</strong>
              <p style={{ marginTop: 4 }}>
                {result.strengths.length
                  ? result.strengths.join(', ')
                  : 'Ready to build new strengths across syllabus.'}
              </p>
            </div>

            <div style={{ marginTop: 14 }}>
              <strong>High-Priority Focus Areas:</strong>
              <p style={{ marginTop: 4, color: '#e45d6b' }}>
                {result.weakTopics.length
                  ? result.weakTopics.join(', ')
                  : 'No critical gaps identified in this set!'}
              </p>
            </div>

            <div style={{ marginTop: 22, display: 'flex', gap: 10 }}>
              <Button icon={CalendarDays} onClick={() => navigate('/study-plan')}>
                Apply to study plan
              </Button>
              <Button
                variant="secondary"
                icon={ListChecks}
                onClick={() => navigate('/quiz')}
              >
                Practice weak topics
              </Button>
            </div>
          </Card>

          <Card>
            <SectionHeading eyebrow="RECOMMENDED NEXT STEP" title="Targeted Weekly Plan" />
            <p style={{ lineHeight: 1.7 }}>
              Focus your initial study blocks on{' '}
              <strong>{result.weakTopics[0] || 'core problem solving'}</strong>. Spend{' '}
              <strong>{data.personalization.dailyTarget} hours daily</strong>, then take a short 5-question
              practice quiz to measure improvement.
            </p>
            <div style={{ marginTop: 20 }}>
              <ProgressBar value={result.score} color="teal" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div>
        <div className="page-intro">
          <div>
            <span className="eyebrow">ADAPTIVE BASELINE CHECK</span>
            <h1>Find your exact starting line.</h1>
            <p>
              A 9-question adaptive diagnostic. Questions get easier or harder in real-time to locate
              your precise concept threshold.
            </p>
          </div>
        </div>

        <Card className="quiz-setup">
          <div className="form-grid quiz-fields">
            <label className="field">
              <span>Exam</span>
              <select
                value={settings.exam}
                onChange={(e) => setSettings({ ...settings, exam: e.target.value })}
              >
                {['JEE', 'NEET', 'CAT', 'UPSC', 'CBSE Board'].map((ex) => (
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
                {(profile?.subjects || ['Mathematics', 'Physics', 'Chemistry']).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ marginTop: 20 }}>
            <Button icon={Play} onClick={startDiagnostic}>
              Begin 9-Question Diagnostic
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const question = quiz[current];
  const progress = Math.round(((current + 1) / quiz.length) * 100);

  return (
    <div>
      <div className="page-intro">
        <div>
          <span className="eyebrow">
            QUESTION {current + 1} OF {quiz.length}
          </span>
          <h1>Show us how you solve.</h1>
          <p>
            Current adaptive tier: <Badge tone="indigo">{difficulty}</Badge>
          </p>
        </div>
      </div>

      <Card className="quiz-runner">
        <ProgressBar value={progress} color="indigo" />

        <div className="question-meta" style={{ marginTop: 20 }}>
          <Badge tone="indigo">{question.subject}</Badge>
          <Badge tone="amber">{question.topic}</Badge>
          <Badge>{question.difficulty}</Badge>
        </div>

        <h2 style={{ marginTop: 14 }}>{question.question}</h2>

        <div className="answer-options" style={{ marginTop: 20 }}>
          {question.options.map((option, idx) => (
            <button
              className={`answer-option ${answers[current] === idx ? 'selected' : ''}`}
              key={option}
              onClick={() => handleSelectOption(idx)}
            >
              <span>{String.fromCharCode(65 + idx)}</span>
              {option}
            </button>
          ))}
        </div>

        <div className="quiz-controls" style={{ marginTop: 28 }}>
          <Button
            disabled={answers[current] === undefined}
            icon={current === quiz.length - 1 ? CheckCircle2 : ArrowRight}
            onClick={handleNext}
          >
            {current === quiz.length - 1 ? 'Calculate my baseline' : 'Next question'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default Diagnostic;
