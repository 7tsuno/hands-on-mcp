import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "step1",
  version: "1.0.0",
});

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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🍜 ramen-server running via stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
