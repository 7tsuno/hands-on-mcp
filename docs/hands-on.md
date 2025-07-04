author: hands-on-mcp
summary: TypeScript で MCP サーバーを作るハンズオン
id: hands-on-mcp
categories: mcp,typescript,slack
environments: Web
status: Published
feedback link: https://github.com/7tsuno/hands-on-mcp/issues
analytics account:

# MCP Server ハンズオン

## はじめに

Duration: 0:02:00

### 🎯 このハンズオンについて

Model Context Protocol (MCP) サーバーを初めて作る方のためのハンズオンです。
TypeScript を使って、実際に動作する MCP サーバーを一から構築していきます。

### 📚 学習内容

このハンズオンは 2 つのステップで構成されています：

**Step 1: 基本編 - おすすめラーメン紹介 MCP**

- MCP サーバーの基本構造を理解
- ツール（Tool）の実装方法を学習
- Claude Code との連携を体験

**Step 2: 応用編 - Slack 連携 MCP**

- 外部 API との連携方法を習得
- 環境変数を使った設定管理
- 複数ツールの実装パターン

### 📋 前提条件

- **Node.js 20** 以上
- **TypeScript** の基本知識
- **MCP** についての基礎理解

## プロジェクトのセットアップ

Duration: 0:03:00

### リポジトリのクローン

まずはプロジェクトをローカルに準備します。

```bash
# リポジトリのクローン
git clone https://github.com/7tsuno/hands-on-mcp.git
cd hands-on-mcp
```

### 依存関係のインストール

```bash
# Node.js の確認（20以上が必要）
node --version

# 依存関係のインストール
npm install
```

### プロジェクト構成

```
hands-on-mcp/
├── src/
│   ├── index.ts             # 実装するファイル
│   └── solutions/           # 解答例
│       ├── step1/
│       └── step2/
├── docs/                    # ドキュメント
└── package.json
```

### 💡 詰まったら

実装に詰まった時は `src/solutions/` 配下に解答例があるので参考にしてください。

## Step 1: おすすめラーメン紹介 MCP の概要

Duration: 0:02:00

### 🍜 Step 1 で作るもの

最初のステップでは、シンプルな MCP サーバーを作成します。

> **指定した味（しょうゆ／みそ／しお）に応じて、おすすめのラーメン屋を返すツール**

### 🎯 Step 1 の学習目標

- MCP サーバーの基本的な構造を理解する
- `registerTool` メソッドでツールを登録する方法を学ぶ
- zod を使った引数のスキーマ定義を習得する
- Claude Code との基本的な連携方法を体験する

### 💻 動作イメージ

ユーザーが Claude Code で「おすすめの醤油ラーメンを教えて」と入力すると、
MCP サーバーのツールが呼び出され、「ほん田（東京・秋葉原）」という回答が返ってきます。

### 📝 実装の流れ

1. 必要なライブラリのインポート
2. MCP サーバーの初期化
3. おすすめラーメン紹介 MCP の実装
4. サーバーの起動処理
5. 動作確認と Claude Code 連携

## Step 1: ライブラリのインポートと初期化

Duration: 0:03:00

### 📁 作業ファイル

`src/index.ts` を編集して MCP サーバーを実装していきます。

### 必要なライブラリをインポート

