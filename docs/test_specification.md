# テスト仕様書 (Test Specification)

## 1. テスト環境・使用ツール

本プロジェクトの品質保証および検証に使用している技術スタックとツールは以下の通りです。

| カテゴリ | ツール / ライブラリ | 用途 |
| --- | --- | --- |
| **Backend Unit/E2E** | **Jest** | バックエンドの単体テスト、および API エンドポイントの E2E テスト (`supertest`) |
| **Frontend Unit** | **Vitest** (or Jest) | フロントエンドコンポーネント・ロジックの単体テスト |
| **Frontend E2E** | **Playwright** | 実際のブラウザを使用したフロントエンド統合・E2E テスト |
| **Integration** | **Docker Compose** | フルスタック（DB, Redis, MinIO, Backend, Frontend）の一括起動と疎通確認 |
| **CI/CD** | **GitHub Actions** | 自動テスト実行、リント、ビルド、条件付き実行制御 (`paths-filter`) |
| **Linter/Formatter** | **ESLint** / **Prettier** | コード品質とフォーマットの統一 |

---

## 2. テスト仕様概要

### 2.1 単体テスト (Unit Test)
- **対象**: Servie クラス、Utility 関数、UI コンポーネント
- **目的**: 個々の機能が仕様通りに動作し、エッジケース（例外、空データ等）を適切に処理できるか検証する。

### 2.2 E2E テスト (Backend)
- **対象**: NestJS API エンドポイント
- **目的**: データベースを含めた状態で、API リクエストに対して正しいレスポンス（ステータスコード、データ構造）が返却されるか検証する。Google OAuth などの認証フローも含む。

### 2.3 E2E テスト (Frontend)
- **対象**: Next.js アプリケーション
- **目的**: ユーザー操作（クリック、遷移、入力）に対する画面の挙動が正しいか検証する。バックエンドとの連携も含む。

### 2.4 統合・システムテスト (Integration Test)
- **対象**: コンテナ群 (docker compose)
- **目的**: 全サービスが競合なく起動し、`healthcheck` を通過して正常（Healthy）な状態になることを保証する。特に環境変数の注入やネットワーク接続を確認する。

---

## 3. 検証チェックリスト (Phase 2 Backend & CI)

### 3.1 認証機能 (Authentication - Google OAuth)

| 項目 (Item) | 検証内容 (Description / Criteria) | 結果 |
| --- | --- | :---: |
| **Google Login Redirect** | ログインボタン押下時、Google の OAuth 認証画面へ正しくリダイレクトされること。 | ✅ |
| **Callback Processing** | Google からのコールバック (`/auth/google/callback`) をバックエンドが正しく処理できること。 | ✅ |
| **User Resolution** | 新規ユーザー作成、または既存ユーザーの特定が正しく行われること。 | ✅ |
| **Session/Token** | 認証成功後、正しいセッションまたは JWT が発行されること。 | ✅ |
| **Environment Config** | 開発環境および CI 環境において、Google 認証情報の環境変数が正しく設定・注入されていること。 | ✅ |

### 3.2 CI/CD パイプライン (GitHub Actions)

| カテゴリ | 項目 | 検証内容 | 結果 |
| --- | --- | --- | :---: |
| **ワークフロー制御** | **Push Trigger** | `main` ブランチへのプッシュ時にワークフローが自動実行されること。 | ✅ |
| | **Manual Trigger** | GitHub Actions UI の `workflow_dispatch` ボタンから手動で全ジョブを実行できること。 | ✅ |
| | **Change Detection** | ファイル変更があったディレクトリのみに関連するジョブが実行されること（最適化）。 | ✅ |
| **ジョブ実行** | **Linting** | `frontend-lint`, `backend-lint`, `pipeline-lint` が警告なく通過すること。 | ✅ |
| | **Unit Tests** | 全ての単体テスト (`frontend`, `backend`, `pipeline`) が通過すること。 | ✅ |
| | **Frontend E2E** | Playwright テストが CI 上で通過すること（バックエンド起動を含む）。 | ✅ |
| | **Backend E2E** | NestJS E2E テストが CI 上で通過すること。 | ✅ |

### 3.3 コンテナ統合 (Integration & Docker)

| 項目 | 検証内容 | 結果 |
| --- | --- | :---: |
| **Integration Test Startup** | CI 上で `docker compose up` がエラーなく完了すること。 | ✅ |
| **Service Health Checks** | DB, Redis, MinIO, Server, Frontend, Pipeline 全てが 60秒以内に `healthy` ステータスになること。 | ✅ |
| **Env Injection: Server** | `server/.env` が CI ステップで正しく生成されていること。 | ✅ |
| **Env Injection: Compose** | `docker compose` 実行時に `MINIO_ACCESS_KEY` 等の変数が置換されていること。 | ✅ |
| **Docker Builds** | Frontend, Server, Pipeline の Docker イメージビルドが成功すること。 | ✅ |
| **Optimization** | `pipeline` のビルドコンテキストから不要ファイル（`__pycache__` 等）が除外されていること。 | ✅ |
