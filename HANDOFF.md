# Grave Reaper × Base44 Arcade Integration — Claude Code Instructions

Integrate the Base44 backend with grave-reaper (GitHub Pages) to create an online ranking system.

Target Repository: https://github.com/JunSuzuki1973/grave-reaper
GitHub Pages: https://junsuzuki1973.github.io/grave-reaper/
Base44 Backend: https://grave-reap-ranks.base44.app
Base44 App ID: 6a2d01f339fbcea2e6958c2d

## Overview

GitHub Pages (Game Client)
  └── index.html / src/ (Existing code remains mostly untouched)
  └── src/arcade/base44client.js  ← New Addition (Base44 Integration Module)
        ↓ HTTP API Calls
Base44 Backend (Pre-built)
  └── POST /functions/saveScore  (Requires Auth, saves best score only)
  └── GET  /functions/getLeaderboard (No Auth required, returns top 20)

## STEP 1: Load Base44 SDK (Add to index.html)

Add the following inside the `<head>` of `index.html`, before existing `<script>` tags:

```html
<!-- Base44 SDK -->
<script type="module">
  import { createClient } from 'https://cdn.base44.com/sdk.esm.js';
  window.base44 = createClient({ appId: '6a2d01f339fbcea2e6958c2d' });
</script>
```

## STEP 2: Create Base44 Integration Module

Create `src/arcade/base44client.js` (do not touch existing game code):

```javascript
// Base44 Integration Module — Grave Reaper Arcade
const BASE44_API = 'https://grave-reap-ranks.base44.app/functions';

export function isArcadeMode() {
  return !!(window.base44?.auth?.currentUser);
}

export function getCurrentUserName() {
  const user = window.base44?.auth?.currentUser;
  return user?.full_name || user?.email?.split('@')[0] || 'Player';
}

export async function signIn() {
  try {
    await window.base44.auth.signInWithPopup();
    return true;
  } catch (e) {
    console.error('Login failed:', e);
    return false;
  }
}

export async function signOut() {
  await window.base44.auth.signOut();
}

// Save score (call at game over or clear)
export async function saveScore({ score, stage, difficulty, play_time }) {
  if (!isArcadeMode()) return null;
  try {
    const token = await window.base44.auth.getToken();
    const res = await fetch(`${BASE44_API}/saveScore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        user_name: getCurrentUserName(),
        score,
        stage,
        difficulty,
        play_time
      })
    });
    return res.json();
  } catch (e) {
    console.error('saveScore failed:', e);
    return null;
  }
}

// Get rankings (Top 20)
export async function getLeaderboard() {
  try {
    const res = await fetch(`${BASE44_API}/getLeaderboard`);
    const data = await res.json();
    return data.leaderboard || [];
  } catch (e) {
    console.error('getLeaderboard failed:', e);
    return [];
  }
}
```

## STEP 3: Send Score at Game Over / Clear

Find the game over logic (GameOver or Game files) in `src/ui/` and append:

```javascript
import * as arcade from '../arcade/base44client.js';

// Inside game over handling logic:
if (arcade.isArcadeMode()) {
  arcade.saveScore({
    score: currentScore,
    stage: currentStage,
    difficulty: currentDifficulty,
    play_time: elapsedSeconds
  });
}
```

## STEP 4: UI Changes

1. **Title Screen**: Add a "Login with Base44" button.
2. **Game Over Screen**: Add a "Ranking" button to fetch and display the leaderboard.
3. **Best Score**: If logged in, display the player's personal best (fetched via API).
