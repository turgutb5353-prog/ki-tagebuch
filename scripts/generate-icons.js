const fs = require("fs");
const path = require("path");

// Generate SVG icon for Spura
function generateSVG(size) {
  const fontSize = Math.round(size * 0.45);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="#8b7355"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="${fontSize}" font-family="system-ui, -apple-system, sans-serif">📔</text>
</svg>`;
}

// Write SVGs (we'll use them directly for now)
const iconsDir = path.join(__dirname, "../public/icons");

fs.writeFileSync(path.join(iconsDir, "icon-192.svg"), generateSVG(192));
fs.writeFileSync(path.join(iconsDir, "icon-512.svg"), generateSVG(512));

console.log("SVG icons generated in public/icons/");
