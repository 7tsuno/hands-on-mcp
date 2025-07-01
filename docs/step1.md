## Step 1: MCP サーバーの基本を理解する

---

### 🎯 このステップで学ぶこと

- MCP サーバーの基本構造
- ツール（Tool）の登録方法

---

### 📝 今回作るもの

> **指定した味（しょうゆ／みそ／しお）に応じて、おすすめのラーメン屋を返すツール**

ユーザーの「おすすめの〇〇ラーメンを教えて」に応じて、AI がツールを使って答えるように設計します。

---

### 🔧 実装手順

では、`src/index.ts` を編集して実装していきましょう。

---

#### ① 必要なライブラリをインポート

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
```

**解説:**

- `McpServer`：MCP サーバーの本体クラス
- `StdioServerTransport`：標準入出力で通信するためのトランスポート
- `zod`：引数のスキーマを定義するためのライブラリ

---

#### ② MCP サーバーのインスタンスを作成

```ts
const server = new McpServer({
  name: "step1",
  version: "1.0.0",
});
```

- `name` と `version` はクライアントが識別に使います

---

#### ③ ツールを登録する

```ts
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
    let recommendation: string;

    switch (flavor) {
      case "しょうゆ":
        recommendation = "ほん田（東京・秋葉原）";
        break;
      case "みそ":
        recommendation = "味噌っ子 ふっく（東京・荻窪）";
        break;
      case "しお":
        recommendation = "Ramen FeeL（東京・青梅）";
        break;
      default:
        recommendation = "おすすめのお店が見つかりませんでした。";
        break;
    }

    return {
      content: [
        {
          type: "text",
          text: `${flavor}ラーメンなら「${recommendation}」がおすすめです！`,
        },
      ],
    };
  }
);
```

---

#### 💡 ツール定義のポイント

- `title`：Claude やクライアント UI で表示される「見出し」的な名前
- `description`：AI がこのツールを使うべきかどうか判断するための情報
- `inputSchema`：zod で引数を定義

**良い description の例：**

> `"指定された味に応じたおすすめのラーメン屋を返します"`
> → 明確に「何をするか」が伝わる

---

#### ④ サーバーの起動処理を実装する

```ts
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

**注意：**

- MCP の通信は標準出力を使うため、ログは `console.error()` で出すようにします。
- `console.log()` を使うと通信が壊れる可能性があるので厳禁です。

---

### 🧪 動作確認（REPL）

ターミナルで `npm run dev` を実行して、以下の JSON を直接貼り付けることで確認できます。

#### 🔍 利用可能なツール一覧を取得

```
{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}
```

#### 🍜 ラーメン屋を取得（例：しょうゆ）

```
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get-ramen-recommendation","arguments":{"flavor":"しょうゆ"}}}
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
claude mcp add step1  -s project  {↑で取得したパス}
```

プロジェクトルートに `.mcp.json` が作成されるのが確認できます。

※ `npm link` などでコマンドをグローバルに登録するとフルパスを指定しなくてもできそうですが、なんかツールが呼ぶシェルの PATH の関係？でうまくいかなかったのでフルパス指定を推奨します。

#### 4. 起動＆動作確認

Claude Code のプロンプトに以下のように入力：

```
おすすめの醤油ラーメンのお店を教えて
```

→ ツールが呼び出されて正しく応答されれば成功！

Claude Code 上で `/mcp` とコマンドを打つと登録されているツールの詳細についても確認できます

---

## ✅ おさらい

| 学んだこと           | 内容                                         |
| -------------------- | -------------------------------------------- |
| MCP サーバーの構成   | `McpServer` + `Transport` で基本セットアップ |
| ツールの登録方法     | `registerTool(name, meta, handler)`          |
| zod でのスキーマ定義 | AI が正しい引数を渡すために必須              |
| Claude 連携の基礎    | サーバーを登録すればすぐに使える             |

---

次のステップでは、**外部サービス（Slack）と連携するツール**を作成して、MCP の実用性をさらに深掘りしていきます。

準備ができたら `Step 2` へ進みましょう！
