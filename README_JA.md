# kensaku

[English version](./README.md)

GitHub Actions の `uses:` を走査して、タグ指定を SHA pin へ変換する候補を表示・適用する CLI です。

## インストール

```bash
npm install -g kensaku
```

## 使い方

```bash
kensaku check
kensaku fix
```

既定ではカレントディレクトリ配下の `.github/workflows/**/*.yml` / `.yaml` を対象にします。

```bash
kensaku check --path ".github/workflows/release.yml"
kensaku fix --path ".github/workflows/*.yml"
```

ローカル開発では以下を使います。

```bash
npm run build
node ./dist/cli.js check
```

## 挙動

- `actions/checkout@v4` のような `owner/repo@ref` を検出
- `docker://...` と `./...` は無視
- `@sha # v4` のようにコメントで元の ref が残っていれば、その ref を基準に更新
- `--major-only` が既定で有効。`v4` のようなメジャータグのみ自動更新対象

## 認証

GitHub API の解決には `GITHUB_TOKEN` か `GH_TOKEN` が使えます。未設定でも試行しますが、レート制限にかかりやすくなります。

## npm publish

```bash
npm run build
npm test
npm publish --access public
```

公開前に `package.json` の `name` と `version` を調整して下さい。
