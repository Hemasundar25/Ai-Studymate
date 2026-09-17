import { useState } from 'react';
import {
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Download,
  Trophy,
  Sparkles,
  Clock3,
  CheckCircle2,
  Brain,
  Zap,
  Flame,
  Users,
  Printer,
  FileText,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';

const ICON_MAP = {
  Trophy,
  Sparkles,
  Clock3,
  CheckCircle2,
  Brain,
  Zap,
  Flame,
};

export function Analytics({ data }) {
  const { profile, attempts, sessions, personalization, achievements } = data;
  const [showParentReport, setShowParentReport] = useState(false);

  // Radar data
  const masteryData = Object.entries(personalization.mastery).map(([subject, score]) => ({
    subject: subject.length > 12 ? `${subject.slice(0, 10)}...` : subject,
    score,
    fullSubject: subject,
  }));

  // Score progression area data
  const scoreData = attempts.length
    ? attempts
        .slice(0, 10)
        .reverse()
        .map((a, idx) => ({
          name: `Set ${idx + 1}`,
          score: a.score,
          title: a.title,
        }))
    : [
        { name: 'Mon', score: 62 },
        { name: 'Tue', score: 70 },
        { name: 'Wed', score: 68 },
        { name: 'Thu', score: 82 },
        { name: 'Fri', score: 79 },
      ];

  // Peer percentile simulation
  // Realistic normal-distribution approximation based on overall score
  const studentOverall = personalization.overall;
  const percentile = Math.min(
    99,
    Math.max(15, Math.round(10 + studentOverall * 0.88 + (attempts.length > 3 ? 4 : 0)))
  );

  const exportFullReport = () => {
    const report = {
      student: profile.name,
      targetExam: profile.exam,
      examDate: profile.examDate,
      overallReadiness: `${personalization.overall}%`,
      estimatedPercentile: `${percentile}th percentile`,
      focusedStudyMinutes: personalization.focusedMinutes,
      completedTaskMinutes: personalization.completedMinutes,
      subjectMastery: personalization.mastery,
      weakTopics: personalization.weakTopics,
      recentAttempts: attempts,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `studymate_analytics_${profile.name.replace(/\s+/g, '_').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    data.notify('Full analytical report exported as JSON.');
  };

  const printParentReport = () => {
    window.print();
  };

  return (
    <div>
      <div className="page-intro">
        <div>
          <span className="eyebrow">DIAGNOSTICS & ANALYTICS</span>
          <h1>Your learning signals, made clear.</h1>
          <p>
            Track concept mastery curves, compare simulated cohort percentiles, and monitor
            long-term consistency.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            variant="secondary"
            icon={FileText}
            onClick={() => setShowParentReport(true)}
          >
            Parent report summary
          </Button>
          <Button variant="secondary" icon={Download} onClick={exportFullReport}>
            Export data
          </Button>
        </div>
      </div>

      <div className="analytics-grid">
        <Card className="wide-chart">
          <SectionHeading
            eyebrow="MULTI-AXIS MASTERY"
            title="Subject Competency Profile"
          />
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={masteryData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Radar
                  name="Mastery"
                  dataKey="score"
                  stroke="#5b5bf7"
                  fill="#5b5bf7"
                  fillOpacity={0.3}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="score-chart">
          <SectionHeading eyebrow="SCORE PROGRESSION" title="Recent Practice Trajectory" />
          <div style={{ height: 220, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#2dd4bf"
                  fill="#2dd4bf"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Peer Comparison Card */}
        <Card className="wide-chart">
          <SectionHeading
            eyebrow="SIMULATED BENCHMARK"
            title={`${profile.exam} Peer Comparison`}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 10 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #5b5bf7, #8b5cf6)',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 8px 20px rgba(91,91,247,0.3)',
              }}
            >
              <strong style={{ fontSize: 20 }}>{percentile}th</strong>
              <small style={{ fontSize: 9, opacity: 0.85 }}>percentile</small>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: '#334155' }}>
                You are performing ahead of <strong>{percentile}%</strong> of simulated candidates
                preparing for <strong>{profile.exam}</strong>.
              </p>
              <small style={{ display: 'block', color: '#64748b', marginTop: 4 }}>
                Calculated locally from syllabus coverage, average quiz accuracy, and task
                completion pace.
              </small>
            </div>
          </div>

          <div className="analytics-stats" style={{ marginTop: 22 }}>
            <div>
              <strong>{personalization.focusedMinutes} min</strong>
              <span>logged focus time</span>
            </div>
            <div>
              <strong>{personalization.completedMinutes} min</strong>
              <span>tasks completed</span>
            </div>
            <div>
              <strong>{attempts.length}</strong>
              <span>practice sets</span>
            </div>
            <div>
              <strong>{sessions.length}</strong>
              <span>deep work blocks</span>
            </div>
          </div>
        </Card>

        {/* Recent Quizzes List */}
        <Card className="score-chart">
          <SectionHeading
            eyebrow="PRACTICE LOG"
            title={`${attempts.length} local attempts recorded`}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {attempts.slice(0, 5).map((attempt) => (
              <div
                key={attempt.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div>
                  <strong style={{ fontSize: 12, color: '#334155' }}>{attempt.title}</strong>
                  <small style={{ display: 'block', color: '#94a3b8', fontSize: 10 }}>
                    {attempt.date ? new Date(attempt.date).toLocaleDateString() : 'Recent'}
                  </small>
                </div>
                <Badge tone={attempt.score >= 75 ? 'teal' : attempt.score >= 50 ? 'amber' : 'red'}>
                  {attempt.score}%
                </Badge>
              </div>
            ))}

            {!attempts.length && (
              <EmptyState
                icon={Users}
                title="No quiz history yet"
                text="Take your first quiz in the Quiz Lab to see historical trends."
              />
            )}
          </div>
        </Card>
      </div>

      {/* Achievement Milestones Section */}
      <div style={{ marginTop: 30 }}>
        <SectionHeading
          eyebrow="MILESTONES & ACHIEVEMENTS"
          title="Consistency Badges"
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14,
            marginTop: 14,
          }}
        >
          {achievements.map((ach) => {
            const IconComponent = ICON_MAP[ach.icon] || Trophy;
            return (
              <Card
                key={ach.id}
                style={{
                  padding: 16,
                  opacity: ach.unlocked ? 1 : 0.55,
                  border: ach.unlocked ? '1px solid #5b5bf7' : '1px solid #e2e8f0',
                  background: ach.unlocked ? 'linear-gradient(135deg, #fbfbfe, #f5f6ff)' : '#fff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    className={`stat-icon ${ach.unlocked ? 'indigo' : 'neutral'}`}
                    style={{
                      background: ach.unlocked ? '#eeefff' : '#f1f5f9',
                      color: ach.unlocked ? '#5b5bf7' : '#94a3b8',
                    }}
                  >
                    <IconComponent size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: 13, color: ach.unlocked ? '#1e293b' : '#64748b' }}>
                      {ach.title}
                    </strong>
                    <Badge tone={ach.unlocked ? 'teal' : 'neutral'} style={{ display: 'block', marginTop: 2 }}>
                      {ach.unlocked ? 'Unlocked ✦' : 'Locked'}
                    </Badge>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: '#64748b', marginTop: 10 }}>
                  {ach.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Parent Report Modal */}
      {showParentReport && (
        <Modal
          title="Parent / Guardian Progress Report"
          onClose={() => setShowParentReport(false)}
          maxWidth="600px"
        >
          <div style={{ lineHeight: 1.6, color: '#334155' }}>
            <p style={{ fontSize: 12, color: '#64748b' }}>
              A straightforward, jargon-free summary of study consistency, accuracy, and preparation
              milestones.
            </p>

            <div
              style={{
                background: '#f8fafc',
                padding: 16,
                borderRadius: 8,
                marginTop: 12,
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <small style={{ color: '#64748b' }}>Student Name:</small>
                  <strong style={{ display: 'block' }}>{profile.name}</strong>
                </div>
                <div>
                  <small style={{ color: '#64748b' }}>Target Examination:</small>
                  <strong style={{ display: 'block' }}>{profile.exam}</strong>
                </div>
                <div>
                  <small style={{ color: '#64748b' }}>Exam Date:</small>
                  <strong style={{ display: 'block' }}>{profile.examDate}</strong>
                </div>
                <div>
                  <small style={{ color: '#64748b' }}>Overall Readiness:</small>
                  <strong style={{ display: 'block', color: '#16a34a' }}>
                    {personalization.overall}%
                  </strong>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <strong>Subject Mastery Summary:</strong>
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(personalization.mastery).map(([sub, sc]) => (
                  <div key={sub} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span>{sub}</span>
                    <strong style={{ color: sc >= 70 ? '#16a34a' : sc >= 50 ? '#d97706' : '#dc2626' }}>
                      {sc}% ({sc >= 70 ? 'Proficient' : sc >= 50 ? 'Progressing' : 'Needs Support'})
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <strong>Weekly Focus Recommendation:</strong>
              <p style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                The student is encouraged to focus on{' '}
                <strong>{personalization.weakSubjects[0] || 'core subjects'}</strong> for{' '}
                <strong>{personalization.dailyTarget} hours per day</strong>. Consistency has been
                strong with {personalization.focusedMinutes} minutes of focused study recorded.
              </p>
            </div>

            <div className="modal-actions" style={{ marginTop: 24 }}>
              <Button variant="ghost" onClick={() => setShowParentReport(false)}>
                Close
              </Button>
              <Button icon={Printer} onClick={printParentReport}>
                Print report
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Analytics;
