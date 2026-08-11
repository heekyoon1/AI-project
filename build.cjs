const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'dist');
const staticFiles = ['index.html', 'styles.css', 'script.js', 'favicon.svg'];

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for (const file of staticFiles) {
  fs.copyFileSync(path.join(__dirname, file), path.join(outputDir, file));
}

console.log(`Built ${staticFiles.length} static files into dist/`);
