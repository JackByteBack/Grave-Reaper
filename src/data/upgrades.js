// Skill card / upgrade definitions

export const UPGRADE_DEFS = [
  // --- Unlock Weapons ---
  {
    id: 'unlock_spear',
    name: 'Holy Spear',
    desc: 'Learn a piercing spear',
    cat: 'Weapon',
    icon: 'icon_sword',
    iconEmoji: '🏹',
    category: 'unlock',
    weaponId: 'spear',
    apply(state) {
      if (!state.unlockedWeapons.includes('spear')) {
        state.unlockedWeapons.push('spear');
        state.weaponCooldowns['spear'] = 0;
      }
    },
  },
  {
    id: 'unlock_axe',
    name: 'Battle Axe',
    desc: 'Learn a heavy axe',
    cat: 'Weapon',
    icon: 'icon_sword',
    iconEmoji: '🪓',
    category: 'unlock',
    weaponId: 'axe',
    apply(state) {
      if (!state.unlockedWeapons.includes('axe')) {
        state.unlockedWeapons.push('axe');
        state.weaponCooldowns['axe'] = 0;
      }
    },
  },
  {
    id: 'unlock_fireball',
    name: 'Fireball',
    desc: 'Learn a fiery projectile',
    cat: 'Weapon',
    icon: 'icon_sword',
    iconEmoji: '🔥',
    category: 'unlock',
    weaponId: 'fireball',
    apply(state) {
      if (!state.unlockedWeapons.includes('fireball')) {
        state.unlockedWeapons.push('fireball');
        state.weaponCooldowns['fireball'] = 0;
      }
    },
  },
  {
    id: 'unlock_lightning',
    name: 'Lightning',
    desc: 'Learn a piercing bolt',
    cat: 'Weapon',
    icon: 'icon_sword',
    iconEmoji: '⚡',
    category: 'unlock',
    weaponId: 'lightning',
    apply(state) {
      if (!state.unlockedWeapons.includes('lightning')) {
        state.unlockedWeapons.push('lightning');
        state.weaponCooldowns['lightning'] = 0;
      }
    },
  },
  {
    id: 'unlock_dagger',
    name: 'Throwing Dagger',
    desc: 'Learn a rapid-fire dagger',
    cat: 'Weapon',
    icon: 'icon_sword',
    iconEmoji: '🗡️',
    category: 'unlock',
    weaponId: 'dagger',
    apply(state) {
      if (!state.unlockedWeapons.includes('dagger')) {
        state.unlockedWeapons.push('dagger');
        state.weaponCooldowns['dagger'] = 0;
      }
    },
  },

  // --- Unlock AoE Attacks ---
  {
    id: 'unlock_thunder',
    name: 'Thunderstrike',
    desc: 'Lightning strikes several foes from above',
    cat: 'AoE',
    icon: 'icon_wind',
    iconEmoji: '🌩️',
    category: 'unlock',
    weaponId: 'thunder',
    apply(state) {
      if (!state.unlockedWeapons.includes('thunder')) {
        state.unlockedWeapons.push('thunder');
        state.weaponCooldowns['thunder'] = 0;
      }
    },
  },
  {
    id: 'unlock_holynova',
    name: 'Holy Nova',
    desc: 'A wave of light hits every enemy on screen',
    cat: 'AoE',
    icon: 'icon_shield',
    iconEmoji: '💥',
    category: 'unlock',
    weaponId: 'holynova',
    apply(state) {
      if (!state.unlockedWeapons.includes('holynova')) {
        state.unlockedWeapons.push('holynova');
        state.weaponCooldowns['holynova'] = 0;
      }
    },
  },

  // --- Weapon Upgrades ---
  {
    id: 'dmg_up',
    name: 'Power Up',
    desc: 'All weapon damage +20%',
    cat: 'Upgrade',
    icon: 'icon_sword',
    iconEmoji: '⚔️',
    category: 'weapon',
    apply(state) { state.damageMultiplier = (state.damageMultiplier || 1) * 1.2; },
  },
  {
    id: 'speed_up',
    name: 'Haste',
    desc: 'Attack speed +15%',
    cat: 'Upgrade',
    icon: 'icon_wind',
    iconEmoji: '💨',
    category: 'weapon',
    apply(state) { state.attackSpeedMultiplier = (state.attackSpeedMultiplier || 1) * 1.15; },
  },
  {
    id: 'multi_shot',
    name: 'Multi-Shot',
    desc: 'Main weapon fires +1 projectile',
    cat: 'Upgrade',
    icon: 'icon_sword',
    iconEmoji: '✨',
    category: 'weapon',
    apply(state) { state.multiShot = (state.multiShot || 1) + 1; },
  },
  {
    id: 'range_up',
    name: 'Long Reach',
    desc: 'All weapon range +30%',
    cat: 'Upgrade',
    icon: 'icon_sword',
    iconEmoji: '📏',
    category: 'weapon',
    apply(state) { state.rangeMultiplier = (state.rangeMultiplier || 1) * 1.3; },
  },
  {
    id: 'pierce',
    name: 'Piercing',
    desc: 'All weapons gain piercing',
    cat: 'Upgrade',
    icon: 'icon_sword',
    iconEmoji: '🔱',
    category: 'weapon',
    apply(state) { state.allPiercing = true; },
  },

  // --- Stats ---
  {
    id: 'max_hp_up',
    name: 'Vitality',
    desc: 'Max HP +25',
    cat: 'Stat',
    icon: 'icon_shield',
    iconEmoji: '❤️',
    category: 'stat',
    apply(state) {
      state.maxHp += 25;
      state.hp = Math.min(state.hp + 25, state.maxHp);
    },
  },
  {
    id: 'move_up',
    name: 'Swift Boots',
    desc: 'Move speed +15%',
    cat: 'Stat',
    icon: 'icon_wind',
    iconEmoji: '👟',
    category: 'stat',
    apply(state) { state.moveSpeedMultiplier = (state.moveSpeedMultiplier || 1) * 1.15; },
  },
  {
    id: 'defense_up',
    name: 'Iron Skin',
    desc: 'Damage taken -15%',
    cat: 'Stat',
    icon: 'icon_shield',
    iconEmoji: '🛡️',
    category: 'stat',
    apply(state) { state.defense = (state.defense || 0) + 0.15; },
  },
  {
    id: 'regen',
    name: 'Regeneration',
    desc: 'Recover 1 HP per second',
    cat: 'Stat',
    icon: 'icon_shield',
    iconEmoji: '💚',
    category: 'stat',
    apply(state) { state.regenPerSec = (state.regenPerSec || 0) + 1; },
  },
  {
    id: 'gem_range',
    name: 'Magnet',
    desc: 'Gem pickup range +50%',
    cat: 'Stat',
    icon: 'icon_wind',
    iconEmoji: '🧲',
    category: 'stat',
    apply(state) { state.gemRange = (state.gemRange || 60) * 1.5; },
  },
  {
    id: 'revive',
    name: 'Second Life',
    desc: 'Avoid death once',
    cat: 'Stat',
    icon: 'icon_shield',
    iconEmoji: '👼',
    category: 'stat',
    apply(state) { state.revives = (state.revives || 0) + 1; },
  },
  {
    id: 'xp_up',
    name: "Sage's Wisdom",
    desc: 'XP gained +25%',
    cat: 'Stat',
    icon: 'icon_wind',
    iconEmoji: '📚',
    category: 'stat',
    apply(state) { state.xpMultiplier = (state.xpMultiplier || 1) * 1.25; },
  },
];

