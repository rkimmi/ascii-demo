const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

// from https://www.youtube.com/watch?v=HeT-5RZgEQY
// run server `python -m http.server`
let image;
let effect;
let selectedColor;

const colorToggle = document.getElementById("colorToggle");
const labelOriginal = document.getElementById("labelOriginal");
const labelSolid = document.getElementById("labelSolid");
const colorPicker = document.getElementById("colorPicker");

function updateColor() {
  const solid = colorToggle.checked;
  labelSolid.classList.toggle("active", solid);
  labelOriginal.classList.toggle("active", !solid);
  selectedColor = solid ? colorPicker.value : null;
  if (effect) handleSlider();
}

updateColor(); // sets initial label state

colorToggle.addEventListener("change", updateColor);
colorPicker.addEventListener("input", () => {
  colorToggle.checked = true; // choosing a color switches to solid mode
  updateColor();
});

// Add inputs to manually overwrite characters
const charInputsContainer = document.getElementById("charInputs");
const defaultChars = [...AsciiCore.DEFAULT_CHARS.values()];

function applyChars() {
  const next = [...charInputsContainer.querySelectorAll("input")].map(
    (el) => el.value,
  );
  AsciiCore.setSymbols(next);
  if (effect) handleSlider();
}

defaultChars.forEach((char) => {
  const input = document.createElement("input");
  input.type = "text";
  input.maxLength = 1;
  input.value = char;
  input.className = "charInput";
  input.addEventListener("input", applyChars);
  charInputsContainer.appendChild(input);
});

const slider = document.getElementById("cellSize");
const sliderLabel = document.getElementById("cellSizeLabel");

slider.addEventListener("change", handleSlider);

class AsciiEffect {
  #imageCellArray = [];
  #pixels = [];
  #ctx;
  #width;
  #height;
  constructor(ctx, width, height) {
    this.#ctx = ctx;
    this.#width = width;
    this.#height = height;
    this.#ctx.drawImage(image, 0, 0, this.#width, this.#height);
    this.#pixels = this.#ctx.getImageData(0, 0, this.#width, this.#height);
  }

  #scanImage(cellSize) {
    this.#imageCellArray = AsciiCore.scanImage(
      this.#pixels,
      cellSize,
      selectedColor,
    );
  }

  #drawAscii() {
    this.#ctx.clearRect(0, 0, this.#width, this.#height);
    for (let i = 0; i < this.#imageCellArray.length; i++) {
      const cell = this.#imageCellArray[i];
      this.#ctx.fillStyle = cell.color;
      this.#ctx.fillText(cell.symbol, cell.x, cell.y);
    }
  }
  draw(cellSize) {
    this.#scanImage(cellSize);
    this.#drawAscii();
  }
}

function handleSlider() {
  const sliderVal = parseInt(slider.value);
  if (sliderVal === 1) {
    sliderLabel.innerHTML = "Original image";
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  } else {
    sliderLabel.innerHTML = "Cell Size " + slider.value + " px";
    effect.draw(sliderVal);
  }
}

function setUpImage(imgSrc) {
  image = new Image();
  image.src = imgSrc;

  image.onload = () => {
    console.log("load img");
    loadImage();
  };

  image.onerror = (error) => {
    console.error("Error loading image:", error);
  };
}

const MAX_DIMENSION = 800; // px; large uploads are scaled down to fit

function loadImage() {
  const scale = Math.min(
    1,
    MAX_DIMENSION / image.width,
    MAX_DIMENSION / image.height,
  );
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  effect = new AsciiEffect(ctx, canvas.width, canvas.height);
  handleSlider(parseInt(slider.value));
}

function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    console.error("Not an image file:", file && file.type);
    return;
  }
  const reader = new FileReader();
  reader.onload = () => setUpImage(reader.result);
  reader.onerror = (error) => console.error("Error reading file:", error);
  reader.readAsDataURL(file);
}

// Prevent the browser from navigating to a file dropped anywhere on the page.
["dragover", "drop"].forEach((evt) =>
  window.addEventListener(evt, (e) => e.preventDefault()),
);

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");

dropZone.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => handleFile(fileInput.files[0]));

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  handleFile(e.dataTransfer.files[0]);
});

setUpImage("./images/0001.JPG");
