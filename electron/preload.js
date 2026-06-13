// APOLO — preload: expone una API mínima y segura al renderer (contextIsolation).
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('apolo', {
  // Controles de la barra de título personalizada (Windows)
  win: {
    minimize: () => ipcRenderer.send('apolo:win', 'minimize'),
    toggleMaximize: () => ipcRenderer.send('apolo:win', 'toggle-maximize'),
    close: () => ipcRenderer.send('apolo:win', 'close'),
  },
  // Persistencia en archivo (biblioteca / acordes): load es sincrónico
  // (una vez al arrancar); save es asíncrono con debounce en main;
  // flush es sincrónico y se usa al cerrar para garantizar el volcado.
  store: {
    load:  (key) => ipcRenderer.sendSync('apolo:store-load', key),
    save:  (key, json) => ipcRenderer.send('apolo:store-save', key, json),
    flush: (key, json) => ipcRenderer.sendSync('apolo:store-flush', key, json),
  },
  platform: process.platform,
});
