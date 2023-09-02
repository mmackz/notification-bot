const sharp = require("sharp");

async function svgToPng(url) {
   const response = await fetch(url);
   const svgData = await response.text();
   const pngBuffer = await sharp(Buffer.from(svgData)).png().toBuffer();
   return pngBuffer;
}

module.exports = svgToPng;
