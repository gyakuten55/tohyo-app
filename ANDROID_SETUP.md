# Android開発環境セットアップガイド

このガイドでは、news-tohyo-appをAndroidで開発・実行するための環境構築手順を説明します。

## 📋 必要なもの

- macOS (あなたの環境: Darwin 24.5.0)
- Android Studio
- Node.js (インストール済み)
- Expo CLI (インストール済み)

## 🚀 セットアップ手順

### 1. Android Studioのインストール

1. [Android Studio公式サイト](https://developer.android.com/studio)からダウンロード
2. ダウンロードしたDMGファイルを開き、Android Studioをアプリケーションフォルダにドラッグ
3. Android Studioを起動し、セットアップウィザードに従う
   - **重要**: "Android Virtual Device"のインストールを選択してください

### 2. Android SDKのインストール

Android Studio初回起動時に自動的にインストールされますが、手動で確認する場合：

1. Android Studioを開く
2. `Preferences` > `Appearance & Behavior` > `System Settings` > `Android SDK`
3. 以下をインストール:
   - Android SDK Platform 34 (またはExpoが推奨する最新版)
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
   - Android SDK Command-line Tools

### 3. 環境変数の設定

付属のスクリプトを使用して簡単に設定できます：

```bash
# スクリプトを実行
./setup-android-env.sh

# 設定を反映
source ~/.zshrc  # または source ~/.bash_profile
```

手動で設定する場合は、`~/.zshrc`に以下を追加：

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

### 4. Android エミュレーターの作成

1. Android Studioを開く
2. `Tools` > `AVD Manager` を選択
3. `Create Virtual Device` をクリック
4. デバイスを選択 (例: Pixel 6)
5. システムイメージを選択 (例: API 34)
6. エミュレーターの名前を設定して`Finish`

### 5. アプリの実行

```bash
# Android エミュレーターでアプリを起動
npm run android
```

## 📱 実機での開発（代替オプション）

Android Studioをインストールせずに、実機で開発することも可能です：

### Expo Goアプリを使用

1. Android端末のGoogle PlayストアからExpo Goをインストール
2. プロジェクトディレクトリで以下を実行:
   ```bash
   npm start
   ```
3. 表示されるQRコードをExpo Goアプリでスキャン

### 開発者モードの有効化（実機ビルドの場合）

1. Androidデバイスの`設定` > `デバイス情報`
2. `ビルド番号`を7回タップ
3. `設定` > `開発者向けオプション`
4. `USBデバッグ`を有効化

## 🔧 トラブルシューティング

### "adb: command not found" エラー

環境変数が正しく設定されていません。以下を確認：

```bash
echo $ANDROID_HOME
# 出力例: /Users/aoi/Library/Android/sdk

which adb
# 出力例: /Users/aoi/Library/Android/sdk/platform-tools/adb
```

### エミュレーターが起動しない

- Android Studioから直接エミュレーターを起動してみる
- システムの仮想化機能が有効になっているか確認
- Rosetta 2がインストールされているか確認（M1/M2 Macの場合）

### パッケージの警告

既に対応済みですが、もし警告が出る場合：

```bash
npm install @react-native-async-storage/async-storage@2.1.2
npm install react-native-safe-area-context@5.4.0
npm install react-native-screens@~4.11.1
```

## 📚 参考リンク

- [Expo Documentation](https://docs.expo.dev/)
- [React Native - Setting up the development environment](https://reactnative.dev/docs/environment-setup)
- [Android Studio User Guide](https://developer.android.com/studio/intro)

## ✅ 次のステップ

環境構築が完了したら：

1. `npm run android` でアプリを起動
2. 開発を開始
3. 本番ビルドが必要な場合は `npm run build:android` を実行