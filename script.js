const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

// from https://www.youtube.com/watch?v=HeT-5RZgEQY
// run server `python -m http.server`
let image;
let effect;
let selectedColor;

function selectColor() {
   const colorElem = document.getElementById('colorPicker');
   selectedColor = colorElem.value;
   const sliderVal = parseInt(slider.value);
   effect.draw(sliderVal, true);
}

const slider = document.getElementById('resolution');
const sliderLabel = document.getElementById('resolutionLabel')

slider.addEventListener('change', handleSlider);

class Cell {
    constructor(x, y, symbol, color) {
        this.x = x;
        this.y = y;
        this.symbol = symbol;
        this.color = color;
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillText(this.symbol, this.x, this.y)
    }
}
class AsciiEffect {
    #imageCellArray = [];
    #pixels = [];
    #ctx;
    #width;
    #height;
    constructor(ctx, width, height) {
        this.#ctx = ctx;
        this.#width = width;
        this.#height = height
        this.#ctx.drawImage(image, 0, 0, this.#width, this.#height)
        this.#pixels = this.#ctx.getImageData(0, 0, this.#width, this.#height)
    }
    
    #convertToSymbol(g) {
        if (g > 250) return '*';
        else if (g > 240) return '#';
        else if (g > 220) return '@';
        else if (g > 200) return '&';
        else if (g > 180) return '%';
        else if (g > 160) return '}';
        else if (g > 140) return '$';
        else if (g > 120) return '=';
        else if (g > 100) return '(';
        else if (g > 80) return '^';
        else if (g > 60) return ':';
        else if (g > 40) return '?';
        else if (g > 20) return '~';
        else return '';
    }
    #scanImage(cellSize, excludeTransparent = false) {
        this.#imageCellArray = [];
        for (let y = 0; y < this.#pixels.height; y += cellSize) {
            for (let x = 0; x < this.#pixels.width; x+= cellSize) {
                const posX = x * 4; // every px has 4 values for rgba
                const posY = y * 4;
                const pos = (posY * this.#pixels.width) + posX;
                
                if (this.#pixels.data[pos + 3] > 128) { // check a in rgba for transparency
                    const red = this.#pixels.data[pos];
                    const green = this.#pixels.data[pos + 1];
                    const blue = this.#pixels.data[pos + 2];
                    const total = red + green + blue;
                    const avgColorVal = total / 3;
                    const color = selectedColor ? selectedColor : `rgb(${red},${green},${blue})`
                    const symbol = this.#convertToSymbol(avgColorVal);
                    if (total > 200) { // exclude transparent
                        this.#imageCellArray.push(new Cell(x, y, symbol, color));
                    }
                }
            }
        }
        console.log(this.#imageCellArray);
    }
    
    #drawAscii() {
        this.#ctx.clearRect(0, 0, this.#width, this.#height)
        for (let i = 0; i < this.#imageCellArray.length; i++) {
            this.#imageCellArray[i].draw(this.#ctx)
        }   
    }
    draw(cellSize) {
        this.#scanImage(cellSize)
        this.#drawAscii();
    }
}

function handleSlider() {
    const sliderVal = parseInt(slider.value);
    if (sliderVal === 1) {
        sliderLabel.innerHTML = "Original image";
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    } else {
        sliderLabel.innerHTML = "Resolution " + slider.value + " px";
        effect.draw(sliderVal);
    }
}

function setUpImage(imgSrc) {
    image = new Image();
    image.src = imgSrc;
    
    image.onload = () => {
        loadImage();
    };

    image.onerror = (error) => {
        console.error('Error loading image:', error);
    };
}

function loadImage() {
    canvas.height = image.height;
    canvas.width = image.width;

    effect = new AsciiEffect(ctx, image.width, image.height);
    handleSlider(parseInt(slider.value));
}

function handleUploadImage() {
    const imgSrcElem = document.getElementById('imageUpload');
    setUpImage(imgSrcElem.value.trim());
}

setUpImage('./images/angel-logo.png');

