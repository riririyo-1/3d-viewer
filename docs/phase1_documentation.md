# Phase 1: フロントエンド設計書

## プロジェクト概要

3D データを簡単に表示するための Web アプリケーションのフロントエンド実装。Phase 1 ではバックエンド通信なしで、クライアントサイド機能のみを実装する。

## 技術スタック

### フロントエンド

| 技術              | バージョン | 用途                               |
| ----------------- | ---------- | ---------------------------------- |
| **Next.js**       | 16.1.0     | React フレームワーク（App Router） |
| **React**         | 19.2.3     | UI ライブラリ                      |
| **TypeScript**    | 5.9.3      | 型安全な開発                       |
| **Tailwind CSS**  | 4.1.18     | CSS フレームワーク                 |
| **Three.js**      | 0.182.0    | 3D レンダリングエンジン            |
| **Zustand**       | 5.0.9      | 状態管理                           |
| **Lucide React**  | 0.562.0    | アイコンライブラリ                 |
| **Framer Motion** | 12.23.26   | アニメーションライブラリ           |

### 開発ツール

| 技術           | バージョン | 用途                   |
| -------------- | ---------- | ---------------------- |
| **pnpm**       | 9.x        | パッケージマネージャー |
| **Vitest**     | 4.0.16     | 単体テスト             |
| **Playwright** | 1.57.0     | E2E テスト             |
| **ESLint**     | 9.39.2     | コード品質チェック     |
| **Docker**     | -          | コンテナ化             |

### 3D レンダリング

- **Three.js**: 生の Three.js を使用
- **OBJLoader**: .obj ファイルの読み込み
- **GLTFLoader**: .glb/.gltf ファイルの読み込み
- **OrbitControls**: カメラ制御

## アーキテクチャ

### アプリケーション構造

```
3d-viewer/
├── frontend/                     # フロントエンドアプリケーション
│   ├── public/                   # 静的ファイル
│   ├── src/
│   │   ├── app/                  # Next.js App Router
│   │   │   ├── layout.tsx        # ルートレイアウト
│   │   │   ├── page.tsx          # ホーム画面（/）
│   │   │   ├── globals.css       # グローバルスタイル
│   │   │   ├── api/              # API Routes
│   │   │   │   └── models/
│   │   │   │       └── route.ts  # モデルライブラリAPI
│   │   │   ├── collection/
│   │   │   │   └── page.tsx      # コレクション画面（/collection）
│   │   │   └── viewer/
│   │   │       └── page.tsx      # ビューワー画面（/viewer）
│   │   ├── components/           # Reactコンポーネント
│   │   │   ├── ui/               # 再利用可能なUIコンポーネント
│   │   │   │   └── Button/
│   │   │   │       ├── Button.tsx
│   │   │   │       └── Button.test.tsx
│   │   │   ├── layout/           # レイアウトコンポーネント
│   │   │   │   ├── MainHeader.tsx
│   │   │   │   └── AccountButton.tsx
│   │   │   ├── three/            # 3D関連コンポーネント
│   │   │   │   └── ViewerCanvas.tsx
│   │   │   └── providers/        # Context Providers
│   │   │       └── LanguageProvider.tsx
│   │   ├── lib/                  # ユーティリティとロジック
│   │   │   ├── utils.ts          # ヘルパー関数（cn）
│   │   │   ├── store.ts          # Zustand状態管理
│   │   │   └── i18n.ts           # 国際化設定
│   │   ├── locales/              # 多言語対応
│   │   │   ├── en.json           # 英語
│   │   │   └── ja.json           # 日本語
│   │   └── types/                # TypeScript型定義
│   ├── test/                     # テスト
│   │   └── e2e/                  # E2Eテスト
│   │       ├── home.spec.ts
│   │       ├── collection.spec.ts
│   │       ├── results/          # テスト結果
│   │       └── report/           # レポート
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── vitest.config.ts          # Vitest設定
│   ├── playwright.config.ts      # Playwright設定
│   ├── tailwind.config.ts        # Tailwind設定
│   └── Dockerfile                # Docker設定
├── docs/                         # ドキュメント
│   └── phase1_documentation.md   # 本ドキュメント
├── compose.yaml                  # Docker Compose設定
└── README.md                     # プロジェクト概要
```