`src/index.ts` に以下のコードを記述します：

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
```

### ライブラリの説明

**`McpServer`**

- MCP サーバーの本体クラス
- ツールの登録やクライアントとの通信を管理

**`StdioServerTransport`**

- 標準入出力（stdin/stdout）で通信するためのトランスポート
- JSON-RPC メッセージのやり取りを処理

**`zod`**

- 引数のスキーマを定義するためのライブラリ
- 型安全性を保証し、バリデーションも自動で行う

### サーバーインスタンスの作成

続けて、MCP サーバーのインスタンスを作成します：

```typescript
const server = new McpServer({
  name: "step1",
  version: "1.0.0",
});
```

💡 **ポイント**:

- `name` はサーバーの識別名（Claude Code で表示される）
- `version` は互換性管理のために重要

## Step 1: おすすめラーメン紹介 MCP の実装

Duration: 0:05:00

### ツールの登録

`registerTool` メソッドを使ってツールを登録します：

```typescript
server.registerTool(
  "get-ramen-recommendation",
  {
    title: "ラーメン屋おすすめ",
    description: "指定された味に応じたおすすめのラーメン屋を返します",
    inputSchema: {
      flavor: z
        .enum(["しょうゆ", "みそ", "しお"])
        .describe("ラーメンの味の種類"),
    },
  },
  async ({ flavor }) => {
    const recommendations: Record<string, string> = {
      しょうゆ: "ほん田（東京・秋葉原）",
      みそ: "味噌っ子 ふっく（東京・荻窪）",
      しお: "Ramen FeeL (東京・青梅)",
    };

    const name = recommendations[flavor];

    return {
      content: [
        {
          type: "text",
          text: `${flavor}ラーメンなら「${name}」がおすすめです！`,
        },
      ],
    };
  }
);
```

### ツール定義のポイント

**1. ツール名（第 1 引数）**

- `"get-ramen-recommendation"` - ユニークな識別子

**2. メタデータ（第 2 引数）**

- `title`: UI に表示される名前
- `description`: AI がツール選択時に参照
- `inputSchema`: zod で引数を定義

**3. ハンドラー（第 3 引数）**

- 非同期関数でツールの処理を実装
- 引数は inputSchema で定義した型が渡される
- 戻り値は `content` 配列で返す

## Step 1: サーバーの起動処理

Duration: 0:03:00

### 起動処理の実装

最後に、サーバーの起動処理を実装します：

```typescript
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🍜 ramen-server running via stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
```

### 重要な注意事項

⚠️ **console.log は使用禁止！**

MCP サーバーは標準出力（stdout）を通信に使用するため：

- デバッグ出力は必ず `console.error()` を使用
- `console.log()` を使うと通信が壊れてエラーになる

### コードの説明

1. **トランスポートの作成**: 標準入出力で通信するための設定
2. **サーバーへの接続**: トランスポートを使ってサーバーを起動
3. **エラーハンドリング**: 起動失敗時は適切に終了

### 💾 ファイルを保存

ここまでの実装を保存してください。次のステップで動作確認を行います。

## Step 1: JSON-RPC について

Duration: 0:01:00

MCP サーバーとは JSON-RPC を使って標準入出力でやり取りをします。

### JSON-RPC とは？

JSON フォーマットを使ったシンプルなプロトコル。

### 基本

- クライアントがサーバーの関数を呼び出す仕組み
- データのやり取りはすべて JSON 形式
- `method`（メソッド名）、`params`（引数）、`id`（識別子）などのフィールドが決まっている

### リクエスト例

```json
{
  "method": "getWeather",
  "params": { "city": "Tokyo" },
  "id": 1
}
```

### レスポンス例

```json
{
  "result": { "temperature": 30, "weather": "sunny" },
  "id": 1
}
```

## Step 1: 動作確認（REPL）

Duration: 0:02:00

### REPL での動作テスト

実装したサーバーが正しく動作するか、REPL（対話モード）で確認します。

### サーバーの起動

ターミナルで以下のコマンドを実行：

```bash
npm run dev
```

以下のようなメッセージが表示されれば起動成功です：

```
🍜 ramen-server running via stdio
```

### ツール一覧の確認

MCP サーバーとは、標準入出力で JSON-RPC を介してやり取りをします。

別のターミナルは開かず、**同じターミナルに**以下の JSON を貼り付けて Enter：

```
{ "jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {} }
```

正常な応答例：

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "get-ramen-recommendation",
        "title": "ラーメン屋おすすめ",
        "description": "指定された味に応じたおすすめのラーメン屋を返します"
      }
    ]
  }
}
```

### ツールの実行テスト

続けて、おすすめラーメン紹介 MCP を呼び出してみます：

```
{"jsonrpc": "2.0","id": 2,"method": "tools/call","params": {"name": "get-ramen-recommendation", "arguments": { "flavor": "しょうゆ" }}}
```

期待される応答：

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "しょうゆラーメンなら「ほん田（東京・秋葉原）」がおすすめです！"
      }
    ]
  }
}
```

### 終了方法

テストが完了したら `Ctrl + C` でサーバーを停止します。

## Step 1: Claude Code への登録

Duration: 0:04:00

### ビルド

TypeScript をコンパイルして実行可能ファイルを生成します：

```bash
npm run build
```

ビルドが成功すると `dist/index.js` が生成されます。

### 実行ファイルのパスを取得

以下のコマンドで実行ファイルのフルパスを取得：

```bash
npm run path
```

出力例：

```
/Users/username/Projects/hands-on-mcp/dist/index.js
```

このパスをコピーしておきます。

### Claude Code に登録

取得したパスを使って MCP サーバーを登録：

```bash
claude mcp add step1 -s project {コピーしたパス}
```

実際のコマンド例：

```bash
claude mcp add step1 -s project /Users/username/Projects/hands-on-mcp/dist/index.js
```

### 登録の確認

プロジェクトルートに `.mcp.json` が作成されます：

```bash
cat .mcp.json
```

### ⚠️ 注意事項

- パスは**フルパス**で指定する必要があります

## Step 1: Claude Code での動作確認

Duration: 0:03:00

### Claude Code の再起動

MCP サーバーを登録したら、Claude Code を起動します

### 動作テスト

Claude Code のチャットに以下を入力：

```
おすすめの醤油ラーメンのお店を教えて
```

期待される応答：

> しょうゆラーメンなら「ほん田（東京・秋葉原）」がおすすめです！

### 他の味も試してみる

```
味噌ラーメンでおすすめは？
```

```
塩ラーメンの美味しいお店を知りたい
```

### MCP ツールの確認

Claude Code で `/mcp` コマンドを実行すると、登録されているツールの詳細を確認できます：

- ツール名
- 説明
- 引数のスキーマ

### 🎉 Step 1 完了！

おめでとうございます！最初の MCP サーバーが完成しました。

次は Step 2 で、より実践的な Slack 連携サーバーを作成します。

## Step 2: Slack 連携サーバーの概要

Duration: 0:03:00

### 🔗 Step 2 で作るもの

Step 2 では、実用的な外部サービス連携を学びます。

> **Slack と連携して、スレッドの取得やメッセージ検索ができる MCP サーバー**

### 🎯 実装する 3 つのツール

1. **Slack スレッド取得**

   - URL から全ての返信を取得
   - スレッドの内容を時系列で整理

2. **メッセージ検索**

   - キーワードでメッセージを検索
   - 検索結果を見やすく整形

3. **ユーザー情報取得**
   - ユーザー ID から詳細情報を取得
   - プロフィール情報を構造化して返す

### 💡 実践的な使用例

- Slack スレッドの内容を要約して GitHub Issue を作成
- 特定の技術に詳しい人を Slack から探す
- 過去の議論を検索して参照

次のステップで Slack App の設定を行います。

## Step 2: Slack App の設定

Duration: 0:05:00

### Slack App の作成

1. [Slack API](https://api.slack.com/apps) にアクセス
2. **Create New App** をクリック
3. **From Scratch** を選択
4. アプリ名（例：mcp-hands-on-{名前}）とワークスペースを設定

### OAuth スコープの設定

左メニューから **OAuth & Permissions** を選択し、以下のスコープを追加：

**User Token Scopes に追加するスコープ：**

| スコープ           | 説明                                       |
| ------------------ | ------------------------------------------ |
| `channels:history` | パブリックチャンネルのメッセージ読み取り   |
| `groups:history`   | プライベートチャンネルのメッセージ読み取り |
| `im:history`       | DM のメッセージ読み取り                    |
| `mpim:history`     | グループ DM のメッセージ読み取り           |
| `search:read`      | メッセージ検索                             |
| `users:read`       | ユーザー情報の読み取り                     |

### アプリのインストール

1. 上の方に戻り、**Install to {ワークスペース名}** をクリック
2. 権限を確認して **許可する**
3. **User OAuth Token** (xoxp-で始まる) をコピー

### 🔐 トークンの保管

取得したトークンは安全に保管してください。
後で環境変数として使用します。

⚠️ **重要**:

- Slack トークンは絶対に GitHub などにコミットしない

## Step 2: 基本実装

Duration: 0:04:00

### Step 1 のコードをベースに拡張

Step 1 のラーメンツールは削除します。
`src/index.ts` を編集して、空にした後、Step 2 の実装を始めます。

### ライブラリのインポート

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { WebClient } from "@slack/web-api";
```

