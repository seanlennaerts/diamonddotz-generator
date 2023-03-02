import "regenerator-runtime/runtime";

const form = document.getElementById("form");
form.addEventListener("change", handleFormUpdate);

async function handleFormUpdate() {
  const formData = new FormData(this);
  let { image, size } = Object.fromEntries(formData.entries());
  const [targetWidth, targetHeight] = size.split("x").map(Number);

  if (image.size === 0) return;
  const imageEl = document.getElementById("img");
  await loadImage(imageEl, URL.createObjectURL(image));

  const pixelatedImage = pixelateImage(imageEl, targetWidth, targetHeight);
  imageEl.src = pixelatedImage;
}

function loadImage(imageElement, imageFile) {
  return new Promise((resolve) => {
    imageElement.addEventListener("load", () => resolve());
    imageElement.src = imageFile;
  });
}

const COLOR_LEGEND = {};

function pixelateImage(image, targetWidth, targetHeight) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const originalWidth = image.width;
  const originalHeight = image.height;
  canvas.width = originalWidth;
  canvas.height = originalHeight;
  ctx.drawImage(image, 0, 0, originalWidth, originalHeight);
  const imageData = ctx.getImageData(0, 0, originalWidth, originalHeight).data;

  // check if image is landscape
  if (originalWidth > originalHeight) {
    [targetWidth, targetHeight] = [targetHeight, targetWidth];
  }

  const factor = Math.ceil(originalWidth / targetWidth);
  console.log(factor);

  if (factor < 2) return;
  // draw borders
  canvas.width = targetWidth * factor;
  canvas.height = targetHeight * factor;
  ctx.strokeStyle = "red";
  ctx.rect(0, 0, targetWidth * factor, targetHeight * factor);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${factor}px monospace`;

  for (let y = 0; y < originalHeight; y += factor) {
    for (let x = 0; x < originalWidth; x += factor) {
      const pixelIndex = (x + y * originalWidth) * 4;
      const originalColor = imageData.slice(pixelIndex, pixelIndex + 3);
      let minDelta = 100;
      let selectedColor = COLORS[0];
      for (const color of COLORS) {
        const delta = deltaE(originalColor, color.rgb);
        if (delta < minDelta) {
          minDelta = delta;
          selectedColor = color;
        }
      }
      // TODO: use color.code
      if (!COLOR_LEGEND[selectedColor.rgb.join(",")]) {
        COLOR_LEGEND[selectedColor.rgb.join(",")] = 0;
      }
      COLOR_LEGEND[selectedColor.rgb.join(",")]++;

      ctx.fillStyle = `rgb(${selectedColor.rgb.join(",")})`;
      ctx.fillRect(x, y, factor, factor);
      ctx.fillStyle = "white";

      // ctx.fillText(selectedColor.symbol, x + factor / 2, y + factor / 2);
    }
  }
  console.log(COLOR_LEGEND);
  return canvas.toDataURL();
}

function deltaE(rgbA, rgbB) {
  let labA = rgb2lab(rgbA);
  let labB = rgb2lab(rgbB);
  let deltaL = labA[0] - labB[0];
  let deltaA = labA[1] - labB[1];
  let deltaB = labA[2] - labB[2];
  let c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
  let c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
  let deltaC = c1 - c2;
  let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
  let sc = 1.0 + 0.045 * c1;
  let sh = 1.0 + 0.015 * c1;
  let deltaLKlsl = deltaL / 1.0;
  let deltaCkcsc = deltaC / sc;
  let deltaHkhsh = deltaH / sh;
  let i =
    deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
  return i < 0 ? 0 : Math.sqrt(i);
}

function rgb2lab(rgb) {
  let r = rgb[0] / 255,
    g = rgb[1] / 255,
    b = rgb[2] / 255,
    x,
    y,
    z;
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

const COLORS = [
  { code: "", rgb: [102, 125, 150], symbol: "A" },
  { code: "", rgb: [155, 114, 49], symbol: "B" },
  { code: "", rgb: [156, 200, 159], symbol: "C" },
  { code: "", rgb: [208, 194, 151], symbol: "D" },
  { code: "", rgb: [72, 58, 137], symbol: "E" },
  { code: "", rgb: [135, 151, 168], symbol: "F" },
  { code: "", rgb: [226, 189, 114], symbol: "G" },
  { code: "", rgb: [134, 134, 139], symbol: "H" },
  { code: "", rgb: [166, 60, 44], symbol: "I" },
  { code: "", rgb: [236, 151, 119], symbol: "J" },
  { code: "", rgb: [188, 118, 99], symbol: "K" },
  { code: "", rgb: [124, 125, 134], symbol: "L" },
  { code: "", rgb: [165, 165, 161], symbol: "M" },
  { code: "", rgb: [72, 40, 34], symbol: "N" },
  { code: "", rgb: [25, 40, 63], symbol: "O" },
  { code: "", rgb: [64, 63, 68], symbol: "P" },
  { code: "", rgb: [89, 89, 99], symbol: "Q" },
  { code: "", rgb: [151, 94, 88], symbol: "R" },
  { code: "", rgb: [52, 45, 41], symbol: "S" },
  { code: "", rgb: [55, 81, 77], symbol: "U" },
  { code: "", rgb: [116, 181, 138], symbol: "T" },
  { code: "", rgb: [71, 132, 144], symbol: "V" },
  { code: "", rgb: [58, 55, 41], symbol: "X" },
  { code: "", rgb: [218, 146, 123], symbol: "Y" },
  { code: "", rgb: [77, 76, 85], symbol: "Z" },
  { code: "", rgb: [205, 81, 51], symbol: "0" },
  { code: "", rgb: [150, 119, 124], symbol: "1" },
  { code: "", rgb: [209, 164, 24], symbol: "2" },
  { code: "", rgb: [107, 75, 81], symbol: "3" },
  { code: "", rgb: [100, 67, 70], symbol: "4" },
  { code: "", rgb: [214, 170, 148], symbol: "5" },
  { code: "", rgb: [120, 132, 118], symbol: "6" },
  { code: "", rgb: [205, 134, 96], symbol: "7" },
  { code: "", rgb: [69, 62, 58], symbol: "8" },
  { code: "", rgb: [237, 167, 21], symbol: "9" },
  { code: "", rgb: [223, 159, 113], symbol: "k" },
  { code: "", rgb: [207, 77, 44], symbol: "l" },
  { code: "", rgb: [155, 142, 144], symbol: "m" },
  { code: "", rgb: [115, 134, 159], symbol: "n" },
  { code: "", rgb: [124, 125, 134], symbol: "!" },
  { code: "", rgb: [134, 134, 139], symbol: "@" },
  { code: "", rgb: [52, 77, 110], symbol: "#" },
  { code: "", rgb: [89, 111, 136], symbol: "$" },
  { code: "", rgb: [157, 33, 51], symbol: "%" },
  { code: "", rgb: [89, 89, 99], symbol: "^" },
  { code: "", rgb: [135, 41, 47], symbol: "&" },
  { code: "", rgb: [249, 163, 38], symbol: "*" },
  { code: "", rgb: [238, 188, 112], symbol: "(" },
  { code: "", rgb: [214, 108, 64], symbol: ")" },
  { code: "", rgb: [57, 76, 84], symbol: "-" },
  { code: "", rgb: [33, 33, 38], symbol: "+" },
  { code: "", rgb: [76, 116, 66], symbol: "=" },
  { code: "", rgb: [128, 157, 81], symbol: "<" },
  { code: "", rgb: [45, 74, 50], symbol: ">" },
  { code: "", rgb: [48, 85, 44], symbol: "?" },
  { code: "", rgb: [90, 64, 143], symbol: "a" },
  { code: "", rgb: [118, 88, 164], symbol: "a" },
  { code: "", rgb: [52, 126, 182], symbol: "a" },
  { code: "", rgb: [103, 116, 35], symbol: "a" },
  { code: "", rgb: [33, 33, 38], symbol: "a" },
  { code: "", rgb: [99, 103, 43], symbol: "a" },
  { code: "", rgb: [15, 85, 152], symbol: "a" },
  { code: "", rgb: [25, 40, 63], symbol: "a" },
  { code: "", rgb: [18, 65, 133], symbol: "a" },
  { code: "", rgb: [72, 40, 34], symbol: "a" },
  { code: "", rgb: [100, 67, 70], symbol: "a" },
  { code: "", rgb: [51, 134, 124], symbol: "a" },
  { code: "", rgb: [76, 53, 46], symbol: "a" },
  { code: "", rgb: [68, 88, 84], symbol: "a" },
  { code: "", rgb: [95, 84, 69], symbol: "a" },
  { code: "", rgb: [127, 109, 118], symbol: "a" },
  { code: "", rgb: [106, 85, 45], symbol: "a" },
  { code: "", rgb: [182, 145, 66], symbol: "a" },
  { code: "", rgb: [237, 167, 21], symbol: "a" },
  { code: "", rgb: [245, 111, 40], symbol: "a" },
  { code: "", rgb: [210, 174, 88], symbol: "a" },
  { code: "", rgb: [236, 194, 91], symbol: "a" },
  { code: "", rgb: [229, 182, 22], symbol: "a" },
  { code: "", rgb: [242, 146, 41], symbol: "a" },
  { code: "", rgb: [210, 134, 80], symbol: "a" },
  { code: "", rgb: [186, 82, 69], symbol: "a" },
  { code: "", rgb: [58, 55, 41], symbol: "a" },
  { code: "", rgb: [166, 100, 68], symbol: "a" },
  { code: "", rgb: [90, 36, 39], symbol: "a" },
  { code: "", rgb: [159, 135, 30], symbol: "a" },
  { code: "", rgb: [98, 124, 118], symbol: "a" },
  { code: "", rgb: [139, 102, 87], symbol: "a" },
  { code: "", rgb: [122, 66, 58], symbol: "a" },
  { code: "", rgb: [150, 114, 100], symbol: "a" },
  { code: "", rgb: [68, 69, 51], symbol: "a" },
  { code: "", rgb: [212, 180, 161], symbol: "a" },
  { code: "", rgb: [227, 177, 154], symbol: "a" },
  { code: "", rgb: [147, 128, 135], symbol: "a" },
  { code: "", rgb: [203, 153, 124], symbol: "a" },
  { code: "", rgb: [103, 116, 35], symbol: "a" },
  { code: "", rgb: [169, 104, 44], symbol: "a" },
  { code: "", rgb: [228, 142, 57], symbol: "a" },
  { code: "", rgb: [191, 116, 46], symbol: "a" },
  { code: "", rgb: [93, 95, 94], symbol: "a" },
  { code: "", rgb: [144, 120, 91], symbol: "a" },
  { code: "", rgb: [240, 186, 99], symbol: "a" },
  { code: "", rgb: [233, 168, 36], symbol: "a" },
  { code: "", rgb: [33, 33, 38], symbol: "a" },
  { code: "", rgb: [87, 47, 40], symbol: "a" },
  { code: "", rgb: [77, 76, 85], symbol: "a" },
  { code: "", rgb: [238, 188, 112], symbol: "a" },
  { code: "", rgb: [143, 17, 31], symbol: "a" },
  { code: "", rgb: [207, 77, 44], symbol: "a" },
];