### 設計パターン

#### 1. App Router（Next.js 16）

- ファイルシステムベースのルーティング
- Server Components と Client Components の使い分け
- 動的ルートとクエリパラメータによる状態管理

#### 2. 状態管理（Zustand）

グローバル状態:

- `assets[]`: アップロードされた 3D アセットのリスト
- `recentAssets[]`: 最近開いたアセット（最大 8 件）
- `activeAsset`: 現在ビューワーで表示中のアセット

#### 3. コンポーネント分類

**Server Components（デフォルト）:**

- レイアウトコンポーネント
- 静的なページ構造

**Client Components（"use client"）:**

- インタラクティブな UI
- 状態を持つコンポーネント
- ブラウザ API を使用するコンポーネント

#### 4. スタイリング戦略

- **Tailwind CSS**: ユーティリティファースト
- **カスタムアニメーション**: CSS-in-JS と Tailwind の組み合わせ
- **グラデーション**: 動的な Canvas 背景（Three.js）
- **レスポンシブ**: モバイルファーストデザイン

## 機能仕様

### 1. ホーム画面（/）

**パス**: `/`
**コンポーネント**: [src/app/page.tsx](../frontend/src/app/page.tsx)

#### 機能

1. **ヒーローセクション**

   - タイトル: "Visionary Geometry"
   - サブタイトル: 多言語対応メッセージ
   - スタジオパースペクティブバッジ

2. **背景アニメーション**

   - Blob 形状のグラデーション
   - 3 つのアニメーション要素
   - CSS keyframes アニメーション

3. **機能カード**
   - **My Collection**: コレクション画面へのリンク
     - アイコン: Layers
     - ホバーエフェクト: スケール変換、回転
     - 遷移: `/collection`
   - **Cloud Node**: 今後実装予定（グレーアウト）
     - 状態: 無効化
     - 表示: "Update Pending"

#### 技術仕様

- Client Component（インタラクティブ）
- Framer Motion アニメーション
- 多言語対応（useLanguage hook）
- レスポンシブデザイン（グリッドレイアウト）

### 2. コレクション画面（/collection）

**パス**: `/collection`
**コンポーネント**: [src/app/collection/page.tsx](../frontend/src/app/collection/page.tsx)

#### 機能

1. **ファイルアップロード**

   - 対応形式: `.obj`, `.glb`, `.gltf`
   - FileReader API によるクライアントサイド読み込み
   - Zustand store への保存

2. **パブリックライブラリ**

   - `/api/models`からモデルリストを取得
   - サーバーサイドの 3D モデルをプレビュー
   - クリックでビューワーに読み込み

3. **アセット一覧表示**

   - グリッドレイアウト（レスポンシブ）
   - 各アセット:
     - プレビュー（Box アイコン）
     - ファイル名
     - アップロード日時
     - ファイルタイプバッジ
     - 削除ボタン

4. **状態管理**
   - `assets`: Zustand store で管理
   - `loading`: ローディング状態
   - `libraryModels`: パブリックモデル一覧

#### 技術仕様

- Client Component
- FileReader API
- Zustand store 統合
- Next.js Navigation（`useRouter`）
- API Routes（`/api/models`）

#### データフロー

```
User選択ファイル → FileReader → Asset作成 → Zustand store → Viewer画面
```

### 3. ビューワー画面（/viewer）

**パス**: `/viewer`
**コンポーネント**: [src/app/viewer/page.tsx](../frontend/src/app/viewer/page.tsx)

#### 機能

1. **3D キャンバス**

   - Three.js による 3D レンダリング
   - `ViewerCanvas`コンポーネントで実装

2. **コントロールパネル**

   - **WIREFRAME**: ワイヤーフレーム表示切り替え
   - **GRID**: グリッド表示切り替え
   - **SPIN**: 自動回転 ON/OFF