### Slack クライアントの初期化

```typescript
// Slack APIクライアントの初期化
const slack = new WebClient(process.env.SLACK_USER_TOKEN);

const server = new McpServer({
  name: "step2",
  version: "1.0.0",
});
```

### 環境変数の重要性

- Slack トークンは環境変数で管理
- コードにハードコードしない（セキュリティ上重要）

## Step 2: スレッド取得ツールの実装

Duration: 0:05:00

### スレッド URL の解析と取得

最初のツールとして、Slack スレッドの URL から会話を取得するツールを実装します：

```typescript
server.registerTool(
  "get-slack-thread",
  {
    title: "Slackスレッド取得",
    description: "SlackスレッドのURLから全ての返信を取得します",
    inputSchema: {
      thread_url: z.string().describe("SlackスレッドのURL"),
    },
  },
  async ({ thread_url }) => {
    // URLからチャンネルIDとタイムスタンプを抽出
    const urlParts = thread_url.match(
      /https:\/\/[^\/]+\.slack\.com\/archives\/([^\/]+)\/p(\d+)(\d{6})?/
    );

    if (!urlParts) {
      throw new Error("無効なSlackスレッドURLです");
    }

    const channelId = urlParts[1];
    const timestamp = `${urlParts[2].slice(0, 10)}.${urlParts[2].slice(10)}`;

    // Slack APIでスレッドの返信を取得
    const result = await slack.conversations.replies({
      channel: channelId,
      ts: timestamp,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              channel: channelId,
              thread_ts: timestamp,
              messages: result.messages,
              total_messages: result.messages?.length || 0,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);
```

