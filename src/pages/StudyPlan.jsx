import { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Clock3,
  Check,
  Pencil,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';

const DAYS_OF_WEEK = ['Today', 'Tomorrow', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function StudyPlan({ data }) {
  const { tasks, setTasks, sessions, setSessions, personalization, profile, notify } = data;
  const [view, setView] = useState('Today');
  const [editing, setEditing] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60); // 25 min default
  const [initialDuration, setInitialDuration] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  const subjects = profile?.subjects?.length
    ? profile.subjects
    : ['Mathematics', 'Physics', 'Chemistry'];

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setRunning(false);
          const elapsedMinutes = Math.max(1, Math.round(initialDuration / 60));
          setSessions([
            ...sessions,
            {
              id: `session-${Date.now()}`,
              minutes: elapsedMinutes,
              date: new Date().toISOString(),
              type: 'Pomodoro Completed',
            },
          ]);
          notify(`Pomodoro completed! ${elapsedMinutes} minutes logged.`);
          return initialDuration;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, initialDuration, sessions, setSessions, notify]);

  const visibleTasks =
    view === 'All Tasks'
      ? tasks
      : view === 'Today'
      ? tasks.filter((t) => t.day === 'Today')
      : tasks.filter((t) => t.day !== 'Done');

  const saveTask = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = String(form.get('title')).trim();
    const subject = String(form.get('subject'));
    const day = String(form.get('day'));
    const minutes = Number(form.get('minutes')) || 30;
    const priority = String(form.get('priority')) || 'Medium';

    if (!title) return;

    if (editing?.id) {
      // Update
      const updated = tasks.map((t) =>
        t.id === editing.id
          ? { ...t, title, subject, day, minutes, priority }
          : t
      );
      setTasks(updated);
      notify('Task updated.');
    } else {
      // New
      const newTask = {
        id: `task-${Date.now()}`,
        title,
        subject,
        day,
        minutes,
        priority,
        done: false,
        createdAt: new Date().toISOString(),
      };
      setTasks([newTask, ...tasks]);
      notify('New task added to plan.');
    }
    setEditing(null);
  };

  const toggleTask = (id) => {
    const updated = tasks.map((t) =>
      t.id === id
        ? { ...t, done: !t.done, completedAt: !t.done ? new Date().toISOString() : null }
        : t
    );
    setTasks(updated);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
    notify('Task removed from plan.');
  };

  const autoGeneratePlan = () => {
    const weakSub = personalization.weakSubjects[0] || subjects[0] || 'Mathematics';
    const otherSub = subjects.find((s) => s !== weakSub) || 'Physics';

    const generated = [
      {
        id: `task-gen-1-${Date.now()}`,
        title: `Core Concept Sprint: ${weakSub} fundamentals`,
        subject: weakSub,
        day: 'Today',
        minutes: 45,
        priority: 'High',
        done: false,
      },
      {
        id: `task-gen-2-${Date.now()}`,
        title: `Adaptive Quiz & Error Log: ${weakSub}`,
        subject: weakSub,
        day: 'Today',
        minutes: 30,
        priority: 'High',
        done: false,
      },
      {
        id: `task-gen-3-${Date.now()}`,
        title: `Speed drills & formulas: ${otherSub}`,
        subject: otherSub,
        day: 'Tomorrow',
        minutes: 35,
        priority: 'Medium',
        done: false,
      },
      {
        id: `task-gen-4-${Date.now()}`,
        title: `Mock problem set: ${weakSub}`,
        subject: weakSub,
        day: 'Wednesday',
        minutes: 50,
        priority: 'High',
        done: false,
      },
      {
        id: `task-gen-5-${Date.now()}`,
        title: `Weekly synthesis & flashcard review`,
        subject: otherSub,
        day: 'Friday',
        minutes: 40,
        priority: 'Medium',
        done: false,
      },
    ];

    setTasks([...generated, ...tasks]);
    notify(`Generated 5 weekly study blocks focused on ${weakSub}!`);
  };

  const finishSessionManually = () => {
    const elapsedSeconds = initialDuration - timerSeconds;
    if (elapsedSeconds < 15) {
      notify('Complete at least 15 seconds of focus before saving.');
      return;
    }
    const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    setSessions([
      ...sessions,
      {
        id: `session-${Date.now()}`,
        minutes: elapsedMinutes,
        date: new Date().toISOString(),
        type: 'Focus Block',
      },
    ]);
    setRunning(false);
    setTimerSeconds(initialDuration);
    notify(`${elapsedMinutes} min focus session saved to your study log!`);
  };

  const completedCount = tasks.filter((t) => t.done).length;
  const progressPercent = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div>
      <div className="page-intro">
        <div>
          <span className="eyebrow">YOUR WEEK, DESIGNED</span>
          <h1>A plan built for consistency.</h1>
          <p>
            Targeting <strong>{personalization.dailyTarget} hours daily</strong>, prioritising{' '}
            <strong>{personalization.weakSubjects[0] || 'your core subject'}</strong>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" icon={Sparkles} onClick={autoGeneratePlan}>
            Auto-generate week
          </Button>
          <Button icon={Plus} onClick={() => setEditing({})}>
            Add task
          </Button>
        </div>
      </div>

      <Card className="plan-summary">
        <div>
          <span className="eyebrow">PLAN PROGRESS</span>
          <strong>
            {completedCount} <small>/ {tasks.length} tasks completed</small>
          </strong>
        </div>
        <ProgressBar value={progressPercent} color="teal" />
        <div className="plan-summary-meta">
          <span>{sessions.length} focus sessions logged</span>
          <span>{tasks.length - completedCount} tasks remaining</span>
        </div>
      </Card>

      <div className="planner-toolbar">
        <div className="segmented">
          {['Today', 'This Week', 'All Tasks'].map((item) => (
            <button
              className={view === item ? 'selected' : ''}
              key={item}
              onClick={() => setView(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <Button
          variant="secondary"
          icon={running ? Pause : Clock3}
          onClick={() => setRunning(!running)}
        >
          {running ? 'Pause timer' : 'Start 25m focus'}
        </Button>
      </div>

      <div className="planner-layout">
        <Card>
          <SectionHeading eyebrow={view.toUpperCase()} title="Study tasks" />
          {visibleTasks.length ? (
            <div className="task-list planner-tasks">
              {visibleTasks.map((task) => (
                <div className={`planner-task ${task.done ? 'done' : ''}`} key={task.id}>
                  <button
                    className="task-check"
                    aria-label={`Mark task ${task.done ? 'open' : 'complete'}`}
                    onClick={() => toggleTask(task.id)}
                  >
                    {task.done && <Check size={13} />}
                  </button>
                  <div>
                    <strong>{task.title}</strong>
                    <small>
                      <span className="subject-dot indigo" />
                      {task.subject} · {task.day} · {task.minutes || 30} min ·{' '}
                      <span style={{ fontWeight: 600, color: task.priority === 'High' ? '#e45d6b' : '#64718a' }}>
                        {task.priority || 'Medium'}
                      </span>
                    </small>
                  </div>
                  <button
                    className="icon-button subtle"
                    aria-label="Edit task"
                    onClick={() => setEditing(task)}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="icon-button subtle danger"
                    aria-label="Delete task"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="No tasks in this view"
              text="Add a focused task or generate a weekly schedule."
              action={
                <Button icon={Plus} onClick={() => setEditing({})}>
                  Add task
                </Button>
              }
            />
          )}
        </Card>

        <Card className="pomodoro-card">
          <SectionHeading eyebrow="POMODORO FOCUS" title="Protect one block" />
          <div className="pomodoro-time">{formatTime(timerSeconds)}</div>
          <p>Short 25-minute deep focus intervals prevent cognitive fatigue.</p>
          <div className="action-row" style={{ justifyContent: 'center' }}>
            <Button
              icon={running ? Pause : Play}
              onClick={() => setRunning(!running)}
            >
              {running ? 'Pause' : 'Start'}
            </Button>
            <Button
              variant="secondary"
              icon={RotateCcw}
              onClick={() => {
                setRunning(false);
                setTimerSeconds(initialDuration);
              }}
            >
              Reset
            </Button>
            <Button
              variant="secondary"
              icon={Check}
              onClick={finishSessionManually}
            >
              Log session
            </Button>
          </div>
          <div style={{ marginTop: 18, display: 'flex', gap: 6, justifyContent: 'center' }}>
            {[15, 25, 45].map((mins) => (
              <button
                key={mins}
                className={`choice-chip ${initialDuration === mins * 60 ? 'selected' : ''}`}
                style={{ padding: '4px 8px', fontSize: 11 }}
                onClick={() => {
                  setRunning(false);
                  setInitialDuration(mins * 60);
                  setTimerSeconds(mins * 60);
                }}
              >
                {mins}m
              </button>
            ))}
          </div>
        </Card>
      </div>

      {editing && (
        <Modal
          title={editing.id ? 'Edit Study Task' : 'Add New Task'}
          onClose={() => setEditing(null)}
        >
          <form className="modal-form" onSubmit={saveTask}>
            <label className="field">
              <span>Task title</span>
              <input
                name="title"
                defaultValue={editing.title || ''}
                required
                placeholder="e.g. Revise definite integration formulas"
              />
            </label>

            <label className="field">
              <span>Subject</span>
              <select name="subject" defaultValue={editing.subject || subjects[0]}>
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Target day</span>
              <select name="day" defaultValue={editing.day || 'Today'}>
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Estimated duration (minutes)</span>
              <input
                name="minutes"
                type="number"
                min="5"
                max="240"
                defaultValue={editing.minutes || 30}
                required
              />
            </label>

            <label className="field">
              <span>Priority level</span>
              <select name="priority" defaultValue={editing.priority || 'Medium'}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High (Weak area focus)</option>
              </select>
            </label>

            <div className="modal-actions">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
              <Button icon={Check}>
                {editing.id ? 'Save changes' : 'Add to plan'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default StudyPlan;
