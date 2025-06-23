# MCP Server ハンズオン

**Model Context Protocol (MCP) サーバを初めて作る方のためのハンズオンです。**

TypeScript を使って、実際に動作する MCP サーバを一から構築していきます。

## 📋 前提条件

- **Node.js 24** 以上
- **TypeScript** の基本知識
- **MCP** についての基礎理解

## 🚀 ハンズオンの準備

### 1. リポジトリのクローン

```bash
git clone https://github.com/7tsuno/hands-on-mcp.git
cd hands-on-mcp
```

### 2. Node.js 24 のセットアップ

asdf を使用している場合：

```bash
asdf install
```

その他の方法で Node.js 24 をインストールしてください。

### 3. 依存関係のインストール

```bash
npm install
```

## 📚 ハンズオンの進め方

### 📖 ドキュメントを読む

まずは以下のドキュメントでハンズオンを開始してください：

**👉 [hands-on.md](./docs/hands-on.md)**

### 💡 詰まったら

詰まった時は `src/solutions/` 配下に解答例があるので参考にしてください

### 🔧 開発・テスト

```bash
# 開発モードで実行
npm run dev

# ビルド
npm run build
```

## 📖 学習内容

このハンズオンで学べること：

- ✅ MCP サーバの基本構造
- ✅ TypeScript での MCP サーバ実装
- ✅ ツール（Tools）の実装方法
- ✅ クライアントとの連携方法

## 🎯 目標

ハンズオン完了後には、以下ができるようになります：

1. **MCP サーバを一から作成**
2. **カスタムツールの実装**
3. **Claude Code との連携**

## 📁 プロジェクト構成

```
hands-on-mcp/
├── docs/
│   └── hands-on.md           # メインのハンズオン資料
├── src/
│   ├── solutions/            # 解答例（参考用）
│   │   ├── step1/           # ステップ1
│   │   ├── step2/           # ステップ2
│   ├── index.ts
├── dist/                    # ビルド出力（src直下のみ）
└── README.md               # このファイル
```

**🎉 それでは、MCP サーバ開発を始めましょう！**

👉 **[ハンズオンを開始する](./docs/step1.md)**
