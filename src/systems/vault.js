// Shadow Vault persistence + application.
//
// Stores the player's Shadow balance and purchased upgrade levels in
// localStorage so meta-progression survives across browser sessions. If
// localStorage is unavailable (private mode / sandboxed iframe), it silently
// falls back to an in-memory store — the vault still works for the session.

import { VAULT_UPGRADES, vaultCost } from '../data/vault.js';

const STORAGE_KEY = 'graveReaper.shadowVault.v1';

let store = { shadows: 0, levels: {} };
let memoryOnly = false;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      store = {
        shadows: Math.max(0, Math.floor(parsed.shadows || 0)),
        levels: (parsed.levels && typeof parsed.levels === 'object') ? parsed.levels : {},
      };
    }
  } catch (e) {
    memoryOnly = true;   // blocked or corrupt → keep state in memory only
  }
  // Clamp any stale/invalid levels to the current definitions.
  for (const def of VAULT_UPGRADES) {
    const lv = Math.floor(store.levels[def.id] || 0);
    store.levels[def.id] = Math.max(0, Math.min(def.maxLevel, lv));
  }
}

function save() {
  if (memoryOnly) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    memoryOnly = true;
  }
}

load();

export function getShadows() { return store.shadows; }

export function getLevel(id) { return store.levels[id] || 0; }

// Add (or, with a negative amount, subtract) Shadows. Returns the new balance.
export function addShadows(amount) {
  store.shadows = Math.max(0, store.shadows + Math.floor(amount));
  save();
  return store.shadows;
}

// Cost of the next level for `def`, or null if the track is fully upgraded.
export function nextCost(def) {
  const lv = getLevel(def.id);
  if (lv >= def.maxLevel) return null;
  return vaultCost(def, lv);
}

export function canAfford(def) {
  const cost = nextCost(def);
  return cost !== null && store.shadows >= cost;
}

// Buy the next level of `def`. Returns true on success, false if maxed or
// the player can't afford it.
export function buyUpgrade(def) {
  const cost = nextCost(def);
  if (cost === null || store.shadows < cost) return false;
  store.shadows -= cost;
  store.levels[def.id] = getLevel(def.id) + 1;
  save();
  return true;
}

// Apply every purchased upgrade to a freshly-built player at run start.
export function applyVaultBonuses(player) {
  for (const def of VAULT_UPGRADES) {
    const lv = getLevel(def.id);
    if (lv > 0) def.apply(player, lv);
  }
}