// Revert one acquired upgrade (used by the final boss's weakening spell).
// 's' is the player. The main weapon (index 0) is protected from being removed.
export function revertUpgrade(id, s) {
  switch (id) {
    case 'unlock_spear':
    case 'unlock_axe':
    case 'unlock_fireball':
    case 'unlock_lightning':
    case 'unlock_dagger':
    case 'unlock_thunder':
    case 'unlock_holynova': {
      const def = UPGRADE_DEFS.find(u => u.id === id);
      const w = def && def.weaponId;
      if (w) {
        const i = s.unlockedWeapons.indexOf(w);
        if (i > 0) {                       // index0(主武器)は守る
          s.unlockedWeapons.splice(i, 1);
          delete s.weaponCooldowns[w];
        }
      }
      break;
    }
    case 'dmg_up':    s.damageMultiplier = Math.max(1, s.damageMultiplier / 1.2); break;
    case 'speed_up':  s.attackSpeedMultiplier = s.attackSpeedMultiplier / 1.15; break;
    case 'multi_shot':s.multiShot = Math.max(1, (s.multiShot || 1) - 1); break;
    case 'range_up':  s.rangeMultiplier = Math.max(1, s.rangeMultiplier / 1.3); break;
    case 'pierce':    s.allPiercing = false; break;
    case 'max_hp_up': s.maxHp = Math.max(20, s.maxHp - 25); s.hp = Math.min(s.hp, s.maxHp); break;
    case 'move_up':   s.moveSpeedMultiplier = s.moveSpeedMultiplier / 1.15; break;
    case 'defense_up':s.defense = Math.max(0, (s.defense || 0) - 0.15); break;
    case 'regen':     s.regenPerSec = Math.max(0, (s.regenPerSec || 0) - 1); break;
    case 'gem_range': s.gemRange = (s.gemRange || 60) / 1.5; break;
    case 'revive':    s.revives = Math.max(0, (s.revives || 0) - 1); break;
    case 'xp_up':     s.xpMultiplier = Math.max(1, s.xpMultiplier / 1.25); break;
  }
}

// Get available upgrades (filter out already-unlocked weapons)
export function getAvailableUpgrades(gameState) {
  return UPGRADE_DEFS.filter(u => {
    if (u.category === 'unlock' && gameState.unlockedWeapons.includes(u.weaponId)) {
      return false;
    }
    return true;
  });
}

// Pick 3 random unique upgrades
export function pickRandomUpgrades(gameState, count = 3) {
  const available = getAvailableUpgrades(gameState);
  const shuffled = available.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
