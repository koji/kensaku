# kensaku

[日本語版はこちら](./README_JA.md)

`kensaku` is a CLI that scans GitHub Actions `uses:` entries and shows or applies updates that pin action references to commit SHAs.

## Installation

```shell
npm install -g kensaku
pnpm add -g kensaku
bun add -g kensaku
```

## Usage

```shell
kensaku check
kensaku fix
```

By default, it scans `.github/workflows/**/*.yml` and `.github/workflows/**/*.yaml` under the current directory.

```shell
kensaku check --path ".github/workflows/release.yml"
kensaku fix --path ".github/workflows/*.yml"
```

For local development:

```shell
npm run build
node ./dist/cli.js check
```

## Behavior

- Detects `owner/repo@ref` entries such as `actions/checkout@v4`
- Ignores `docker://...` and `./...`
- If an action is already pinned like `@sha # v4`, it uses the comment as the source ref for refreshes
- `--major-only` is enabled by default, so only major tags like `v4` are updated automatically

### check command
```shell
kensaku check

.github\workflows\ci.yml:17
  action: actions/checkout
  target: v5
  current: v5
  latest: 93cb6efe18208431cddfb8368fd83d5badbf9bfd
  replace: uses: actions/checkout@v5
  with:    uses: actions/checkout@93cb6efe18208431cddfb8368fd83d5badbf9bfd # v5

.github\workflows\ci.yml:51
  action: oven-sh/setup-bun
  target: v2
  current: v2
  latest: 0c5077e51419868618aeaa5fe8019c62421857d6
  replace: uses: oven-sh/setup-bun@v2
  with:    uses: oven-sh/setup-bun@0c5077e51419868618aeaa5fe8019c62421857d6 # v2
```

### fix command
`before`
```yaml
steps:
  - name: Checkout code
    uses: actions/checkout@v5
    with:
      fetch-depth: 0

  - name: Setup Bun
    uses: oven-sh/setup-bun@v2
    with:
      bun-version: latest
```

```shell
kensaku fix
```

`after`
```yaml
steps:
      - name: Checkout code
        uses: actions/checkout@93cb6efe18208431cddfb8368fd83d5badbf9bfd # v5
        with:
          fetch-depth: 0

      - name: Setup Bun
        uses: oven-sh/setup-bun@0c5077e51419868618aeaa5fe8019c62421857d6 # v2
        with:
          bun-version: latest
```

## Authentication

GitHub API resolution uses `GITHUB_TOKEN` or `GH_TOKEN` when available. It can run without a token, but you are more likely to hit rate limits.

Adjust `name` and `version` in `package.json` before publishing.
