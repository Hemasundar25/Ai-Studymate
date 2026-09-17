/**
 * StudyMate AI — Comprehensive AI Tutor Engine (aiTutorService.js)
 * 
 * Strict ₹0 offline-first architecture:
 * 1. Rich built-in Demo AI Tutor with topic-aware intelligence across 7+ subjects
 *    and 5 pedagogical modes (Tutor, Socratic, Explain Simply, Doubt Solver, Revision).
 * 2. Dedicated solvers for algebra (linear equations, quadratic formulas, arithmetic).
 * 3. Specialized deep-dive modules for high-yield competitive topics (Newton's laws,
 *    photosynthesis, quadratic equations, calculus, genetics, etc.).
 * 4. Safe, resilient local Ollama integration (http://localhost:11434) with
 *    non-blocking timeout, dynamic model detection, and seamless Demo AI fallback.
 */

import { storage } from './storage';

// ── 1. Algebraic & Mathematical Solvers ─────────────────────────────

/**
 * Solve basic linear equations of form: ax + b = c, or 2x + 5 = 17
 */
function trySolveLinearEquation(text) {
  const clean = text.replace(/help\s+me\s+solve/gi, '')
                    .replace(/solve/gi, '')
                    .replace(/what\s+is\s+x\s+in/gi, '')
                    .replace(/[?!.]/g, '')
                    .trim();

  // Pattern: [+-]?(\d*)x\s*([+-]\s*\d+)?\s*=\s*([+-]?\d+)
  const match = clean.match(/^([+-]?\d*)\s*([a-zA-Z])\s*([+-]\s*\d+)?\s*=\s*([+-]?\d+)$/);
  if (!match) return null;

  const rawA = match[1].replace(/\s+/g, '');
  const variable = match[2];
  const rawB = match[3] ? match[3].replace(/\s+/g, '') : '+0';
  const rawC = match[4].replace(/\s+/g, '');

  let a = rawA === '' || rawA === '+' ? 1 : rawA === '-' ? -1 : Number(rawA);
  let b = Number(rawB);
  let c = Number(rawC);

  if (isNaN(a) || isNaN(b) || isNaN(c) || a === 0) return null;

  const step1Result = c - b;
  const finalAnswer = step1Result / a;
  const isInteger = Number.isInteger(finalAnswer);
  const formattedAns = isInteger ? finalAnswer : finalAnswer.toFixed(2);

  return {
    equation: `${a !== 1 ? (a === -1 ? '-' : a) : ''}${variable} ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${c}`,
    variable,
    a,
    b,
    c,
    step1Result,
    finalAnswer: formattedAns,
  };
}

// ── 2. Specialized Subject Knowledge Bases ─────────────────────────

