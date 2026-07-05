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
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('📦 Copying Next.js frontend build into Electron renderer...');
console.log(`   Source: ${FRONTEND_OUT}`);
console.log(`   Dest:   ${RENDERER_DIR}`);

copyRecursive(FRONTEND_OUT, RENDERER_DIR);

console.log('✅ Frontend copied successfully.\n');
