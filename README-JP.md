# ニュース投票アプリ

React Native と Supabase を使用して構築されたゲーミフィケーション型モバイルニュース投票アプリです。ユーザーはニュース記事に投票し、ポイントを獲得してランキングで競うことができます。

## 機能

- **記事投票**: ニュース記事に対する2択投票
- **ポイントシステム**: 1投票につき1ポイント獲得
- **リアルタイムオッズ**: 投票率に基づく動的オッズ計算
- **ユーザーランキング**: 獲得ポイント順のリーダーボード
- **ユーザープロフィール**: 統計情報付きカスタマイズ可能プロフィール
- **管理ダッシュボード**: 記事の作成・管理（管理者のみ）
- **認証システム**: Supabase Auth によるメール・パスワード認証
- **クロスプラットフォーム**: 単一コードベースによるiOS・Android対応

## 技術スタック

- **フロントエンド**: React Native with Expo
- **バックエンド**: Supabase (PostgreSQL + Edge Functions)
- **認証**: Supabase Auth
- **ストレージ**: Supabase Storage
- **UIコンポーネント**: React Native Paper
- **ナビゲーション**: React Navigation v6
- **TypeScript**: 完全TypeScriptサポート

## 必要環境

- Node.js (v16以上)
- npm または yarn
- Expo CLI
- Supabaseアカウント
- iOS Simulator（iOS開発用）またはAndroid Studio（Android開発用）

## インストール手順

### 1. プロジェクトのセットアップ
```bash
cd news-tohyo-app
npm install
```

### 2. Supabaseの設定
- [SUPABASE_SETUP-JP.md](./SUPABASE_SETUP-JP.md) の詳細手順に従ってください
- Supabaseプロジェクトとデータベースを作成
- Edge Functionsをデプロイ
- 環境変数を設定

### 3. 環境設定
```bash
cp .env.example .env
```

`.env`ファイルにSupabaseの認証情報を入力：
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 開発サーバーの起動
```bash
npm start
```

### 5. デバイス・シミュレータでの実行
- iOSシミュレータの場合は `i` キーを押す
- Androidエミュレータの場合は `a` キーを押す
- 実機の場合はExpo Goアプリで QRコード をスキャン

## プロジェクト構成

```
news-tohyo-app/
├── components/          # 再利用可能UIコンポーネント
├── contexts/           # Reactコンテキスト（認証など）
├── lib/               # ユーティリティ関数と設定
├── navigation/        # アプリナビゲーション設定
├── screens/           # 画面コンポーネント
├── supabase/          # データベーススキーマとEdge Functions
│   ├── functions/     # Supabase Edge Functions
│   ├── schema.sql     # データベーススキーマ
│   └── rls-policies.sql # Row Level Security ポリシー
├── App.tsx            # ルートコンポーネント
└── package.json       # 依存関係とスクリプト
```

## 主要機能の実装

### 認証システム
- メール・パスワードでの新規登録・ログイン
- パスワードリセット機能
- Supabase Auth によるセッション管理
- ユーザープロフィール作成

### 投票システム
- 重複投票防止
- SQLトリガーによるリアルタイムオッズ計算
- 自動ユーザーポイント更新を伴うポイントシステム
- 投票履歴追跡

### 管理者機能
- 記事の作成・管理
- ステータス制御（下書き・公開）
- 記事削除
- 統計ダッシュボード

### セキュリティ
- Row-Level Security (RLS) ポリシー
- ユーザーデータの分離
- 管理者専用エンドポイント
- HTTPS/TLS暗号化

## データベーススキーマ

アプリは以下の主要テーブルを使用します：
- `users`: ユーザープロフィールとポイント
- `articles`: 投票オプション付きニュース記事
- `votes`: ユーザー投票（一意制約付き）
- `comments`: コメントシステム（将来機能）
- `user_points`: ポイント取引履歴

## APIエンドポイント

### Edge Functions
- `POST /functions/v1/vote`: 投票送信
- `GET /functions/v1/articles`: ページネーション付き記事取得
- `GET /functions/v1/rankings`: ユーザーランキング取得

## 開発

### テスト実行
```bash
npm test
```

### コード整形
```bash
npm run lint:fix
```

### 型チェック
```bash
npm run type-check
```

### プロダクションビルド
```bash
# iOS
npm run build:ios

# Android
npm run build:android

# 両プラットフォーム
npm run build:all
```

## デプロイメント

### 1. EAS Buildの設定
```bash
expo install --fix
eas build:configure
```

### 2. App Store用ビルド
```bash
npm run build:all
```

### 3. App Storeへの申請
```bash
npm run submit:ios      # iOS App Store
npm run submit:android  # Google Play Store
```

## 運用・管理

### 管理者アカウントの作成
1. 通常ユーザーとして登録
2. Supabaseダッシュボードで以下のSQLを実行：
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your-admin-email@example.com';
```

### 記事の管理
- 管理者としてログイン
- 管理タブから記事の作成・編集・削除が可能
- 下書き・公開ステータスの切り替え

### ユーザー管理
- Supabaseダッシュボードから直接ユーザー情報を確認可能
- ポイントの手動調整が必要な場合はSQLで操作

## トラブルシューティング

### よくある問題

**Q: アプリが起動しない**
A: 以下を確認してください：
- Node.jsのバージョン（v16以上）
- 環境変数の設定
- Supabaseプロジェクトの状態

**Q: 投票ができない**
A: 以下を確認してください：
- ユーザーがログイン済みか
- 記事が公開状態か
- すでに投票していないか

**Q: ランキングが表示されない**
A: データベースにユーザーと投票データが存在するか確認してください

## 仕様書準拠項目

本実装は元の日本語仕様書に準拠しています：
- ✅ 2択投票システム
- ✅ ポイントシステム（1票=1pt）
- ✅ リアルタイムオッズ計算
- ✅ ユーザーランキング
- ✅ 管理ダッシュボード
- ✅ メール・パスワード認証
- ✅ iOS・Android クロスプラットフォーム対応
- ✅ Row-Level Security
- ✅ Supabase バックエンド統合

## バージョン履歴

- **v1.0.0**: 初回リリース（コア投票機能付き）
  - 基本投票システム
  - ユーザー認証
  - ランキングシステム
  - 管理ダッシュボード

## ライセンス

このプロジェクトはMITライセンスの下でライセンスされています。

## サポート

質問やサポートについては、GitHubリポジトリでIssueを作成してください。

## 貢献

1. リポジトリをフォーク
2. フィーチャーブランチを作成
3. 変更を実施
4. 新機能のテストを追加
5. プルリクエストを提出