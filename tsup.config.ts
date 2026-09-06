import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  clean: true,
  dts: true,
  // tsup has no --banner CLI flag; this is the supported way to inject the shebang.
  banner: { js: "#!/usr/bin/env node" },
});