const knowledgeBase = {
  quadratic: {
    title: 'Quadratic Equations (ax² + bx + c = 0)',
    subject: 'Mathematics',
    definition: 'A quadratic equation is a second-degree polynomial equation in a single variable where the highest exponent of the variable is 2.',
    formula: 'x = (-b ± √(b² - 4ac)) / (2a)',
    discriminant: 'D = b² - 4ac. If D > 0: two real & distinct roots; if D = 0: two equal real roots; if D < 0: two complex conjugate roots.',
    analogy: 'Think of throwing a cricket ball or basketball into the air. The path it traces is a parabola (a smooth U-shaped curve). The moment the ball leaves the ground and the moment it lands are the two "roots" or solutions of the quadratic curve.',
    workedExample: 'For 2x² - 4x - 6 = 0:\n  • a = 2, b = -4, c = -6\n  • D = (-4)² - 4(2)(-6) = 16 + 48 = 64\n  • x = (4 ± √64) / (2 × 2) = (4 ± 8) / 4\n  • Roots: x = 3 and x = -1.',
    socraticQuestions: [
      'What is the highest power of x in a quadratic expression, and what shape does its graph make?',
      'If the discriminant b² - 4ac turns out to be negative, can we take the square root of a negative real number? What does that tell us about real roots?',
    ],
    socraticHint: 'First check if the equation can be factored cleanly before jumping to the quadratic formula. Look for two numbers that multiply to give (a × c) and add up to give b.',
    revisionPoints: [
      'Standard form: ax² + bx + c = 0 (where a ≠ 0)',
      'Quadratic formula: x = [-b ± √(b² - 4ac)] / 2a',
      'Nature of roots: D > 0 (distinct real), D = 0 (repeated real), D < 0 (complex roots)',
      'Sum of roots (α + β) = -b/a, Product of roots (αβ) = c/a',
    ],
    practiceQuestion: 'Find the nature of roots for 3x² - 6x + 3 = 0. (Hint: Calculate D = b² - 4ac)',
    practiceAnswer: 'D = (-6)² - 4(3)(3) = 36 - 36 = 0. Since D = 0, the equation has two real and equal roots: x = 1.',
  },

  newtonsLaws: {
    title: "Newton's Laws of Motion",
    subject: 'Physics',
    definition: "Sir Isaac Newton's three fundamental laws form the bedrock of classical mechanics, relating the motion of an object to the forces acting upon it.",
    formula: 'F_net = m · a (Second Law) | p = m · v (Momentum) | F_AB = -F_BA (Third Law)',
    analogy: 'Imagine standing on a bus when the driver suddenly hits the brakes. Your feet stop with the floor, but your upper body lunges forward because it wants to keep moving at the same speed. That resistance to change is Inertia (First Law)!',
    workedExample: 'A 5 kg block is accelerated at 4 m/s² on a frictionless surface.\n  • F = m × a\n  • F = 5 kg × 4 m/s² = 20 N.\n  • If the pushing force ceases, by Newton\'s 1st Law, the block continues moving at a constant velocity.',
    socraticQuestions: [
      'If no net external force acts on a spaceship cruising in deep interstellar space, will it slow down, speed up, or continue at constant velocity?',
      'When you jump off a small boat onto the dock, why does the boat push backward in the water as you leap forward?',
    ],
    socraticHint: 'Remember that Newton\'s Second Law specifies the NET force (vector sum of all applied forces), not just any individual pushing force.',
    revisionPoints: [
      '1st Law (Inertia): An object remains at rest or in uniform straight-line motion unless acted upon by a net external force.',
      '2nd Law (Force & Acceleration): Net Force = rate of change of momentum (F = dp/dt = ma for constant mass).',
      '3rd Law (Action-Reaction): For every action, there is an equal in magnitude and opposite in direction reaction acting on DIFFERENT bodies simultaneously.',
    ],
    practiceQuestion: 'A 1000 kg car accelerates from rest to 20 m/s in 5 seconds. What is the average net force acting on the car?',
    practiceAnswer: 'Acceleration a = (20 - 0) / 5 = 4 m/s². Net Force F = m × a = 1000 kg × 4 m/s² = 4000 N.',
  },

  photosynthesis: {
    title: 'Photosynthesis in Plants',
    subject: 'Biology / Chemistry',
    definition: 'Photosynthesis is the biochemical process by which green plants, algae, and cyanobacteria convert light energy into chemical energy stored in glucose molecules.',
    formula: '6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂ (in the presence of chlorophyll)',
    analogy: 'Think of a plant leaf as a solar-powered gourmet bakery. The solar panels are chlorophyll pigments in chloroplasts. The raw ingredients delivered are water (from roots) and carbon dioxide (from air). The baked bread is glucose (stored energy), and the fresh exhaust released into the kitchen is oxygen!',
    workedExample: 'Two main stages:\n  1. Light-Dependent Reactions: Occur in the thylakoid membranes. Sunlight splits water (photolysis), releasing O₂ and generating energy carriers ATP & NADPH.\n  2. Light-Independent Reactions (Calvin Cycle): Occurs in the stroma. The enzyme RuBisCO fixes atmospheric CO₂ into carbohydrates using ATP and NADPH.',
    socraticQuestions: [
      'Where does the oxygen that plants release actually come from: the carbon dioxide molecules (CO₂) or the water molecules (H₂O)?',
      'Why do most plant leaves appear green to the human eye, even though they absorb sunlight for photosynthesis?',
    ],
    socraticHint: 'Chlorophyll pigments absorb blue and red wavelengths strongly, but reflect green light. Also, heavy isotope experiments (Ruben & Kamen) proved that evolved O₂ originates from the splitting of H₂O.',
    revisionPoints: [
      'Overall equation: 6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂',
      'Site: Chloroplasts (Thylakoids for light reactions, Stroma for Calvin cycle)',
      'Key Pigments: Chlorophyll a (primary), Chlorophyll b, Carotenoids (accessory pigments)',
      'Key Enzyme: RuBisCO (Ribulose-1,5-bisphosphate carboxylase-oxygenase)',
      'Limiting Factors: Light intensity, CO₂ concentration, and temperature (Blackman’s Law)',
    ],
    practiceQuestion: 'What are the two high-energy chemical products generated during the light-dependent stage that power the Calvin Cycle?',
    practiceAnswer: 'ATP (Adenosine Triphosphate) and NADPH (Nicotinamide Adenine Dinucleotide Phosphate).',
  },

  calculus: {
    title: 'Differential & Integral Calculus',
    subject: 'Mathematics',
    definition: 'Calculus is the mathematical study of continuous change, divided into Differential Calculus (rates of change, slopes of curves) and Integral Calculus (accumulation of quantities, areas under curves).',
    formula: 'Derivative: f\'(x) = lim_{h→0} [f(x+h) - f(x)]/h | Integration by Parts: ∫u dv = u·v - ∫v du',
    analogy: 'Imagine driving a car on a road trip. Your speedometer tells you your instantaneous rate of change (derivative) at that exact second. Your odometer and trip meter tell you the total accumulated distance traveled (integral) over time.',
    workedExample: 'To find ∫ x · e^x dx:\n  • Let u = x (so du = dx) and dv = e^x dx (so v = e^x)\n  • Applying ∫u dv = u·v - ∫v du:\n  • ∫ x · e^x dx = x · e^x - ∫ e^x dx = x · e^x - e^x + C = e^x(x - 1) + C.',
    socraticQuestions: [
      'What geometric property of a curved line does the first derivative f\'(x) represent at any given point?',
      'Why is integration considered the inverse operation of differentiation (Fundamental Theorem of Calculus)?',
    ],
    socraticHint: 'Remember the ILATE rule for choosing "u" in integration by parts: Inverse trig, Logarithmic, Algebraic, Trigonometric, Exponential.',
    revisionPoints: [
      'd/dx (x^n) = n·x^(n-1)',
      'd/dx (sin x) = cos x, d/dx (cos x) = -sin x',
      'Product Rule: (u·v)\' = u\'v + uv\'',
      'Chain Rule: d/dx [f(g(x))] = f\'(g(x)) · g\'(x)',
      '∫ x^n dx = (x^(n+1))/(n+1) + C (for n ≠ -1)',
    ],
    practiceQuestion: 'Differentiate f(x) = 3x³ - 5x + 7 with respect to x.',
    practiceAnswer: 'f\'(x) = d/dx(3x³) - d/dx(5x) + d/dx(7) = 9x² - 5.',
  },

  genetics: {
    title: 'Genetics & Mendelian Inheritance',
    subject: 'Biology',
    definition: 'Genetics is the branch of biology concerned with the study of genes, genetic variation, and heredity in organisms.',
    formula: 'Monohybrid Phenotypic Ratio: 3:1 | Genotypic Ratio: 1:2:1 (Homozygous Dominant : Heterozygous : Homozygous Recessive)',
    analogy: 'Imagine recipe cards passed down from parents. Each parent contributes one copy of the recipe (allele). If one recipe card is written in bold permanent marker (dominant) and the other in light pencil (recessive), the kitchen prepares the bold recipe whenever it is present!',
    workedExample: 'Crossing two heterozygous tall pea plants (Tt × Tt):\n  • Gametes: T and t from both parents\n  • Punnett Square cells: TT, Tt, Tt, tt\n  • Phenotype: 3 Tall (TT, Tt, Tt) : 1 Dwarf (tt)\n  • Genotype: 1 TT : 2 Tt : 1 tt.',
    socraticQuestions: [
      'If an organism has a dominant phenotype, how can you determine whether its genotype is homozygous (TT) or heterozygous (Tt)?',
      'Why do recessive sex-linked traits (like color blindness) appear much more frequently in human males than in females?',
    ],
    socraticHint: 'Mendel used a "Test Cross" (crossing the unknown individual with a homozygous recessive individual) to determine whether the parent was purebred or heterozygous.',
    revisionPoints: [
      'Mendel\'s 1st Law: Law of Segregation (alleles separate during gamete formation)',
      'Mendel\'s 2nd Law: Law of Independent Assortment (genes for different traits assort independently)',
      'Phenotypic monohybrid ratio: 3:1; Dihybrid ratio: 9:3:3:1',
      'Codominance example: ABO blood groups (IA and IB are codominant over i)',
    ],
    practiceQuestion: 'What percentage of offspring will be dwarf from a cross between a heterozygous tall plant (Tt) and a dwarf plant (tt)?',
    practiceAnswer: 'Punnett cross Tt × tt produces 50% Tt (tall) and 50% tt (dwarf). Therefore, 50% will be dwarf.',
  },

  chemistryBonding: {
    title: 'Chemical Bonding & Periodic Trends',
    subject: 'Chemistry',
    definition: 'Chemical bonding refers to the attractive forces that hold atoms or ions together to create molecules and crystalline compounds.',
    formula: 'Formal Charge = Valence Electrons - Non-bonding Electrons - 1/2(Bonding Electrons)',
    analogy: 'Atoms are like people seeking emotional stability. For atoms, ultimate stability means having a complete outer electron shell (octet rule). Ionic bonding is like one atom giving away a toy and another taking it, whereas covalent bonding is like two kids sharing toys in the middle!',
    workedExample: 'Periodic Trends across a Period (left to right):\n  • Atomic Radius: Decreases due to increasing effective nuclear charge (Z_eff).\n  • Ionization Energy: Increases because electrons are pulled closer to the nucleus.\n  • Electronegativity: Increases (Fluorine is most electronegative at 4.0).',
    socraticQuestions: [
      'Why does atomic radius increase as you move DOWN a group in the periodic table, even though the positive nuclear charge is increasing?',
      'Between Na+ and F-, which ion has a smaller ionic radius, and why (considering they are isoelectronic)?',
    ],
    socraticHint: 'Think about electron shielding: every step down a column adds an entire new principal energy shell (n = 1, 2, 3...) which shields outer electrons.',
    revisionPoints: [
      'Ionic Bond: Electrostatic attraction between cations and anions (metal + non-metal)',
      'Covalent Bond: Mutual sharing of electron pairs (non-metal + non-metal)',
      'Periodic trends across period (L→R): Radius ↓, Ionization Energy ↑, Electronegativity ↑',
      'Periodic trends down group (Top→Bottom): Radius ↑, Ionization Energy ↓, Electronegativity ↓',
    ],
    practiceQuestion: 'Arrange in order of increasing atomic radius: Li, Na, K.',
    practiceAnswer: 'Li < Na < K. Atomic radius increases down Group 1 as new electron shells are added.',
  },

  quantitativeAptitude: {
    title: 'Percentages, Ratios & Speed-Time-Distance',
    subject: 'Quantitative Aptitude',
    definition: 'Quantitative Aptitude tests numerical fluency, proportional reasoning, and arithmetic problem-solving under time constraints.',
    formula: 'Speed = Distance / Time | Average Speed = 2·v1·v2 / (v1 + v2) for equal distances | Profit % = (Profit / CP) × 100',
    analogy: 'Think of speed like your phone\'s battery discharge: if you use heavy apps (high speed), you drain the battery (time) faster. If you go at double speed, the time required to reach the destination drops by half.',
    workedExample: 'A train traveling at 72 km/h crosses an electric pole in 10 seconds.\n  • Convert km/h to m/s: 72 × (5/18) = 20 m/s\n  • Distance = Speed × Time = 20 m/s × 10 s = 200 meters (the length of the train).',
    socraticQuestions: [
      'If an article\'s price is increased by 20% and then decreased by 20%, is the final price equal to the original price, higher, or lower?',
      'Why can you NOT simply take the arithmetic average (v1 + v2)/2 to calculate average speed when traveling equal distances at different speeds?',
    ],
    socraticHint: 'Multiply by 5/18 to convert km/h into m/s, or by 18/5 to convert m/s into km/h.',
    revisionPoints: [
      'Speed = Distance / Time; 1 km/h = 5/18 m/s',
      'If A is x% more than B, then B is [x / (100 + x)] × 100% less than A',
      'Successive percentage changes of a% and b%: Net % = a + b + (ab / 100)',
      'Work done = Rate × Time; If A does work in n days, 1-day work is 1/n',
    ],
    practiceQuestion: 'If a car travels from town A to town B at 60 km/h and returns at 40 km/h, what is the average speed for the entire round trip?',
    practiceAnswer: 'Harmonic mean for equal distances: 2 × 60 × 40 / (60 + 40) = 4800 / 100 = 48 km/h.',
  },

  generalStudies: {
    title: 'Indian Polity & Fundamental Rights',
    subject: 'General Studies / UPSC',
    definition: 'Indian Polity encompasses the constitutional framework, governance systems, distribution of powers, and civic rights in the Republic of India.',
    formula: 'Key Articles: Art 14 (Equality), Art 19 (Freedoms), Art 21 (Life & Liberty), Art 32 (Constitutional Remedies)',
    analogy: 'The Constitution is like the master operating system (OS) of a country. Laws passed by Parliament are software applications running on top. If any app conflicts with the master OS kernel (the Constitution), the judiciary (Supreme Court) acts as the anti-virus and strikes it down as unconstitutional (Article 13).',
    workedExample: 'Article 32 is described by Dr. B.R. Ambedkar as the "Heart and Soul of the Constitution" because it guarantees the right to move the Supreme Court directly via Writs (Habeas Corpus, Mandamus, Prohibition, Certiorari, Quo-Warranto) for the enforcement of Fundamental Rights.',
    socraticQuestions: [
      'Why are Fundamental Rights (Part III) justiciable in courts, whereas Directive Principles of State Policy (Part IV) are non-justiciable?',
      'Can the Indian Parliament amend any part of the Constitution under Article 368, including the Fundamental Rights? What limitation was set by the Kesavananda Bharati case (1973)?',
    ],
    socraticHint: 'Remember the "Basic Structure Doctrine" established in 1973: Parliament has wide amending powers, but cannot alter the fundamental foundation or basic structure of the Constitution.',
    revisionPoints: [
      'Part III (Articles 12 to 35): Fundamental Rights',
      'Golden Triangle of Rights: Article 14 (Equality), Article 19 (Freedom), Article 21 (Life and Liberty)',
      '5 Writs under Art 32 (SC) and Art 226 (HC): Habeas Corpus, Mandamus, Prohibition, Certiorari, Quo-Warranto',
      'Right to Education: Article 21A added via 86th Constitutional Amendment Act 2002',
    ],
    practiceQuestion: 'Which writ is issued by a court to secure the release of a person who has been detained unlawfully?',
    practiceAnswer: 'Habeas Corpus (literally translates to "To have the body of").',
  },
};

