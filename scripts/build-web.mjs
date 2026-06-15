// Assemble the web app into ./www for the native (Capacitor) APK build.
//
// The APK bundles every file under webDir, so this copies the whole repo into
// www/ and excludes only dev/build/tooling files. Using an exclude-list (rather
// than an allow-list) guarantees no runtime asset — sprite, background, BGM —
// is ever accidentally left out of the app.
//
// Usage: node scripts/build-web.mjs   (run from the repo root; `npm run build:web`)

import { existsSync, rmSync, mkdirSync, cpSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const www = path.join(root, 'www');

// Top-level directories that never belong in the shipped app.
const EXCLUDE_DIRS = new Set([
  'node_modules', 'www', 'android', 'ios', '.git', '.github', '.claude',
  'tools', 'resources', 'scripts', 'background music',
]);

// Top-level files that are dev/build only.
const EXCLUDE_FILES = new Set([
  'package.json', 'package-lock.json', 'pnpm-lock.yaml',
  'capacitor.config.json', 'capacitor.config.ts',
  'serve.py', 'serve.bat', 'serve.command',
  '.gitignore', 'HANDOFF.md', 'PLAN.md', 'README.md',
]);

// Drop OS cruft from any nested directory we copy.
const nestedFilter = (src) => path.basename(src) !== '.DS_Store';

console.log('Building web bundle → www/');
if (existsSync(www)) rmSync(www, { recursive: true, force: true });
mkdirSync(www, { recursive: true });

// Copy each top-level entry individually — cpSync refuses to copy the repo root
// into its own www/ subdirectory, so we never hand it the root itself.
let copied = 0;
for (const name of readdirSync(root)) {
  if (name === '.DS_Store') continue;
  if (EXCLUDE_DIRS.has(name) || EXCLUDE_FILES.has(name)) continue;
  cpSync(path.join(root, name), path.join(www, name), { recursive: true, filter: nestedFilter });
  copied++;
}

console.log(`Done. Copied ${copied} top-level entries. www/ ready for \`cap sync android\`.`);
