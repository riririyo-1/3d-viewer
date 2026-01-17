# リファクタリング計画書

## 1. 概要
本ドキュメントは、現在のプロジェクト（Frontend: Next.js, Server: NestJS, Pipeline: FastAPI）の構成を分析し、ユーザー定義のルールおよびベストプラクティスに基づいたリファクタリング計画をまとめたものです。

## 2. 現状分析結果

### 2.1 API関連・構成
- **構成**: Frontend <-> Server (NestJS) <-> Pipeline (FastAPI) という構成になっています。
- **FastAPIのルーティング**:
  - 現在 `/conversion`, `/health` などのルートで提供されています。
  - **判定**: `/api/xxx` というプレフィックスがなくても、Backend (NestJS) からの内部呼び出しが主であれば **問題ありません**。ただし、将来的に外部公開やFrontendからの直接アクセスが発生する場合は、`/api/v1` 等のバージョニングを含むプレフィックスの導入を推奨します。
- **整合性**: OpenAPI (Swagger) が Server 側は `@nestjs/swagger` で整備されています。Pipeline 側も FastAPI の自動ドキュメント (`/docs`) が機能しています。

### 2.2 ディレクトリ構成・クリーンアーキテクチャ
- **Server (NestJS)**:
  - `modules` (assets, auth, conversion...) によるモジュール分割が行われており、標準的な NestJS の構成です。
  - `Controller` -> `Service` の階層は守られていますが、厳密なクリーンアーキテクチャ（ドメイン層の分離）までは踏み込んでいない箇所も見受けられます。現状の規模では十分ですが、ビジネスロジックが複雑化する `assets` 等はドメイン層を意識した分離（Repositoryパターンの適用など）を検討しても良いでしょう。
- **Pipeline (FastAPI)**:
  - `presentation`, `application` (usecases), `infrastructure` というディレクトリ構成になっており、**クリーンアーキテクチャの構造に従っています**。これは非常に良い状態です。
- **Frontend (Next.js)**:
  - `src/app` (App Router) を利用しており、モダンな構成です。
  - `components`, `lib`, `hooks` と適切に整理されています。

### 2.3 ハードコーディングのチェック
以下の箇所で修正すべきハードコーディングや環境変数の直接記述が見つかりました。

- **Frontend**:
  - `src/lib/api.ts`: デフォルト値として `"http://localhost:4000"` がハードコードされています。
- **Pipeline**:
  - `src/config/settings.py`: MinIO のクレデンシャル (`minioadmin`) がデフォルト値としてコード内に存在します。
- **Docker Compose**:
  - `compose.yaml`:
    - `POSTGRES_USER`, `POSTGRES_PASSWORD` が平文で記述されています。
    - `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD` が平文で記述されています（一部変数はあるが、直接記述も見られる）。

### 2.4 過剰な設定・設計 / モダンなツール
- **過剰性**:
  - 現状のマイクロサービス構成（Node + Python）は、3D処理（Pythonが得意）とAPI/Auth（Nodeが得意）の責務分離として合理的です。過剰ではありません。
- **Python環境**:
  - ルールに「uvを利用」とありますが、`pipeline` ディレクトリには `pyproject.toml` がなく `requirements.txt` のみです。
  - **改善点**: `uv init` を行い、依存関係を `pyproject.toml` で管理する形へ移行すべきです。

### 2.5 環境変数・セキュリティ
- `.env` ファイルによる管理は行われていますが、`compose.yaml` 内での直接記述のリスクがあります。
- GitHub Secrets 利用に関してはリポジトリ設定によりますが、コードベース上は `.gitignore` に `.env` が含まれているため、最低限の流出防止はなされています。

### 2.6 テスト駆動開発 (TDD)
- **Server**: `.spec.ts` が生成されており、Jestによるテストが可能です。
- **Pipeline**: `tests` ディレクトリがあり、構造化されています。
- **Frontend**: `test` ディレクトリと `vitest` の設定があり、TDD可能な状態です。

---

## 3. リファクタリング・アクションプラン

優先度順に記載します。

### Phase 1: セキュリティと環境設定の修正 (優先度：高)
1.  **Docker Composeの秘匿情報排除**:
    - `compose.yaml` 内のパスワード類を全て環境変数 (`${VAR_NAME}`) に置き換える。
    - `.env.example` を更新し、必要な変数を網羅する。
2.  **Pipelineのハードコード修正**:
    - `src/config/settings.py` のデフォルト値を削除し、環境変数が未設定の場合はエラーにするか、安全な空値を設定する（本番での事故防止）。
3.  **FrontendのAPI URL修正**:
    - 環境変数 `NEXT_PUBLIC_API_URL` を必須とし、ハードコードされた `localhost` フォールバックを見直す。

### Phase 2: Python環境のモダン化 (優先度：中)
1.  **uv への移行**:
    - `pipeline` ディレクトリで `uv init` を実行。
    - `requirements.txt` の内容を `uv add` で追加し、`pyproject.toml` 管理へ移行。
    - `Dockerfile` を `uv` を使用したインストール手順に書き換え。

### Phase 3: アーキテクチャの洗練 (優先度：低〜中)
1.  **Server (NestJS) の Repository パターン導入（任意）**:
    - データベース操作を Service から切り離し、テスト容易性を向上させる。
2.  **API Versioning**:
    - 将来的な拡張に備え、Server/Pipeline 共にURL設計を見直す（必要であれば）。現状は内部通信メインのため急務ではない。

## 4. ディレクトリ構成案（理想形）

```text
root/
├── .env                # 全体の環境変数（git管理外）
├── compose.yaml        # サービス定義（環境変数を参照）
├── frontend/           # Next.js (App Router)
│   ├── src/app/
│   ├── src/components/
│   └── vitest.config.ts
├── server/             # NestJS
│   ├── src/modules/    # モジュール (Domain/Infra分離)
│   └── test/
└── pipeline/           # Python (FastAPI)
    ├── pyproject.toml  # uv管理 (New!)
    ├── src/
    │   ├── presentation/
    │   ├── application/
    │   └── infrastructure/
    └── tests/
```

この計画に基づき、順次リファクタリングを進めることを推奨します。
