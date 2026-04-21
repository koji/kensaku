import test from 'node:test';
import assert from 'node:assert/strict';
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
