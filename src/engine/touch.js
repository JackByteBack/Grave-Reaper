// On-screen touch controls for mobile.
//
// Buttons are DOM overlays fixed to the viewport corners so they stay under the
// player's thumbs regardless of canvas scale. Each button maps to a keyboard
// code via pressKey/releaseKey, so the rest of the game treats touch input
// exactly like the physical keyboard (movement, jump, menu nav, confirm).
//
// Layout intent:
//   • bottom-left  : ◀ ▶ movement (left thumb)
//   • bottom-right : ⚔ attack + ⤴ jump (right thumb)
//
// Visibility is driven by setTouchMode():
//   'play'   → Move + Jump + Attack   (in-game)
//   'menu'   → Move + Jump            (title / character / difficulty / game over)
//   'hidden' → nothing                (level-up overlay, loading)
// During the level-up ability overlay the buttons are hidden; the cards are
// tapped directly, then the layout returns automatically once play resumes.

import { pressKey, releaseKey } from './input.js';

let root = null;

// Show controls only where touch input actually makes sense, so the buttons
// never clutter a desktop mouse session. Chrome device-emulation also matches.
// Append ?touch=1 to the URL to force them on for testing on a desktop.
function isTouchCapable() {
  if (/[?&]touch=1\b/.test(window.location.search)) return true;
  return (
    'ontouchstart' in window ||
    (navigator.maxTouchPoints || 0) > 0 ||
    window.matchMedia('(pointer: coarse)').matches
  );
}

// Build one button, wiring pointer down/up to the given key code. Holding the
// button keeps the key down; releasing (or sliding off) releases it.
function makeButton(id, glyph, code, extraClass) {
  const btn = document.createElement('button');
  btn.id = id;
  btn.type = 'button';
  btn.className = 'tc-btn' + (extraClass ? ' ' + extraClass : '');
  btn.textContent = glyph;
  btn.setAttribute('aria-hidden', 'true');
  btn.tabIndex = -1;

  const down = (e) => {
    e.preventDefault();
    try { btn.setPointerCapture(e.pointerId); } catch (_) {}
    btn.classList.add('tc-active');
    pressKey(code);
  };
  const up = (e) => {
    e.preventDefault();
    btn.classList.remove('tc-active');
    releaseKey(code);
  };

  btn.addEventListener('pointerdown', down);
  btn.addEventListener('pointerup', up);
  btn.addEventListener('pointercancel', up);
  // Long-press context menu would interrupt held movement — suppress it.
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
  return btn;
}

export function initTouchControls() {
  if (root || !isTouchCapable()) return;

  root = document.createElement('div');
  root.id = 'touch-controls';
  root.className = 'mode-hidden';

  const left = document.createElement('div');
  left.className = 'tc-cluster tc-cluster-left';
  left.appendChild(makeButton('tc-left',  '◀', 'ArrowLeft',  'tc-dir'));
  left.appendChild(makeButton('tc-right', '▶', 'ArrowRight', 'tc-dir'));

  const right = document.createElement('div');
  right.className = 'tc-cluster tc-cluster-right';
  // Attack sits up-and-left of Jump so both fall naturally under the thumb.
  right.appendChild(makeButton('tc-attack', '⚔', 'KeyJ',  'tc-attack'));
  right.appendChild(makeButton('tc-jump',   '⤴', 'Space', 'tc-jump'));

  root.appendChild(left);
  root.appendChild(right);
  document.body.appendChild(root);
}

// Switch which buttons are shown for the current game state.
export function setTouchMode(mode) {
  if (!root) return;
  root.classList.remove('mode-hidden', 'mode-menu', 'mode-play');
  root.classList.add('mode-' + mode);
}