### 実装のポイント

**URL パース**

- 正規表現で Slack URL からチャンネル ID とタイムスタンプを抽出
- URL 形式: `https://xxx.slack.com/archives/C1234567890/p1234567890123456`

**タイムスタンプ変換**

- URL の `p1234567890123456` → API の `1234567890.123456`

**エラーハンドリング**

- 無効な URL、権限エラー、スレッド不在を適切に処理

## Step 2: 検索とユーザー情報ツールの実装

Duration: 0:05:00

### メッセージ検索ツール

2 つ目のツールとして、メッセージ検索機能を実装：

```typescript
server.registerTool(
  "search-slack-messages",
  {
    title: "Slackメッセージ検索",
    description: "Slackメッセージを検索して結果を取得します",
    inputSchema: {
      query: z.string().describe("検索クエリ"),
      limit: z.number().optional().default(20).describe("取得する最大件数"),
    },
  },
  async ({ query, limit }) => {
    // Slack APIでメッセージを検索
    const result = await slack.search.messages({
      query: query,
      count: limit,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              query: query,
              messages: result.messages?.matches || [],
              total_results: result.messages?.total || 0,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);
```

### ユーザー情報取得ツール

3 つ目のツールとして、ユーザー情報取得機能を実装：

```typescript
server.registerTool(
  "get-slack-user",
  {
    title: "Slackユーザー情報取得",
    description: "SlackユーザーIDから詳細なユーザー情報を取得します",
    inputSchema: {
      user_id: z.string().describe("SlackユーザーID（例: U1234567890）"),
    },
  },
  async ({ user_id }) => {
    try {
      // Slack APIでユーザー情報を取得
      const result = await slack.users.info({
        user: user_id,
      });

      if (!result.user) {
        throw new Error("ユーザーが見つかりませんでした");
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result.user, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`ユーザー情報の取得に失敗しました: ${error.message}`);
    }
  }
);
```

