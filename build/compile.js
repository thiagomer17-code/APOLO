// ===================================================================
// APOLO — precompilación de JSX (build-time)
// Compila los .jsx del renderer a un único src/app.bundle.js usando el
// propio Babel (standalone) en Node — sin dependencias nuevas. Así el
// runtime NO carga Babel (−3 MB) ni transpila al arrancar (más rápido).
// Se mantiene la semántica de "scripts clásicos" (sourceType: 'script')
// para preservar el scope global compartido entre módulos.
// ===================================================================
'use strict';
const fs = require('fs');
const path = require('path');
const Babel = require(path.join(__dirname, '..', 'src', 'vendor', 'babel.min.js'));

const SRCJS = path.join(__dirname, '..', 'src', 'js');
// MISMO orden de carga que tenía index.html
const ORDER = [
  'tweaks-panel', 'apolo-data', 'apolo-sidebar', 'apolo-views',
  'apolo-tab', 'apolo-chords', 'apolo-chordlib', 'apolo-editor', 'apolo-app',
];

let out = '/* APOLO bundle — generado por build/compile.js. No editar a mano. */\n';
for (const name of ORDER) {
  const code = fs.readFileSync(path.join(SRCJS, name + '.jsx'), 'utf8');
  const res = Babel.transform(code, {
    presets: ['react'],
    sourceType: 'script',   // clásico: top-level functions -> global, sin "use strict"
    compact: false,
    comments: false,
  });
  out += '\n/* ===== ' + name + ' ===== */\n' + res.code + '\n';
}

const dest = path.join(__dirname, '..', 'src', 'app.bundle.js');
fs.writeFileSync(dest, out, 'utf8');
console.log('compiled ' + ORDER.length + ' modules -> src/app.bundle.js (' + Math.round(out.length / 1024) + ' KB)');
