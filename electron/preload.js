// APOLO — preload: expone una API mínima y segura al renderer (contextIsolation).
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('apolo', {
  // Controles de la barra de título personalizada (Windows)
  win: {
    minimize: () => ipcRenderer.send('apolo:win', 'minimize'),
    toggleMaximize: () => ipcRenderer.send('apolo:win', 'toggle-maximize'),
    close: () => ipcRenderer.send('apolo:win', 'close'),
  },
  platform: process.platform,
});
