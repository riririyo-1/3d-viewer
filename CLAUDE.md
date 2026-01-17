## チャット・アシスト・エージェント

- 日本語で
- 丁寧語で

## ドキュメント作成ルール

- README.md は{project root}に配置
- その他のドキュメントの保存先は、{project root}/docs 配下に作成
- 語尾は断定形で記載

## コーディングルール

- ハードコーディングは絶対に禁止
- クリーンで読みやすいコードを書く
- 常にベストプラクティスを意識すること
- 関数全体を示すようなタイトルコメントは、関数の上に、1 行で簡潔に記載する
- 関数やブロック毎のタイトルコメントは、その前に "# -- コメント --------------"のように可読性高く記載
- 行ごとのコメントは、インデントを揃え、コードの右側に端的に記載する
- 関数同士は 2 行空けること
- 環境変数は`.env`で管理
- 新規ツールは出来る限りmac:brew, win:winget で入れること

## python
- brew or winget/pyenv を利用
- 3.12 を利用
- uv を利用

## Next.js 開発ルール
- App Router を使用
- TypeScript 必須
- pnpm をパッケージマネージャーとして使用
- `frontend/src/app`にページ、`frontend/src/components`にコンポーネント配置
- Server Components と Client Components を適切に使い分け
- any 型は禁止
- 推奨ツール
  - Next.js (React フレームワーク)
  - TypeScript (JavaScript のスーパーセット)
  - Tailwind CSS (ユーティリティファースト CSS フレームワーク)
  - shadcn/ui (Radix UI ベースの UI コンポーネントライブラリ)
  - framer-motion (React アニメーションライブラリ)
  - next-themes (Next.js 用のテーマ切り替えライブラリ)
  - i18n 対応（ライブラリではなく、local/en.json, ja.json ファイルで管理）

## Amplify Gen 2 実装ルール

- `amplify/backend.ts`でリソース定義
- TypeScript でバックエンド設定
- defineBackend() でリソース組み立て
- 環境毎の設定は amplify/environments/ で管理
- npx amplify sandbox でローカル開発

## IaC ルール

- Terraform を使用
- モジュール化を徹底
- app, infra ディレクトリでコード分離

## CI/CD ルール

- GitHub Actions を使用
- 1 つの workflow で完結させ、JOB で分割

## セキュリティルール

- git に機密情報を含めない
- AWS 認証情報をコードに含めない
- 環境変数で機密情報管理（.env、GitHub Secrets）
- 入力値検証必須（zod 等のスキーマバリデーション）
- Amplify Auth での認証状態管理

## WSL ファイルパス変換ルール

Windows パスを ubuntu のマウントディレクトリパスに変換：
`C:\Users\user1\Pictures\image.jpg` → `/mnt/c/user1/Pictures/image.jpg`
