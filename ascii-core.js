// Shared, DOM-free ASCII algorithm.
// Works as a plain <script> in the browser (attaches to window)
// and as a CommonJS module in Node (module.exports).

function convertToSymbol(g) {
  if (g > 260) return ">";
  else if (g > 240) return "#";
  else if (g > 220) return "@";
  else if (g > 200) return "&";
  else if (g > 180) return "%";
  else if (g > 160) return "}";
  else if (g > 140) return "$";
  else if (g > 120) return "=";
  else if (g > 100) return "(";
  else if (g > 80) return "^";
  else if (g > 60) return "*";
  else if (g > 40) return "+";
  else if (g > 20) return ":";
  else return "~";
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

const AsciiCore = { convertToSymbol, scanImage };

if (typeof module !== "undefined" && module.exports) {
  module.exports = AsciiCore; // Node
} else if (typeof window !== "undefined") {
  window.AsciiCore = AsciiCore; // browser
}
