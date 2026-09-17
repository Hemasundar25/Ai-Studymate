import { describe, expect, it, beforeEach, vi } from 'vitest';
import { generateDemoResponse } from './demoAI';
import { generateResponse as generateTutorResponse } from './aiTutorService';
import { questionBank, getQuestions, getQuestionFilters } from '../data/questions';
import { curriculumData } from '../data/curriculum';
import { storage, resetStudyMateData, collectData, importData } from './storage';

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }
  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }
  setItem(key, value) {
    this.values.set(key, String(value));
  }
  removeItem(key) {
    this.values.delete(key);
  }
}

globalThis.localStorage = new MemoryStorage();

describe('Question Bank Integrity', () => {
  it('contains over 60 high-quality questions across all supported examinations', () => {
    expect(questionBank.length).toBeGreaterThanOrEqual(60);
  });

  it('ensures all questions have valid options, correct answers, and explanations', () => {
    questionBank.forEach((q) => {
      expect(q.id).toBeTruthy();
      expect(q.exam).toBeTruthy();
      expect(q.subject).toBeTruthy();
      expect(q.topic).toBeTruthy();
      expect(q.question).toBeTruthy();
      expect(q.options.length).toBe(4);
      expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(q.correctAnswer).toBeLessThan(4);
      expect(q.explanation).toBeTruthy();
    });
  });

  it('filters questions accurately by exam and subject', () => {
    const jeeQuestions = getQuestions({ exam: 'JEE', count: 10 });
    expect(jeeQuestions.length).toBeGreaterThan(0);
    jeeQuestions.forEach((q) => expect(q.exam).toBe('JEE'));

    const neetBio = getQuestions({ exam: 'NEET', subject: 'Biology', count: 5 });
    expect(neetBio.length).toBeGreaterThan(0);
    neetBio.forEach((q) => {
      expect(q.exam).toBe('NEET');
      expect(q.subject).toBe('Biology');
    });
  });

  it('provides all expected examination categories in filters', () => {
    const filters = getQuestionFilters();
    expect(filters.exams).toContain('JEE');
    expect(filters.exams).toContain('NEET');
    expect(filters.exams).toContain('CAT');
    expect(filters.exams).toContain('UPSC');
    expect(filters.exams).toContain('CBSE Board');
  });
});

describe('Curriculum Prerequisite Graph', () => {
  it('contains valid prerequisite networks for multiple subjects', () => {
    const subjects = Object.keys(curriculumData);
    expect(subjects).toContain('JEE Mathematics');
    expect(subjects).toContain('NEET Biology');
    expect(subjects).toContain('CBSE Science');

    subjects.forEach((sub) => {
      const nodes = curriculumData[sub];
      expect(nodes.length).toBeGreaterThanOrEqual(5);
      const nodeIds = new Set(nodes.map((n) => n.id));

      nodes.forEach((node) => {
        expect(node.title).toBeTruthy();
        expect(typeof node.x).toBe('number');
        expect(typeof node.y).toBe('number');
        // Ensure all declared prerequisites actually exist in the node set
        node.prerequisites.forEach((pId) => {
          expect(nodeIds.has(pId)).toBe(true);
        });
      });
    });
  });
});

describe('Deterministic Demo AI Service', () => {
  const profile = {
    name: 'Aarav',
    exam: 'JEE',
    subjects: ['Mathematics', 'Physics', 'Chemistry'],
  };

  const personalization = {
    weakSubjects: ['Mathematics'],
    mastery: { Mathematics: 45, Physics: 70, Chemistry: 80 },
  };

  it('generates rich Tutor mode responses', () => {
    const response = generateDemoResponse({
      text: 'How do I solve integration by parts?',
      mode: 'Tutor',
      profile,
      personalization,
    });
    expect(response).toBeTruthy();
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(50);
  });

  it('generates Socratic guiding questions without revealing straight answers immediately', () => {
    const response = generateDemoResponse({
      text: 'What is the formula for kinetic energy?',
      mode: 'Socratic',
      profile,
      personalization,
    });
    expect(response).toContain('?');
    expect(response.length).toBeGreaterThan(40);
  });

  it('generates Explain Simply responses with analogies', () => {
    const response = generateDemoResponse({
      text: 'Explain quantum entanglement simply',
      mode: 'Explain Simply',
      profile,
      personalization,
    });
    expect(response.length).toBeGreaterThan(40);
  });

  it('generates Revision flashcard notes', () => {
    const response = generateDemoResponse({
      text: 'Revise Newton laws of motion',
      mode: 'Revision',
      profile,
      personalization,
    });
    expect(response.length).toBeGreaterThan(40);
  });

  it('generates step-by-step Doubt Solver responses', () => {
    const response = generateDemoResponse({
      text: 'Solve 2x + 5 = 15',
      mode: 'Doubt Solver',
      profile,
      personalization,
    });
    expect(response).toBeTruthy();
    expect(response.length).toBeGreaterThan(30);
  });
});

describe('Workspace Data Safety & Portability', () => {
  beforeEach(() => {
    globalThis.localStorage = new MemoryStorage();
  });

  describe('Resilient AI Tutor transport', () => {
    const profile = { name: 'Aarav', exam: 'JEE', subjects: ['Mathematics'] };

    beforeEach(() => {
      globalThis.localStorage = new MemoryStorage();
      vi.restoreAllMocks();
    });

    it('falls back to a useful offline answer when Ollama is unavailable', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

      const result = await generateTutorResponse({
        text: 'Explain quadratic equations simply.',
        mode: 'Explain Simply',
        profile,
        personalization: { weakSubjects: ['Mathematics'], overall: 50 },
      });

      expect(result.source).toBe('demo');
      expect(result.text).toContain('Quadratic Equations');
      expect(result.notice).toContain('built-in StudyMate Tutor');
    });

    it('discovers an installed model and parses the Ollama chat response', async () => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ models: [{ name: 'tiny-local' }] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: { content: 'Local answer' } }),
        });
      vi.stubGlobal('fetch', fetchMock);

      const result = await generateTutorResponse({
        text: 'What is inertia?',
        mode: 'Tutor',
        profile,
        personalization: {},
      });

      expect(result).toMatchObject({ source: 'ollama', model: 'tiny-local', text: 'Local answer' });
      expect(JSON.parse(fetchMock.mock.calls[1][1].body).model).toBe('tiny-local');
      expect(JSON.parse(fetchMock.mock.calls[1][1].body).stream).toBe(false);
    });
  });
  it('exports and imports state cleanly', () => {
    const sampleState = {
      profile: { name: 'Priya Sharma', exam: 'NEET', subjects: ['Biology'] },
      tasks: [{ id: 'task-101', title: 'Revise Genetics', done: true }],
      attempts: [{ id: 'att-1', title: 'Bio Quiz', score: 95 }],
    };

    const importResult = importData(sampleState);
    expect(importResult.valid).toBe(true);

    const exported = collectData();
    expect(exported.profile.name).toBe('Priya Sharma');
    expect(exported.tasks[0].title).toBe('Revise Genetics');
    expect(exported.attempts[0].score).toBe(95);
  });

  it('resets StudyMate workspace keys completely', () => {
    storage.set('profile', { name: 'Temp' });
    resetStudyMateData();
    expect(storage.get('profile', null)).toBe(null);
  });
});
