const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, "../data/emojis.json");

function readDataFile() {
  const data = fs.readFileSync(file, 'utf8');
  return JSON.parse(data);
}

function writeDataFile(data) {
  const jsonData = JSON.stringify(data, null, 4);
  fs.writeFileSync(file, jsonData, 'utf8');
}

module.exports = {
   read: readDataFile,
   write: writeDataFile
};