import './styles.less';

const GRID_SIZE = 8;
const PIXEL_SIZE = 48;
const CANVAS_SIZE = GRID_SIZE * PIXEL_SIZE;

let pixelData = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
let currentChar = 'A';
let isDrawing = false;
let currentDrawValue = true;
let fontData = {};

const pixelCanvas = document.getElementById('pixelCanvas');
const previewCanvas = document.getElementById('previewCanvas');
const charInput = document.getElementById('charInput');
const clearBtn = document.getElementById('clearBtn');
const fillBtn = document.getElementById('fillBtn');
const invertBtn = document.getElementById('invertBtn');
const outputData = document.getElementById('outputData');
const exportBtn = document.getElementById('exportBtn');
const charGrid = document.getElementById('charGrid');
const exportBMFontBtn = document.getElementById('exportBMFontBtn');
const exportSVGBtn = document.getElementById('exportSVGBtn');

const pixelCtx = pixelCanvas.getContext('2d');
const previewCtx = previewCanvas.getContext('2d');

function initDefaultChars() {
  const defaultChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let c of defaultChars) {
    fontData[c] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
  }
}

function drawGrid() {
  pixelCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const px = x * PIXEL_SIZE;
      const py = y * PIXEL_SIZE;
      
      pixelCtx.fillStyle = pixelData[y][x] ? '#4a90d9' : '#2d2d44';
      pixelCtx.fillRect(px, py, PIXEL_SIZE - 1, PIXEL_SIZE - 1);
    }
  }
}

function drawPreview() {
  const previewPixelSize = 8;
  previewCtx.clearRect(0, 0, 64, 64);
  
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const px = x * previewPixelSize;
      const py = y * previewPixelSize;
      
      previewCtx.fillStyle = pixelData[y][x] ? '#4a90d9' : '#000000';
      previewCtx.fillRect(px, py, previewPixelSize, previewPixelSize);
    }
  }
}

function updateOutput() {
  let output = `// Character: ${currentChar}\n`;
  output += `// 8x8 Pixel Font Data\n\n`;
  output += `const ${currentChar}_data = [\n`;
  
  for (let y = 0; y < GRID_SIZE; y++) {
    let row = '  0b';
    for (let x = 0; x < GRID_SIZE; x++) {
      row += pixelData[y][x] ? '1' : '0';
    }
    row += y < GRID_SIZE - 1 ? ',' : '';
    output += row + '\n';
  }
  
  output += '];\n\n';
  output += '/* Hex format:\n';
  for (let y = 0; y < GRID_SIZE; y++) {
    let hexValue = 0;
    for (let x = 0; x < GRID_SIZE; x++) {
      hexValue = (hexValue << 1) | (pixelData[y][x] ? 1 : 0);
    }
    output += '  0x' + hexValue.toString(16).padStart(2, '0').toUpperCase();
    if (y < GRID_SIZE - 1) output += ',';
    output += '\n';
  }
  output += '*/';
  
  outputData.value = output;
}

function saveCurrentChar() {
  fontData[currentChar] = pixelData.map(row => [...row]);
}

function loadChar(c) {
  if (fontData[c]) {
    pixelData = fontData[c].map(row => [...row]);
  } else {
    pixelData = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
  }
  currentChar = c;
  charInput.value = c;
  drawGrid();
  drawPreview();
  updateOutput();
}

function togglePixel(x, y, value) {
  if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
    pixelData[y][x] = value;
    drawGrid();
    drawPreview();
    updateOutput();
  }
}

function getCanvasCoords(e) {
  const rect = pixelCanvas.getBoundingClientRect();
  const scaleX = pixelCanvas.width / rect.width;
  const scaleY = pixelCanvas.height / rect.height;
  
  const x = Math.floor((e.clientX - rect.left) * scaleX / PIXEL_SIZE);
  const y = Math.floor((e.clientY - rect.top) * scaleY / PIXEL_SIZE);
  
  return { x, y };
}

pixelCanvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  const { x, y } = getCanvasCoords(e);
  currentDrawValue = !pixelData[y][x];
  togglePixel(x, y, currentDrawValue);
});

pixelCanvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  const { x, y } = getCanvasCoords(e);
  togglePixel(x, y, currentDrawValue);
});

pixelCanvas.addEventListener('mouseup', () => {
  isDrawing = false;
  saveCurrentChar();
  renderCharGrid();
});

pixelCanvas.addEventListener('mouseleave', () => {
  isDrawing = false;
});

charInput.addEventListener('input', (e) => {
  const newChar = e.target.value.toUpperCase();
  if (newChar) {
    saveCurrentChar();
    loadChar(newChar);
    renderCharGrid();
  }
});

clearBtn.addEventListener('click', () => {
  pixelData = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
  drawGrid();
  drawPreview();
  updateOutput();
  saveCurrentChar();
  renderCharGrid();
});

fillBtn.addEventListener('click', () => {
  pixelData = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(true));
  drawGrid();
  drawPreview();
  updateOutput();
  saveCurrentChar();
  renderCharGrid();
});

invertBtn.addEventListener('click', () => {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      pixelData[y][x] = !pixelData[y][x];
    }
  }
  drawGrid();
  drawPreview();
  updateOutput();
  saveCurrentChar();
  renderCharGrid();
});

exportBtn.addEventListener('click', () => {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = GRID_SIZE;
  exportCanvas.height = GRID_SIZE;
  const ctx = exportCanvas.getContext('2d');
  
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      ctx.fillStyle = pixelData[y][x] ? '#ffffff' : '#000000';
      ctx.fillRect(x, y, 1, 1);
    }
  }
  
  const link = document.createElement('a');
  link.download = `pixel-font-${currentChar}.png`;
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
});

function renderCharGrid() {
  charGrid.innerHTML = '';
  
  for (let c in fontData) {
    const charItem = document.createElement('div');
    charItem.className = 'char-item';
    
    const miniCanvas = document.createElement('canvas');
    miniCanvas.width = 8;
    miniCanvas.height = 8;
    const miniCtx = miniCanvas.getContext('2d');
    
    const charPixelData = fontData[c];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        miniCtx.fillStyle = charPixelData[y][x] ? '#4a90d9' : '#000000';
        miniCtx.fillRect(x, y, 1, 1);
      }
    }
    
    const label = document.createElement('span');
    label.textContent = c;
    
    charItem.appendChild(miniCanvas);
    charItem.appendChild(label);
    
    charItem.addEventListener('click', () => {
      saveCurrentChar();
      loadChar(c);
      renderCharGrid();
    });
    
    charGrid.appendChild(charItem);
  }
}

function createBMFontTexture() {
  const chars = Object.keys(fontData);
  const charsPerRow = Math.ceil(Math.sqrt(chars.length));
  const pixelScale = 8;
  const charSize = GRID_SIZE * pixelScale;
  const padding = 2;
  
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = charsPerRow * (charSize + padding);
  textureCanvas.height = Math.ceil(chars.length / charsPerRow) * (charSize + padding);
  const ctx = textureCanvas.getContext('2d');
  
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, textureCanvas.width, textureCanvas.height);
  
  const charPositions = {};
  
  chars.forEach((char, index) => {
    const row = Math.floor(index / charsPerRow);
    const col = index % charsPerRow;
    const x = col * (charSize + padding);
    const y = row * (charSize + padding);
    
    charPositions[char] = { x, y, width: charSize, height: charSize };
    
    const charPixelData = fontData[char];
    for (let py = 0; py < GRID_SIZE; py++) {
      for (let px = 0; px < GRID_SIZE; px++) {
        if (charPixelData[py][px]) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + px * pixelScale, y + py * pixelScale, pixelScale, pixelScale);
        }
      }
    }
  });
  
  return { textureCanvas, charPositions, charSize, chars };
}

