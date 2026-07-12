const fs = require('fs');
const path = require('path');

const paperPath = path.resolve(__dirname, '..', 'chrome-extension', 'paper-core.min.js');
const exportStatement = '\nwindow.paper = paper;\n';
const source = fs.readFileSync(paperPath, 'utf8');

if (!source.includes(exportStatement.trim())) {
  fs.writeFileSync(paperPath, source.trimEnd() + exportStatement, 'utf8');
}
