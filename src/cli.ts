#!/usr/bin/env node

import {
  applyChanges,
  createGitHubResolver,
  formatReport,
  inspectWorkflows,
  parseArgs,
} from './lib.js';

async function main(): Promise<void> {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log([
      'Usage: node --experimental-strip-types ./src/cli.ts <check|fix> [options]',
      '',
      'Options:',
      '  --path <glob>       Workflow glob to scan',
      '  --root <dir>        Root directory to scan',
      '  --repo <owner/name> Reserved for future use',
      '  --major-only        Only update major tags like v4 (default)',
      '  --no-major-only     Allow non-major refs such as v4.2.1',
    ].join('\n'));
    return;
  }

  const args = parseArgs(process.argv.slice(2));
  const resolveRef = createGitHubResolver();
  const results = await inspectWorkflows({
    rootDir: args.rootDir,
    path: args.path,
    majorOnly: args.majorOnly,
    repo: args.repo,
    resolveRef,
  });

  console.log(formatReport(results, args.rootDir));

  const hasChanges = results.some((result) => result.changes.length > 0);
  if (args.command === 'fix' && hasChanges) {
    await applyChanges(results);
    console.log('\nApplied updates.');
    process.exitCode = 0;
    return;
  }

  process.exitCode = hasChanges ? 1 : 0;
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 2;
});
