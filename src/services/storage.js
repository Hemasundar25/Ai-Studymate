const PREFIX = 'studymate:';

export const STORAGE_KEYS = [
  'profile',
  'tasks',
  'attempts',
  'focus-sessions',
  'diagnostic',
  'chat-conversations',
  'active-conversation',
  'tutor-mode',
  'study-history',
  'ai-settings',
  'achievements',
  'ollama-model',
  'mock-exams',
];

export const storage = {
  get(key, fallback) {
    try {
      const value = localStorage.getItem(`${PREFIX}${key}`);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(`${PREFIX}${key}`);
  },
  has(key) {
    return localStorage.getItem(`${PREFIX}${key}`) !== null;
  },
};

export const defaultProfile = {
  name: 'Aarav Mehta',
  exam: 'JEE',
  subjects: ['Mathematics', 'Physics', 'Chemistry'],
  examDate: '2026-04-18',
  dailyHours: 4,
  style: 'Visual + practice',
  confidence: { Mathematics: 72, Physics: 58, Chemistry: 81 },
};

export function loadProfile() {
  return storage.get('profile', defaultProfile);
}

export function collectData() {
  return Object.fromEntries(STORAGE_KEYS.filter((key) => storage.has(key)).map((key) => [key, storage.get(key, null)]));
}

export function validateImport(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { valid: false, error: 'The file must contain a JSON object.' };
  const allowed = new Set(STORAGE_KEYS);
  const keys = Object.keys(data);
  if (!keys.length || keys.some((key) => !allowed.has(key))) return { valid: false, error: 'This file is not a valid StudyMate export.' };
  if (data.profile && (typeof data.profile !== 'object' || typeof data.profile.name !== 'string')) return { valid: false, error: 'The profile data is incomplete.' };
  if (data.tasks && !Array.isArray(data.tasks)) return { valid: false, error: 'Tasks must be a list.' };
  if (data.attempts && !Array.isArray(data.attempts)) return { valid: false, error: 'Quiz attempts must be a list.' };
  return { valid: true };
}

export function importData(data) {
  const result = validateImport(data);
  if (!result.valid) return result;
  Object.entries(data).forEach(([key, value]) => storage.set(key, value));
  return { valid: true };
}

export function resetStudyMateData() {
  STORAGE_KEYS.forEach((key) => storage.remove(key));
}
