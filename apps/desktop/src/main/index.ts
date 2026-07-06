/**
 * Electron Main Process Entry Point
 *
 * Creates the main application window and sets up IPC handlers.
 */
import { app, BrowserWindow, Menu } from 'electron';
import squirrelStartup from 'electron-squirrel-startup';
import { createMainWindow } from './window';
import { registerIpcHandlers } from './ipc';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (squirrelStartup) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

app.on('ready', async () => {
  Menu.setApplicationMenu(null);
  mainWindow = createMainWindow();
  registerIpcHandlers();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createMainWindow();
  }
});
