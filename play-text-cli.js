// ASCII text animation player.
// Usage: node play.js <framesDir> [--fps 12] [--loop]
// Plays .txt frames (as written by batch-text.js) in the terminal.

const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const args = { dir: null, fps: 12, loop: false };
  const rest = argv.slice(2);
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === "--loop") args.loop = true;
    else if (a === "--fps") args.fps = parseInt(rest[++i], 10);
    else if (!args.dir) args.dir = a;
  }
  return args;
}

async function main() {
  const { dir, fps, loop } = parseArgs(process.argv);

  if (!dir) {
    console.error("Usage: node play.js <framesDir> [--fps 12] [--loop]");
    process.exit(1);
  }
  if (!Number.isInteger(fps) || fps < 1) {
    console.error(`Invalid fps: must be an integer >= 1`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".txt"))
    .sort();

  if (files.length === 0) {
    console.error(`No .txt frames found in ${dir}`);
    process.exit(1);
  }

  // Preload frames so playback timing isn't disk-bound.
  const frames = files.map((f) => fs.readFileSync(path.join(dir, f), "utf8"));
  const delay = 1000 / fps;

  // Hide cursor; restore it on exit (Ctrl+C included).
  process.stdout.write("\x1b[?25l");
  const restore = () => {
    process.stdout.write("\x1b[?25h");
    process.exit(0);
  };
  process.on("SIGINT", restore);

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  do {
    for (const frame of frames) {
      // Move cursor home + clear screen, then draw. Smoother than `clear`.
      process.stdout.write("\x1b[H\x1b[2J" + frame);
      await sleep(delay);
    }
  } while (loop);

  process.stdout.write("\x1b[?25h\n");
}

main().catch((err) => {
  process.stdout.write("\x1b[?25h");
  console.error(err);
  process.exit(1);
});
