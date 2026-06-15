// 5 total stages. Stages progress by survival time and switch backgrounds.
// Large Demon (boss) appears after 5 min (300 sec) survival, defeating it clears the stage.

export const STAGE_DURATION = 60;     // (Unused) Reference value
export const BOSS_SPAWN_TIME = 300;   // Boss appears 5 min after stage starts

export const STAGES = [
  { num: 1, name: 'Cursed Graveyard',   bg: 1 },
  { num: 2, name: 'Forest of the Dead', bg: 2 },
  { num: 3, name: 'Castle Gate',        bg: 3 },
  { num: 4, name: 'Castle Great Hall',  bg: 4 },
  { num: 5, name: "Demon Lord's Throne", bg: 5, final: true },
];

export const NUM_STAGES = STAGES.length;

export function getStage(num) {
  return STAGES[Math.max(0, Math.min(STAGES.length - 1, num - 1))];
}

// Calculate current stage number (1..5) from survival time
export function stageForTime(elapsed) {
  return Math.min(NUM_STAGES, Math.floor(elapsed / STAGE_DURATION) + 1);
}
