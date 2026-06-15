// Keyboard input state manager

const keys = {};
const justPressed = {};
const justReleased = {};

export function initInput() {
  window.addEventListener('keydown', (e) => {
    if (!keys[e.code]) {
      justPressed[e.code] = true;
    }
    keys[e.code] = true;
    // Prevent default for game keys
    if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
      e.preventDefault();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    justReleased[e.code] = true;
  });
}

// ─── Virtual (touch) input ───────────────────────────────────────────────────
// On-screen buttons feed the SAME key-state maps as the physical keyboard, so
// every downstream check (movement, jump, menu navigation, confirm) works with
// no special-casing. A button "press" mirrors a keydown; "release" a keyup.
export function pressKey(code) {
  if (!keys[code]) justPressed[code] = true;
  keys[code] = true;
}

export function releaseKey(code) {
  keys[code] = false;
  justReleased[code] = true;
}

export function isDown(code) {
  return !!keys[code];
}

export function isJustPressed(code) {
  return !!justPressed[code];
}

export function isJustReleased(code) {
  return !!justReleased[code];
}

export function clearFrame() {
  // Clear per-frame states
  for (const k in justPressed) delete justPressed[k];
  for (const k in justReleased) delete justReleased[k];
}

export function isLeft() {
  return isDown('ArrowLeft') || isDown('KeyA');
}

export function isRight() {
  return isDown('ArrowRight') || isDown('KeyD');
}

export function isJump() {
  return isJustPressed('Space') || isJustPressed('Enter');
}

// Manual attack request (touch Attack button). 'KeyJ' is reserved as the
// virtual attack key so it never collides with movement/jump/confirm keys.
export function isAttack() {
  return isJustPressed('KeyJ');
}

export function isConfirm() {
  return isJustPressed('Space') || isJustPressed('Enter');
}

export function isNavLeft() {
  return isJustPressed('ArrowLeft') || isJustPressed('KeyA');
}

export function isNavRight() {
  return isJustPressed('ArrowRight') || isJustPressed('KeyD');
}
