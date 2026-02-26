const sharp = require("sharp");

function makeSVG(size) {
  const r = Math.round(size * 0.22);
  const fs = Math.round(size * 0.45);
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#8b7355"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="${fs}" font-family="Arial">📔</text>
</svg>`
  );
}

Promise.all([
  sharp(makeSVG(192)).png().toFile("public/icons/icon-192.png"),
  sharp(makeSVG(512)).png().toFile("public/icons/icon-512.png"),
])
  .then(() => console.log("Icons created!"))
  .catch((e) => console.error(e));
