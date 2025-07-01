## Step 2: 外部サービス（Slack）と連携する

---

### 🎯 このステップで学ぶこと

- 外部 API との連携方法
- 環境変数を使った設定管理
- 複数のツールを持つ MCP サーバーの実装

---

### 📝 今回作るもの

> **Slack と連携して、スレッドの取得やメッセージ検索ができるツール**

2 つのツールを実装します：

1. Slack スレッドの URL から全ての返信を取得
2. Slack メッセージを検索

---

### 📋 事前準備

#### 1. Slack SDK のインストール

```bash
npm install @slack/web-api
```

#### 2. Slack App の作成とトークンの取得

##### Slack アプリの作成

1. [Slack API](https://api.slack.com/apps) にアクセスします
2. **Create New App** をクリックします
3. **From Scratch** を選択します

##### アプリ情報の設定

1. **Settings > Basic Information** へ移動します
2. **Display Information** セクションで以下を設定します：
   - **App name**: `hands_on_mcp_{ユーザー名}`
   - **Short description**: `hands_mcp from {ユーザー名}`
3. **Save Changes** をクリックします

##### OAuth 権限の設定

1. **Features > OAuth & Permissions** へ移動します
2. **Scopes > User Token Scopes** に以下の権限を追加します：
   - `channels:history` - チャンネルの履歴を読み取り
   - `groups:history` - プライベートチャンネルの履歴を読み取り
   - `im:history` - ダイレクトメッセージの履歴を読み取り
   - `mpim:history` - グループダイレクトメッセージの履歴を読み取り
   - `search:read` - Slack 内での検索権限

##### アプリのインストール

1. **Settings > Install App** へ移動します
2. **Install to {ワークスペース名}** をクリックします
3. 権限を確認して **許可** をクリックします

##### トークンの取得

インストール完了後、**User OAuth Token** が生成されます（xoxp-で始まるトークン）。このトークンをコピーして保存してください。

---

### 🔧 実装手順

では、`src/index.ts` を編集して実装していきましょう。

---

#### ① 必要なライブラリをインポート

```typescript
#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { WebClient } from "@slack/web-api";
```

**解説:**

- `WebClient`：Slack Web API を使うためのクライアント

---

#### ② Slack API クライアントと MCP サーバーの初期化

```typescript
// Slack APIクライアントの初期化
const slack = new WebClient(process.env.SLACK_USER_TOKEN);

const server = new McpServer({
  name: "step2",
  version: "1.0.0",
});
```

---

#### ③ スレッド取得ツールを登録する

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

---

#### ④ メッセージ検索ツールを登録する

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

---

#### 💡 実装のポイント

- **URL 解析**：正規表現で Slack の URL からチャンネル ID とタイムスタンプを抽出
- **環境変数**：`process.env` で環境変数を設定しておくと、`.mcp.json` に設定した環境変数が使われるようになる

---

#### ⑤ サーバーの起動処理を実装する

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

---

### 🧪 動作確認（REPL）

ターミナルで以下のコマンドを実行して、JSON を直接貼り付けることで確認できます。

```bash
SLACK_USER_TOKEN="xoxp-your-token" npm run dev
```

#### 🔍 利用可能なツール一覧を取得

```
{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}
```

#### 💬 Slack メッセージを検索

```
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"search-slack-messages","arguments":{"query":"MCP","limit":5}}}
```

応答が返ってくればちゃんと動いています。

---

### 🤖 Claude Code との連携確認

#### 1. ビルド

```bash
npm run build
```

#### 2. 実行ファイルのパスを取得

```bash
npm run path
```

#### 3. Claude Code に登録

```bash
claude mcp add step2 -s project {↑で取得したパス} -e SLACK_USER_TOKEN="xoxp-your-token"
```

プロジェクトルートの `.mcp.json` に設定が追加されます。

#### 4. 起動＆動作確認

Claude Code で以下のような実践的な使い方ができます：

**📌 スレッドの要約とタスク管理**

```
このSlackスレッドの内容を要約して、議論されている課題についてGitHub Issueを作成して：
https://example.slack.com/archives/C1234567890/p1234567890123456
```

**🔍 エラー解決のための情報収集**

```
TypeError: Cannot read property 'foo' of undefined というエラーが出ているんだけど、
Slackで同じようなエラーについて話している人がいないか検索して、
解決方法が議論されていたら教えて
```

---

### 🚨 トラブルシューティング

| エラー           | 原因                                 | 解決方法                                                       |
| ---------------- | ------------------------------------ | -------------------------------------------------------------- |
| `not_in_channel` | ユーザーがチャンネルに参加していない | トークンを取得したユーザーがチャンネルに参加していることを確認 |
| `missing_scope`  | 必要な権限が不足                     | Slack App の設定で必要なスコープを追加                         |
| `invalid_auth`   | トークンが無効                       | トークンを再生成して環境変数を更新                             |

---

## ✅ おさらい

| 学んだこと       | 内容                               |
| ---------------- | ---------------------------------- |
| 外部 API 連携    | Slack Web API を使った実装         |
| 環境変数の活用   | トークンなどの機密情報の管理       |
| 複数ツールの実装 | 1 つのサーバーに複数のツールを登録 |
| URL 解析         | 正規表現を使ったパラメータ抽出     |

---

完成したコードは `src/solutions/step2/index.ts` を参照してください。
