import path from "node:path";
import fs from "fs-extra";
import { execa } from "execa";
import * as p from "@clack/prompts";
import pc from "picocolors";

import {
  rootPackageJson,
  pnpmWorkspaceYaml,
  turboJson,
  npmrc,
  tsConfigPackageJson,
  tsConfigBase,
  tsConfigNextjs,
  tsConfigReactLibrary,
  tsConfigNode,
  tailwindPackageJson,
  tailwindConfigTs,
  eslintConfigBase,
  eslintConfigNext,
  eslintConfigPackageJson,
  uiPackageJson,
  uiTsConfig,
  uiButton,
  uiCard,
  uiIndex,
} from "./templates/config.js";

import {
  databasePackageJson,
  databaseTsConfig,
  databaseClient,
  databaseIndex,
  prismaSchema,
  serverIndex,
  serverDbConfig,
  serverHealthController,
  serverHealthRoute,
  serverAuthMiddleware,
  serverErrorHandler,
  serverPackageJson,
  serverTsConfig,
  webPackageJson,
  webTsConfig,
  webNextConfig,
  webTailwindConfig,
  webLayoutTsx,
  webPageTsx,
  webGlobalsCss,
  webEslintConfig,
  envExample,
} from "./templates/apps.js";

type Opts = {
  projectName: string;
  dbName: string;
  packageManager: "pnpm" | "npm";
};

const GITIGNORE = "node_modules\n.next\ndist\n.env\n.env.local\n";

const TAILWIND_DIRECTIVES = "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n";

const POSTCSS_CONFIG = "export default { plugins: { tailwindcss: {}, autoprefixer: {} } };\n";

export async function scaffold({ projectName, dbName, packageManager }: Opts) {
  const projectDir = path.resolve(process.cwd(), projectName);

  if ((await fs.pathExists(projectDir)) && (await fs.readdir(projectDir)).length > 0) {
    p.cancel(`${pc.red(projectDir)} already exists and is not empty.`);
    process.exit(1);
  }

  const write = async (relPath: string, content: string) => {
    const full = path.join(projectDir, relPath);
    await fs.mkdirp(path.dirname(full));
    await fs.writeFile(full, content, "utf8");
  };

  const s = p.spinner();
  s.start("Creating files...");

  await fs.mkdirp(projectDir);

  // root
  await write("package.json", rootPackageJson({ projectName, packageManager }));
  await write("turbo.json", turboJson());
  await write(".env.example", envExample({ dbName }));
  await write(".gitignore", GITIGNORE);
  if (packageManager === "pnpm") {
    await write(".npmrc", npmrc());
    await write("pnpm-workspace.yaml", pnpmWorkspaceYaml());
  }

  // packages/typescript-config
  await write("packages/typescript-config/package.json", tsConfigPackageJson());
  await write("packages/typescript-config/base.json", tsConfigBase());
  await write("packages/typescript-config/nextjs.json", tsConfigNextjs());
  await write("packages/typescript-config/react-library.json", tsConfigReactLibrary());
  // Not in the spec's table, but databaseTsConfig() extends node.json.
  await write("packages/typescript-config/node.json", tsConfigNode());

  // packages/tailwind-config
  await write("packages/tailwind-config/package.json", tailwindPackageJson());
  await write("packages/tailwind-config/tailwind.config.ts", tailwindConfigTs());

  // packages/eslint-config
  await write("packages/eslint-config/package.json", eslintConfigPackageJson());
  await write("packages/eslint-config/base.js", eslintConfigBase());
  await write("packages/eslint-config/next.js", eslintConfigNext());

  // packages/ui
  await write("packages/ui/package.json", uiPackageJson());
  await write("packages/ui/tsconfig.json", uiTsConfig());
  await write("packages/ui/src/button.tsx", uiButton());
  await write("packages/ui/src/card.tsx", uiCard());
  await write("packages/ui/src/index.ts", uiIndex());
  await write("packages/ui/styles.css", TAILWIND_DIRECTIVES);

  // packages/database
  await write("packages/database/package.json", databasePackageJson());
  await write("packages/database/tsconfig.json", databaseTsConfig());
  await write("packages/database/src/client.ts", databaseClient());
  await write("packages/database/src/index.ts", databaseIndex());
  await write("packages/database/prisma/schema.prisma", prismaSchema());

  // apps/server
  await write("apps/server/package.json", serverPackageJson());
  await write("apps/server/tsconfig.json", serverTsConfig());
  await write("apps/server/src/index.ts", serverIndex());
  await write("apps/server/src/config/db.ts", serverDbConfig());
  await write("apps/server/src/controllers/healthController.ts", serverHealthController());
  await write("apps/server/src/routes/health.ts", serverHealthRoute());
  await write("apps/server/src/middleware/authMiddleware.ts", serverAuthMiddleware());
  await write("apps/server/src/middleware/errorHandler.ts", serverErrorHandler());
  await write("apps/server/src/services/.gitkeep", "");
  await write("apps/server/src/types/.gitkeep", "");
  await write("apps/server/src/utils/.gitkeep", "");

  // apps/web
  await write("apps/web/package.json", webPackageJson({ projectName }));
  await write("apps/web/tsconfig.json", webTsConfig());
  await write("apps/web/next.config.mjs", webNextConfig());
  await write("apps/web/tailwind.config.ts", webTailwindConfig());
  await write("apps/web/eslint.config.js", webEslintConfig());
  await write("apps/web/app/layout.tsx", webLayoutTsx({ projectName }));
  await write("apps/web/app/page.tsx", webPageTsx());
  await write("apps/web/app/globals.css", webGlobalsCss());
  await write("apps/web/postcss.config.mjs", POSTCSS_CONFIG);

  s.stop("Files created");

  const run = (file: string, args: string[]) => execa(file, args, { cwd: projectDir });

  // Step 1 — install
  let installed = true;
  s.start("Installing dependencies...");
  try {
    await execa(packageManager, ["install"], { cwd: projectDir });
    s.stop("Dependencies installed");
  } catch {
    installed = false;
    s.stop(pc.yellow(`${packageManager} install failed — run it yourself in the project`));
  }

  // Step 2 — git
  s.start("Initializing git...");
  try {
    await run("git", ["init"]);
    await run("git", ["add", "."]);
    await run("git", ["commit", "-m", "init: scaffold from create-turbo-stack"]);
    s.stop("Git repository initialized");
  } catch {
    // no git, or no configured user.name/user.email — files are written either way
    s.stop(pc.yellow("git init skipped"));
  }

  // Step 3 — outro
  p.outro(
    [
      `${pc.green("✓")} Done!`,
      "",
      "Next steps:",
      `  ${pc.bold(`cd ${projectName}`)}`,
      ...(installed ? [] : [`  ${pc.bold(`${packageManager} install`)}`]),
      `  ${pc.bold("cp .env.example .env.local")}`,
      `  ${pc.dim("# add your DATABASE_URL to .env.local")}`,
      `  ${pc.bold(`${packageManager} run dev`)}`,
      "",
      "Database:",
      `  cd packages/database`,
      `  ${pc.bold(`${packageManager} run db:push`)}`,
      `  ${pc.bold(`${packageManager} run db:generate`)}`,
    ].join("\n"),
  );
}
