import test from 'node:test';
import assert from 'node:assert';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function collectJsFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') return [];
      return collectJsFiles(full);
    }
    return entry.name.endsWith('.js') ? [full] : [];
  });
}

test('only one GRAVITY definition exists', () => {
  const files = collectJsFiles('.');
  const regex = /const\s+GRAVITY\s*=/;
  const matches = files.filter(f => regex.test(readFileSync(f, 'utf8')));
  assert.deepStrictEqual(matches, ['src/config.js']);
});
