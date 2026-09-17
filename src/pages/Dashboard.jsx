import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Target,
  Clock3,
  CheckCircle2,
  Flame,
  Activity,
  ArrowRight,
  Plus,
  MessageCircle,
  Upload,
  ListChecks,
  GraduationCap,
  Sparkles,
  ChevronDown,
  Check,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { StatCard } from '../components/ui/StatCard';
import { SectionHeading } from '../components/ui/SectionHeading';
import { buildRecommendationExplanation } from '../services/personalizationService';

export function Dashboard({ data }) {
  const { profile, tasks, setTasks, attempts, personalization, notify } = data;
  const navigate = useNavigate();
  const [why, setWhy] = useState(false);

  const completed = tasks.filter((task) => task.done).length;
  const days = Math.max(0, Math.ceil((new Date(profile.examDate) - new Date()) / 86400000));

  const toggleTask = (id) => {
    const nextTasks = tasks.map((task) =>
      task.id === id
        ? { ...task, done: !task.done, completedAt: !task.done ? new Date().toISOString() : null }
        : task
    );
    setTasks(nextTasks);
    notify('Task updated. Recommendation refreshed.');
  };

  const streakDays = Math.min(99, 3 + completed);

  const avgScore = attempts.length
    ? Math.round(attempts.reduce((sum, a) => sum + Number(a.score || 0), 0) / attempts.length)
    : personalization.overall;

  return (
    <div>
      <div className="page-intro">
        <div>
          <span className="eyebrow">PERSONAL STUDY OS</span>
          <h1>
            Good day, {profile?.name?.split(' ')[0] || 'Learner'}{' '}
            <span className="wave" role="img" aria-label="wave">
              ✦
            </span>
          </h1>
          <p>Small, focused daily study blocks compound into peak exam readiness.</p>
        </div>
        <Button icon={Plus} onClick={() => navigate('/study-plan')}>
          Plan a session
        </Button>
      </div>

      <div className="hero-grid">
        <Card className="welcome-card">
          <div>
            <Badge tone="teal">ADAPTIVE ENGINE ACTIVE</Badge>
            <h2>Your next move is clear.</h2>
            <p>
              {personalization.nextAction}. Current estimated exam readiness is{' '}
              <strong>{personalization.overall}%</strong>.
            </p>
            <Button icon={ArrowRight} onClick={() => navigate('/chat')}>
              Ask your tutor
            </Button>
          </div>
          <div className="hero-orbit" aria-hidden="true">
            <div className="orbit-ring ring-one" />
            <div className="orbit-ring ring-two" />
            <div className="orbit-core">
              <Brain size={28} />
              <span>{personalization.overall}%</span>
              <small>readiness</small>
            </div>
          </div>
        </Card>

        <Card className="countdown-card">
          <div className="card-topline">
            <span>Exam countdown</span>
            <Target size={18} />
          </div>
          <strong className="countdown-number">
            {days}
            <small> days</small>
          </strong>
          <p>{profile.exam} preparation window</p>
          <div className="countdown-line">
            <span>Syllabus pace</span>
            <span>{Math.min(100, personalization.overall + 8)}%</span>
          </div>
          <ProgressBar value={personalization.overall + 8} color="teal" />
        </Card>
      </div>

      <div className="stat-grid">
        <StatCard
          label="Study target"
          value={`${personalization.dailyTarget}h`}
          meta="personalized daily"
          icon={Clock3}
          tone="indigo"
        />
        <StatCard
          label="Tasks complete"
          value={`${completed}/${tasks.length}`}
          meta="in current plan"
          icon={CheckCircle2}
          tone="amber"
        />
        <StatCard
          label="Current streak"
          value={`${streakDays} days`}
          meta="keep showing up"
          icon={Flame}
          tone="orange"
        />
        <StatCard
          label="Avg. quiz score"
          value={`${avgScore}%`}
          meta="from practice sets"
          icon={Activity}
          tone="teal"
        />
      </div>

      <div className="content-grid">
        <Card className="chart-card">
          <SectionHeading
            eyebrow="SMART RECOMMENDATION"
            title={personalization.nextAction}
            action={
              <button className="text-button" onClick={() => setWhy(!why)}>
                {why ? 'Hide explanation' : 'Why this recommendation?'}{' '}
                <ChevronDown size={14} style={{ transform: why ? 'rotate(180deg)' : 'none' }} />
              </button>
            }
          />
          <ProgressBar value={personalization.overall} color="indigo" />
          <p className="recommendation-copy" style={{ marginTop: 12 }}>
            Weak subjects:{' '}
            <strong>{personalization.weakSubjects.join(', ') || 'Building baseline'}</strong>.
            Recommended difficulty:{' '}
            <Badge tone="indigo">{personalization.recommendedDifficulty}</Badge>
          </p>
          {why && (
            <div className="explanation-panel">
              <Sparkles size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{buildRecommendationExplanation(personalization)}</span>
            </div>
          )}
        </Card>

        <Card className="focus-card">
          <SectionHeading
            eyebrow="TODAY'S FOCUS"
            title="Keep the momentum"
            action={
              <button className="text-button" onClick={() => navigate('/study-plan')}>
                Manage tasks
              </button>
            }
          />
          <div className="task-progress">
            <div className="focus-ring">
              <span>
                {completed}/{tasks.length}
              </span>
            </div>
            <div>
              <strong>
                {tasks.length - completed > 0
                  ? `${tasks.length - completed} tasks remaining`
                  : 'All tasks completed!'}
              </strong>
              <p>Click any task to mark it done.</p>
            </div>
          </div>
          <div className="task-list">
            {tasks.slice(0, 4).map((task) => (
              <button
                className={`task-row ${task.done ? 'done' : ''}`}
                key={task.id}
                onClick={() => toggleTask(task.id)}
              >
                <span className="task-check">{task.done && <Check size={13} />}</span>
                <span className="task-info">
                  <strong>{task.title}</strong>
                  <small>
                    {task.subject} · {task.minutes || 30} min
                  </small>
                </span>
                <ArrowRight size={15} />
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="quick-actions">
        <div>
          <span className="eyebrow" style={{ color: '#a0aecd' }}>
            QUICK ACTIONS
          </span>
          <h2>Ready to learn?</h2>
        </div>
        <div className="action-row">
          <Button variant="secondary" icon={MessageCircle} onClick={() => navigate('/chat')}>
            Ask AI Tutor
          </Button>
          <Button variant="secondary" icon={Upload} onClick={() => navigate('/doubt-solver')}>
            Doubt Solver
          </Button>
          <Button variant="secondary" icon={ListChecks} onClick={() => navigate('/quiz')}>
            Start Quiz
          </Button>
          <Button variant="secondary" icon={GraduationCap} onClick={() => navigate('/diagnostic')}>
            Diagnostic
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
