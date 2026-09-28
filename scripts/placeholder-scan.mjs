#!/usr/bin/env node
/**
 * Fails CI if it finds TODO, FIXME, PLACEHOLDER, or hardcoded fake emails
 * that look real (e.g. test@example.com is allowed; john.doe@clinic.com is not).
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  '.turbo',
  'dist',
  '.next',
  'coverage',
  '.pnpm-store',
]);

const FORBIDDEN = [
  /\bTODO\b/,
  /\bFIXME\b/,
  /\bPLACEHOLDER\b/i,
  /\bcoming soon\b/i,
  /\bnot implemented\b/i,
];

// Allowlist common safe test domains; flag others that look like real addresses
const FAKE_EMAIL_RE =
  /\b[a-zA-Z0-9._%+-]+@(?!(example\.com|example\.org|test\.com|localhost|invalid))[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;

const ALLOWED_FAKE_PATTERNS = [
  /user@example\.com/,
  /admin@example\.com/,
  /test@example\.com/,
  /noreply@example\.com/,
];

let failures = 0;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) await walk(full);
      continue;
    }
    if (!/\.(ts|tsx|js|jsx|mjs|cjs|md|json|yml|yaml)$/i.test(entry.name)) continue;
    // Skip the scan script itself and living docs that legitimately mention the words
    const rel = relative(ROOT, full);
    if (rel.startsWith('scripts/placeholder-scan') || rel.startsWith('docs/')) continue;

    const content = await readFile(full, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, i) => {
      for (const re of FORBIDDEN) {
        if (re.test(line)) {
          console.error(`[FORBIDDEN] ${rel}:${i + 1}: ${line.trim().slice(0, 120)}`);
          failures++;
        }
      }
      const emails = line.match(FAKE_EMAIL_RE) || [];
      for (const email of emails) {
        if (ALLOWED_FAKE_PATTERNS.some((p) => p.test(email))) continue;
        console.error(`[SUSPICIOUS_EMAIL] ${rel}:${i + 1}: ${email}`);
        failures++;
      }
    });
  }
}

await walk(ROOT);
if (failures > 0) {
  console.error(`\nplaceholder-scan failed with ${failures} issue(s).`);
  process.exit(1);
}
console.log('placeholder-scan: clean');
