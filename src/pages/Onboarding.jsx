import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, AlertCircle, ArrowLeft, ArrowRight, Check, Zap } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { storage } from '../services/storage';

const EXAM_SUBJECT_PRESETS = {
  JEE: ['Mathematics', 'Physics', 'Chemistry'],
  NEET: ['Biology', 'Physics', 'Chemistry'],
  CAT: ['Quantitative Aptitude', 'Verbal Ability', 'Data Interpretation'],
  UPSC: ['General Studies', 'Polity', 'History', 'Geography', 'Economics'],
  'CBSE Board': ['Mathematics', 'Science', 'Social Science', 'English'],
  'State Board': ['Mathematics', 'Science', 'Social Science', 'Languages'],
  Custom: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'General Studies'],
};

const ALL_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Quantitative Aptitude',
  'General Studies',
  'Science',
  'Social Science',
  'Polity',
  'History',
  'Geography',
  'Economics',
];

export function Onboarding({ data }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(data.profile);
  const [error, setError] = useState('');

  const steps = ['About you', 'Target & Subjects', 'Study Style & Confidence'];

  const update = (key, value) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      // If exam changes, auto-suggest subjects for that exam if not already customized
      if (key === 'exam' && EXAM_SUBJECT_PRESETS[value]) {
        updated.subjects = EXAM_SUBJECT_PRESETS[value];
        const newConf = { ...prev.confidence };
        EXAM_SUBJECT_PRESETS[value].forEach((s) => {
          if (newConf[s] === undefined) newConf[s] = 60;
        });
        updated.confidence = newConf;
      }
      return updated;
    });
  };

  const toggleSubject = (subject) => {
    const current = form.subjects || [];
    const next = current.includes(subject)
      ? current.filter((s) => s !== subject)
      : [...current, subject];
    const newConf = { ...form.confidence };
    if (!newConf[subject]) newConf[subject] = 50;
    setForm({ ...form, subjects: next, confidence: newConf });
  };

  const save = (goToDiagnostic = false) => {
    if (!form.name?.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!form.examDate) {
      setError('Please select your target exam date.');
      return;
    }
    if (!form.subjects?.length) {
      setError('Please select at least one subject in your rotation.');
      return;
    }

    data.setProfile(form);
    storage.set('profile', form);
    if (goToDiagnostic) {
      navigate('/diagnostic');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="onboarding-wrap">
      <Link to="/" className="brand onboarding-brand">
        <div className="brand-mark">
          <Sparkles size={18} />
        </div>
        <span>
          StudyMate <b>AI</b>
        </span>
      </Link>

      <Card className="onboarding-card">
        <div className="onboarding-header">
          <Badge tone="indigo">PERSONALIZE YOUR SPACE</Badge>
          <h1>Let’s make your study time count.</h1>
          <p>A few details help the local adaptive engine build a plan tailored to your exam.</p>
        </div>

        <div className="stepper">
          {steps.map((label, index) => (
            <div className={`step ${index <= step ? 'active' : ''}`} key={label}>
              <span>{index + 1}</span>
              <small>{label}</small>
            </div>
          ))}
        </div>

        {error && (
          <div className="form-error">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {step === 0 && (
          <div className="form-grid">
            <label className="field full">
              <span>What should we call you?</span>
              <input
                autoFocus
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Your full or preferred name"
              />
            </label>

            <label className="field">
              <span>Target exam</span>
              <select value={form.exam} onChange={(e) => update('exam', e.target.value)}>
                {['JEE', 'NEET', 'CAT', 'UPSC', 'CBSE Board', 'State Board', 'Custom'].map(
                  (exam) => (
                    <option key={exam}>{exam}</option>
                  )
                )}
              </select>
            </label>

            <label className="field">
              <span>Exam date</span>
              <input
                type="date"
                value={form.examDate}
                onChange={(e) => update('examDate', e.target.value)}
              />
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="form-section">
            <label className="field">
              <span>Subjects in your rotation (click to toggle)</span>
              <div className="chip-grid">
                {ALL_SUBJECTS.map((subject) => {
                  const isSelected = form.subjects?.includes(subject);
                  return (
                    <button
                      type="button"
                      className={`choice-chip ${isSelected ? 'selected' : ''}`}
                      key={subject}
                      onClick={() => toggleSubject(subject)}
                    >
                      {isSelected && <Check size={14} />}
                      {subject}
                    </button>
                  );
                })}
              </div>
            </label>

            <label className="field">
              <span>
                Daily study target: <strong>{form.dailyHours} hours / day</strong>
              </span>
              <input
                type="range"
                min="1"
                max="12"
                value={form.dailyHours}
                onChange={(e) => update('dailyHours', Number(e.target.value))}
              />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="form-section">
            <label className="field">
              <span>Preferred learning style</span>
              <select value={form.style} onChange={(e) => update('style', e.target.value)}>
                <option>Visual + practice</option>
                <option>Concept first</option>
                <option>Fast revision</option>
                <option>Socratic questions</option>
              </select>
            </label>

            <div className="field">
              <span>Self-assessed starting confidence per subject:</span>
              <div className="confidence-list">
                {form.subjects?.map((subject) => {
                  const val = form.confidence?.[subject] ?? 50;
                  return (
                    <label className="confidence-row" key={subject}>
                      <span>{subject}</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={val}
                        onChange={(e) =>
                          update('confidence', {
                            ...form.confidence,
                            [subject]: Number(e.target.value),
                          })
                        }
                      />
                      <b>{val}%</b>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="onboarding-actions">
          {step > 0 && (
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 2 ? (
            <Button
              icon={ArrowRight}
              onClick={() => {
                setError('');
                if (step === 0 && (!form.name.trim() || !form.examDate)) {
                  setError('Please fill in your name and exam date.');
                  return;
                }
                if (step === 1 && !form.subjects?.length) {
                  setError('Please select at least one subject.');
                  return;
                }
                setStep(step + 1);
              }}
            >
              Continue
            </Button>
          ) : (
            <>
              <Button variant="secondary" icon={Zap} onClick={() => save(true)}>
                Take diagnostic
              </Button>
              <Button icon={Check} onClick={() => save(false)}>
                Save profile
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

export default Onboarding;
