/**
 * Demo AI response service — generates useful, deterministic responses
 * based on student profile, subject, topic, mastery, and tutor mode.
 * No API key, no network call. Works completely offline.
 */

const subjectTips = {
  Mathematics: [
    'Start by clearly writing what is given and what is to find.',
    'Draw a diagram or number line to visualize the problem.',
    'Check if a formula or identity applies before attempting brute force.',
    'After solving, substitute your answer back to verify it.',
    'Practice similar problems with slight variations to build fluency.',
  ],
  Physics: [
    'Identify the type of motion or force involved first.',
    'Draw a free-body diagram for every mechanics problem.',
    'Keep units consistent — convert everything to SI before calculation.',
    'Energy conservation and momentum conservation are your most powerful tools.',
    'Relate the formula to a physical intuition: what does each term mean?',
  ],
  Chemistry: [
    'Balance the equation before doing any stoichiometric calculation.',
    'Organic reactions follow patterns — group them by mechanism type.',
    'For periodic table trends, remember: left-right, top-bottom patterns.',
    'Learn the exceptions (e.g. Cu, Cr electron configurations) separately.',
    'Practice drawing electron-dot structures for bonding questions.',
  ],
  Biology: [
    'Create mnemonics for taxonomy and classification sequences.',
    'Draw labelled diagrams — examiners award marks for clarity.',
    'Connect processes to their locations: which organelle, which organ?',
    'For genetics, always set up a Punnett square systematically.',
    'Revise human physiology with system-by-system flowcharts.',
  ],
  'Quantitative Aptitude': [
    'Look for shortcuts: divisibility rules, Vedic math tricks.',
    'Estimate before calculating — eliminate obviously wrong options.',
    'Time management is key: skip time-consuming problems, return later.',
    'Convert word problems into equations methodically.',
    'Practice mental math daily for 10 minutes.',
  ],
  'General Studies': [
    'Create a timeline for historical events to see cause-and-effect.',
    'Map-based revision helps for geography questions.',
    'Current affairs need daily 15-minute reading, not cramming.',
    'For polity, understand the "why" behind each constitutional provision.',
    'Make comparative tables: e.g. Lok Sabha vs Rajya Sabha powers.',
  ],
  Science: [
    'Understand the concept before memorizing the formula.',
    'Relate science to everyday life to make it memorable.',
    'Practise numerical problems step by step, showing all working.',
    'Revise diagrams: cell structure, circuits, ray diagrams.',
    'Focus on NCERT — most board questions come directly from it.',
  ],
};

function pickTips(subject, count = 2) {
  const tips = subjectTips[subject] || subjectTips.Science;
  const start = Math.abs(subject.length * 7) % tips.length;
  return Array.from({ length: count }, (_, i) => tips[(start + i) % tips.length]);
}

function getWeakArea(personalization) {
  if (personalization?.weakTopics?.length) {
    return personalization.weakTopics[0].topic;
  }
  if (personalization?.weakSubjects?.length) {
    return personalization.weakSubjects[0];
  }
  return 'your current focus area';
}

function getMastery(personalization, subject) {
  if (personalization?.mastery?.[subject]) {
    return personalization.mastery[subject];
  }
  return personalization?.overall || 50;
}

