const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const openDivs = (html.match(/<div(\s|>)/gi) || []).length;
const closeDivs = (html.match(/<\/div>/gi) || []).length;

console.log(`Open divs: ${openDivs} Close divs: ${closeDivs} Balanced: ${openDivs === closeDivs}`);
if (openDivs !== closeDivs) {
  process.exit(1);
}
