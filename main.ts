// Entry point for "The agent builds a game from one prompt".
// The entry is an X post carrying the video; this program only copies the
// post's address (POST.json, added to the repo root after the post is made)
// into the grader's output directory, as the competition requires.
import { copyFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
// Never delete the output directory itself (the grader runs as an
// unprivileged user on a read-only root); only its children.
for (const f of readdirSync(outDir)) {
  rmSync(join(outDir, f), { recursive: true, force: true });
}
const repoRoot = dirname(fileURLToPath(import.meta.url));
copyFileSync(join(repoRoot, 'POST.json'), join(outDir, 'POST.json'));
