# クイックスタートガイド - ローカルテスト用

このガイドでは、Supabaseのセットアップなしでローカル環境でアプリをテストする方法を説明します。

## 前提条件

- Node.js (v16以上)
- npm または yarn
- iOS Simulator または Android Studio（オプション）

## 1. 依存関係のインストール

```bash
cd news-tohyo-app
npm install
```

## 2. 環境変数の設定（テスト用）

```bash
cp .env.example .env
```

`.env`ファイルをテスト用に編集：
```env
# テスト用のダミー値（実際には動作しませんが、アプリの起動は可能）
EXPO_PUBLIC_SUPABASE_URL=https://dummy.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=dummy_key
EXPO_PUBLIC_APP_ENV=development
```

## 3. アプリの起動

```bash
npm start
```

## 4. テスト方法

### Web版でのテスト（推奨）
```bash
# ブラウザで表示
npm run web
```

### iOS Simulatorでのテスト
```bash
# iOS Simulatorが必要
npm run ios
```

### Android Emulatorでのテスト
```bash
# Android Studioが必要
npm run android
```

### 実機でのテスト
1. `npm start` 実行後に表示されるQRコードをスキャン
2. Expo Goアプリ（App Store/Google Playから無料ダウンロード）で開く

## 注意事項

- **Supabase未設定の場合**: 認証やデータ取得は動作しませんが、UIの確認は可能です
- **エラーについて**: ネットワーク関連のエラーは正常です（バックエンド未接続のため）
- **画面確認**: ログイン画面、レイアウト、ナビゲーション構造の確認が可能です

## 次のステップ

UIの確認が完了したら：

1. [SUPABASE_SETUP-JP.md](./SUPABASE_SETUP-JP.md) に従ってSupabaseをセットアップ
2. 実際の認証・投票機能をテスト
3. 管理者機能の動作確認

## よくある問題

**Q: `npm start`でエラーが発生する**
A: Node.jsのバージョンを確認し、`npm install`を再実行してください

**Q: Expoアプリが見つからない**
A: App Store/Google Playで「Expo Go」を検索してインストールしてください

**Q: シミュレータが起動しない**
A: Xcode（iOS）またはAndroid Studio（Android）が正しくインストールされているか確認してください