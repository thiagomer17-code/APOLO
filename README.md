# APOLO 🎸

Editor de escritorio **personal** para crear, editar y guardar **letras con acordes** y **tablaturas** de guitarra, con una estética tipo Spotify. Funciona **offline**, sin cuentas ni nube: todo se guarda localmente en tu PC.

Construido con **Electron** reutilizando el diseño hecho en Claude Design.

---

## Funciones (MVP)

- **Biblioteca tipo Spotify**: navegación Biblioteca → Artista → Álbum → Canción, con historial atrás/adelante, búsqueda global y barra lateral con artistas y canciones recientes.
- **Crear** artistas/bandas, álbumes y canciones (con o sin álbum).
- **Editor de acordes sobre la letra**: pegás/editás la letra y hacés clic sobre una sílaba para anclar el acorde encima del renglón (en color de acento). Editás, movés y borrás acordes.
- **Editor de tablatura** con **afinación configurable**: definís cuántas cuerdas tiene la grilla y qué nota es cada una (presets: Estándar, Drop D, DADGAD, Open G, 7 cuerdas, bajo 4…), agregás/quitás columnas, y soporta técnicas `h p / \ b x`.
- **Modo edición / lectura**: la lectura es una vista limpia para tocar, con autoscroll (velocidades finas), tamaño de letra ajustable, transposición en vivo y un panel de diagramas de acordes.
- **Transposición**, capo, tono y notas por canción.
- **Tema claro/oscuro** con la paleta de Anthropic/Claude.
- **Guardado automático local** (no se sube nada a internet).

> Funciones extra ya incluidas del diseño: portadas con ajustador de imagen (recortar/rotar/zoom), menús contextuales, reordenar por arrastre, diagramas de acordes con cejilla.

---

## Requisitos

- **Windows** (10/11).
- **Node.js 18+** y npm — necesarios solo para instalar dependencias, ejecutar y generar el instalador. Descargá desde <https://nodejs.org> (LTS) o `winget install OpenJS.NodeJS.LTS`.

La app en sí funciona **offline**: React, Babel y las tipografías están vendorizados localmente en `src/vendor` y `src/fonts`.

---

## Ejecutar en desarrollo

```powershell
npm install      # baja Electron (la primera vez tarda)
npm start        # abre APOLO
```

> **Atajo (ya configurado):** esta carpeta incluye un **Node.js portable** en `.node\` y las dependencias ya instaladas. Podés abrir APOLO con **doble clic en `run-apolo.bat`** sin tener Node instalado en el sistema.

## Generar el instalador `.exe` (Windows)

```powershell
npm run dist
```

El instalador NSIS queda en `dist/` (p. ej. `APOLO Setup 1.0.0.exe`). Se instala con doble clic, crea accesos directos y permite elegir carpeta de instalación.

Para una build sin empaquetar (carpeta ejecutable, útil para probar):

```powershell
npm run pack     # genera dist/win-unpacked/APOLO.exe
```

## Actualizaciones automáticas (auto-update)

La app instalada se **actualiza sola** vía GitHub Releases: al iniciar chequea si hay una versión nueva publicada, la baja en segundo plano y te ofrece reiniciar para instalarla — sin bajar un instalador a mano en cada PC. Tus canciones son locales y no se tocan. Para publicar una actualización subís la versión en `package.json` y corrés `npm run release`. Paso a paso completo en **[RELEASING.md](RELEASING.md)**.

---

## Estructura

```
APOLO/
├─ electron/
│  ├─ main.js        # proceso principal: ventana sin marco, protocolo app://, IPC de ventana
│  └─ preload.js     # API mínima y segura (controles de ventana) vía contextBridge
├─ src/              # renderer (la app del diseño)
│  ├─ index.html     # entrada; carga React/Babel locales y los módulos
│  ├─ apolo.css      # sistema visual completo
│  ├─ js/*.jsx       # componentes (datos, sidebar, vistas, tablatura, acordes, editor, app)
│  ├─ vendor/        # react, react-dom, babel (offline)
│  └─ fonts/         # tipografías .woff2 + fonts.css (offline)
├─ build/            # recursos de empaquetado (icono)
├─ package.json
└─ _design/          # bundle de diseño original (referencia; no se empaqueta)
```

### Notas técnicas

- **Sin paso de compilación**: el renderer usa Babel en runtime sobre los `.jsx`, así que el código del diseño queda casi sin cambios. La app se carga desde un protocolo privilegiado `app://apolo/` (origen estable y seguro) para que `localStorage` persista y el XHR de Babel funcione.
- **Persistencia**: los datos viven en `localStorage`, que Electron guarda en la carpeta de datos de la app:
  `%APPDATA%\APOLO`.
- **Barra de título propia**: ventana `frame:false`; los botones minimizar/maximizar/cerrar se conectan por IPC.

---

## Datos de ejemplo

Al abrir por primera vez, APOLO viene con artistas y una canción demo cargada (letra original de muestra, sin derechos de terceros) para que veas todo funcionando. Podés borrarlos con **clic derecho → Borrar** y empezar tu propia biblioteca.

## Fuera de alcance (por ahora)

No reproduce audio, no exporta a PDF/imagen, no comparte, no tiene login ni busca letras en internet.
