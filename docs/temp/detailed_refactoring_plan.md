# 詳細リファクタリング計画書

本ドキュメントは、ハードコーディングの廃止、`uv` への移行、そしてクリーンアーキテクチャ（特に DTO の厳格な運用）に焦点を当てた詳細なリファクタリング計画です。

## 1. ハードコーディングの廃止と環境変数管理

### 1.1 現状の問題点と修正対象
以下のハードコーディングされた値を `.env` に移動し、コードからは環境変数を参照するように修正します。

| 対象コンポーネント | ファイルパス | 修正箇所 | 対応する環境変数名（案） |
| :--- | :--- | :--- | :--- |
| **Frontend** | `src/lib/api.ts` | `"http://localhost:4000"` | `NEXT_PUBLIC_API_URL` |
| **Server** | `compose.yaml` | `POSTGRES_PASSWORD=password` | `POSTGRES_PASSWORD` |
| **Server** | `compose.yaml` | `MINIO_ROOT_PASSWORD` (他各種) | `MINIO_ROOT_PASSWORD` 等 |
| **Pipeline** | `src/config/settings.py` | `minioadmin` (User/Pass) | `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` |
| **Pipeline** | `src/config/settings.py` | `"localhost"` (MinIO Endpoint) | `MINIO_ENDPOINT` |

### 1.2 アクションプラン
1.  **`.env` の整理**: ルートディレクトリの `.env` をマスターとし、全サービスから参照する（Docker Compose経由）。
2.  **`compose.yaml` の修正**: 直接記述を削除し、`${ENV_VAR}` 形式に変更。
3.  **Secrets のドキュメント化**: `README.md` に「GitHub Actions Secrets 設定項目」セクションを追加。
    - 登録すべき Secret: `POSTGRES_PASSWORD`, `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `DATABASE_URL` 等。

## 2. Python (Pipeline) の `uv` 移行

### 2.1 現状
- `pipeline` ディレクトリに `requirements.txt` が存在。`pyproject.toml` は未作成。

### 2.2 アクションプラン
1.  **初期化**: `pipeline` ディレクトリで `uv init` を実行。
2.  **依存関係の移行**: `requirements.txt` から `uv add <package>` で `pyproject.toml` に移行。
3.  **Dockerfile の更新**: `pip install` ではなく `uv` を使用したインストール手順に変更（マルチステージビルド推奨）。

```dockerfile
# Dockerfile 更新イメージ
FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen
COPY src ./src
CMD ["uv", "run", "uvicorn", "src.main:app", "--host", "0.0.0.0"]
```

## 3. Server (NestJS) クリーンアーキテクチャとDTOの徹底

### 3.1 DTO 設計指針
ユーザー定義ルールに基づき、以下のレイヤーごとのDTO運用を徹底します。

| レイヤー | 役割 | DTO名称規則 | 具体例 | メモ |
| :--- | :--- | :--- | :--- | :--- |
| **Interface Adapter** | Controller | `RequestDTO` / `ResponseDTO` | `CreateAssetRequestDto`, `AssetResponseDto` | クライアントとの通信用。バリデーション付与。 |
| **Use Case** | Service | `InputDTO` / `OutputDTO` | `CreateAssetInputDto`, `CreateAssetOutputDto` | ビジネスロジックの入出力。Entityを隠蔽する。 |
| **Entity** | Prisma/Domain | **使用禁止** | - | DTOの混入禁止。純粋なデータ構造/ORMモデルのみ。 |

### 3.2 現状の改善点 (Assets Moduleの例)
現状の `AssetsService` は `AssetResponseDto` (Web層のDTO) を返却しており、レイヤー間の結合度が少し高くなっています。

#### 変更前 (Current)
- `Controller`: `create(...)` -> `service.create(...)` -> returns `AssetResponseDto`
- `Service`: `create(userId, file)` -> returns `AssetResponseDto`

#### 変更後 (Proposed)
1.  **Controller (Interface Adapter)**
    - 受け取ったリクエストを `CreateAssetInputDto` に変換して Service に渡す。
    - Service から返ってきた `CreateAssetOutputDto` を `AssetResponseDto` に変換して返す。
2.  **Service (Use Case)**
    - 引数は `CreateAssetInputDto` (または個別の引数だが、戻り値はDTO)。
    - 戻り値は `CreateAssetOutputDto`。これは純粋なPOJOであり、`@ApiProperty` などのSwagger装飾を含まない（含まれていても良いが、依存関係的には切り離すのが理想）。
    - **Entity (Prisma Model)** は Service 内部でのみ扱い、外には出さない。

### 3.3 リファクタリング手順
1.  **DTO定義**:
    - `src/modules/assets/dto/input/create-asset.input.dto.ts`
    - `src/modules/assets/dto/output/create-asset.output.dto.ts`
2.  **Service修正**:
    - 戻り値を `Promise<AssetResponseDto>` から `Promise<CreateAssetOutputDto>` に変更。
3.  **Controller修正**:
    - Mapperを実装（または専用のMapperクラスを作成）し、OutputDTO -> ResponseDTO の変換を行う。

## 4. 全体スケジュール

1.  **設定周り (Hardcoding / Env)** [優先度: 高]
    - `compose.yaml` 修正 & `.env` 整備
    - `README.md` 更新
2.  **基盤周り (uv)** [優先度: 中]
    - Pipeline の `uv` 移行 & Dockerfile 更新
3.  **コード周り (NestJS DTO)** [優先度: 低〜中]
    - Assets モジュールから試験的に適用
    - 他モジュールへ展開

---

## 5. 検証計画

### 5.1 環境変数・起動確認
- `.env` のみを設定した状態で `docker compose up --build` が正常に成功すること。
- Pipeline / Server が起動し、相互通信できること。

### 5.2 依存関係 (uv)
- Pipeline コンテナ内で `uv sync` が走っていること。
- APIエンドポイント (`/docs`) が正常に表示されること。

### 5.3 アーキテクチャ (DTO)
- `npm run test` (Unit Test) が通ること。Service の戻り値の型変更に伴い、テストコードの修正が必要になるため、それをパスさせる。
- `npm run test:e2e` が通ること（APIのインターフェースが変わっていないことの確認）。
