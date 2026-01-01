## 開発ガイドライン

### コーディング規約

#### TypeScript

- **any 型禁止**: すべて型定義必須
- **strict モード有効**: `tsconfig.json`で設定
- **型推論優先**: 明示的な型定義は必要最小限

#### React

- **Client Component**: インタラクティブな機能は`"use client"`
- **Server Component**: デフォルトで Server Component
- **hooks**: カスタム hooks は`use`プレフィックス

#### スタイリング

- **Tailwind 優先**: インラインスタイル禁止
- **cn 関数使用**: 条件付きクラス名は`cn()`
- **レスポンシブ**: モバイルファーストデザイン

### Git 運用

**ブランチ戦略:**

- `main`: 本番相当
- `phase1/frontend`: Phase 1 開発ブランチ

**コミットメッセージ:**

```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: スタイル変更
refactor: リファクタリング
test: テスト追加・修正
chore: ビルド・設定変更
```
