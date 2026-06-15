// ASCII algorithm
// Works as a plain <script> in the browser (attaches to window)
// and as a CommonJS module in Node (module.exports).

// Pixel brightness to default character map
const DEFAULT_CHARS = new Map([
  [240, "#"],
  [220, "@"],
  [200, "&"],
  [180, "%"],
  [160, "}"],
  [140, "$"],
  [120, "="],
  [100, "("],
  [80, "^"],
  [60, "*"],
  [40, "+"],
  [20, ":"],
  [-Infinity, "~"],
]);

let chars = new Map(DEFAULT_CHARS);

// Enabled overwriting of characters
function setSymbols(next) {
  const defaults = [...DEFAULT_CHARS];
  chars = new Map(
    defaults.map(([threshold, def], i) => [
      threshold,
      next && next[i] ? next[i] : def,
    ]),
  );
}

function convertToSymbol(g) {
  for (const [threshold, symbol] of chars) {
    if (g > threshold) return symbol;
  }
}

// imageData: an ImageData-like { data, width, height }
// cellSize:  sampling step (the slider value)
// color:     optional fixed color string; when falsy, uses the source pixel rgb
// Returns: [{ x, y, symbol, color }]
function scanImage(imageData, cellSize, color) {
  const cells = [];
  for (let y = 0; y < imageData.height; y += cellSize) {
    for (let x = 0; x < imageData.width; x += cellSize) {
      const posX = x * 4; // every px has 4 values for rgba
      const posY = y * 4;
      const pos = posY * imageData.width + posX;

      if (imageData.data[pos + 3] > 128) {
        // check a in rgba for transparency
        const red = imageData.data[pos];
        const green = imageData.data[pos + 1];
        const blue = imageData.data[pos + 2];
        const total = red + green + blue;
        const avgColorVal = total / 3;
        const cellColor = color ? color : `rgb(${red},${green},${blue})`;
        const symbol = convertToSymbol(avgColorVal);
        cells.push({ x, y, symbol, color: cellColor });
      }
    }
  }
  return cells;
}

const AsciiCore = { convertToSymbol, scanImage, setSymbols, DEFAULT_CHARS };

if (typeof module !== "undefined" && module.exports) {
  module.exports = AsciiCore; // Node
} else if (typeof window !== "undefined") {
  window.AsciiCore = AsciiCore; // browser
}
