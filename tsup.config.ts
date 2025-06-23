import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  target: "node24",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  minify: false,
  // CLI用の設定
  shims: true,
  // shebangを追加
  banner: {
    js: "#!/usr/bin/env node",
  },
  // Node.js builtin modulesの処理
  noExternal: ["commander"],
  // 実行権限を付与
  onSuccess: "chmod +x dist/index.js",
});
