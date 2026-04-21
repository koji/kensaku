import { glob, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const WORKFLOW_GLOB = '.github/workflows/**/*.{yml,yaml}';
const SHA_PATTERN = /^[0-9a-f]{40}$/;
const MAJOR_TAG_PATTERN = /^v\d+$/;

export type Command = 'check' | 'fix';

export type CliArgs = {
  command: Command;
  path: string;
  majorOnly: boolean;
  rootDir: string;
  repo: string | null;
};

export type ParsedUsesLine = {
  prefix: string;
  action: string;
  ref: string;
  comment: string;
  original: string;
};

export type FileChange = {
  filePath: string;
  lineNumber: number;
  action: string;
  targetRef: string;
  currentRef: string;
  currentComment: string;
  currentLine: string;
  nextLine: string;
  nextSha: string;
};

export type InspectionResult = {
  filePath: string;
  raw: string;
  lines: string[];
  changes: FileChange[];
};

export type ResolveRef = (action: string, ref: string, repo?: string | null) => Promise<string>;

export type InspectOptions = {
  rootDir: string;
  path: string;
  majorOnly: boolean;
  repo?: string | null;
  resolveRef: ResolveRef;
};

type ParsedValue = {
  value: string;
  comment: string;
};

type GitHubCommitResponse = {
  sha?: unknown;
  message?: string;
};

export function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    command: 'check',
    path: WORKFLOW_GLOB,
    majorOnly: true,
    rootDir: process.cwd(),
    repo: null,
  };

  const positionals: string[] = [];

  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];

    if (value === '--path') {
      const next = argv[i + 1];
      if (!next) {
        throw new Error('--path requires a value');
      }

      args.path = next;
      i += 1;
      continue;
    }

    if (value === '--repo') {
      const next = argv[i + 1];
      if (!next) {
        throw new Error('--repo requires a value');
      }

      args.repo = next;
      i += 1;
      continue;
    }

    if (value === '--root') {
      const next = argv[i + 1];
      if (!next) {
        throw new Error('--root requires a value');
      }

      args.rootDir = path.resolve(next);
      i += 1;
      continue;
    }

    if (value === '--major-only') {
      args.majorOnly = true;
      continue;
    }

    if (value === '--no-major-only') {
      args.majorOnly = false;
      continue;
    }

    if (value.startsWith('-')) {
      throw new Error(`Unknown option: ${value}`);
    }

    positionals.push(value);
  }

  if (positionals.length > 0) {
    const command = positionals[0];
    if (command !== 'check' && command !== 'fix') {
      throw new Error(`Unknown command: ${command}`);
    }

    args.command = command;
  }

  return args;
}

export async function findWorkflowFiles(rootDir: string, pattern = WORKFLOW_GLOB): Promise<string[]> {
  const results: string[] = [];

  for await (const match of glob(pattern, { cwd: rootDir })) {
    results.push(path.resolve(rootDir, match));
  }

  return results.sort();
}

export function parseUsesLine(line: string): ParsedUsesLine | null {
  const match = line.match(/^(\s*-\s*)?uses:\s*(.+?)\s*$/);
  if (!match) {
    return null;
  }

  const prefix = match[1] ?? '';
  const rest = match[2];
  if (!rest) {
    return null;
  }

  const parsedValue = parseValueAndComment(rest);
  if (!parsedValue) {
    return null;
  }

  const { value, comment } = parsedValue;
  if (value.startsWith('docker://') || value.startsWith('./')) {
    return null;
  }

  const usesMatch = value.match(/^([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)@(.+)$/);
  if (!usesMatch) {
    return null;
  }

  const action = usesMatch[1];
  const ref = usesMatch[2];
  if (!action || !ref) {
    return null;
  }

  return {
    prefix,
    action,
    ref,
    comment: normalizeComment(comment),
    original: line,
  };
}

function parseValueAndComment(raw: string): ParsedValue | null {
  const trimmed = raw.trim();

  if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
    const quote = trimmed[0];
    const end = trimmed.indexOf(quote, 1);
    if (end === -1) {
      return null;
    }

    const value = trimmed.slice(1, end);
    const tail = trimmed.slice(end + 1).trimStart();
    const comment = tail.startsWith('#') ? tail : '';
    return { value, comment };
  }

  const hashIndex = trimmed.indexOf('#');
  if (hashIndex === -1) {
    return { value: trimmed, comment: '' };
  }

  return {
    value: trimmed.slice(0, hashIndex).trimEnd(),
    comment: trimmed.slice(hashIndex),
  };
}

