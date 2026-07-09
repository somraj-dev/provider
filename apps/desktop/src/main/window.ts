/**
 * Window Management
 *
 * Creates and configures the main application window.
 */
import { BrowserWindow, app } from 'electron';
import path from 'path';
import fs from 'fs';

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;
declare const MAIN_WINDOW_PRELOAD_VITE_ENTRY: string;

export function createMainWindow(): BrowserWindow {
  // Resolve preload path - try multiple known locations
  let preloadPath: string | undefined;

  // 1. Try the Vite-injected constant (works in dev)
  if (typeof MAIN_WINDOW_PRELOAD_VITE_ENTRY !== 'undefined') {
    preloadPath = MAIN_WINDOW_PRELOAD_VITE_ENTRY;
  }

  // 2. Try common production paths relative to __dirname
  if (!preloadPath || !fs.existsSync(preloadPath)) {
    const candidates = [
      path.join(__dirname, 'preload.js'),
      path.join(__dirname, '..', 'preload', 'index.js'),
      path.join(__dirname, '..', '.vite', 'build', 'preload.js'),
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        preloadPath = candidate;
        break;
      }
    }
  }

  const webPrefs: Electron.WebPreferences = {
    contextIsolation: true,
    nodeIntegration: false,
  };

  // Only set preload if we found a valid file
  if (preloadPath && fs.existsSync(preloadPath)) {
    webPrefs.preload = preloadPath;
    webPrefs.sandbox = true;
  }

  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    title: 'AxioVital Provider',
    webPreferences: webPrefs,
    // TODO: Set application icon
    // icon: path.join(__dirname, '..', '..', 'resources', 'icons', 'icon.png'),
  });

  // Load content based on environment
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    // Development: load from Vite dev server or Next.js dev server
    const devUrl = process.env.ELECTRON_DEV_URL || MAIN_WINDOW_VITE_DEV_SERVER_URL;
    mainWindow.loadURL(devUrl);
  } else {
    // Production: try multiple renderer paths
    const rendererCandidates = [
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      path.join(__dirname, '../renderer/main_window/index.html'),
      path.join(__dirname, '../renderer/index.html'),
      path.join(app.getAppPath(), 'src', 'renderer', 'index.html'),
      path.join(app.getAppPath(), 'renderer', 'index.html'),
    ];

    let loaded = false;
    for (const candidate of rendererCandidates) {
      if (fs.existsSync(candidate)) {
        mainWindow.loadFile(candidate);
        loaded = true;
        break;
      }
    }

    if (!loaded) {
      // Last resort: show a diagnostic page with path info
      mainWindow.loadURL(`data:text/html,
        <html><body style="font-family:sans-serif;padding:40px;background:#1a1a2e;color:#eee">
          <h2>AxioVital - Renderer Not Found</h2>
          <p>Could not find index.html in any expected location:</p>
          <ul>${rendererCandidates.map(c => `<li>${c}</li>`).join('')}</ul>
          <p><b>__dirname:</b> ${__dirname}</p>
          <p><b>app.getAppPath():</b> ${app.getAppPath()}</p>
        </body></html>
      `);
    }
  }

  // Open DevTools for debugging (remove for final release)
  mainWindow.webContents.openDevTools();

  return mainWindow;
}