// ── 3. Query Intent & Topic Detection ──────────────────────────────

function detectKnowledgeTopic(query) {
  const q = query.toLowerCase();

  if (q.includes('quadratic') || (q.includes('equation') && (q.includes('ax') || q.includes('degree') || q.includes('root')))) {
    return knowledgeBase.quadratic;
  }
  if (q.includes('newton') || q.includes('law of motion') || q.includes('laws of motion') || q.includes('inertia') || q.includes('f = ma') || q.includes('f=ma')) {
    return knowledgeBase.newtonsLaws;
  }
  if (q.includes('photosynthesis') || q.includes('calvin cycle') || q.includes('chlorophyll') || q.includes('thylakoid') || q.includes('light reaction')) {
    return knowledgeBase.photosynthesis;
  }
  if (q.includes('calculus') || q.includes('integral') || q.includes('derivative') || q.includes('differentiate') || q.includes('integration') || q.includes('limit')) {
    return knowledgeBase.calculus;
  }
  if (q.includes('genetics') || q.includes('mendel') || q.includes('punnett') || q.includes('allele') || q.includes('heredity') || q.includes('chromosome')) {
    return knowledgeBase.genetics;
  }
  if (q.includes('bonding') || q.includes('periodic table') || q.includes('electronegativity') || q.includes('atomic radius') || q.includes('covalent') || q.includes('ionic')) {
    return knowledgeBase.chemistryBonding;
  }
  if (q.includes('percentage') || q.includes('ratio') || q.includes('speed') || q.includes('time and work') || q.includes('train') || q.includes('profit and loss') || q.includes('aptitude')) {
    return knowledgeBase.quantitativeAptitude;
  }
  if (q.includes('polity') || q.includes('constitution') || q.includes('fundamental right') || q.includes('preamble') || q.includes('article') || q.includes('upsc') || q.includes('parliament')) {
    return knowledgeBase.generalStudies;
  }

  return null;
}

