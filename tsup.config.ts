import { defineConfig } from "tsup";
import { readFileSync } from "node:fs";

// Baked in at build time so --version can never drift from package.json.
// prepublishOnly runs the build, so the published binary always matches.
const { version } = JSON.parse(readFileSync("package.json", "utf8")) as {
  version: string;
};

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  clean: true,
  dts: true,
  define: { __VERSION__: JSON.stringify(version) },
  // tsup has no --banner CLI flag; this is the supported way to inject the shebang.
  banner: { js: "#!/usr/bin/env node" },
});
