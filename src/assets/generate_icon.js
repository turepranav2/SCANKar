const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size, outputPath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const radius = size * 0.22;

  // Blue gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, size);
  gradient.addColorStop(0, '#1D4ED8');
  gradient.addColorStop(1, '#2563EB');

  // Rounded rectangle
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // White document icon shape
  const docX = size * 0.28;
  const docY = size * 0.18;
  const docW = size * 0.44;
  const docH = size * 0.52;
  const foldSize = size * 0.12;

  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath();
  ctx.moveTo(docX, docY);
  ctx.lineTo(docX + docW - foldSize, docY);
  ctx.lineTo(docX + docW, docY + foldSize);
  ctx.lineTo(docX + docW, docY + docH);
  ctx.lineTo(docX, docY + docH);
  ctx.closePath();
  ctx.fill();

  // Fold triangle
  ctx.fillStyle = 'rgba(147,197,253,0.9)';
  ctx.beginPath();
  ctx.moveTo(docX + docW - foldSize, docY);
  ctx.lineTo(docX + docW, docY + foldSize);
  ctx.lineTo(docX + docW - foldSize, docY + foldSize);
  ctx.closePath();
  ctx.fill();

  // Text lines on document
  ctx.fillStyle = '#2563EB';
  const lineX = docX + size * 0.07;
  const lineW = docW - size * 0.14;
  const lineH = size * 0.035;
  const lineGap = size * 0.065;
  const startY = docY + size * 0.15;
  for (let i = 0; i < 4; i++) {
    const w = i === 3 ? lineW * 0.6 : lineW;
    ctx.fillRect(lineX, startY + i * lineGap, w, lineH);
  }

  // "SK" text at bottom
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${size * 0.18}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText('SK', size / 2, size * 0.88);

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Generated: ${outputPath} (${size}x${size})`);
}

// Also generate foreground-only icon for adaptive icons (108dp with 72dp safe zone)
function generateForeground(size, outputPath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Transparent background — only the foreground content
  // Adaptive icons use 108dp canvas with 72dp centered safe zone (66.67%)
  const safeOffset = size * 0.1667; // (108-72)/2 / 108
  const safeSize = size * 0.6667;

  // White document icon shape (centered in safe zone)
  const docX = safeOffset + safeSize * 0.22;
  const docY = safeOffset + safeSize * 0.10;
  const docW = safeSize * 0.56;
  const docH = safeSize * 0.52;
  const foldSize = safeSize * 0.14;

  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath();
  ctx.moveTo(docX, docY);
  ctx.lineTo(docX + docW - foldSize, docY);
  ctx.lineTo(docX + docW, docY + foldSize);
  ctx.lineTo(docX + docW, docY + docH);
  ctx.lineTo(docX, docY + docH);
  ctx.closePath();
  ctx.fill();

  // Fold triangle
  ctx.fillStyle = 'rgba(147,197,253,0.9)';
  ctx.beginPath();
  ctx.moveTo(docX + docW - foldSize, docY);
  ctx.lineTo(docX + docW, docY + foldSize);
  ctx.lineTo(docX + docW - foldSize, docY + foldSize);
  ctx.closePath();
  ctx.fill();

  // Text lines on document
  ctx.fillStyle = '#2563EB';
  const lineX = docX + safeSize * 0.08;
  const lineW = docW - safeSize * 0.16;
  const lineH = safeSize * 0.035;
  const lineGap = safeSize * 0.065;
  const startY = docY + safeSize * 0.14;
  for (let i = 0; i < 4; i++) {
    const w = i === 3 ? lineW * 0.6 : lineW;
    ctx.fillRect(lineX, startY + i * lineGap, w, lineH);
  }

  // "SK" text below document
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${safeSize * 0.22}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText('SK', size / 2, safeOffset + safeSize * 0.88);

  const buffer = canvas.toBuffer('image/png');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Generated foreground: ${outputPath} (${size}x${size})`);
}

// Android icon sizes
const androidIcons = [
  { size: 48,  fgSize: 108, dir: 'mipmap-mdpi' },
  { size: 72,  fgSize: 162, dir: 'mipmap-hdpi' },
  { size: 96,  fgSize: 216, dir: 'mipmap-xhdpi' },
  { size: 144, fgSize: 324, dir: 'mipmap-xxhdpi' },
  { size: 192, fgSize: 432, dir: 'mipmap-xxxhdpi' },
];

const resDir = path.join(__dirname, '..', '..', 'android', 'app', 'src', 'main', 'res');

for (const { size, fgSize, dir } of androidIcons) {
  generateIcon(size, path.join(resDir, dir, 'ic_launcher.png'));
  generateIcon(size, path.join(resDir, dir, 'ic_launcher_round.png'));
  generateForeground(fgSize, path.join(resDir, dir, 'ic_launcher_foreground.png'));
}

// Also generate 1024x1024 for Play Store
const distDir = path.join(__dirname, '..', '..', 'distribution');
generateIcon(1024, path.join(distDir, 'icon-1024.png'));
console.log('\n✅ All icons generated!');
