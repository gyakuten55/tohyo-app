#!/bin/bash

# Android環境変数設定スクリプト
# このスクリプトを実行して、Android開発環境の環境変数を設定します

echo "Android開発環境の環境変数を設定します..."

# シェルの設定ファイルを判定
if [ -n "$ZSH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.bash_profile"
else
    echo "サポートされていないシェルです。手動で環境変数を設定してください。"
    exit 1
fi

# 環境変数の設定
cat >> "$SHELL_CONFIG" << 'EOF'

# Android SDK Environment Variables
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
EOF

echo "環境変数が $SHELL_CONFIG に追加されました。"
echo ""
echo "次のコマンドを実行して設定を反映してください:"
echo "  source $SHELL_CONFIG"
echo ""
echo "または、ターミナルを再起動してください。"