function exportBMFont() {
  const { textureCanvas, charPositions, charSize, chars } = createBMFontTexture();
  const fontSize = 8;
  const lineHeight = 10;
  
  let fntContent = '';
  fntContent += `info face="PixelFont8x8" size=${fontSize} bold=0 italic=0 charset="" unicode=1 stretchH=100 smooth=0 aa=1 padding=0,0,0,0 spacing=1,1 outline=0\n`;
  fntContent += `common lineHeight=${lineHeight} base=8 scaleW=${textureCanvas.width} scaleH=${textureCanvas.height} pages=1 packed=0 alphaChnl=0 redChnl=4 greenChnl=4 blueChnl=4\n`;
  fntContent += `page id=0 file="pixel-font.png"\n`;
  fntContent += `chars count=${chars.length}\n`;
  
  chars.forEach((char) => {
    const pos = charPositions[char];
    const charCode = char.charCodeAt(0);
    fntContent += `char id=${charCode} x=${pos.x} y=${pos.y} width=${pos.width} height=${pos.height} xoffset=0 yoffset=0 xadvance=8 page=0 chnl=15\n`;
  });
  
  const fntBlob = new Blob([fntContent], { type: 'text/plain' });
  const fntUrl = URL.createObjectURL(fntBlob);
  const fntLink = document.createElement('a');
  fntLink.href = fntUrl;
  fntLink.download = 'pixel-font.fnt';
  fntLink.click();
  URL.revokeObjectURL(fntUrl);
  
  textureCanvas.toBlob((pngBlob) => {
    const pngUrl = URL.createObjectURL(pngBlob);
    const pngLink = document.createElement('a');
    pngLink.href = pngUrl;
    pngLink.download = 'pixel-font.png';
    pngLink.click();
    URL.revokeObjectURL(pngUrl);
  }, 'image/png');
}

function exportSVGFont() {
  const chars = Object.keys(fontData);
  
  function createFontSVG() {
    let svgContent = `<?xml version="1.0" standalone="no"?>\n`;
    svgContent += `<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n`;
    svgContent += `<svg xmlns="http://www.w3.org/2000/svg">\n`;
    svgContent += `<defs>\n`;
    svgContent += `<font id="PixelFont8x8" horiz-adv-x="800">\n`;
    svgContent += `<font-face font-family="PixelFont8x8" units-per-em="1000" ascent="800" descent="200" />\n`;
    svgContent += `<missing-glyph horiz-adv-x="800" d="" />\n`;
    
    chars.forEach((char) => {
      const charPixelData = fontData[char];
      let pathData = '';
      
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          if (charPixelData[y][x]) {
            const px = x * 100;
            const py = 700 - y * 100;
            pathData += `M${px},${py} l100,0 l0,-100 l-100,0 z `;
          }
        }
      }
      
      svgContent += `<glyph unicode="${char}" horiz-adv-x="800" d="${pathData}" />\n`;
    });
    
    svgContent += `</font>\n`;
    svgContent += `</defs>\n`;
    svgContent += `</svg>\n`;
    
    return svgContent;
  }
  
  const svgContent = createFontSVG();
  
  const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
  const svgUrl = URL.createObjectURL(svgBlob);
  const svgLink = document.createElement('a');
  svgLink.href = svgUrl;
  svgLink.download = 'pixel-font.svg';
  svgLink.click();
  URL.revokeObjectURL(svgUrl);
  
  const allData = {};
  chars.forEach(char => {
    allData[char] = fontData[char].map(row => {
      let val = 0;
      row.forEach((pixel, i) => {
        val |= (pixel ? 1 : 0) << (7 - i);
      });
      return '0x' + val.toString(16).padStart(2, '0').toUpperCase();
    });
  });
  
  const jsonContent = JSON.stringify({
    name: 'PixelFont8x8',
    size: 8,
    chars: allData
  }, null, 2);
  
  const jsonBlob = new Blob([jsonContent], { type: 'application/json' });
  const jsonUrl = URL.createObjectURL(jsonBlob);
  const jsonLink = document.createElement('a');
  jsonLink.href = jsonUrl;
  jsonLink.download = 'pixel-font.json';
  jsonLink.click();
  URL.revokeObjectURL(jsonUrl);
}

exportBMFontBtn.addEventListener('click', exportBMFont);
exportSVGBtn.addEventListener('click', exportSVGFont);

function init() {
  initDefaultChars();
  loadChar('A');
  renderCharGrid();
}

init();
