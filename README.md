# studio-view

**フロントエンド**

![Next.js](https://img.shields.io/badge/Next.js-16.1.0-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.18-38B2AC?style=flat&logo=tailwind-css)
![Three.js](https://img.shields.io/badge/Three.js-0.182.0-black?style=flat&logo=three.js)

**バックエンド**

![NestJS](https://img.shields.io/badge/NestJS-11.1.11-E0234E?style=flat&logo=nestjs)
![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748?style=flat&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat&logo=redis)

**パイプライン**

![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat&logo=python)

**全体**

![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker)
![pnpm](https://img.shields.io/badge/pnpm-10.27-F69220?style=flat&logo=pnpm)

## 概要

3D データを簡単に表示するための Web アプリ。

![画面イメージ1](./images/image.png)
![画面イメージ2](./images/image-1.png)

## 機能（今回 対象外含む）

### google ログイン機能

- Google アカウントでログインする。

### ファイルアップロード

- 3D データファイルをアップロードできるようにする。
- 1 アカウントあたり、XX GB までアップロード可能なバケットという単位を作る。
- アップロードできるファイル形式
  - obj ファイル
  - glb ファイル
- プランに応じて、アップロード可能な容量が制限される。

### 高効率フォーマット変換 (OBJ to GLB)

- マルチファイル統合: OBJ（形状）、MTL（定義）、テクスチャ画像（外見）を 1 つのバイナリファイル（.glb）に集約する。
- PBR マテリアル変換: 従来の Phong/Lambert モデル（MTL）を、現代の Web 描画（WebGL/Three.js 等）に適した PBR（物理ベースレンダリング）パラメータに自動変換する。

- アセットの埋め込み: テクスチャ画像は Base64 形式、またはバイナリバッファとして GLB 内部に格納する。

### 座標データの高精度圧縮（軽量化）

- 浮動小数点精度の最適化: 頂点座標（x, y, z）および法線ベクトルの小数点以下を指定した桁数（例：5 桁）で丸める。
- 冗長データの削除: 変換時に重複する頂点データをマージ（ウェルド）し、インデックス化することでデータ量を削減する。
- バイナリパッキング: 丸めた数値を適切なデータ型（float32 等）でパッキングし、ファイルサイズを最小化する。

### ビューア

- 3D オブジェクト ライブラリ
  - 自動サムネイル生成: アップロード時、特定の角度からスナップショットを撮り、ライブラリ一覧用のプレビュー画像を自動生成する。
- 3D オブジェクト ビューア
- 共有リンク生成: 特定のモデルだけを外部の人に見せられる一時的な URL を発行（パスワード保護機能付き）。

## 開発環境

### コーディング環境

- **OS:** Ubuntu 22.04
- **Editor:** VS Code / Google Antigravity IDE

### LLM 活用・開発フロー

自然言語中心の開発スタイルを採用。

- **Coding:** Claude Code / GitHub Copilot / Gemini

## 技術スタック詳細

詳細は [技術スタック完全ガイド](./docs/tech_stack.md) を参照

### フロントエンド技術

- **フレームワーク**: Next.js 16.1.0 (App Router)
- **UI ライブラリ**: React 19.2.3
- **言語**: TypeScript 5.9.3
- **スタイリング**: Tailwind CSS 4.1.18
- **3D レンダリング**: Three.js 0.182.0
- **状態管理**: Zustand 5.0.9
- **HTTP クライアント**: Axios 1.13.2

### バックエンド技術

- **フレームワーク**: NestJS 11.1.11
- **ORM**: Prisma 5.22.0
- **データベース**: PostgreSQL 16
- **認証**: JWT + Passport.js
- **ジョブキュー**: BullMQ 5.66.4 + Redis 7
- **ストレージ**: MinIO (S3 互換)

### 変換パイプライン技術

- **言語**: Python 3.12
- **フレームワーク**: FastAPI 0.115
- **変換ツール**: obj2gltf

### インフラ技術

- **コンテナ化**: Docker + Docker Compose
- **パッケージマネージャー**: pnpm 10.27

## 開発手順

それぞれのフェーズでは、要件に基づくテスト主体で作成する。
これにより、AI に対して「このテストを通るようなコードを書け」という明確なゴール（プロンプト）が提示できるようになる。

- 要件定義
- テストケース定義
- テスト・テストデータ実装
- 実装
- テスト
- リリース

下記の大きなフェーズに分けて、段階を踏んで実現する。

1. フロントエンド作成
2. バックエンド作成（ローカル立ち上げ版）
3. GCP インフラ作成（terraform）
   1. ログイン機能
   2. バケット作成
4. フロントエンド作成
   1. アップロード機能
   2. ファイル一覧機能
5. 高効率フォーマット変換機能
6. 座標データの高精度圧縮機能
7. 自動サムネイル生成機能
8. 共有リンク生成機能
9. 課金機能
   1. プラン作成
   2. プランごとにアップロード容量制限設定
   3. プランごとにアップロード可能ファイル数制限設定
   4. プランごとにアップロード可能ファイル種別制限設定