3. **カメラ制御**

   - OrbitControls
   - マウスドラッグで回転
   - スクロールでズーム
   - 右クリックでパン

4. **リダイレクト処理**
   - `activeAsset`が存在しない場合、`/collection`にリダイレクト

#### 技術仕様

- Client Component
- Three.js 統合
- Zustand store から`activeAsset`取得
- レスポンシブ UI

### 4. 3D ビューワー（ViewerCanvas）

**コンポーネント**: [src/components/three/ViewerCanvas.tsx](../frontend/src/components/three/ViewerCanvas.tsx)

#### レンダリング仕様

**シーン設定:**

- 背景: グラデーション（白 → グレー）
- フォグ: 距離 15〜60 でフェードアウト

**ライティング:**

1. **Ambient Light**: 0.7 強度、全方位照明
2. **Hemisphere Light**: 0.4 強度、空（白）と地面（グレー）
3. **Directional Light**: 1.0 強度、影付き
   - 位置: (5, 12, 6)
   - シャドウマップ: 2048x2048 VSM

**ペデスタル（台座）:**

- 形状: Cylinder (半径 3, 高さ 0.1)
- マテリアル: MeshStandardMaterial
  - 色: グレー
  - Roughness: 0.8
  - Metalness: 0.5
  - 透明度: 0.9（カメラ位置に応じて変化）

**グリッドヘルパー:**

- サイズ: 100x100
- 色: グレー系 2 色
- 表示/非表示切り替え可能

**カメラ:**

- タイプ: PerspectiveCamera
- FOV: 40 度
- 初期位置: (4.4, 3.5, 4.4)
- OrbitControls 有効化

**レンダラー設定:**

- アンチエイリアス: 有効
- PixelRatio: 最大 2.0
- シャドウマップ: VSM
- 色空間: SRGB
- トーンマッピング: ACESFilmic
- 露出: 1.0

#### モデル読み込み

**OBJ ファイル（.obj）:**

```typescript
OBJLoader → parse/load → handleModel → シーンに追加
```

**GLB/GLTF ファイル（.glb, .gltf）:**

```typescript
GLTFLoader → parse/load → gltf.scene → handleModel → シーンに追加
```

**正規化処理:**

1. BoundingBox 計算
2. 中心を原点に移動
3. 最大サイズを 2.8 にスケーリング
4. Y 軸を台座上に配置

**マテリアル処理:**

- OBJ ファイル: デフォルトで MeshStandardMaterial（グレー）を適用
- GLB/GLTF ファイル: 既存マテリアルを保持
- ワイヤーフレーム: 動的に切り替え可能

#### パフォーマンス最適化

- アニメーションループ: `requestAnimationFrame`
- OrbitControls damping: 0.05
- リソースクリーンアップ: unmount 時に`dispose()`

## 状態管理

### Zustand Store

**ファイル**: [src/lib/store.ts](../frontend/src/lib/store.ts)

#### インターフェース

```typescript
interface Asset {
  id: string; // UUID
  name: string; // ファイル名
  type: string; // 'obj' | 'glb' | 'gltf'
  data: string | ArrayBuffer; // ファイルデータ
  url?: string; // 外部URL（オプショナル）
  timestamp: string; // アップロード日時
}

interface AppState {
  assets: Asset[];
  recentAssets: Asset[];
  activeAsset: Asset | null;

  addAsset: (asset: Asset) => void;
  removeAsset: (id: string) => void;
  setActiveAsset: (asset: Asset | null) => void;
}
```

#### アクション

**1. addAsset(asset)**

- 新規アセットを`assets`配列の先頭に追加
- `recentAssets`を更新（最大 8 件、重複排除）
- `activeAsset`を新規アセットに設定

**2. removeAsset(id)**

- `assets`から該当 ID を削除
- `recentAssets`から該当 ID を削除
- `activeAsset`が削除対象の場合、null に設定

**3. setActiveAsset(asset)**