export function generateDemoResponse({ text, mode, profile, personalization }) {
  const subject = profile?.subjects?.[0] || 'Mathematics';
  const exam = profile?.exam || 'JEE';
  const weak = getWeakArea(personalization);
  const mastery = getMastery(personalization, subject);
  const tips = pickTips(subject);
  const query = text.toLowerCase().trim();

  // ── Revision Mode ─────────────────────────────────────────────────
  if (mode === 'Revision') {
    return `📝 **Quick Revision Card**

**Topic**: ${extractTopic(query, subject)}

**Key Points to Remember:**
1. ${tips[0]}
2. ${tips[1]}

**Formula / Rule:**
The core concept here connects to ${weak}. Your current mastery in ${subject} is ${mastery}%, so focus on understanding the "why" before memorizing.

**Self-Test:**
- Can you explain this concept to someone without notes?
- Can you solve a related problem in under 2 minutes?
- Do you know the common mistake students make here?

**Next Step:** Practice 3 problems on this topic, then revisit your weak area (${weak}).

_This is a local Demo AI revision card. Connect Ollama for deeper explanations._`;
  }

  // ── Socratic Mode ─────────────────────────────────────────────────
  if (mode === 'Socratic') {
    return `Good question! Let me guide you through this step by step, rather than giving the answer directly.

🤔 **First, let's check your foundation:**
What do you already know about ${extractTopic(query, subject)}? Think about the basic definition or rule that applies here.

💡 **Hint 1:**
${tips[0]} — Does this help you see how to start?

🔍 **Guiding Question:**
If you had to break this into two simpler sub-problems, what would they be? Try writing down the first step before reading further.

📌 **Progressive Hint:**
The key insight connects to ${weak}. Your mastery there is ${mastery}%, so let's strengthen that link. Ask yourself: "What prerequisite concept must I be sure about before attempting this?"

When you're ready, share your first attempt and I'll guide you to the complete solution.

_This is Socratic Demo AI mode — designed to help you think, not just copy answers._`;
  }

  // ── Explain Simply Mode ───────────────────────────────────────────
  if (mode === 'Explain Simply') {
    return `Let me break this down in the simplest way possible.

**In plain language:**
${query.replace(/[?!.]+$/, '')} — think of it like this: every complex idea is made of smaller, simpler ideas stacked together.

**Analogy:**
Imagine you're building with LEGO blocks. Each concept is one block. ${extractTopic(query, subject)} is a structure made of a few key blocks. The first block is the definition, the second is the rule, and the third is how to apply it.

**Key takeaway:**
${tips[0]}

**Real-world connection:**
This concept shows up in ${exam} exams because it tests whether you understand the building blocks, not just the final structure.

**Your personal note:**
Since your ${subject} mastery is ${mastery}%, focus on getting the definition crystal clear. Once the foundation is solid, the complex problems become much easier.

_Explained in Demo AI mode. For deeper analogies, connect Ollama._`;
  }

  // ── Doubt Solver Mode ─────────────────────────────────────────────
  if (mode === 'Doubt Solver') {
    return `Let me help you resolve this doubt systematically.

**Understanding the Question:**
You're asking about: ${extractTopic(query, subject)}

**Step-by-step Approach:**
1. **Identify** what is given and what needs to be found
2. **Recall** the relevant formula, law, or definition
3. **Apply** the concept step by step
4. **Verify** your answer by substitution or dimensional analysis

**Common Mistake Alert:**
Students often make errors here because they skip step 1. ${tips[1]}

**For ${exam} specifically:**
This type of question typically appears as a direct application or with a twist. Your weak area (${weak}) connects to this — strengthening it will help.

**Quick Practice:**
Try solving a simpler version of this problem first, then build up to the actual difficulty level.

_This is Demo AI doubt solving. For worked solutions with full math, connect Ollama._`;
  }

  // ── Default Tutor Mode ────────────────────────────────────────────
  // Detect common query patterns
  if (query.includes('weak') || query.includes('improve') || query.includes('struggling')) {
    return `Based on your local profile, here's a targeted improvement plan:

📊 **Your Current Position:**
- ${subject} mastery: ${mastery}%
- Weakest area: ${weak}
- Recommended difficulty: ${personalization?.recommendedDifficulty || 'Medium'}

🎯 **3-Step Recovery Plan:**
1. **Diagnose**: Take a focused 5-question set on ${weak} to identify exact gaps
2. **Build**: Spend ${profile?.dailyHours || 2} hours this week on foundational concepts
3. **Test**: Retake the diagnostic to measure improvement

💡 **Study Tips:**
- ${tips[0]}
- ${tips[1]}

**Next action:** Go to Quiz Lab → select "${weak}" as topic → complete a set. Then check Analytics to see your progress.

_Personalized by Demo AI using your local study data._`;
  }

  if (query.includes('quiz') || query.includes('practice') || query.includes('test me')) {
    return `Let's get you practicing! Here's what I recommend:

🎯 **Personalized Practice Plan:**
- Start with: ${weak} (your lowest-confidence area)
- Difficulty: ${personalization?.recommendedDifficulty || 'Medium'} (based on your ${mastery}% mastery)
- Set size: 5 questions for a focused session

📝 **Before You Start:**
${tips[0]}

**Go to Quiz Lab** and select these filters, or say "quiz me on ${weak}" and I'll help you prepare.

_Demo AI recommendation based on your local performance data._`;
  }

  if (query.includes('plan') || query.includes('schedule') || query.includes('study')) {
    return `Here's a study strategy tailored to your profile:

📅 **Daily ${profile?.dailyHours || 4}-Hour Plan:**
- **Hour 1**: ${weak} — focused concept review and notes
- **Hour 2**: Practice problems (${personalization?.recommendedDifficulty || 'Medium'} difficulty)
- **Hour 3**: Rotate to your second-weakest subject
- **Hour 4**: Mixed revision + 1 timed mini-test

🔥 **Weekly Milestones:**
- Complete at least 3 quiz sets
- Log 5 focus sessions
- Retake diagnostic every 2 weeks

💡 **Tips:**
- ${tips[0]}
- ${tips[1]}

**Go to Study Plan** to create tasks based on this breakdown.

_Personalized by Demo AI from your local exam and profile data._`;
  }

  if (query.includes('explain') || query.includes('what is') || query.includes('define') || query.includes('how does')) {
    return `Great question! Let me explain this clearly.

**Concept: ${extractTopic(query, subject)}**

In ${subject}, this concept is fundamental to ${exam} preparation. Here's the structured breakdown:

1. **Definition**: Start with the precise definition — this is what examiners test first
2. **Key Formula / Rule**: Identify the governing equation or principle
3. **Application**: See how it connects to problems you'll face
4. **Common Pitfalls**: ${tips[1]}

**Connection to Your Learning:**
Your mastery in ${subject} is ${mastery}%. This concept builds on prerequisites you may want to review first. Check the Knowledge Map to see where it fits.

**Next Step:**
${tips[0]}

_Demo AI explanation. For detailed worked examples, connect Ollama._`;
  }

  // Generic helpful response
  return `Thanks for asking about "${text.slice(0, 60)}${text.length > 60 ? '…' : ''}".

Here's how I can help you with this:

📚 **For ${exam} ${subject}:**
Your current mastery is ${mastery}% and your main focus area should be ${weak}.

💡 **Quick Guidance:**
- ${tips[0]}
- ${tips[1]}

🎯 **Recommended Actions:**
1. Check the **Knowledge Map** to see prerequisite concepts
2. Take a **Quiz** on this topic to test your understanding
3. Use **Study Plan** to schedule focused practice time

**Try asking me:**
- "Explain [topic] simply"
- "Quiz me on [subject]"
- "How do I improve in [weak area]"
- "Create a study plan for this week"

_This is Demo AI mode — responses are generated locally from your study data. For open-ended answers, connect Ollama at localhost:11434._`;
}

