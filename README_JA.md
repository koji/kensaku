# kensaku

[English version](./README.md)

GitHub Actions の `uses:` を走査して、タグ指定を SHA pin へ変換する候補を表示・適用する CLI です。

## インストール

```shell
npm install -g kensaku
pnpm add -g kensaku
bun add -g kensaku
```

## 使い方

```shell
kensaku check
kensaku fix
kensaku -v / --version
```

既定ではカレントディレクトリ配下の `.github/workflows/**/*.yml` / `.yaml` を対象にします。

```shell
kensaku check --path ".github/workflows/release.yml"
kensaku fix --path ".github/workflows/*.yml"
```

### help コマンド
```shell
kensaku -h
Usage: node --experimental-strip-types ./src/cli.ts <check|fix> [options]

Options:
  --path <glob>       Workflow glob to scan
  --root <dir>        Root directory to scan
  --repo <owner/name> Reserved for future use
  --major-only        Only update major tags like v4 (default)
  --no-major-only     Allow non-major refs such as v4.2.1
```

ローカル開発では以下を使います。

```shell
npm run build
node ./dist/cli.js check
```

## 挙動

- `actions/checkout@v4` のような `owner/repo@ref` を検出
- `docker://...` と `./...` は無視
- `@sha # v4` のようにコメントで元の ref が残っていれば、その ref を基準に更新
- `--major-only` が既定で有効。`v4` のようなメジャータグのみ自動更新対象

### check コマンド
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

### fix コマンド
`実行前`
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

`実行後`
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

## 認証

GitHub API の解決には `GITHUB_TOKEN` か `GH_TOKEN` が使えます。未設定でも試行しますが、レート制限にかかりやすくなります。

公開前に `package.json` の `name` と `version` を調整して下さい。
