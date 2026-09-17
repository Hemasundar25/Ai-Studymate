import { useState, useMemo, useCallback } from 'react';
import { storage, loadProfile } from '../services/storage';
import { calculatePersonalization } from '../services/personalizationService';
import { demoAttempts, demoTasks } from '../data/demoData';
import { questionBank } from '../data/questions';

export const DEFAULT_ACHIEVEMENTS = [
  { id: 'first-quiz', title: 'First Steps', description: 'Complete your first practice quiz', icon: 'Trophy', unlocked: false },
  { id: 'perfect-score', title: 'Flawless', description: 'Score 100% on any quiz set', icon: 'Sparkles', unlocked: false },
  { id: 'focus-master', title: 'Deep Work', description: 'Log 3+ focus timer sessions', icon: 'Clock3', unlocked: false },
  { id: 'task-crusher', title: 'Task Momentum', description: 'Mark 5 study tasks complete', icon: 'CheckCircle2', unlocked: false },
  { id: 'diagnostic-done', title: 'Self Aware', description: 'Complete the baseline diagnostic test', icon: 'Brain', unlocked: false },
  { id: 'quiz-veteran', title: 'Practice Prodigy', description: 'Complete 5 or more quiz attempts', icon: 'Zap', unlocked: false },
];

export function useAppData() {
  const [profile, setProfileState] = useState(loadProfile);
  const [tasks, setTasksState] = useState(() => storage.get('tasks', demoTasks));
  const [attempts, setAttemptsState] = useState(() => storage.get('attempts', demoAttempts));
  const [sessions, setSessionsState] = useState(() => storage.get('focus-sessions', []));
  const [diagnostic, setDiagnosticState] = useState(() => storage.get('diagnostic', null));
  const [toast, setToast] = useState('');

  const notify = useCallback((message) => {
    setToast(message);
  }, []);

  const setProfile = useCallback((value) => {
    setProfileState(value);
    storage.set('profile', value);
  }, []);

  const setTasks = useCallback((value) => {
    setTasksState(value);
    storage.set('tasks', value);
  }, []);

  const setAttempts = useCallback((value) => {
    setAttemptsState(value);
    storage.set('attempts', value);
  }, []);

  const setSessions = useCallback((value) => {
    setSessionsState(value);
    storage.set('focus-sessions', value);
  }, []);

  const setDiagnostic = useCallback((value) => {
    setDiagnosticState(value);
    storage.set('diagnostic', value);
  }, []);

  const [customAchievements, setCustomAchievementsState] = useState(() =>
    storage.get('achievements', DEFAULT_ACHIEVEMENTS)
  );

  const setAchievements = useCallback((value) => {
    setCustomAchievementsState(value);
    storage.set('achievements', value);
  }, []);

  // Compute reactive achievements based on activity
  const achievements = useMemo(() => {
    return customAchievements.map((ach) => {
      if (ach.unlocked) return ach;
      let shouldUnlock = false;
      if (ach.id === 'first-quiz' && attempts.length >= 1) shouldUnlock = true;
      if (ach.id === 'perfect-score' && attempts.some((a) => a.score === 100)) shouldUnlock = true;
      if (ach.id === 'focus-master' && sessions.length >= 3) shouldUnlock = true;
      if (ach.id === 'task-crusher' && tasks.filter((t) => t.done).length >= 5) shouldUnlock = true;
      if (ach.id === 'diagnostic-done' && diagnostic !== null) shouldUnlock = true;
      if (ach.id === 'quiz-veteran' && attempts.length >= 5) shouldUnlock = true;

      return shouldUnlock ? { ...ach, unlocked: true } : ach;
    });
  }, [customAchievements, attempts, sessions, tasks, diagnostic]);

  const personalization = useMemo(() => {
    return calculatePersonalization({
      profile,
      tasks,
      attempts,
      studySessions: sessions,
      diagnostic,
      questions: questionBank,
    });
  }, [profile, tasks, attempts, sessions, diagnostic]);

  return {
    profile,
    setProfile,
    tasks,
    setTasks,
    attempts,
    setAttempts,
    sessions,
    setSessions,
    diagnostic,
    setDiagnostic,
    achievements,
    setAchievements,
    personalization,
    toast,
    notify,
  };
}

export default useAppData;
