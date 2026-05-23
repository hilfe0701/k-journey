/**
 * Drift guard (ADR-0028 §Test plan): the error catalog in code and the
 * master copy table in docs/ERROR_MESSAGES.md must not diverge, and every
 * `surfaceError('code')` literal in the app must reference a real code.
 */

import * as fs from 'fs';
import * as path from 'path';
import { ERROR_CATALOG } from '../errors/catalog';

const ROOT = path.join(__dirname, '../../..');
const DOC = fs.readFileSync(path.join(ROOT, 'docs/ERROR_MESSAGES.md'), 'utf8');

/** Codes from the leading `code` cell of every ERROR_MESSAGES.md table row. */
function documentedCodes(): string[] {
  const codes: string[] = [];
  for (const line of DOC.split('\n')) {
    const m = line.match(/^\|\s*`([a-z0-9-]+)`\s*\|/);
    if (m) codes.push(m[1]);
  }
  return codes;
}

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...sourceFiles(full));
    else if (/\.tsx?$/.test(entry.name) && !entry.name.includes('.test.')) out.push(full);
  }
  return out;
}

describe('error catalog ↔ ERROR_MESSAGES.md drift guard', () => {
  it('every documented code exists in ERROR_CATALOG', () => {
    const missing = documentedCodes().filter((c) => !ERROR_CATALOG[c]);
    expect(missing).toEqual([]);
  });

  it('every ERROR_CATALOG code is documented in ERROR_MESSAGES.md', () => {
    const documented = new Set(documentedCodes());
    const undocumented = Object.keys(ERROR_CATALOG).filter((c) => !documented.has(c));
    expect(undocumented).toEqual([]);
  });

  it('every surfaceError(code) literal references a real catalog code', () => {
    const files = [
      ...sourceFiles(path.join(ROOT, 'src')),
      ...sourceFiles(path.join(ROOT, 'app')),
    ];
    const bad: string[] = [];
    for (const file of files) {
      const src = fs.readFileSync(file, 'utf8');
      const re = /surfaceError\(\s*'([a-z0-9-]+)'/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(src)) !== null) {
        if (!ERROR_CATALOG[m[1]]) bad.push(`${path.relative(ROOT, file)}: ${m[1]}`);
      }
    }
    expect(bad).toEqual([]);
  });
});