function extractTopic(query, fallbackSubject) {
  // Try to extract a meaningful topic from the query
  const patterns = [
    /(?:explain|what is|define|about|learn|understand|study|practice|help with)\s+(.+)/i,
    /(.+?)(?:\?|!|please|help|explain)/i,
  ];
  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match && match[1].trim().length > 2 && match[1].trim().length < 80) {
      return match[1].trim();
    }
  }
  return fallbackSubject;
}

/**
 * Attempt Ollama generation with graceful fallback to Demo AI.
 */
export async function generateResponse({ text, mode, profile, personalization, signal }) {
  try {
    const controller = signal ? undefined : new AbortController();
    const abortSignal = signal || controller?.signal;

    const result = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: localStorage.getItem('studymate:ollama-model') || 'llama3.2',
        prompt: buildOllamaPrompt({ text, mode, profile, personalization }),
        stream: false,
      }),
      signal: abortSignal,
    });

    if (!result.ok) throw new Error('Ollama unavailable');

    const data = await result.json();
    return { text: data.response, source: 'ollama' };
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    // Graceful fallback to Demo AI
    return {
      text: generateDemoResponse({ text, mode, profile, personalization }),
      source: 'demo',
    };
  }
}

function buildOllamaPrompt({ text, mode, profile, personalization }) {
  const context = `You are StudyMate AI, a ${mode} tutor for ${profile?.exam || 'JEE'} preparation.
Student: ${profile?.name || 'Student'}, studying ${profile?.subjects?.join(', ') || 'general subjects'}.
Mastery: ${JSON.stringify(personalization?.mastery || {})}.
Weak areas: ${personalization?.weakSubjects?.join(', ') || 'not yet identified'}.
Mode: ${mode}.`;

  const modeInstructions = {
    Tutor: 'Provide clear, educational explanations with examples.',
    Socratic: 'Ask guiding questions. Give hints progressively. Do NOT reveal the answer immediately.',
    'Explain Simply': 'Use simple language, analogies, and everyday examples. Avoid jargon.',
    'Doubt Solver': 'Provide a systematic step-by-step solution with reasoning for each step.',
    Revision: 'Create a concise revision card with key points, formulas, and a self-test question.',
  };

  return `${context}\n${modeInstructions[mode] || modeInstructions.Tutor}\n\nStudent question: ${text}`;
}

/**
 * Check if Ollama is available at localhost:11434.
 */
export async function checkOllamaStatus() {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return { available: false, models: [] };
    const data = await response.json();
    const models = (data.models || []).map((m) => m.name || m.model);
    return { available: true, models };
  } catch {
    return { available: false, models: [] };
  }
}