## Step 2: サーバー起動処理

```typescript
async function main() {
  if (!process.env.SLACK_USER_TOKEN) {
    console.error("エラー: SLACK_USER_TOKENが設定されていません");
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("💬 slack-server running via stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
```

## Step 2: 動作確認と Claude Code 連携

Duration: 0:04:00

### REPL での動作確認

環境変数を設定してサーバーを起動：

```bash
SLACK_USER_TOKEN="xoxp-your-token" npm run dev
```

ツール一覧の確認：

```json
{ "jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {} }
```

### ビルドと Claude Code への登録

```bash
# ビルド
npm run build

# パスを取得
npm run path

# 環境変数付きで登録
claude mcp add step2 -s project {パス} \
  -e SLACK_USER_TOKEN="xoxp-your-token"
```

### 実践的な使い方

Claude Code で以下のような使い方ができます：

**スレッドの要約：**

```
このSlackスレッドの内容を要約して、議論されている課題についてGitHub Issueを作成して：
https://example.slack.com/archives/C1234567890/p1234567890123456
```

**特定の話題に詳しい人を探す：**

```
MCPについて詳しく知りたい。Slackで検索してMCPについてよく言及している人を探して
```

**バグレポートの調査：**

```
Slackで「エラー」「バグ」「不具合」を検索して、最近報告されている問題をまとめて
```

## トラブルシューティング

Duration: 0:03:00

### よくあるエラーと対処法

| エラー                     | 原因                 | 解決方法                             |
| -------------------------- | -------------------- | ------------------------------------ |
| `console.log` で通信エラー | 標準出力の競合       | `console.error` を使用               |
| `not_in_channel`           | チャンネル未参加     | トークンのユーザーがチャンネルに参加 |
| `missing_scope`            | 権限不足             | Slack App で必要なスコープを追加     |
| `invalid_auth`             | トークン無効         | トークンを再生成して環境変数を更新   |
| `channel_not_found`        | チャンネル ID 間違い | URL が正しいか確認                   |

### デバッグのコツ

**1. REPL でテスト**

- 環境変数を設定して `npm run dev`
- JSON-RPC を直接送信して動作確認

**2. エラーログの活用**

```typescript
console.error("Debug:", { channel, timestamp });
```

**3. Slack API のレート制限**

- 大量のリクエストは避ける
- エラー時は少し待ってリトライ

### 📁 解答例の確認

どうしても詰まった場合：

```bash
# Step 1 の解答
cat src/solutions/step1/index.ts

# Step 2 の解答
cat src/solutions/step2/index.ts
```

## まとめ

Duration: 0:03:00

### 🎉 完成！

おめでとうございます！2 つの MCP サーバーを完成させました。

### 📚 学んだこと

**Step 1: 基本編**

- ✅ MCP サーバーの基本構造（McpServer + Transport）
- ✅ ツールの登録と実装（registerTool）
- ✅ zod によるスキーマ定義
- ✅ Claude Code との基本的な連携

**Step 2: 応用編**

- ✅ 外部 API との連携（Slack Web API）
- ✅ 環境変数の管理（process.env）
- ✅ 複数ツールの実装パターン
- ✅ エラーハンドリングのベストプラクティス

### 🚀 次のステップ

学んだ知識を活かして、以下に挑戦してみましょう：

- **データベース**と接続してデータを管理
- **ファイルシステム**を操作するツール
- **Web スクレイピング**ツール

### 📚 参考リソース

- [MCP 公式ドキュメント](https://modelcontextprotocol.io/)
- [Claude Code ドキュメント](https://docs.anthropic.com/claude-code)
- [Slack API ドキュメント](https://api.slack.com/)
- [zod ドキュメント](https://zod.dev/)

**Happy Coding! 🎊**
