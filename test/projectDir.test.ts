import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { inspectProjectDir } from "../src/projectDir.js";

const root = await mkdtemp(path.join(os.tmpdir(), "turboforge-project-dir-"));

try {
  const fileTarget = path.join(root, "file-target");
  await writeFile(fileTarget, "occupied");
  assert.equal(await inspectProjectDir(fileTarget), "non-directory");

  const missing = path.join(root, "missing");
  const empty = path.join(root, "empty");
  const nonEmpty = path.join(root, "non-empty");
  await mkdir(empty);
  await mkdir(nonEmpty);
  await writeFile(path.join(nonEmpty, "keep.txt"), "x");

  assert.equal(await inspectProjectDir(missing), "missing");
  assert.equal(await inspectProjectDir(empty), "empty-directory");
  assert.equal(await inspectProjectDir(nonEmpty), "non-empty-directory");
} finally {
  await rm(root, { recursive: true, force: true });
}
