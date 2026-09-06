import * as p from "@clack/prompts";
import pc from "picocolors";
import { scaffold } from "./scaffold.js";

function bail<T>(value: T | symbol): T {
  if (p.isCancel(value)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }
  return value as T;
}

export async function run() {
  const argName = process.argv[2];

  p.intro(pc.bgCyan(pc.black(" create-turbo-stack ")));

  const projectName =
    argName ??
    bail(
      await p.text({
        message: "Project name?",
        validate: (v) =>
          !v ? "Required" : /^[a-z0-9-]+$/.test(v) ? undefined : "Only a-z, 0-9 and hyphens",
      }),
    );

  const dbName = bail(
    await p.text({
      message: "Database name?",
      validate: (v) =>
        !v ? "Required" : /^[a-z0-9_]+$/.test(v) ? undefined : "Only a-z, 0-9 and underscores",
    }),
  );

  const ok = bail(
    await p.confirm({ message: `Create ${projectName} with database ${dbName}?` }),
  );
  if (!ok) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  await scaffold({ projectName, dbName });
}