/**
 * Detect intended pedagogical mode from user query if explicitly stated.
 */
function resolveMode(requestedMode, query) {
  const q = query.toLowerCase();
  if (q.includes('socratic')) return 'Socratic';
  if (q.includes('explain simply') || q.includes('simply') || q.includes('simple terms') || q.includes('eli5')) return 'Explain Simply';
  if (q.includes('revision') || q.includes('revise') || q.includes('quick revision') || q.includes('flashcard')) return 'Revision';
  if (q.includes('doubt') || q.includes('step by step') || q.includes('step-by-step') || q.includes('help me solve')) return 'Doubt Solver';
  if (requestedMode) return requestedMode;
  return 'Tutor';
}

// ── 4. Deterministic Offline Demo AI Generator ──────────────────────

export function generateDemoResponse({ text, mode: requestedMode, profile, personalization }) {
  const mode = resolveMode(requestedMode, text);
  const query = text.trim();

  // Check for direct linear equation solving
  const linearSolution = trySolveLinearEquation(query);
  if (linearSolution) {
    return formatLinearEquationSolution(linearSolution, mode);
  }

  // Check for matched knowledge base topic
  const kbTopic = detectKnowledgeTopic(query);
  if (kbTopic) {
    return formatTopicResponse(kbTopic, mode, profile);
  }

  // Generic subject-aware heuristic response
  return formatGeneralAcademicResponse({ query, mode, profile, personalization });
}

