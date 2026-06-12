// ===================================================================
// APOLO — proceso principal de Electron
// App de escritorio personal para letras con acordes y tablaturas.
// Sin internet, sin cuentas: todo se guarda localmente en la PC.
// ===================================================================
'use strict';

const { app, BrowserWindow, ipcMain, protocol, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { setupAutoUpdates } = require('./updater');

// El renderer usa Babel en runtime, que requiere 'unsafe-eval' en la CSP.
// Es una app local/offline que solo carga código propio, así que silenciamos
// la advertencia de seguridad de Electron (solo aparecía en la consola de dev).
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

const SRC = path.join(__dirname, '..', 'src');
const APP_SCHEME = 'app';
const APP_HOST = 'apolo';
const START_URL = `${APP_SCHEME}://${APP_HOST}/index.html`;

// Tipos MIME para servir los recursos locales con la cabecera correcta.
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jsx': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.map': 'application/json',
};

// Esquema privilegiado: origen estable y "seguro" para que localStorage
// persista de forma fiable en la carpeta de datos de la app y para que el
// XHR de Babel pueda cargar los .jsx (cosa que file:// no garantiza).
protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

let mainWindow = null;

function registerAppProtocol() {
  protocol.handle(APP_SCHEME, async (request) => {
    let rel;
    try {
      rel = decodeURIComponent(new URL(request.url).pathname);
    } catch (e) {
      return new Response('Bad request', { status: 400 });
    }
    if (!rel || rel === '/') rel = '/index.html';

    // Resolver dentro de SRC y bloquear path traversal.
    const filePath = path.normalize(path.join(SRC, rel));
    if (filePath !== SRC && !filePath.startsWith(SRC + path.sep)) {
      return new Response('Forbidden', { status: 403 });
    }
    try {
      const data = await fs.promises.readFile(filePath);
      const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
      return new Response(data, { headers: { 'Content-Type': type } });
    } catch (e) {
      return new Response('Not found', { status: 404 });
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 940,
    minHeight: 600,
    frame: false, // barra de título propia (estilo Windows del diseño)
    backgroundColor: '#191919',
    show: false,
    title: 'APOLO',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  Menu.setApplicationMenu(null);
  mainWindow.loadURL(START_URL);
  mainWindow.once('ready-to-show', () => mainWindow.show());

  // Los enlaces externos abren el navegador del sistema; nada navega fuera de la app.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith(START_URL.replace('/index.html', ''))) e.preventDefault();
  });
}

// Controles de ventana desde la barra de título personalizada.
ipcMain.on('apolo:win', (e, action) => {
  const w = BrowserWindow.fromWebContents(e.sender);
  if (!w) return;
  if (action === 'minimize') w.minimize();
  else if (action === 'toggle-maximize') (w.isMaximized() ? w.unmaximize() : w.maximize());
  else if (action === 'close') w.close();
});

// Una sola instancia.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    registerAppProtocol();
    createWindow();
    setupAutoUpdates(() => mainWindow);
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
