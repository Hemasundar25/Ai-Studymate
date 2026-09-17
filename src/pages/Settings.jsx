import { useState, useRef, useEffect } from 'react';
import {
  Check,
  Download,
  Upload,
  Sparkles,
  Trash2,
  Zap,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Modal } from '../components/ui/Modal';
import {
  storage,
  collectData,
  importData,
  resetStudyMateData,
} from '../services/storage';
import { demoAttempts, demoTasks } from '../data/demoData';
import { checkOllamaStatus } from '../services/demoAI';

export function Settings({ data }) {
  const [form, setForm] = useState(data.profile);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState({ checking: true, available: false, models: [] });
  const [selectedModel, setSelectedModel] = useState(
    () => storage.get('ollama-model', 'llama3.2')
  );

  const fileRef = useRef(null);

  const checkConnection = async () => {
    setOllamaStatus((prev) => ({ ...prev, checking: true }));
    const res = await checkOllamaStatus();
    setOllamaStatus({
      checking: false,
      available: res.available,
      models: res.models.length ? res.models : ['llama3.2', 'mistral', 'phi3'],
    });
  };

  useEffect(() => {
    let active = true;
    checkOllamaStatus().then((res) => {
      if (active) {
        setOllamaStatus({
          checking: false,
          available: res.available,
          models: res.models.length ? res.models : ['llama3.2', 'mistral', 'phi3'],
        });
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.examDate) return;
    data.setProfile(form);
    storage.set('profile', form);
    storage.set('ollama-model', selectedModel);
    setSaved(true);
    data.notify('Profile and AI settings saved.');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLoadDemo = () => {
    data.setTasks([
      ...data.tasks,
      ...demoTasks.filter((d) => !data.tasks.some((t) => t.id === d.id)),
    ]);
    data.setAttempts([
      ...data.attempts,
      ...demoAttempts.filter((d) => !data.attempts.some((a) => a.id === d.id)),
    ]);
    data.notify('Sample demo tasks and quizzes loaded successfully.');
  };

  const handleExport = () => {
    const exportContent = JSON.stringify(collectData(), null, 2);
    const blob = new Blob([exportContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `studymate_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    data.notify('Complete workspace data exported to JSON.');
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const result = importData(parsed);
        if (!result.valid) throw new Error(result.error);
        data.notify('Data imported successfully! Refreshing workspace...');
        setTimeout(() => window.location.reload(), 600);
      } catch (err) {
        data.notify(err.message || 'Could not import this file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    resetStudyMateData();
    setConfirmReset(false);
    data.notify('All local StudyMate data reset.');
    window.location.href = '/onboarding';
  };

  return (
    <div>
      <div className="page-intro">
        <div>
          <span className="eyebrow">PREFERENCES & CONTROLS</span>
          <h1>Settings that keep you in control.</h1>
          <p>Configure local AI preferences, review data privacy, or export your complete history.</p>
        </div>
        {saved && (
          <Badge tone="teal">
            <Check size={13} /> Saved
          </Badge>
        )}
      </div>

      <div className="settings-layout">
        <Card>
          <SectionHeading eyebrow="STUDENT PROFILE" title="Target & Schedule" />
          <form onSubmit={handleSaveProfile}>
            <div className="settings-form">
              <label className="field">
                <span>Your Name</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </label>

              <label className="field">
                <span>Target Examination</span>
                <select
                  value={form.exam}
                  onChange={(e) => setForm({ ...form, exam: e.target.value })}
                >
                  {['JEE', 'NEET', 'CAT', 'UPSC', 'CBSE Board', 'State Board', 'Custom'].map(
                    (ex) => (
                      <option key={ex} value={ex}>
                        {ex}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="field">
                <span>Exam Date</span>
                <input
                  type="date"
                  value={form.examDate}
                  onChange={(e) => setForm({ ...form, examDate: e.target.value })}
                  required
                />
              </label>

              <label className="field">
                <span>Daily Target (Hours)</span>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={form.dailyHours}
                  onChange={(e) => setForm({ ...form, dailyHours: Number(e.target.value) })}
                  required
                />
              </label>
            </div>

            <Button icon={Check}>Save Profile</Button>
          </form>
        </Card>

        {/* AI & Local LLM Integration Card */}
        <Card>
          <SectionHeading
            eyebrow="LOCAL AI ENGINE"
            title="Ollama & Offline Settings"
            action={
              <button
                className="text-button"
                onClick={checkConnection}
                disabled={ollamaStatus.checking}
              >
                <RefreshCw
                  size={14}
                  className={ollamaStatus.checking ? 'spin' : ''}
                />{' '}
                Check connection
              </button>
            }
          />

          <div className="connection-row" style={{ marginTop: 12 }}>
            <div className="connection-icon">
              <Zap size={20} />
            </div>
            <div>
              <strong>
                {ollamaStatus.available
                  ? 'Ollama Local LLM Active'
                  : 'Deterministic Demo AI Active'}
              </strong>
              <small>
                {ollamaStatus.available
                  ? 'Connected to local Ollama daemon at http://localhost:11434'
                  : 'Offline mode: Context-aware templates ensure high-yield guidance with 0 config'}
              </small>
            </div>
            <Badge tone={ollamaStatus.available ? 'teal' : 'indigo'}>
              {ollamaStatus.available ? 'Ollama Online' : 'Demo AI (Offline)'}
            </Badge>
          </div>

          <div style={{ marginTop: 16 }}>
            <label className="field">
              <span>Preferred LLM Model (when Ollama is running)</span>
              <select
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  storage.set('ollama-model', e.target.value);
                  data.notify(`Preferred model set to ${e.target.value}`);
                }}
              >
                {ollamaStatus.models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Card>

        {/* Data Controls Card */}
        <Card style={{ gridColumn: '1 / -1' }}>
          <SectionHeading eyebrow="DATA CONTROLS" title="Local Storage Management" />
          <p style={{ color: '#64748b', fontSize: 12, marginBottom: 14 }}>
            StudyMate AI runs 100% in your browser. All data resides securely in your local browser
            storage.
          </p>

          <div className="data-summary">
            <span>
              Profile <strong>1</strong>
            </span>
            <span>
              Conversations <strong>{storage.get('chat-conversations', []).length}</strong>
            </span>
            <span>
              Quiz Attempts <strong>{data.attempts.length}</strong>
            </span>
            <span>
              Tasks <strong>{data.tasks.length}</strong>
            </span>
            <span>
              Focus Sessions <strong>{data.sessions.length}</strong>
            </span>
          </div>

          <div className="data-actions" style={{ marginTop: 18 }}>
            <Button variant="secondary" icon={Download} onClick={handleExport}>
              Export full backup (JSON)
            </Button>
            <Button
              variant="secondary"
              icon={Upload}
              onClick={() => fileRef.current?.click()}
            >
              Import backup file
            </Button>
            <input
              ref={fileRef}
              hidden
              type="file"
              accept=".json,application/json"
              onChange={handleImport}
            />
            <Button variant="secondary" icon={Sparkles} onClick={handleLoadDemo}>
              Load sample demo data
            </Button>
            <Button
              variant="danger"
              icon={Trash2}
              onClick={() => setConfirmReset(true)}
            >
              Reset workspace data
            </Button>
          </div>
        </Card>

        {/* Privacy Assurance Card */}
        <Card style={{ gridColumn: '1 / -1' }}>
          <SectionHeading eyebrow="PRIVACY & INTEGRITY" title="Zero Cloud Telemetry" />
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div className="stat-icon teal" style={{ flexShrink: 0 }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 12, lineHeight: 1.7, color: '#475569' }}>
                StudyMate AI requires no external authentication servers, paid cloud databases, or
                third-party trackers. All recommendations, flashcards, diagnostic scoring, and OCR
                extractions execute entirely inside your device environment.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {confirmReset && (
        <Modal
          title="Reset StudyMate Workspace?"
          onClose={() => setConfirmReset(false)}
        >
          <p style={{ color: '#475569', lineHeight: 1.6 }}>
            This will clear all StudyMate tasks, quiz scores, chat conversations, and study sessions
            stored on this browser. Other websites and browser cookies will not be affected.
          </p>

          <div className="modal-actions" style={{ marginTop: 22 }}>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>
              Keep my data
            </Button>
            <Button variant="danger" icon={Trash2} onClick={handleReset}>
              Yes, reset everything
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Settings;
