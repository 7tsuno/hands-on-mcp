import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { WebClient } from "@slack/web-api";

// Slack APIクライアントの初期化
const slack = new WebClient(process.env.SLACK_USER_TOKEN);

const server = new McpServer({
  name: "step2",
  version: "1.0.0",
});

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
