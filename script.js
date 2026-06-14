const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

// from https://www.youtube.com/watch?v=HeT-5RZgEQY
// run server `python -m http.server`
let image;
let effect;
let selectedColor;

function selectColor() {
  const colorElem = document.getElementById("colorPicker");
  selectedColor = colorElem.value;
  const sliderVal = parseInt(slider.value);
  effect.draw(sliderVal, true);
}

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
    sliderLabel.innerHTML = "cellSize " + slider.value + " px";
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

function loadImage() {
  canvas.height = image.height;
  canvas.width = image.width;

  effect = new AsciiEffect(ctx, image.width, image.height);
  handleSlider(parseInt(slider.value));
}

function handleUploadImage() {
  const imgSrcElem = document.getElementById("imageUpload");
  setUpImage(imgSrcElem.value.trim());
}

setUpImage("./images/0001.JPG");