function formatLinearEquationSolution(sol, mode) {
  const { equation, variable, a, b, c, step1Result, finalAnswer } = sol;

  if (mode === 'Socratic') {
    return `Let's solve **${equation}** together step by step!

🤔 **Guiding Question 1:**
Our goal is to isolate the variable **${variable}**. Currently, we have **${b >= 0 ? '+' + b : b}** on the left side with ${a !== 1 ? a + variable : variable}. What opposite operation should we perform on both sides of the equation to eliminate that constant?

💡 **Hint:**
Whenever you add or subtract the same value on BOTH sides, the equality remains balanced.
${b !== 0 ? `Try subtracting ${b} from both sides: ${a !== 1 ? a + variable : variable} = ${c} - (${b})` : ''}

🔍 **Guiding Question 2:**
Once you get **${a !== 1 ? a + variable : variable} = ${step1Result}**, how do you isolate **${variable}** when it is multiplied by **${a}**?

✨ **Final Solution:**
1. Subtract ${b} from both sides:
   ${a !== 1 ? a + variable : variable} = ${c} - ${b}
   ${a !== 1 ? a + variable : variable} = ${step1Result}
2. Divide both sides by ${a}:
   **${variable} = ${finalAnswer}**
3. Verification:
   ${a}(${finalAnswer}) + (${b}) = ${a * finalAnswer + b} = ${c} ✓ Holds true!

_Generated by StudyMate Socratic AI Tutor._`;
  }

  if (mode === 'Explain Simply') {
    return `Let's break down **${equation}** using a simple balance scale analogy!

⚖️ **The Balance Scale Analogy:**
Think of the equals sign (=) as an old-fashioned grocery scale that is perfectly balanced. 
On the left tray, you have: **${a !== 1 ? a + ' mystery boxes (' + variable + ')' : '1 mystery box (' + variable + ')'} plus ${b} single gram weights**.
On the right tray, you have: **${c} single gram weights**.

**Step 1: Clear the extra weights**
Take away ${b} weights from BOTH sides so the scale stays level:
Left tray: ${a !== 1 ? a + variable : variable}
Right tray: ${c} - ${b} = **${step1Result}**

**Step 2: Find what one box weighs**
${a !== 1 ? `Since ${a} identical mystery boxes weigh ${step1Result} grams together, each single box weighs:\n${step1Result} ÷ ${a} = **${finalAnswer}**` : `The single mystery box weighs **${finalAnswer}**!`}

**Answer:**
**${variable} = ${finalAnswer}**

_Explained simply using StudyMate everyday intuition._`;
  }

  if (mode === 'Revision') {
    return `📝 **Linear Equation Quick Card**

**Target Equation:** ${equation}

**Core Rules:**
1. Maintain balance: whatever operation is done to the left side must be done to the right side.
2. Isolate terms containing the variable on one side and constant values on the other.
3. Divide by the variable's coefficient to find the final value.

**Quick Steps:**
• ${equation}
• ${a !== 1 ? a + variable : variable} = ${c} - (${b}) = ${step1Result}
• ${variable} = ${step1Result} / ${a} = **${finalAnswer}**

**Self-Test Verification:**
Substitute ${variable} = ${finalAnswer} into ${equation}:
${a}(${finalAnswer}) + ${b} = ${a * finalAnswer + b} = ${c} (Matches right-hand side).

_StudyMate Revision Card — 100% verified._`;
  }

  // Default Tutor / Doubt Solver
  return `Here is the complete step-by-step solution for **${equation}**:

**Problem Statement:**
Solve for **${variable}** in the linear equation:
\`\`\`text
${equation}
\`\`\`

**Step 1: Isolate the variable term**
Subtract **${b}** from both sides of the equation to eliminate the constant on the left:
\`\`\`text
${a !== 1 ? a + variable : variable} + ${b} - ${b} = ${c} - ${b}
${a !== 1 ? a + variable : variable} = ${step1Result}
\`\`\`

**Step 2: Solve for ${variable}**
Divide both sides by the coefficient of ${variable} (which is **${a}**):
\`\`\`text
${variable} = ${step1Result} / ${a}
${variable} = ${finalAnswer}
\`\`\`

**Step 3: Verification (Check your work)**
Substitute **${variable} = ${finalAnswer}** back into the original equation:
\`\`\`text
Left Hand Side (LHS) = ${a}(${finalAnswer}) + (${b})
                     = ${a * finalAnswer} + (${b})
                     = ${c}
Right Hand Side (RHS) = ${c}
Since LHS = RHS, the solution is verified and correct!
\`\`\`

**Final Result:**
**${variable} = ${finalAnswer}**`;
}

