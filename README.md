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

`sample`
```shell
PS C:\Users\19172\Desktop\dev\Hyouji> kensaku check
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

.github\workflows\ci.yml:76
  action: actions/cache
  target: v4
  current: v4
  latest: 0057852bfaa89a56745cba8c7296529d2fc39830
  replace: uses: actions/cache@v4
  with:    uses: actions/cache@0057852bfaa89a56745cba8c7296529d2fc39830 # v4

.github\workflows\publish.yml:21
  action: actions/checkout
  target: v5
  current: v5
  latest: 93cb6efe18208431cddfb8368fd83d5badbf9bfd
  replace: uses: actions/checkout@v5
  with:    uses: actions/checkout@93cb6efe18208431cddfb8368fd83d5badbf9bfd # v5

.github\workflows\publish.yml:26
  action: oven-sh/setup-bun
  target: v2
  current: v2
  latest: 0c5077e51419868618aeaa5fe8019c62421857d6
  replace: uses: oven-sh/setup-bun@v2
  with:    uses: oven-sh/setup-bun@0c5077e51419868618aeaa5fe8019c62421857d6 # v2

.github\workflows\publish.yml:31
  action: actions/cache
  target: v4
  current: v4
  latest: 0057852bfaa89a56745cba8c7296529d2fc39830
  replace: uses: actions/cache@v4
  with:    uses: actions/cache@0057852bfaa89a56745cba8c7296529d2fc39830 # v4

.github\workflows\publish.yml:98
  action: actions/checkout
  target: v5
  current: v5
  latest: 93cb6efe18208431cddfb8368fd83d5badbf9bfd
  replace: uses: actions/checkout@v5
  with:    uses: actions/checkout@93cb6efe18208431cddfb8368fd83d5badbf9bfd # v5

.github\workflows\publish.yml:103
  action: oven-sh/setup-bun
  target: v2
  current: v2
  latest: 0c5077e51419868618aeaa5fe8019c62421857d6
  replace: uses: oven-sh/setup-bun@v2
  with:    uses: oven-sh/setup-bun@0c5077e51419868618aeaa5fe8019c62421857d6 # v2

.github\workflows\publish.yml:108
  action: actions/setup-node
  target: v6
  current: v6
  latest: 48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e
  replace: uses: actions/setup-node@v6
  with:    uses: actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e # v6

.github\workflows\publish.yml:152
  action: actions/cache
  target: v4
  current: v4
  latest: 0057852bfaa89a56745cba8c7296529d2fc39830
  replace: uses: actions/cache@v4
  with:    uses: actions/cache@0057852bfaa89a56745cba8c7296529d2fc39830 # v4

.github\workflows\safe-chain.yml:10
  action: actions/checkout
  target: v4
  current: v4
  latest: 34e114876b0b11c390a56381ad16ebd13914f8d5
  replace: uses: actions/checkout@v4
  with:    uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4

.github\workflows\safe-chain.yml:13
  action: actions/setup-node
  target: v4
  current: v4
  latest: 49933ea5288caeca8642d1e84afbd3f7d6820020
  replace: uses: actions/setup-node@v4
  with:    uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4

.github\workflows\safe-chain.yml:18
  action: oven-sh/setup-bun
  target: v2
  current: v2
  latest: 0c5077e51419868618aeaa5fe8019c62421857d6
  replace: uses: oven-sh/setup-bun@v2
  with:    uses: oven-sh/setup-bun@0c5077e51419868618aeaa5fe8019c62421857d6 # v2

.github\workflows\security-audit.yml:20
  action: actions/checkout
  target: v4
  current: v4
  latest: 34e114876b0b11c390a56381ad16ebd13914f8d5
  replace: uses: actions/checkout@v4
  with:    uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4

.github\workflows\security-audit.yml:23
  action: oven-sh/setup-bun
  target: v1
  current: v1
  latest: f4d14e03ff726c06358e5557344e1da148b56cf7
  replace: uses: oven-sh/setup-bun@v1
  with:    uses: oven-sh/setup-bun@f4d14e03ff726c06358e5557344e1da148b56cf7 # v1

.github\workflows\security-audit.yml:64
  action: actions/upload-artifact
  target: v4
  current: v4
  latest: ea165f8d65b6e75b540449e92b4886f43607fa02
  replace: uses: actions/upload-artifact@v4
  with:    uses: actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4

.github\workflows\security-audit.yml:79
  action: actions/download-artifact
  target: v4
  current: v4
  latest: d3f86a106a0bac45b974a628896c90dbdf5c8093
  replace: uses: actions/download-artifact@v4
  with:    uses: actions/download-artifact@d3f86a106a0bac45b974a628896c90dbdf5c8093 # v4
```

after running the fix command
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

## Authentication

GitHub API resolution uses `GITHUB_TOKEN` or `GH_TOKEN` when available. It can run without a token, but you are more likely to hit rate limits.

Adjust `name` and `version` in `package.json` before publishing.
