// Difficulty settings. "Beginner" is the baseline; higher settings strengthen enemies.
//
// Parameter meanings:
//  hpMul/dmgMul/speedMul/spawnMul ... Static base multipliers (difficulty floor)
//  rampRate   ... Speed at which enemies strengthen over time (lower is slower)
//  intensityMax ... Upper bound for dynamic difficulty (reached when the player is healthy)
//  adaptUp    ... Amount intensity increases per second when healthy/performing well
//  adaptDown  ... Amount intensity decreases per second when hit/struggling
//
// Dynamic difficulty: When player takes minimal damage (has room to spare),
// enemies become stronger and more frequent. When HP is low (struggling),
// enemies weaken and spawn less. Reaction speed varies by difficulty (Beginner: gentle, Nightmare: aggressive).

export const DIFFICULTIES = [
  {
    id: 'beginner',
    name: 'Beginner',
    desc: ['Baseline / Easiest', 'Ramps up very slowly', 'Start here'],
    color: '#7ee787',
    hpMul: 1.0, dmgMul: 0.85, speedMul: 1.0, spawnMul: 1.0,
    rampRate: 0.0030, intensityMax: 1.25, adaptUp: 0.06, adaptDown: 0.30,
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    desc: ['A real challenge', 'Enemy HP +40% / ATK +15%', 'Standard ramp-up'],
    color: '#ffd24a',
    hpMul: 1.4, dmgMul: 1.15, speedMul: 1.08, spawnMul: 1.2,
    rampRate: 0.0055, intensityMax: 1.6, adaptUp: 0.14, adaptDown: 0.22,
  },
  {
    id: 'advanced',
    name: 'Advanced',
    desc: ['For veterans', 'Enemy HP +100% / ATK +50%', 'Surges when you thrive'],
    color: '#ff8c42',
    hpMul: 2.0, dmgMul: 1.5, speedMul: 1.18, spawnMul: 1.4,
    rampRate: 0.0085, intensityMax: 2.1, adaptUp: 0.26, adaptDown: 0.16,
  },
  {
    id: 'nightmare',
    name: 'Nightmare',
    desc: ['Nightmare-class', 'Enemy HP +200% / ATK +120%', 'Unscathed = brutal, swarming, fast'],
    color: '#ff4d6d',
    hpMul: 3.0, dmgMul: 2.2, speedMul: 1.35, spawnMul: 1.8,
    rampRate: 0.0120, intensityMax: 2.8, adaptUp: 0.42, adaptDown: 0.10,
  },
];

export function getDifficulty(id) {
  return DIFFICULTIES.find(d => d.id === id) || DIFFICULTIES[0];
}