- `activeAsset`を更新
- 既存アセットの場合、`recentAssets`を更新

#### データ永続化

Phase 1 では実装せず。将来的に LocalStorage/SessionStorage を検討。

## 国際化（i18n）

### 実装方式

- ライブラリ不使用
- JSON ファイルベースの翻訳管理
- Context API によるロケール切り替え

### 対応言語

- 英語（en）: デフォルト
- 日本語（ja）

### ファイル構成

```
src/
├── locales/
│   ├── en.json
│   └── ja.json
├── lib/
│   └── i18n.ts
└── components/
    └── providers/
        └── LanguageProvider.tsx
```

### 使用方法

```typescript
const { t, locale, setLocale } = useLanguage();
const text = t("home.title1");
```

## スタイリング

### Tailwind CSS 設定

**バージョン**: 4.x
**設定ファイル**: `tailwind.config.ts`

#### カスタムスタイル

**グローバル CSS（globals.css）:**

```css
@import "tailwindcss";

/* Custom animations */
@keyframes blob {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-in {
  animation: fade-in 1s ease-out;
}
```

#### ユーティリティ関数

**cn 関数（classnames merge）:**

```typescript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### デザインシステム

**カラーパレット:**

- Primary: スレート系（slate-900, slate-500, slate-400）
- Accent: ブルー系（blue-100, blue-400, blue-600）
- Background: グレー系（#f3f4f6）
- Text: スレート系

**タイポグラフィ:**

- フォント: Outfit（Google Fonts）
- ウェイト: 400, 700, 900（Black）
- スタイル: 大文字（uppercase）、トラッキング調整

**間隔:**

- ボタンパディング: px-10 py-5
- カード余白: p-8, p-10
- グリッドギャップ: gap-6, gap-8, gap-10

**角丸:**

- 小: rounded-xl（12px）
- 中: rounded-3xl（24px）
- 大: rounded-[2.8rem]（44.8px）

**シャドウ:**

- 軽: shadow-sm
- 中: shadow-xl
- 重: shadow-2xl

## API 設計

### API Routes

#### GET /api/models

**ファイル**: [src/app/api/models/route.ts](../frontend/src/app/api/models/route.ts)

**レスポンス:**

```json
[
  {
    "id": "model-001",
    "name": "Sample Model",
    "category": "glb",
    "url": "/models/sample.glb",
    "thumbnailUrl": "/thumbnails/sample.png"
  }
]
```

**用途:**

- パブリックライブラリのモデルリスト取得
- Phase 1 では静的なモックデータを返す
- Phase 2 以降でバックエンド API と統合

## テスト戦略

### テストピラミッド

```
        /\
       /  \      E2E Tests (Playwright)
      /----\
     /      \    Integration Tests (Vitest + RTL)
    /--------\
   /          \  Unit Tests (Vitest)
  /------------\
