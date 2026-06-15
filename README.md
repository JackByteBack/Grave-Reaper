# ⚰️ Grave Reaper

A retro horizontal scrolling action game that runs in your browser.
Concept: **Ghosts 'n Goblins × Vampire Survivors** — Gothic horror scrolling & jumping combined with auto-attack, gem collection, and skill selection on level-up.

## ▶ Play Now

### 🏆 Grave Reaper Legends (Full Version - Recommended)
**https://grave-reaper-legends.base44.app/**

Full-featured version hosted on [Base44](https://base44.app). Includes the game plus **online features**:
- **Leaderboard Display** — Your score is registered in the online rankings when you game over
- **Handle Name** — Participate in rankings with your own name
- **In-Game Currency (Prototype)** — Foundation for future expansions

> How it works: The game (this repository) is loaded in an iframe, and uses `postMessage` to send scores and data to the parent app (React). See the "🔗 Base44 Integration (postMessage)" section below for details.

### 🎮 Engine Version (Vanilla - This Repository)
**https://junsuzuki1973.github.io/grave-reaper/**

Game engine only, served via GitHub Pages. No online features — anyone can play immediately in a modern browser (no installation needed).

## 📱 Play as an App (Website · Installable App · Android APK)

The game runs three ways from **one codebase** — website mode is unchanged.

### 🌐 Website (as before)
Just open the page in any modern browser. Nothing about this changed.

### 📲 Installable App (Windows · macOS · Android · iOS) — PWA
The game is a **Progressive Web App**, so it installs like a native app:
- **Windows / macOS / Android (Chrome or Edge):** open the site and click the **📲 Install App** button (top-right), or use the browser's "Install app" menu item.
- **iOS (Safari):** tap **Share → Add to Home Screen**.

Once installed it launches in its own window, runs **offline** after the first load, and shows the touch controls on mobile.

### 🤖 Android APK (self-contained, bundles all files)
A real APK is built automatically in the cloud (GitHub Actions) — no toolchain needed on your machine.

**Download link (after the first build on `main`):**
```
https://github.com/JackByteBack/shadow-vault/releases/download/latest/grave-reaper.apk
```
Also downloadable from the **Releases** page, or from any workflow run's **Artifacts**.

To install: copy the APK to your phone, tap it, and allow "Install unknown apps" for your browser/file manager when prompted.

> Build it yourself locally (needs Node, JDK 17, and the Android SDK):
> ```bash
> npm install
> npm run apk        # → android/app/build/outputs/apk/debug/app-debug.apk
> ```
> The APK wrapper uses [Capacitor](https://capacitorjs.com). The web payload is assembled into `www/` by `npm run build:web`.

## 🎮 Controls

| Action | Keyboard | Mobile (touch) |
|--------|----------|----------------|
| Move | `←` / `→` or `A` / `D` | ◀ ▶ buttons (bottom-left) |
| Jump | `Space` / `Enter` | ⤴ button (bottom-right) |
| Fire / Attack | **Auto** (fires on weapon cooldown) | ⚔ **Fire** button (bottom-right) — also auto-fires |
| Skill Select | `←` `→` to move, `Enter` / `1`–`3` to confirm | tap a card |
| Fullscreen | `F` key or the ⛶ button (top-right) | ⛶ button |

Touch controls appear automatically on phones/tablets (and in the APK). On a desktop you can force them with `?touch=1` in the URL.

## 🕹 Game Flow

1. Defeat waves of enemies approaching from left and right with auto-attacks, collecting **Gems (experience)**
2. On level-up, time stops — pick one of **3 skill cards** to enhance your character
3. Each stage starts a 5-minute countdown. After **5 minutes, a Large Demon** (mid-boss) appears with reinforcements → defeat it to advance
4. **5 total stages**. **Stage 5**: The final boss **"Magic Caster (Demon Lord Lich)"** descends immediately
   - Summons Large Demons, casts wide-area Fireball, rapid dark orb volleys, and casts **weakening spells that drain your level and skills** (dodge by running during the spell telegraph)
5. Defeat the final boss for **complete victory**

Features **4 difficulty levels** (Beginner / Intermediate / Advanced / Nightmare) plus **dynamic difficulty** that adjusts to your HP — the game gets harder when you're healthy, and easier when you're hurting.

## 🔗 Base44 Integration (postMessage)

The game (iframe child) sends events to the parent window (Base44 / React app) via `window.parent.postMessage(..., '*')`. Events are only sent when inside a parent iframe (`window.parent !== window`); direct GitHub Pages access sends nothing. Implementation in [src/main.js](src/main.js) and [src/ui/gameover.js](src/ui/gameover.js).

| Event `type` | Sent When | Data |
|---|---|---|
| `GRAVE_REAPER_GAME_OVER` | Game over or all stages cleared | `score: { score, kills, stage, level, gems, victory, play_time }` |
| `GRAVE_REAPER_GO_TO_RANKING` | "🏆 View Rankings" button pressed on game over screen (click or `L` key) | (none) |

Parent-side receiving example:
```javascript
window.addEventListener('message', (e) => {
  // Validate e.origin if needed
  if (e.data?.type === 'GRAVE_REAPER_GAME_OVER') {
    const s = e.data.score;   // { score, kills, stage, level, gems, victory, play_time }
    // → Save to Score entity, etc.
  } else if (e.data?.type === 'GRAVE_REAPER_GO_TO_RANKING') {
    // → Navigate to rankings screen
  }
});
```

The `score` is synthesized from game stats (v16 has no native score concept): `kills×100 + gems×10 + seconds×5 + level×500 + (victory? +50000 : 0)`. To change the formula, edit `postGameOverToParent` in `src/main.js`.

## 🗺 Roadmap (Legends Expansion Plan)

Plans to continuously enhance `Grave Reaper Legends` with user-facing features:
- **In-Game Currency** — Full implementation (earning, spending, balance tracking)
- **Artifacts** — Collectible permanent power-ups via equipping
- **Legendary Boss Compendium** — Attack pattern guides and strategy info for each boss
- Other features to track player progression and achievements

*Note: These will be implemented primarily on the Base44 side (backend/React UI). The game engine (this repository) will only receive minimal `postMessage` integration as needed.*

## 🛠 Tech Stack

- **HTML5 Canvas + Vanilla JavaScript (ES modules)**. No build tools required.
- **Two-canvas architecture**: 480×270 internal resolution scaled by integer multiples (or fitted on fullscreen)
  - Game world canvas uses `image-rendering: pixelated` (pixel-perfect)
  - High-res UI overlay for crisp text rendering
- **Fixed 60fps timestep** game loop
- **BGM**: HTML5 Audio
- **SFX**: Web Audio API synthesis

## 💻 Running Locally

ES modules and images are blocked by CORS with `file://`, so use a local server:

```bash
python serve.py        # → http://localhost:8080
# or double-click serve.bat (Windows)
```

`serve.py` is a development server with cache-busting headers (any static server works).

## 📁 Project Structure

```
index.html              Two-canvas entry point (+ PWA manifest/meta links)
manifest.webmanifest    PWA app metadata (name, icons, display)
sw.js                   Service worker (offline cache for the installed app)
css/style.css           Layout & styling (+ install button, touch controls)
src/
  pwa.js                Service-worker registration + Install App button
  engine/               Loop, input, touch controls, camera, sprites, audio
  entities/             Player, enemies, boss, final boss, projectiles, pickups
  systems/              Spawner, combat, leveling
  ui/                   HUD, level-up, title, game over
  data/                 Weapons, enemies, skills, difficulty, stage definitions
assets/
  sprites/              Extracted pixel art sprites
  backgrounds/          Stage backgrounds
  icons/                App icons (PWA + favicon + apple-touch)
tools/
  make_icons.py         Generates app icons (stdlib-only PNG encoder)
scripts/build-web.mjs   Assembles www/ for the APK build
capacitor.config.json   Capacitor (APK wrapper) config
package.json            npm scripts + Capacitor deps
resources/icon.png      1024px source icon for the APK launcher
.github/workflows/      build-apk.yml — cloud APK build + Release publish
```

## 📜 License / Credits

Personal fan game / study project. Sprites, backgrounds, and BGM sourced externally. Extracted and formatted using Python (Pillow).

## 🗝 Shadow Vault (Meta-Progression)

A permanent upgrade shop reached from the title screen — press **`V`** or click **⚰ SHADOW VAULT**.

- **Shadows** are a meta-currency earned every run. When a run ends (death *or* full clear) your stats convert to Shadows: `kills×2 + gems×0.5 + seconds×1 + level×15 + (victory ? +500 : 0)`, then scaled by the **Soul Tithe** bonus. The amount earned and your new total are shown on the game-over screen.
- Spend Shadows on permanent upgrades that apply to **every future run** (5 levels each, escalating cost):

  | Upgrade | Effect (per level) |
  |---|---|
  | ❤️ Soul Vigor | +15 starting Max HP |
  | ⚔️ Dark Might | +6% weapon damage |
  | 👟 Fleet Shadow | +5% move speed |
  | 🧲 Grave Magnet | +12% gem pickup range |
  | 🛡️ Shadow Ward | −3% damage taken |
  | 🩸 Grave Regen | +0.4 HP/sec regeneration |
  | ⚡ Frenzied Strikes | +5% attack speed |
  | 📖 Forbidden Lore | +8% XP gain |
  | 💀 Undying Will | +1 revive per run (max 3) — revive at 30% HP |
  | 💰 Soul Tithe | +8% Shadows earned (self-investment loop) |

- **Controls:** `↑`/`↓` (or `W`/`S`) to select, `Enter`/`Space` to buy, `Esc` to go back — or simply **tap a row** (mobile/mouse). The list **scrolls** when there are more upgrades than fit on screen.
- Progress is saved to `localStorage` (`graveReaper.shadowVault.v1`), so it persists across sessions. In a sandboxed iframe where storage is blocked, it gracefully falls back to in-memory for the session.

Implementation: definitions in [src/data/vault.js](src/data/vault.js), persistence/logic in [src/systems/vault.js](src/systems/vault.js), screen in [src/ui/vault.js](src/ui/vault.js).
