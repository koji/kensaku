import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseUsesLine, buildPinnedLine } from '../dist/lib.js';

test('dist exports parse and pin helpers', () => {
  const parsed = parseUsesLine("- uses: 'actions/checkout@v4'");
  assert.equal(parsed?.action, 'actions/checkout');
  assert.equal(
    buildPinnedLine(
      { prefix: '- ', action: 'actions/checkout' },
      '34e114876b0b11c390a56381ad16ebd13914f8d5',
      'v4',
    ),
    '- uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4',
  );
});

test('dist cli prints package version for -v and --version', () => {
  const repoRoot = path.resolve(import.meta.dirname, '..');
  const packageJson = JSON.parse(
    readFileSync(path.join(repoRoot, 'package.json'), 'utf8'),
  );

  for (const flag of ['-v', '--version']) {
    const result = spawnSync(process.execPath, ['./dist/cli.js', flag], {
      cwd: repoRoot,
      encoding: 'utf8',
    });

    assert.equal(result.status, 0, `expected exit code 0 for ${flag}`);
    assert.equal(result.stderr, '', `expected no stderr for ${flag}`);
    assert.equal(result.stdout.trim(), packageJson.version);
  }
});
