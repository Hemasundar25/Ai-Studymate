import { describe, expect, it, beforeEach } from 'vitest';
import { calculatePersonalization, getAdaptiveDifficulty } from './personalizationService';
import { collectData, importData, storage, validateImport } from './storage';

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

globalThis.localStorage = new MemoryStorage();

describe('personalization engine', () => {
  it('prioritizes the weakest subject and increases the target when mastery is low', () => {
    const result = calculatePersonalization({ profile: { subjects: ['Math', 'Physics'], dailyHours: 3, confidence: { Math: 30, Physics: 80 } }, tasks: [], attempts: [], studySessions: [] });
    expect(result.weakSubjects[0]).toBe('Math');
    expect(result.recommendedDifficulty).toBe('Easy');
    expect(result.dailyTarget).toBe(3.5);
    expect(result.nextAction).toContain('Math');
  });

  it('classifies adaptive movement deterministically', () => {
    expect(getAdaptiveDifficulty({ currentDifficulty: 'Medium', wasCorrect: true })).toBe('Hard');
    expect(getAdaptiveDifficulty({ currentDifficulty: 'Medium', wasCorrect: false })).toBe('Easy');
    expect(getAdaptiveDifficulty({ currentDifficulty: 'Hard', wasCorrect: true })).toBe('Hard');
  });
});

describe('local data portability', () => {
  beforeEach(() => { globalThis.localStorage = new MemoryStorage(); });

  it('rejects unknown schemas and imports valid exports', () => {
    expect(validateImport({ random: true }).valid).toBe(false);
    expect(importData({ profile: { name: 'Test' }, tasks: [] }).valid).toBe(true);
    expect(collectData().profile.name).toBe('Test');
  });
});

describe('study plan persistence', () => {
  it('round trips task completion through namespaced storage', () => {
    const tasks = [{ id: 'task-1', title: 'Revise limits', done: false }];
    storage.set('tasks', tasks);
    const completed = storage.get('tasks', []).map((task) => ({ ...task, done: true }));
    storage.set('tasks', completed);
    expect(storage.get('tasks', [])[0]).toMatchObject({ id: 'task-1', done: true });
  });
});
