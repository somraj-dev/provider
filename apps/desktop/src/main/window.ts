/**
 * Window Management
 *
 * Creates and configures the main application window.
 */
import { BrowserWindow } from 'electron';
import path from 'path';

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;
declare const MAIN_WINDOW_PRELOAD_VITE_ENTRY: string;


export function createMainWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    title: 'AxioVital Provider',
    webPreferences: {
      preload: typeof MAIN_WINDOW_PRELOAD_VITE_ENTRY !== 'undefined' ? MAIN_WINDOW_PRELOAD_VITE_ENTRY : path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    // TODO: Set application icon
    // icon: path.join(__dirname, '..', '..', 'resources', 'icons', 'icon.png'),
  });

  // Load content based on environment
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    // Development: load from Vite dev server or Next.js dev server
    const devUrl = process.env.ELECTRON_DEV_URL || MAIN_WINDOW_VITE_DEV_SERVER_URL;
    mainWindow.loadURL(devUrl);
  } else {
    // Production: load the Next.js static export from the renderer directory
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open DevTools always so the user/developer can inspect the console log errors causing the white screen
  mainWindow.webContents.openDevTools();

  return mainWindow;
}

