export const curriculumData = {
  'JEE Mathematics': [
    { id: 'sets', title: 'Sets & Relations', x: 110, y: 120, status: 'completed', prerequisites: [], detail: 'Build the language of functions, mappings, and mathematical relationships.' },
    { id: 'quadratic', title: 'Quadratic Equations', x: 300, y: 120, status: 'completed', prerequisites: ['sets'], detail: 'Master roots, discriminant analysis, and parameter-based problems.' },
    { id: 'functions', title: 'Functions', x: 490, y: 120, status: 'current', prerequisites: ['sets', 'quadratic'], detail: 'Understand domain, range, composition, and inverse functions.' },
    { id: 'limits', title: 'Limits & Continuity', x: 680, y: 120, status: 'weak', prerequisites: ['functions'], detail: 'Close the confidence gap with graphical intuition and standard limits.' },
    { id: 'derivatives', title: 'Differentiation', x: 300, y: 300, status: 'locked', prerequisites: ['limits'], detail: 'Learn derivatives as rate of change and use core differentiation rules fluently.' },
    { id: 'integrals', title: 'Integration', x: 490, y: 300, status: 'locked', prerequisites: ['derivatives'], detail: 'Connect anti-derivatives, area under curves, and substitution techniques.' },
    { id: 'vectors', title: 'Vectors & 3D', x: 680, y: 300, status: 'locked', prerequisites: ['functions'], detail: 'Represent geometry algebraically and solve spatial problems.' },
  ],
  'NEET Biology': [
    { id: 'cell', title: 'Cell Structure', x: 110, y: 120, status: 'completed', prerequisites: [], detail: 'Understand prokaryotic vs eukaryotic cells, organelles, and their functions.' },
    { id: 'organelles', title: 'Cell Organelles', x: 300, y: 120, status: 'completed', prerequisites: ['cell'], detail: 'Deep dive into mitochondria, ER, Golgi, lysosomes, and their roles.' },
    { id: 'photosynthesis', title: 'Photosynthesis', x: 490, y: 120, status: 'current', prerequisites: ['organelles'], detail: 'Light reactions, Calvin cycle, C3/C4/CAM pathways.' },
    { id: 'dna', title: 'DNA & Replication', x: 680, y: 120, status: 'weak', prerequisites: ['organelles'], detail: 'DNA structure, semi-conservative replication, and repair mechanisms.' },
    { id: 'genetics', title: 'Mendelian Genetics', x: 300, y: 300, status: 'locked', prerequisites: ['dna'], detail: 'Laws of inheritance, mono/dihybrid crosses, and pedigree analysis.' },
    { id: 'evolution', title: 'Evolution', x: 490, y: 300, status: 'locked', prerequisites: ['genetics'], detail: 'Natural selection, speciation, Hardy-Weinberg principle.' },
  ],
  'CBSE Science': [
    { id: 'matter', title: 'Matter & Atoms', x: 110, y: 120, status: 'completed', prerequisites: [], detail: 'States of matter, atomic models, and subatomic particles.' },
    { id: 'reactions', title: 'Chemical Reactions', x: 300, y: 120, status: 'completed', prerequisites: ['matter'], detail: 'Types of reactions: combination, decomposition, displacement, redox.' },
    { id: 'acids', title: 'Acids & Bases', x: 490, y: 120, status: 'current', prerequisites: ['reactions'], detail: 'pH scale, indicators, neutralization, and salt formation.' },
    { id: 'electricity', title: 'Electricity', x: 680, y: 120, status: 'weak', prerequisites: ['matter'], detail: 'Ohm\'s law, circuits, resistance, and power.' },
    { id: 'light', title: 'Light & Optics', x: 400, y: 300, status: 'locked', prerequisites: ['electricity'], detail: 'Reflection, refraction, lenses, mirrors, and the human eye.' },
  ],
};

// Backward compatibility: export the original JEE Math as default curriculum
export const curriculum = curriculumData['JEE Mathematics'];
