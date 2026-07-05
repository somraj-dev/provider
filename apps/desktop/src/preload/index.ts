/**
 * Preload Script
 *
 * Exposes a safe, limited API to the renderer process
 * via the contextBridge.
 */
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('axiovital', {
  // Application
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getName: () => ipcRenderer.invoke('app:getName'),

  // TODO: Expose more APIs as needed
  // auth: {
  //   login: (credentials: unknown) => ipcRenderer.invoke('auth:login', credentials),
  // },
  // settings: {
  //   get: (key: string) => ipcRenderer.invoke('settings:get', key),
  // },
});
