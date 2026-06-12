// ===================================================================
// APOLO — auto-actualización (electron-updater + GitHub Releases)
// Solo actúa en la app INSTALADA (no en modo desarrollo). Al iniciar y
// cada pocas horas chequea si hay una versión nueva publicada; la baja
// en segundo plano y ofrece reiniciar para instalarla. Tus datos
// (canciones) son locales y no se tocan.
// ===================================================================
'use strict';
const { app, dialog, ipcMain } = require('electron');

function setupAutoUpdates(getWindow) {
  // En desarrollo (app sin empaquetar) el updater no aplica y tiraría error.
  if (!app.isPackaged) return;

  let autoUpdater, log;
  try {
    ({ autoUpdater } = require('electron-updater'));
    log = require('electron-log');
  } catch (e) {
    return; // sin dependencias del updater no hacemos nada
  }

  autoUpdater.logger = log;
  log.transports.file.level = 'info';
  autoUpdater.autoDownload = true;            // baja la actualización sola
  autoUpdater.autoInstallOnAppQuit = true;    // si no reiniciás, se instala al cerrar

  autoUpdater.on('error', (err) => {
    log.error('[updater] error', err == null ? 'desconocido' : (err.stack || err).toString());
  });
  autoUpdater.on('update-available', (info) => log.info('[updater] hay versión nueva:', info.version));
  autoUpdater.on('update-not-available', () => log.info('[updater] ya estás en la última versión'));
  autoUpdater.on('update-downloaded', async (info) => {
    const win = (typeof getWindow === 'function') ? getWindow() : null;
    const { response } = await dialog.showMessageBox(win || undefined, {
      type: 'info',
      buttons: ['Reiniciar ahora', 'Más tarde'],
      defaultId: 0,
      cancelId: 1,
      title: 'Actualización disponible',
      message: `APOLO ${info.version} está lista para instalarse.`,
      detail: 'Se aplicará al reiniciar la aplicación. Tus canciones no se modifican.',
    });
    if (response === 0) autoUpdater.quitAndInstall();
  });

  const check = () => autoUpdater.checkForUpdates().catch((e) => log.error('[updater] chequeo falló', e));

  // Chequeo al arrancar (con un pequeño respiro) y luego cada 3 horas.
  setTimeout(check, 4000);
  setInterval(check, 3 * 60 * 60 * 1000);

  // Permite forzar un chequeo manual desde el renderer (window.apolo.checkForUpdates()).
  ipcMain.handle('apolo:check-updates', () => check());
}

module.exports = { setupAutoUpdates };
