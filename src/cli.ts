import * as p from "@clack/prompts";
import pc from "picocolors";
import { scaffold } from "./scaffold.js";

const NAME_RE = /^[a-z0-9-]+$/;
const DB_RE = /^[a-z0-9_]+$/;

const HELP = `
  ${pc.bold("create-turbo-stack")} — scaffold a production Turborepo monorepo

  ${pc.bold("Usage")}
    npx create-turbo-stack [project-name]

  ${pc.bold("Options")}
    -h, --help       show this message
    -v, --version    print the version

  Prompts for anything not passed on the command line.
`;

function bail<T>(value: T | symbol): T {
  if (p.isCancel(value)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }
  return value as T;
}

export async function run() {
  const arg = process.argv[2];

  if (arg === "-h" || arg === "--help") {
    console.log(HELP);
    return;
  }
  if (arg === "-v" || arg === "--version") {
    console.log("1.0.0");
    return;
  }
  // Anything else flag-shaped is a typo, not a project name — don't scaffold `--nope/`.
  if (arg !== undefined && !NAME_RE.test(arg)) {
    console.error(
      `${pc.red("Invalid project name")} ${pc.bold(arg)} — use only a-z, 0-9 and hyphens.`,
    );
    process.exit(1);
  }

  p.intro(pc.bgCyan(pc.black(" create-turbo-stack ")));

  const projectName =
    arg ??
    bail(
      await p.text({
        message: "Project name?",
        validate: (v) =>
          !v ? "Required" : NAME_RE.test(v) ? undefined : "Only a-z, 0-9 and hyphens",
      }),
    );

  const dbName = bail(
    await p.text({
      message: "Database name?",
      validate: (v) =>
        !v ? "Required" : DB_RE.test(v) ? undefined : "Only a-z, 0-9 and underscores",
    }),
  );

  const packageManager = bail(
    await p.select({
      message: "Package manager?",
      options: [
        { value: "pnpm", label: "pnpm (recommended)" },
        { value: "npm", label: "npm" },
      ],
    }),
  ) as "pnpm" | "npm";

  const ok = bail(
    await p.confirm({ message: `Create ${projectName} with database ${dbName}?` }),
  );
  if (!ok) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  await scaffold({ projectName, dbName, packageManager });
}
