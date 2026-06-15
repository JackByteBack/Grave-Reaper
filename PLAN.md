# Grave Reaper — Development Plan

A retro-future side-scrolling action game that runs in the browser.
**Concept**: "Ghosts 'n Goblins" (side-scrolling, jump, Gothic horror world) × "Vampire Survivors" (auto-attack, gem collection, skill selection upon leveling up).

---

## 1. Tech Stack

- **HTML5 Canvas + Vanilla JavaScript (ES Modules)**. No build required.
- `image-rendering: pixelated` for sharp pixel art scaling.
- Internal resolution **480×270 (16:9)** fitted to the screen via integer scaling → balances retro feel and performance.
- 60fps fixed-timestep game loop.
- **Local server required**: ES Modules and images are blocked by CORS on `file://`, so start with `python -m http.server` or similar (startup scripts included).

## 2. Asset Processing (Largest Technical Risk)

The attached 5 sheets are 2048×1152 "labeled showcase sheets." They contain headers, palette samples, and decorative frames → cannot be used directly.

**Strategy**: Use Python (Pillow) to extract each sprite into individual PNGs based on coordinate specifications → organize into `assets/sprites/`. After extraction, upscale and visually verify, iteratively adjusting coordinates.

- `tools/extract_sprites.py` … Automated cropping based on coordinate tables.
- Extraction Targets (Priority):
  1. Player: Dark Knight (idle / walk×3 / jump / attack)
  2. Enemies: Zombie, Skeleton, Bat, Ghost, Red Devil, Werewolf, Gargoyle, Dragon, Dracula + **Large Demon Boss**
  3. Weapon Effects: Sword swing, Spear, Axe, Fireball, Lightning, Dagger
  4. Items: Gem (red/blue/green), Potion, Skill icons (shield/wind/sword)
  5. Tiles/Background: Ground tiles, Gravestones, Dead trees, Full moon, Castle silhouette
- Difficult-to-extract details → Supplement with custom pixel art or emojis.

## 3. Game Mechanics

### Controls
- Movement: `←`/`A` (Left), `→`/`D` (Right)
- Jump: `Space`/`Enter` (Gravity, ground/platform detection)
- Attack: **Automatic** (Vampire Survivors style. Weapons fire automatically based on cooldown)
- Level-up selection: `←`/`→` to move cards, `Enter`/`Space` to confirm (`1`/`2`/`3` keys for direct selection)

### Core Loop
1. Enemies appear in waves from left and right, approaching the player.
2. Defeat them with auto-attacks → they drop **Gems** (XP), with a low chance of **HP Potions**.
3. Collect Gems to fill the XP bar → **Level up**, freezing time to present 3 skill cards.
4. Select a card to strengthen the player → Difficulty increases (spawn rate, enemy speed, enemy HP).
5. At regular intervals, a **Boss (Large Demon)** appears.

### Progression Elements (Skill Card Examples)
- Unlock New Weapons: Spear / Battle Axe / Fireball / Lightning / Throwing Dagger
- Weapon Upgrades: Damage↑, Attack Speed↑, Projectile Count↑, Range↑, Piercing
- Status: Max HP↑, Move Speed↑, Defense (Damage Reduction), HP Regeneration, Gem Pickup Range↑

### Player Combat
- The player maintains a list of weapons, each firing automatically on its own cooldown.
- Fires in the direction the player is facing or toward the nearest enemy (behavior defined per weapon).

## 4. Stage
- Side-scrolling stage with ground + floating platforms (looping or horizontally long).
- Parallax background: Full moon + Castle silhouette + Graveyard/Dead tree foreground layer.
- Camera follows the player (horizontal scrolling).

## 5. UI / HUD
- Top: HP bar, Level & XP bar, Survival timer, Kill count, Gem count.
- Level-up screen: 3 skill cards (Icon + Name + Effect, keyboard selection highlight).
- Title screen / Game Over screen (Retry).

## 6. File Structure
```
Grave Reaper/
├─ index.html
├─ serve.bat / serve.sh         # Local server startup
├─ css/style.css
├─ tools/extract_sprites.py     # Sprite extraction
├─ assets/
│  ├─ source/  (Original 5 PNGs)
│  └─ sprites/ (Individual PNGs after extraction)
└─ src/
   ├─ main.js        # Entry point / Game loop
   ├─ engine/        # loop, input, camera, sprite, animation, audio
   ├─ entities/      # player, enemy, projectile, pickup, boss
   ├─ systems/       # spawner, combat, leveling, collision
   ├─ ui/            # hud, levelup-cards, title, gameover
   └─ data/          # weapons, enemies, upgrades definitions
```

## 7. Implementation Milestones
1. **Foundation**: Project structure, local server, empty Canvas startup.
2. **Asset Extraction**: Extract with extract_sprites.py → Visual check → Coordinate adjustment.
3. **Engine**: Game loop, input, sprite rendering, animation, camera, physics (gravity/jump/grounding).
4. **Player**: Movement, jump, animation.
5. **Enemies & Spawner**: Appearance, tracking, contact damage, defeat.
6. **Auto-attack & Weapons**: Multiple weapon firing and hit detection.
7. **Drops & XP**: Gem/Potion collection, XP, level-up detection.
8. **Level-up UI**: 3 cards, keyboard selection, applying upgrades.
9. **HUD & Stage Background**: Parallax, graveyard tiles.
10. **Boss**: Large Demon appearance and attack patterns.
11. **Title/Game Over & Polish**: Balance, SE (emojis/simple synthesized sound), finishing touches.

## 8. Supplementing Policy
Missing assets will be supplemented in this order: 1. Modification of existing sprites, 2. Simple pixel art generation, 3. Emojis. Sound effects use Web Audio API synthesis or are omitted.