function normalizeComment(comment: string): string {
  if (!comment) {
    return '';
  }

  return comment.replace(/^#\s*/, '').trim();
}

export function getTargetRef(parsedLine: ParsedUsesLine | null): string | null {
  if (!parsedLine) {
    return null;
  }

  if (SHA_PATTERN.test(parsedLine.ref)) {
    return parsedLine.comment || null;
  }

  return parsedLine.ref;
}

export function buildPinnedLine(parsedLine: Pick<ParsedUsesLine, 'prefix' | 'action'>, sha: string, targetRef: string): string {
  return `${parsedLine.prefix}uses: ${parsedLine.action}@${sha} # ${targetRef}`;
}

export async function inspectFile(filePath: string, options: InspectOptions): Promise<InspectionResult> {
  const raw = await readFile(filePath, 'utf8');
  const lines = raw.split(/\r?\n/);
  const changes: FileChange[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? '';
    const parsed = parseUsesLine(line);
    if (!parsed) {
      continue;
    }

    const targetRef = getTargetRef(parsed);
    if (!targetRef) {
      continue;
    }

    if (options.majorOnly && !MAJOR_TAG_PATTERN.test(targetRef)) {
      continue;
    }

    const latestSha = await options.resolveRef(parsed.action, targetRef, options.repo);
    const nextLine = buildPinnedLine(parsed, latestSha, targetRef);
    if (nextLine === line) {
      continue;
    }

    changes.push({
      filePath,
      lineNumber: index + 1,
      action: parsed.action,
      targetRef,
      currentRef: parsed.ref,
      currentComment: parsed.comment,
      currentLine: line,
      nextLine,
      nextSha: latestSha,
    });
  }

  return {
    filePath,
    raw,
    lines,
    changes,
  };
}

export async function inspectWorkflows(options: InspectOptions): Promise<InspectionResult[]> {
  const files = await findWorkflowFiles(options.rootDir, options.path);
  const results: InspectionResult[] = [];

  for (const filePath of files) {
    results.push(await inspectFile(filePath, options));
  }

  return results;
}

export async function applyChanges(results: InspectionResult[]): Promise<void> {
  for (const result of results) {
    if (result.changes.length === 0) {
      continue;
    }

    const nextLines = [...result.lines];
    for (const change of result.changes) {
      nextLines[change.lineNumber - 1] = change.nextLine;
    }

    await writeFile(result.filePath, nextLines.join('\n'), 'utf8');
  }
}

export function formatReport(results: InspectionResult[], rootDir = process.cwd()): string {
  if (results.length === 0) {
    return 'No workflow files found.';
  }

  const changes = results.flatMap((result) => result.changes);
  if (changes.length === 0) {
    return 'No updates needed.';
  }

  return changes
    .map((change) => {
      const relativePath = path.relative(rootDir, change.filePath) || change.filePath;
      return [
        `${relativePath}:${change.lineNumber}`,
        `  action: ${change.action}`,
        `  target: ${change.targetRef}`,
        `  current: ${change.currentRef}`,
        `  latest: ${change.nextSha}`,
        `  replace: ${change.currentLine.trim()}`,
        `  with:    ${change.nextLine.trim()}`,
      ].join('\n');
    })
    .join('\n\n');
}

export function createGitHubResolver({
  fetchImpl = globalThis.fetch,
  token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN,
}: {
  fetchImpl?: typeof fetch;
  token?: string | undefined;
} = {}): ResolveRef {
  if (typeof fetchImpl !== 'function') {
    throw new Error('fetch is not available in this Node runtime');
  }

  const cache = new Map<string, string>();

  return async function resolveRef(action: string, ref: string): Promise<string> {
    const cacheKey = `${action}@${ref}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const [owner, repo] = action.split('/');
    if (!owner || !repo) {
      throw new Error(`Invalid action reference: ${action}`);
    }

    const endpoint = `https://api.github.com/repos/${owner}/${repo}/commits/${encodeURIComponent(ref)}`;
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'sha-checker',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetchImpl(endpoint, { headers });
    if (!response.ok) {
      const payload = await safeJson(response);
      const message = payload?.message ?? response.statusText;
      throw new Error(`Failed to resolve ${action}@${ref}: ${response.status} ${message}`);
    }

    const payload = (await response.json()) as GitHubCommitResponse;
    const sha = typeof payload.sha === 'string' ? payload.sha : null;
    if (!sha || !SHA_PATTERN.test(sha)) {
      throw new Error(`GitHub API returned an invalid sha for ${action}@${ref}`);
    }

    cache.set(cacheKey, sha);
    return sha;
  };
}

async function safeJson(response: Response): Promise<GitHubCommitResponse | null> {
  try {
    return (await response.json()) as GitHubCommitResponse;
  } catch {
    return null;
  }
}
