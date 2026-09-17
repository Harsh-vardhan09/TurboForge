import fs from "fs-extra";

export type ProjectDirState = "missing" | "non-directory" | "empty-directory" | "non-empty-directory";

export async function inspectProjectDir(projectDir: string): Promise<ProjectDirState> {
  const stat = await fs.lstat(projectDir).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return null;
    throw error;
  });

  if (stat === null) return "missing";
  if (!stat.isDirectory()) return "non-directory";

  return (await fs.readdir(projectDir)).length === 0 ? "empty-directory" : "non-empty-directory";
}
