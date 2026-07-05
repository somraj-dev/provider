/**
 * IPC Handler Registration
 *
 * Register all IPC handlers for communication between
 * the main process and renderer process.
 */
import { ipcMain } from 'electron';

export function registerIpcHandlers(): void {
  // Application info
  ipcMain.handle('app:getVersion', () => {
    const { app } = require('electron');
    return app.getVersion();
  });

  ipcMain.handle('app:getName', () => {
    return 'AxioVital Provider';
  });

  // TODO: Add more IPC handlers as needed
  // ipcMain.handle('auth:login', async (_event, credentials) => { ... });
  // ipcMain.handle('settings:get', async (_event, key) => { ... });
  // ipcMain.handle('notifications:show', async (_event, options) => { ... });
}
