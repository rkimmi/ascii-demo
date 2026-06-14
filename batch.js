// Batch ASCII renderer.
// Usage: node batch.js <inputDir> <outputDir> <cellSize>
// Reads .png frames from inputDir, writes ASCII PNGs to outputDir.

const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const { scanImage } = require("./ascii-core");

const BG_COLOR = "black";
const FONT = "10px sans-serif"; // matches the browser canvas default

async function main() {
  const [, , inputDir, outputDir, cellSizeArg] = process.argv;

  if (!inputDir || !outputDir || !cellSizeArg) {
    console.error("Usage: node batch.js <inputDir> <outputDir> <cellSize>");
    process.exit(1);
  }

  const cellSize = parseInt(cellSizeArg, 10);
  if (!Number.isInteger(cellSize) || cellSize < 1) {
    console.error(`Invalid cellSize: ${cellSizeArg} (must be an integer >= 1)`);
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const frames = fs
    .readdirSync(inputDir)
    .filter((f) => f.toLowerCase().endsWith(".png"))
    .sort();

  if (frames.length === 0) {
    console.error(`No .png files found in ${inputDir}`);
    process.exit(1);
  }

  console.log(`Rendering ${frames.length} frame(s) at cellSize ${cellSize}...`);

  for (let i = 0; i < frames.length; i++) {
    const file = frames[i];
    const image = await loadImage(path.join(inputDir, file));

    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    // Sample pixels from the source image.
    ctx.drawImage(image, 0, 0, image.width, image.height);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);

    // Draw the ASCII over a solid background.
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, image.width, image.height);
    ctx.font = FONT;

    const cells = scanImage(imageData, cellSize); // original pixel colors
    for (const cell of cells) {
      ctx.fillStyle = cell.color;
      ctx.fillText(cell.symbol, cell.x, cell.y);
    }

    const outName = path.basename(file, path.extname(file)) + ".png";
    fs.writeFileSync(path.join(outputDir, outName), canvas.toBuffer("image/png"));
    console.log(`  [${i + 1}/${frames.length}] ${file} -> ${outName}`);
  }

  console.log(`Done. Wrote ${frames.length} file(s) to ${outputDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