```

### 1. 単体テスト（Unit Tests）

**ツール**: Vitest + React Testing Library

**テスト対象:**

- UI コンポーネント（Button, Card 等）
- ユーティリティ関数（`cn`, i18n）
- 状態管理ロジック（Zustand store）

**例: Button.test.tsx**

```typescript
describe("Button", () => {
  it("renders correctly", () => {
    /* ... */
  });
  it("handles click events", () => {
    /* ... */
  });
  it("applies variant classes", () => {
    /* ... */
  });
});
```

**実行コマンド:**

```bash
pnpm test           # Watch mode
pnpm test run       # Single run
```

**設定ファイル**: [vitest.config.ts](../frontend/vitest.config.ts)

### 2. E2E テスト（End-to-End Tests）

**ツール**: Playwright

**テスト対象:**

- ユーザーフロー（Home → Collection → Viewer）
- ページ遷移
- ファイルアップロード
- 3D モデル表示（ビジュアルリグレッション）

**テストファイル:**

- [test/e2e/home.spec.ts](../frontend/test/e2e/home.spec.ts): ホーム画面テスト
- [test/e2e/collection.spec.ts](../frontend/test/e2e/collection.spec.ts): コレクション画面テスト

**実行コマンド:**

```bash
pnpm test:e2e          # E2Eテスト実行
pnpm test:e2e --ui     # UIモード
```

**設定ファイル**: [playwright.config.ts](../frontend/playwright.config.ts)

**出力:**

- 結果: `test/e2e/results/`
- レポート: `test/e2e/report/`

### 3. ビジュアルリグレッションテスト（VRT）

**Playwright のスナップショット機能を使用:**

```typescript
await expect(page).toHaveScreenshot("viewer-page.png");
```

**用途:**

- 3D モデル描画の崩れ検知
- UI の意図しない変更検知

### テストスコープ（Phase 1）

| カテゴリ | テスト内容            | 実装状況    |
| -------- | --------------------- | ----------- |
| **Unit** | Button コンポーネント | ✅ 実装済み |
| **Unit** | ユーティリティ関数    | 未実装      |
| **Unit** | Zustand store         | 未実装      |
| **E2E**  | ホーム画面表示        | ✅ 実装済み |
| **E2E**  | コレクション画面遷移  | ✅ 実装済み |
| **E2E**  | ファイルアップロード  | 未実装      |
| **E2E**  | 3D モデル表示         | 未実装      |

## CI/CD

### GitHub Actions Workflow

**ファイル**: [.github/workflows/ci.yml](../.github/workflows/ci.yml)

#### トリガー

- `push`イベント（main ブランチ）
- `pull_request`イベント（main ブランチ）

#### ジョブ構成

**1. changes**

- パス変更検出
- `frontend/**`または`docker`ファイル変更時に後続ジョブ実行

**2. frontend-lint**

- ESLint 実行
- TypeScript 型チェック（`tsc --noEmit`）
- Node.js 20, pnpm 9 使用
- pnpm キャッシュ有効化

**3. frontend-unit-test**

- Vitest で単体テスト実行
- `pnpm test run`

**4. frontend-e2e-test**

- Playwright E2E テスト実行
- Playwright ブラウザ自動インストール
- 失敗時にレポートをアーティファクトとしてアップロード（30 日保存）

**5. build-docker**

- 前述のジョブ成功後に実行
- Docker イメージビルド
- プッシュなし（検証のみ）

#### キャッシュ戦略

- pnpm store をキャッシュ
- キー: `${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}`

#### 並列実行

- lint, unit-test, e2e-test は並列実行
- build-docker は lint, unit-test 成功後に実行

## Docker 環境

### マルチステージビルド

**ファイル**: [frontend/Dockerfile](../frontend/Dockerfile)

#### ステージ構成

**1. base**

- ベースイメージ: `node:20-alpine`

**2. deps**

- `libc6-compat`インストール
- pnpm グローバルインストール
- 依存関係インストール（`pnpm install --frozen-lockfile`）

**3. builder**

- アプリケーションビルド（`pnpm build`）
- Next.js standalone 出力

**4. runner（本番環境）**

- 非 root ユーザー（nextjs:1001）で実行
- standalone 出力をコピー
- ポート 3000 公開

#### 実行方法

**開発環境:**

```bash
cd frontend
pnpm install
pnpm dev
```

**Docker 環境:**

```bash
docker compose up --build
```

**アクセス:**

```
http://localhost:3000
```




## 付録

### 用語集

| 用語                 | 説明                                                        |
| -------------------- | ----------------------------------------------------------- |
| **App Router**       | Next.js 13+の新しいルーティングシステム                     |
| **Server Component** | サーバーサイドでレンダリングされる React コンポーネント     |
| **Client Component** | クライアントサイドでレンダリングされる React コンポーネント |
| **Zustand**          | 軽量な状態管理ライブラリ                                    |
| **OrbitControls**    | Three.js のカメラ制御ライブラリ                             |
| **PBR**              | Physical Based Rendering（物理ベースレンダリング）          |
| **Standalone**       | Next.js の出力モード（Docker 最適化）                       |
| **VRT**              | Visual Regression Testing（ビジュアルリグレッションテスト） |
