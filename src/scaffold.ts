import path from "node:path";
import fs from "fs-extra";
import { execa } from "execa";
import * as p from "@clack/prompts";
import pc from "picocolors";

import {
  rootPackageJson,
  turboJson,
  tsConfigPackageJson,
  tsConfigBase,
  tsConfigNextjs,
  tsConfigNode,
  tailwindPackageJson,
  tailwindConfigTs,
  uiPackageJson,
  uiTsConfig,
  uiButton,
  uiCard,
  uiIndex,
} from "./templates/config.js";

import {
  databasePackageJson,
  databaseTsConfig,
  databaseIndex,
  prismaSchema,
  backendPackageJson,
  backendTsConfig,
  backendIndex,
  backendHealth,
  backendErrorHandler,
  webPackageJson,
  webTsConfig,
  webNextConfig,
  webTailwindConfig,
  webLayoutTsx,
  webPageTsx,
  webGlobalsCss,
  envExample,
} from "./templates/apps.js";

type Opts = { projectName: string; dbName: string };

const GITIGNORE = "node_modules\n.next\ndist\n.env\n.env.local\n";

export async function scaffold({ projectName, dbName }: Opts) {
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
  await write("package.json", rootPackageJson({ projectName }));
  await write("turbo.json", turboJson());
  await write(".env.example", envExample({ dbName }));
  await write(".gitignore", GITIGNORE);

  // packages/typescript-config
  await write("packages/typescript-config/package.json", tsConfigPackageJson());
  await write("packages/typescript-config/base.json", tsConfigBase());
  await write("packages/typescript-config/nextjs.json", tsConfigNextjs());
  await write("packages/typescript-config/node.json", tsConfigNode());

  // packages/tailwind-config
  await write("packages/tailwind-config/package.json", tailwindPackageJson());
  await write("packages/tailwind-config/tailwind.config.ts", tailwindConfigTs());

  // packages/ui
  await write("packages/ui/package.json", uiPackageJson());
  await write("packages/ui/tsconfig.json", uiTsConfig());
  await write("packages/ui/src/button.tsx", uiButton());
  await write("packages/ui/src/card.tsx", uiCard());
  await write("packages/ui/src/index.ts", uiIndex());

  // packages/database
  await write("packages/database/package.json", databasePackageJson());
  await write("packages/database/tsconfig.json", databaseTsConfig());
  await write("packages/database/src/index.ts", databaseIndex());
  await write("packages/database/prisma/schema.prisma", prismaSchema());

  // backend/api
  await write("backend/api/package.json", backendPackageJson());
  await write("backend/api/tsconfig.json", backendTsConfig());
  await write("backend/api/src/index.ts", backendIndex());
  await write("backend/api/src/routes/health.ts", backendHealth());
  await write("backend/api/src/middleware/errorHandler.ts", backendErrorHandler());

  // apps/web
  await write("apps/web/package.json", webPackageJson({ projectName }));
  await write("apps/web/tsconfig.json", webTsConfig());
  await write("apps/web/next.config.mjs", webNextConfig());
  await write("apps/web/tailwind.config.ts", webTailwindConfig());
  await write("apps/web/app/layout.tsx", webLayoutTsx({ projectName }));
  await write("apps/web/app/page.tsx", webPageTsx());
  await write("apps/web/app/globals.css", webGlobalsCss());

  s.stop("Files created");

  const run = (file: string, args: string[]) => execa(file, args, { cwd: projectDir });

  // Step 1 — install
  let installed = true;
  s.start("Installing dependencies...");
  try {
    await run("npm", ["install"]);
    s.stop("Dependencies installed");
  } catch {
    installed = false;
    s.stop(pc.yellow("npm install failed — run it yourself in the project"));
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
      `${pc.green("✓")} Done! Your project is ready.`,
      "",
      "Next steps:",
      `  ${pc.bold(`cd ${projectName}`)}`,
      ...(installed ? [] : [`  ${pc.bold("npm install")}`]),
      `  ${pc.bold("cp .env.example .env.local")}`,
      `  ${pc.dim("# fill in DATABASE_URL in .env.local")}`,
      `  ${pc.bold("npm run dev")}`,
    ].join("\n"),
  );
}
