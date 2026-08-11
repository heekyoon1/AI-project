const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'dist');
const staticFiles = ['index.html', 'styles.css', 'supabase-ui.css', 'script.js', 'supabase-config.js', 'favicon.svg'];

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for (const file of staticFiles) {
  fs.copyFileSync(path.join(__dirname, file), path.join(outputDir, file));
}

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (supabaseUrl && supabaseAnonKey) {
  const config = `window.SUPABASE_CONFIG = ${JSON.stringify({ url: supabaseUrl, anonKey: supabaseAnonKey })};\n`;
  fs.writeFileSync(path.join(outputDir, 'supabase-config.js'), config, 'utf8');
}

console.log(`Built ${staticFiles.length} static files into dist/`);