function formatTopicResponse(topic, mode, profile) {
  const studentName = profile?.name?.split(' ')[0] || 'Student';
  const targetExam = profile?.exam || 'JEE';

  if (mode === 'Explain Simply') {
    return `Hello ${studentName}! Here is **${topic.title}** explained in plain, simple language:

📖 **In Everyday Words:**
${topic.definition}

💡 **The Big Real-World Analogy:**
${topic.analogy}

⚡ **Core Takeaway:**
\`\`\`text
${topic.formula}
\`\`\`

🎯 **Worked Example to Cement It:**
${topic.workedExample}

📌 **Why this matters for your ${targetExam} preparation:**
Exam questions rarely ask for pure memorization — they test whether you understand the fundamental mechanics behind the formula. Master the analogy, and the math becomes second nature!

_Explained simply in StudyMate Tutor mode._`;
  }

  if (mode === 'Socratic') {
    return `Great topic to explore, ${studentName}! Let's guide you through **${topic.title}** Socratically:

🤔 **Guiding Question 1:**
${topic.socraticQuestions[0]}

💡 **Helpful Hint:**
${topic.socraticHint}

🔍 **Guiding Question 2:**
${topic.socraticQuestions[1]}

📚 **Key Principle Breakdown:**
• **Definition**: ${topic.definition}
• **Governing Rule**: \`${topic.formula}\`

✏️ **Take a moment:**
Try answering the two guiding questions in your head or notes before checking the worked application below:
${topic.workedExample}

_Socratic Mode: Training you to deduce solutions from foundational principles._`;
  }

  if (mode === 'Revision') {
    return `📝 **High-Yield Revision Flashcard: ${topic.title}**

**Target Examination:** ${targetExam} | **Subject:** ${topic.subject}

📋 **Core Concepts & Key Takeaways:**
${topic.revisionPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

⚡ **Essential Formula / Law:**
\`\`\`text
${topic.formula}
\`\`\`

🧠 **Rapid Self-Test:**
**Question:** ${topic.practiceQuestion}

**Answer & Explanation:**
${topic.practiceAnswer}

🎯 **Next Step:**
Log a 25-minute Pomodoro session in your Study Plan to solve 5 practice problems on this exact topic.

_StudyMate Revision Engine — High-yield, concise, and exam-ready._`;
  }

  if (mode === 'Doubt Solver') {
    return `Here is a systematic step-by-step breakdown for **${topic.title}**:

1️⃣ **Identify What is Given & Concept Scope:**
${topic.definition}
Target: Understand the governing laws and apply them accurately to problem solving.

2️⃣ **Governing Laws & Formulas:**
\`\`\`text
${topic.formula}
\`\`\`

3️⃣ **Step-by-Step Resolution & Worked Application:**
${topic.workedExample}

4️⃣ **Common Student Pitfalls to Avoid:**
• Always verify units before calculation (ensure SI units: meters, kilograms, seconds, Newtons).
• Do not confuse scalar quantities with vector quantities.
• Remember: ${topic.socraticHint}

5️⃣ **Verification Check:**
Substitute your calculated values back into the primary equations to verify that conservation laws and dimensional consistency are maintained.

_Step-by-step Doubt Solver — StudyMate AI._`;
  }

  // Default Tutor Mode
  return `Welcome to your study session on **${topic.title}** (${topic.subject})!

### 1. Conceptual Foundation
${topic.definition}

### 2. Governing Equations & Principles
\`\`\`text
${topic.formula}
\`\`\`

### 3. Intuitive Understanding
${topic.analogy}

### 4. Step-by-Step Worked Demonstration
${topic.workedExample}

### 5. Exam Readiness Notes for ${targetExam}
• **Weightage:** This is a cornerstone topic that regularly appears in both foundational and numerical sections.
• **Weak Area Check:** Your current focus area connects directly to these concepts.
• **Recommended Practice:** Try solving at least 3 varied difficulty problems in the Quiz Lab to test your retention.

_StudyMate AI Tutor — Local intelligent tutor._`;
}

