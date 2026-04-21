import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  applyChanges,
  buildPinnedLine,
  createGitHubResolver,
  inspectWorkflows,
  parseUsesLine,
} from '../src/lib.ts';

test('parseUsesLine parses quoted uses values', () => {
  const parsed = parseUsesLine("- uses: 'actions/checkout@v4'");
  assert.deepEqual(parsed, {
    prefix: '- ',
    action: 'actions/checkout',
    ref: 'v4',
    comment: '',
    original: "- uses: 'actions/checkout@v4'",
  });
});

test('parseUsesLine ignores local and docker actions', () => {
  assert.equal(parseUsesLine('- uses: ./local-action'), null);
  assert.equal(parseUsesLine('- uses: docker://alpine:3.20'), null);
});

test('buildPinnedLine emits normalized sha pin form', () => {
  const nextLine = buildPinnedLine(
    {
      prefix: '      - ',
      action: 'actions/checkout',
    },
    '34e114876b0b11c390a56381ad16ebd13914f8d5',
    'v4',
  );

  assert.equal(nextLine, '      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4');
});

test('inspectWorkflows reports unpinned and stale pinned actions', async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'kensaku-'));
  await mkdir(path.join(rootDir, '.github/workflows'), { recursive: true });
  const workflowPath = path.join(rootDir, '.github/workflows/ci.yml');
  await writeFile(
    workflowPath,
    [
      'jobs:',
      '  test:',
      '    steps:',
      "      - uses: 'actions/checkout@v4'",
      '      - uses: actions/setup-node@1111111111111111111111111111111111111111 # v4',
      '      - uses: ./local-action',
      '',
    ].join('\n'),
    'utf8',
  );

  const results = await inspectWorkflows({
    rootDir,
    path: '.github/workflows/*.yml',
    majorOnly: true,
    resolveRef: async (action: string, ref: string) => {
      if (action === 'actions/checkout' && ref === 'v4') {
        return '34e114876b0b11c390a56381ad16ebd13914f8d5';
      }

      if (action === 'actions/setup-node' && ref === 'v4') {
        return '2222222222222222222222222222222222222222';
      }

      throw new Error(`unexpected ${action}@${ref}`);
    },
  });

  const changes = results.flatMap((result) => result.changes);
  assert.equal(changes.length, 2);
  assert.equal(changes[0]?.lineNumber, 4);
  assert.equal(changes[0]?.nextLine, '      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4');
  assert.equal(changes[1]?.lineNumber, 5);
  assert.equal(changes[1]?.nextLine, '      - uses: actions/setup-node@2222222222222222222222222222222222222222 # v4');
});

test('applyChanges rewrites workflow files in place', async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'kensaku-'));
  await mkdir(path.join(rootDir, '.github/workflows'), { recursive: true });
  const workflowPath = path.join(rootDir, '.github/workflows/ci.yml');
  await writeFile(workflowPath, "- uses: 'actions/checkout@v4'\n", 'utf8');

  const results = await inspectWorkflows({
    rootDir,
    path: '.github/workflows/*.yml',
    majorOnly: true,
    resolveRef: async () => '34e114876b0b11c390a56381ad16ebd13914f8d5',
  });

  await applyChanges(results);
  const updated = await readFile(workflowPath, 'utf8');
  assert.equal(updated, '- uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4\n');
});

test('createGitHubResolver uses commit endpoint and validates sha', async () => {
  const calls: Array<{ url: string | URL | Request; options: RequestInit | undefined }> = [];
  const resolver = createGitHubResolver({
    token: 'token-1',
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return {
        ok: true,
        async json() {
          return { sha: '34e114876b0b11c390a56381ad16ebd13914f8d5' };
        },
      } as Response;
    },
  });

  const sha = await resolver('actions/checkout', 'v4');
  assert.equal(sha, '34e114876b0b11c390a56381ad16ebd13914f8d5');
  assert.equal(calls.length, 1);
  assert.equal(String(calls[0]?.url), 'https://api.github.com/repos/actions/checkout/commits/v4');
  assert.equal((calls[0]?.options?.headers as Record<string, string>).Authorization, 'Bearer token-1');
});
