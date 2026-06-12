# Publicar actualizaciones de APOLO

APOLO usa **electron-updater + GitHub Releases**. La app instalada se actualiza sola: al iniciar (y cada 3 horas) chequea si hay una versión nueva publicada, la baja en segundo plano y te ofrece reiniciar para instalarla. **No hace falta bajar el instalador a mano en cada PC.**

> Importante: esto actualiza el **programa**, no tus **canciones**. Tu biblioteca vive local en cada PC (`%APPDATA%\APOLO`) y no se sincroniza ni se borra con una actualización.

---

## 1) Configuración inicial (una sola vez)

1. **Crear el repositorio en GitHub** llamado `APOLO` (público es lo más simple para el auto-update).
2. En `package.json`, dentro de `build.publish`, poné tu usuario en `owner` (el `repo` ya es `APOLO`):
   ```json
   "publish": [{ "provider": "github", "owner": "thiagomer17-code", "repo": "APOLO" }]
   ```
3. **Subir el código** al repo (una vez):
   ```powershell
   git remote add origin https://github.com/thiagomer17-code/APOLO.git
   git push -u origin main
   ```
4. **Token de GitHub** para poder publicar releases: creá un *Personal Access Token* (classic) con permiso `repo` en <https://github.com/settings/tokens>, y guardalo como variable de entorno antes de publicar:
   ```powershell
   $env:GH_TOKEN = "ghp_tu_token_aca"
   ```

> Tip: instalar **GitHub CLI** (`winget install GitHub.cli`) y hacer `gh auth login` simplifica todo (crea el repo, maneja el token, etc.).

---

## 2) Sacar una actualización (cada vez)

1. Hacé tus cambios en el código.
2. **Subí el número de versión** en `package.json` (ej. `1.0.0` → `1.0.1`). Regla simple: siempre que publiques, el número tiene que ser **mayor** que el anterior.
3. Con el token cargado (`$env:GH_TOKEN`), corré:
   ```powershell
   npm run release
   ```
   Esto compila el `.exe` **y** sube al GitHub Release: el instalador, su `.blockmap` y el `latest.yml` (el archivo que la app lee para detectar la versión nueva).
4. (Opcional) Entrá al Release en GitHub y, si quedó como *draft*, publicalo.

¡Listo! La próxima vez que abras APOLO en tu otra PC, detecta la versión nueva, la baja sola y te ofrece reiniciar para instalarla.

---

## Notas

- **Primera instalación:** el `.exe` inicial se instala una vez por PC (doble clic). De ahí en adelante, las updates son automáticas. La versión instalada tiene que tener ya el updater incluido (de la 1.0.0 en adelante con esta configuración).
- **Sin firma de código:** Windows SmartScreen puede mostrar "editor desconocido" en la primera instalación (le das *Más info → Ejecutar de todas formas*). El auto-update funciona igual sin firmar.
- **Repo privado:** si no querés el código público, lo más limpio es mantener el código en un repo privado y publicar los *releases* en un repo **público aparte** (apuntá `owner`/`repo` de `publish` a ese repo de releases). Así el auto-update no necesita token embebido en la app.
- **Probar sin publicar:** `npm run dist` genera el instalador en `dist\` sin subir nada.