function formatGeneralAcademicResponse({ query, mode, profile, personalization }) {
  const subject = profile?.subjects?.[0] || 'General Studies';
  const exam = profile?.exam || 'JEE';
  const weakSubject = personalization?.weakSubjects?.[0] || subject;
  const mastery = personalization?.overall || 65;

  if (mode === 'Revision') {
    return `📝 **Quick Study & Revision Blueprint**

**Topic / Query:** "${query.slice(0, 70)}"
**Exam Track:** ${exam} | **Focus Subject:** ${weakSubject}

**Key Principles to Review:**
1. **First Principles**: State the exact definition and verify the physical/mathematical parameters involved.
2. **Formula Sheet**: Check that all constants, units, and boundary conditions are known before solving.
3. **Common Trap**: Watch out for sign conventions and negative markings in competitive tests (+4 / -1).

**Self-Test Check:**
• Can you derive the primary governing equation without looking at notes?
• Can you solve a baseline problem on this in under 90 seconds?

**Next Move:** Head to Quiz Lab and select **${weakSubject}** for an adaptive 5-question sprint!

_StudyMate Revision Mode — Deterministic offline response._`;
  }

  if (mode === 'Socratic') {
    return `Let's work through your question about **"${query.slice(0, 60)}"** Socratically:

🤔 **Foundation Question:**
Before looking at the final solution, what is the core scientific or mathematical law that governs this scenario?

💡 **Guiding Hint:**
Break down the question into three clear components:
1. What values or assumptions are explicitly given?
2. What target quantity are you asked to find or explain?
3. Which intermediate formula connects the given parameters to the target?

🔍 **Guiding Question 2:**
If you change one variable (e.g. increase the temperature, double the mass, or change the sign), how would you expect the result to change?

Share your thinking or first calculation step, and we will verify it together!

_StudyMate Socratic Tutor Mode._`;
  }

  if (mode === 'Explain Simply') {
    return `Let's explain **"${query.slice(0, 60)}"** simply and intuitively!

💡 **In Plain Words:**
Complex academic topics look intimidating because of heavy jargon. At its core, this concept is just a rule for how different parts of a system interact.

🏰 **Practical Everyday Analogy:**
Think of it like cooking a recipe:
• The ingredients are your inputs (given data, forces, concentrations).
• The cooking process is the governing law (equations, chemical bonds, logic).
• The finished dish is your answer (equilibrium, velocity, proof).
If you adjust one ingredient, the final taste changes in a predictable, calculated way.

🎯 **Key Rule to Remember:**
Always write down what you know first, eliminate impossible options, and verify the units.

_StudyMate Explain Simply Mode._`;
  }

  // Default Tutor / Doubt Solver
  return `Hello! Let's explore your query: **"${query.slice(0, 80)}"** for **${exam}** preparation.

### 📚 Structured Approach:
1. **Core Concept**:
   This topic plays an important role in **${weakSubject}**. For ${exam}, examiners test whether you understand the fundamental assumptions, not just plug-and-chug math.

2. **Step-by-Step Methodology**:
   • **Step 1**: Write down the given quantities with their correct units.
   • **Step 2**: Recall the primary identity or theorem.
   • **Step 3**: Substitute given parameters and simplify systematically.
   • **Step 4**: Perform a quick sanity check (dimensions, sign, magnitude).

3. **Tailored Study Strategy**:
   Your current estimated readiness is **${mastery}%**. Strengthening **${weakSubject}** will give you the highest score boost.

**Suggested Follow-Ups to ask me:**
• "Explain quadratic equations simply."
• "Help me solve 2x + 5 = 17."
• "Teach photosynthesis in Socratic mode."
• "Give me a quick revision of Newton's laws."

_StudyMate AI Tutor — Local intelligent tutor._`;
}

