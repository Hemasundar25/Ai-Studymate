# StudyMate AI — AI Study Companion & Exam Preparation Platform

StudyMate AI is an offline-first, privacy-respecting study companion designed for students preparing for **JEE, NEET, CAT, UPSC, CBSE Board, and State Board** examinations. Built with React 19, Vite 8, Framer Motion, and Recharts, it features an adaptive learning engine, multi-mode AI tutor, Pomodoro planner, OCR doubt solver, prerequisite knowledge graphs, and simulated peer analytics.

**100% Free & Local**: No account, API key, billing, cloud database, or paid external service is required.

---

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Launch Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in any modern web browser.

### 3. Production Build & Quality Verification
```bash
npm run lint      # ESLint with React 19 rules
npm test          # Vitest suite
npm run build     # Production Vite build
```

The current validation suite covers the offline tutor, Ollama fallback/model discovery,
chat-related service behavior, and local data import/export/reset.

---

## 🌟 Key Features

### Premium interface

StudyMate uses a local, reusable glassmorphism design system with a dark navy
workspace, indigo/violet/cyan accents, responsive cards and controls, accessible
focus states, reduced-motion support, custom scrollbars, and a global `Ctrl/⌘ K`
command palette. The visual layer is CSS-only and adds no paid assets or services.

1. **Personalized Dashboard (`/`)**
   - Exam countdown timer based on your specific target exam date.
   - Real-time readiness calculation with animated orbital indicator.
   - Explainable next-action recommendations with one-click reasoning breakdown.
   - Interactive focus checklist with immediate score recalculation.

2. **Multi-Step Onboarding (`/onboarding`)**
   - Calibrates student name, target examination (JEE, NEET, CAT, UPSC, CBSE, State Board), and exam date.
   - Dynamic subject selection and daily study target slider (1–12 hours).
   - Learning style selector and initial per-subject confidence calibration.

3. **AI Study Tutor (`/chat`)**
   - **5 Educational Modes**: *Tutor*, *Socratic* (guiding questions), *Explain Simply* (analogies), *Doubt Solver* (step-by-step), and *Revision* (high-yield flashcards).
   - Fully functional offline via a deterministic, topic-aware built-in Demo AI; automatically upgrades to local **Ollama** if a local model is available.
   - Conversation drawer: multiple chat sessions, export to `.txt`, and one-click answer copy.

4. **Study Planner & Pomodoro (`/study-plan`)**
   - One-click weekly schedule generator targeting weak subjects.
   - Complete task CRUD with priority levels (High, Medium, Low) and day filters.
   - Built-in Pomodoro focus timer (15m, 25m, 45m blocks) that logs deep work sessions into analytics.

5. **Adaptive Diagnostic (`/diagnostic`)**
   - 9-question baseline assessment that dynamically adjusts difficulty (*Easy*, *Medium*, *Hard*) based on correctness.
   - Identifies verified strengths and critical gaps, feeding directly into the study planner.

6. **Quiz Lab & Mock Exams (`/quiz`)**
   - **Practice Mode**: Untimed, relaxed concept reinforcement.
   - **Mock Exam Mode**: Live countdown timer, auto-submit on expiry, and optional negative marking (+4 / -1 format).
   - Interactive question palette with answered, unanswered, and marked-for-review states.
   - Submit confirmation dialog and error classification breakdown (*Concept Gap*, *Careless Mistake*, *Formula Memory*, *Time Pressure*).

7. **Doubt Solver (`/doubt-solver`)**
   - Local OCR powered by `Tesseract.js` for photos of textbook questions and handwritten notes.
   - Local PDF text extraction powered by `pdfjs-dist`.
   - Editable prompt buffer and step-by-step AI problem solver with export.

8. **Curriculum Knowledge Map (`/knowledge-map`)**
   - Interactive SVG prerequisite graph for *JEE Mathematics*, *NEET Biology*, and *CBSE Science*.
   - Concept nodes color-coded by mastery: Completed, Available, Needs Practice, and Locked.
   - Deep concept inspector with direct "Start Practice" shortcut.

9. **Analytics & Milestone Badges (`/analytics`)**
   - Recharts Radar chart displaying multi-subject competency.
   - Area chart showing historical score trends over time.
   - Simulated peer percentile ranking against fellow aspirants.
   - Reactive achievement milestone badges (*First Steps*, *Flawless*, *Deep Work*, etc.).
   - Printable, jargon-free Parent / Guardian progress report.

10. **Settings & Portability (`/settings`)**
    - Profile editor and live Ollama daemon connection checker (`http://localhost:11434`).
    - Complete data portability: JSON export, JSON import with validation, and scoped local reset.

---

## 🤖 Optional Local LLM (Ollama)

Ollama is completely optional. If you wish to use local open-source LLMs offline:
1. Download Ollama from [ollama.com](https://ollama.com).
2. Pull your preferred model:
   ```bash
   ollama pull llama3.2
   ```
3. Start Ollama. StudyMate will automatically detect it at `http://localhost:11434` and use it for tutor answers.

StudyMate checks `/api/tags`, selects an installed model automatically, sends a supported
`/api/chat` request, and falls back immediately to the built-in tutor if Ollama is offline,
slow, missing a model, or returns an invalid response. No API key is ever required.

---

## 🔒 Privacy & Local-First Philosophy

All user profile data, question attempts, chat transcripts, and focus session logs are stored exclusively in your browser's HTML5 `localStorage`. Zero telemetry, zero paid APIs, zero tracking cookies.
