/**
 * Copy Frontend Build Output
 *
 * Copies the Next.js static export output (apps/frontend/out)
 * into the Electron renderer directory so it can be loaded
 * by BrowserWindow.loadFile() in production.
 *
 * This script runs before electron-forge make/package.
 */
const fs = require('fs');
const path = require('path');

const FRONTEND_OUT = path.resolve(__dirname, '..', '..', '..', 'apps', 'frontend', 'out');
const RENDERER_DIR = path.resolve(__dirname, '..', 'src', 'renderer');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`\n  ❌ Frontend build output not found at: ${src}`);
    console.error(`     Run "npm run build:frontend" first.\n`);
    process.exit(1);
  }

  // Clean the destination renderer directory (except keep a backup of the original index.html)
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      if (entry.name.endsWith('.html')) {
        let content = fs.readFileSync(srcPath, 'utf8');
        // Rewrite absolute links to next assets to make them relative for file:// protocol
        content = content.replace(/(href|src)="\/_next\//g, '$1="_next/');
        content = content.replace(/(href|src)="\/images\//g, '$1="images/');
        content = content.replace(/url\("\/_next\//g, 'url("_next/');
        fs.writeFileSync(destPath, content, 'utf8');
      } else if (entry.name.endsWith('.js') || entry.name.endsWith('.css')) {
        let content = fs.readFileSync(srcPath, 'utf8');
        content = content.replace(/\/_next\//g, '_next/');
        fs.writeFileSync(destPath, content, 'utf8');
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

console.log('📦 Copying Next.js frontend build into Electron renderer...');
console.log(`   Source: ${FRONTEND_OUT}`);
console.log(`   Dest:   ${RENDERER_DIR}`);

copyRecursive(FRONTEND_OUT, RENDERER_DIR);

console.log('✅ Frontend copied successfully.\n');