// ── 5. Safe Local Ollama Integration ────────────────────────────────

/**
 * Check if local Ollama daemon is reachable at http://localhost:11434/api/tags.
 * Safe, non-blocking with 1500ms timeout.
 */
export async function checkOllamaStatus(signal) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const abortFromCaller = () => controller.abort();
    signal?.addEventListener('abort', abortFromCaller, { once: true });

    const res = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortFromCaller);

    if (!res.ok) return { available: false, models: [] };

    const data = await res.json();
    const models = (data.models || []).map((m) => m.name || m.model).filter(Boolean);
    return { available: true, models };
  } catch {
    return { available: false, models: [] };
  }
}

/**
 * Main response generator with automatic graceful fallback:
 * 1. Checks if Ollama is available.
 * 2. If available, attempts /api/chat with selected or discovered model.
 * 3. If Ollama fails, times out, or is offline, instantly returns the rich Demo AI response
 *    with a non-technical notification notice.
 */
export async function generateResponse({ text, mode, profile, personalization, signal }) {
  const preferredModel = storage.get('ollama-model', null);

  // Quick check for local Ollama
  let ollamaOk = false;
  let modelToUse = preferredModel || 'llama3.2';

  try {
    const status = await checkOllamaStatus(signal);
    if (status.available && status.models.length > 0) {
      ollamaOk = true;
      if (!status.models.includes(modelToUse)) {
        modelToUse = status.models[0];
      }
    }
  } catch {
    ollamaOk = false;
  }

  // Attempt Ollama if online
  if (ollamaOk) {
    try {
      const ollamaController = new AbortController();
      const timeoutId = setTimeout(() => ollamaController.abort(), 12000); // 12-second generation cap

      // Combine user signal if passed
      if (signal) {
        signal.addEventListener('abort', () => ollamaController.abort(), { once: true });
      }

      const res = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelToUse,
          messages: [
            {
              role: 'system',
              content: `You are StudyMate AI, an expert exam preparation tutor for Indian students (${profile?.exam || 'JEE'}). Mode: ${mode || 'Tutor'}. Student name: ${profile?.name || 'Student'}. Provide clear, friendly, educational answers with structured headings and step-by-step math where appropriate.`,
            },
            {
              role: 'user',
              content: text,
            },
          ],
          stream: false,
        }),
        signal: ollamaController.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const reply = json.message?.content || json.response;
        if (reply && reply.trim()) {
          return {
            text: reply.trim(),
            source: 'ollama',
            model: modelToUse,
          };
        }
      }
      clearTimeout(timeoutId);
    } catch (err) {
      if (err.name === 'AbortError' && signal?.aborted) {
        throw err; // User deliberately cancelled
      }
      // Non-fatal: drop down to built-in Demo AI
    }
  }

  // Always-reliable Demo AI fallback
  const demoReply = generateDemoResponse({
    text,
    mode,
    profile,
    personalization,
  });

  return {
    text: demoReply,
    source: 'demo',
    notice: 'Using built-in StudyMate Tutor mode',
  };
}

export default {
  generateResponse,
  generateDemoResponse,
  checkOllamaStatus,
};
