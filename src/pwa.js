// PWA glue: registers the offline service worker and drives the "Install App"
// button. Loaded as a separate module from index.html so the core game (main.js)
// is untouched. Everything here is best-effort and wrapped in guards — if the
// browser lacks support, or we're inside the Base44 iframe, it silently no-ops
// and the website plays exactly as before.

const inIframe = (() => {
  try { return window.self !== window.top; } catch (_) { return true; }
})();

// ── Service worker (offline cache) ──────────────────────────────────────────
// Skip inside the Base44 iframe so we never interfere with the host app, and
// only run on secure origins (https / localhost) where SWs are allowed.
function registerSW() {
  if (inIframe) return;
  if (!('serviceWorker' in navigator)) return;
  const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (!isSecure) return;
  // Register relative to this page so it works at a domain root or a Pages subpath.
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => {
      console.warn('[pwa] service worker registration failed:', err);
    });
  });
}

// ── Install button ──────────────────────────────────────────────────────────
const btn = document.getElementById('install-btn');
const standalone = window.matchMedia('(display-mode: standalone)').matches
  || window.matchMedia('(display-mode: fullscreen)').matches
  || window.navigator.standalone === true;

let deferredPrompt = null;

function showBtn(text) {
  if (!btn) return;
  btn.textContent = text;
  btn.hidden = false;
}
function hideBtn() {
  if (btn) btn.hidden = true;
}

// Chromium (Windows / Android / ChromeOS): the browser tells us the app is
// installable. Capture the event and reveal our own styled button.
window.addEventListener('beforeinstallprompt', (e) => {
  if (inIframe || standalone) return;
  e.preventDefault();
  deferredPrompt = e;
  showBtn('📲 Install App');
});

if (btn) {
  btn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch (_) {}
      deferredPrompt = null;
      hideBtn();
      return;
    }
    // iOS Safari has no install prompt — guide the user instead.
    if (isIOS()) {
      alert('To install:\nTap the Share button, then "Add to Home Screen".');
    }
  });
}

// Once installed, drop the button.
window.addEventListener('appinstalled', () => { deferredPrompt = null; hideBtn(); });

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1);
}

// iOS gives no beforeinstallprompt, so offer the manual hint when relevant.
if (!inIframe && !standalone && isIOS()) {
  showBtn('📲 Add to Home Screen');
}

registerSW();
