// Meridian Casino — the hand-in program (Node 22, standard library only).
//
// It stages the entry into /output (or $MAKEFUN_OUTPUT_DIR outside the
// grader): the playable game/ tree, the screenshots/ renders, and the
// dossier.json the judge reads, built with the kit's vendored library.
// The staging is fully deterministic: the same repository writes the same
// bytes on every run, because nothing here reads a clock, a random source,
// or the network — only the files beside this program.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// Where this program lives, and where the staged entry goes.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputRoot = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps for this bounty (reference/gate.json): only
// text_max_bytes shapes the dossier's bytes; the other caps refuse an entry
// the scorer would refuse — more than 4 screenshots, one over 256 KiB, more
// than 993 files in game/ or 48 MiB of game files, a path over 1000 bytes.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
} as const;

/**
 * Copy one directory tree into another, file by file, creating directories
 * as needed. Symlinks are refused rather than followed: the gate only
 * accepts plain files and directories under game/.
 */
function copyTree(fromDir: string, toDir: string): void {
  mkdirSync(toDir, { recursive: true });
  for (const entry of readdirSync(fromDir, { withFileTypes: true })) {
    const from = join(fromDir, entry.name);
    const to = join(toDir, entry.name);
    if (entry.isDirectory()) {
      copyTree(from, to);
    } else if (entry.isFile()) {
      writeFileSync(to, readFileSync(from));
    } else {
      throw new Error(`refusing to stage ${from}: not a plain file or directory`);
    }
  }
}

/** Stage one top-level tree of the repository, when it exists. */
function stageTree(name: string): void {
  const from = join(repoRoot, name);
  if (!existsSync(from)) return;
  if (!statSync(from).isDirectory()) throw new Error(`${name} is not a directory`);
  copyTree(from, join(outputRoot, name));
}

mkdirSync(outputRoot, { recursive: true });
stageTree('game');
stageTree('screenshots');

// The dossier is built from the staged copy, so it always describes exactly
// what the grader will read.
writeFileSync(join(outputRoot, 'dossier.json'), buildDossier(outputRoot, DOSSIER_CAPS));
