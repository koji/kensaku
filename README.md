# sha-checker

[日本語版はこちら](./README_JA.md)

`sha-checker` is a CLI that scans GitHub Actions `uses:` entries and shows or applies updates that pin action references to commit SHAs.

## Installation

```bash
npm install -g sha-checker
```

## Usage

```bash
sha-checker check
sha-checker fix
```

By default, it scans `.github/workflows/**/*.yml` and `.github/workflows/**/*.yaml` under the current directory.

```bash
sha-checker check --path ".github/workflows/release.yml"
sha-checker fix --path ".github/workflows/*.yml"
```

For local development:

```bash
npm run build
node ./dist/cli.js check
```

## Behavior

- Detects `owner/repo@ref` entries such as `actions/checkout@v4`
- Ignores `docker://...` and `./...`
- If an action is already pinned like `@sha # v4`, it uses the comment as the source ref for refreshes
- `--major-only` is enabled by default, so only major tags like `v4` are updated automatically

## Authentication

GitHub API resolution uses `GITHUB_TOKEN` or `GH_TOKEN` when available. It can run without a token, but you are more likely to hit rate limits.

## Publishing to npm

```bash
npm run build
npm test
npm publish --access public
```

Adjust `name` and `version` in `package.json` before publishing.
