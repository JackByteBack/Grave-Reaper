// Shadow Vault — permanent meta-upgrade definitions.
//
// Unlike the run-time skill cards in data/upgrades.js, these persist across
// runs (saved to localStorage by systems/vault.js). Each upgrade has discrete
// levels; buying a level spends "Shadows" — the currency banked when a run
// ends — and permanently strengthens every future run.
//
// `apply(player, level)` mutates a freshly-built player at run start. It is
// given the PURCHASED level (1..maxLevel); a level of 0 means the upgrade is
// not owned and apply() is never called for it.

export const VAULT_UPGRADES = [
  {
    id: 'soul_vigor',
    name: 'Soul Vigor',
    icon: '❤️',
    maxLevel: 5,
    baseCost: 80,
    desc: (lv) => `Start with +${lv * 15} Max HP`,
    apply(player, level) {
      const bonus = level * 15;
      player.maxHp += bonus;
      player.hp += bonus;   // start the run at full health
    },
  },
  {
    id: 'dark_might',
    name: 'Dark Might',
    icon: '⚔️',
    maxLevel: 5,
    baseCost: 120,
    desc: (lv) => `+${lv * 6}% weapon damage`,
    apply(player, level) {
      player.damageMultiplier *= 1 + level * 0.06;
    },
  },
  {
    id: 'fleet_shadow',
    name: 'Fleet Shadow',
    icon: '👟',
    maxLevel: 5,
    baseCost: 90,
    desc: (lv) => `+${lv * 5}% move speed`,
    apply(player, level) {
      player.moveSpeedMultiplier *= 1 + level * 0.05;
    },
  },
  {
    id: 'grave_magnet',
    name: 'Grave Magnet',
    icon: '🧲',
    maxLevel: 5,
    baseCost: 70,
    desc: (lv) => `+${lv * 12}% gem pickup range`,
    apply(player, level) {
      player.gemRange *= 1 + level * 0.12;
    },
  },
  {
    id: 'shadow_ward',
    name: 'Shadow Ward',
    icon: '🛡️',
    maxLevel: 5,
    baseCost: 110,
    desc: (lv) => `-${lv * 3}% damage taken`,
    apply(player, level) {
      player.defense = Math.min(0.8, player.defense + level * 0.03);
    },
  },
  {
    id: 'soul_tithe',
    name: 'Soul Tithe',
    icon: '💰',
    maxLevel: 5,
    baseCost: 100,
    desc: (lv) => `+${lv * 8}% Shadows earned`,
    // Self-investment loop: read by computeRunReward(), not applied to the
    // player, so there is nothing to do here at run start.
    apply() {},
  },
];

// Cost to buy the NEXT level (currentLevel → currentLevel+1). Escalates so the
// final level of a track costs roughly 3.4× the first.
export function vaultCost(def, currentLevel) {
  return Math.round(def.baseCost * (1 + currentLevel * 0.6));
}

// Convert a finished run's stats into earned Shadows. `titheLevel` is the
// player's Soul Tithe vault level (the self-investment bonus).
export function computeRunReward(stats, titheLevel = 0) {
  const base =
    stats.kills * 2 +
    Math.floor(stats.gems * 0.5) +
    Math.floor(stats.time) +
    stats.level * 15 +
    (stats.victory ? 500 : 0);
  return Math.max(0, Math.round(base * (1 + titheLevel * 0.08)));
}
