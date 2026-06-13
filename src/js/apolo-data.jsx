/* ===================================================================
   APOLO — datos de ejemplo + helpers musicales
   (letra ORIGINAL de muestra, sin derechos de terceros)
   =================================================================== */

/* --- afinaciones predefinidas (de cuerda aguda arriba a grave abajo) --- */
const APOLO_TUNINGS = [
  { id:'std6',  name:'Estándar',   strings:['e','B','G','D','A','E'] },
  { id:'dropd', name:'Drop D',     strings:['e','B','G','D','A','D'] },
  { id:'dadgad',name:'DADGAD',     strings:['D','A','G','D','A','D'] },
  { id:'openg', name:'Open G',     strings:['D','B','G','D','G','D'] },
  { id:'halfdn',name:'½ tono abajo',strings:['eb','Bb','Gb','Db','Ab','Eb'] },
  { id:'std7',  name:'7 cuerdas',  strings:['e','B','G','D','A','E','B'] },
  { id:'std4',  name:'Bajo 4',     strings:['G','D','A','E'] },
];

const NOTE_OPTIONS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B',
                      'Db','Eb','Gb','Ab','Bb',
                      'c','d','e','f','g','a','b','eb','Bb','Gb','Db','Ab'];

/* --- transposición de acordes --- */
const SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const FLAT  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
const ENH = { 'Db':'C#','Eb':'D#','Gb':'F#','Ab':'G#','Bb':'A#' };

function noteIndex(n){
  let s = n.replace('b','#'); // normaliza primero por enarmonía
  if(ENH[n]) s = ENH[n];
  let i = SHARP.indexOf(s);
  if(i<0) i = FLAT.indexOf(n);
  return i;
}
/* transpone un acorde como "C/G", "F#m7", "Bb" por n semitonos */
function transposeChord(chord, n, preferFlat){
  if(!chord) return chord;
  const table = preferFlat ? FLAT : SHARP;
  const shiftRoot = (root) => {
    const m = root.match(/^([A-G][#b]?)(.*)$/);
    if(!m) return root;
    let idx = noteIndex(m[1]);
    if(idx<0) return root;
    idx = (idx + n + 1200) % 12;
    return table[idx] + m[2];
  };
  return chord.split('/').map(shiftRoot).join('/');
}

/* helpers de construcción de líneas/acordes */
function L(text, chords){ return { text, chords: chords || [] }; }  // chords: [{pos,chord}]
function tabGrid(strings, cols, fills){
  // fills: {"row,col":"val"}
  const g = strings.map((_,r)=> Array.from({length:cols}, (_,c)=> (fills && fills[r+','+c]) || '' ));
  return g;
}

/* --- colores de monograma para avatares/portadas sin foto --- */
const MONO_COLORS = [
  'linear-gradient(145deg,#cc785c,#8f4f38)',  /* Book Cloth */
  'linear-gradient(145deg,#d4a27f,#9c6f49)',  /* Kraft */
  'linear-gradient(145deg,#7a7a73,#48483f)',  /* Cloud */
  'linear-gradient(145deg,#5f6b74,#363f47)',  /* Slate frío */
  'linear-gradient(145deg,#b5705a,#6e3d2e)',  /* Terracota */
  'linear-gradient(145deg,#8a8278,#514c44)',  /* Gris cálido */
  'linear-gradient(145deg,#9c8458,#5f4f31)',  /* Manila profundo */
];
function monoColor(seed){ let h=0; for(const c of (seed||'')) h=(h*31+c.charCodeAt(0))>>>0; return MONO_COLORS[h%MONO_COLORS.length]; }

/* =================================================================
   DATA SEED
   ================================================================= */
function apoloSeed(){
  /* Instalación nueva: biblioteca VACÍA (sin artistas, álbumes ni canciones).
     La biblioteca de ACORDES sí viene precargada (ver seedChordLib en
     apolo-chordlib.jsx). El usuario arranca su biblioteca desde cero. */
  return { artists: [], songs: {} };
}

/* exporta a window para los demás scripts */
Object.assign(window, {
  APOLO_TUNINGS, NOTE_OPTIONS, transposeChord, monoColor, apoloSeed, tabGrid,
});
