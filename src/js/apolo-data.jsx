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
  return {
    artists: [
      {
        id:'a_marea', name:'La Marea Quieta', initial:'M', kind:'Banda',
        genre:'Folk rock · Rosario', photo:null,
        albums:[
          {
            id:'al_orillas', title:'Orillas', year:2023, cover:null,
            songs:['s_avenida','s_norte','s_caracola','s_lampara']
          },
          {
            id:'al_invierno', title:'Invierno en la costa', year:2021, cover:null,
            songs:['s_humo','s_trenes']
          },
        ],
        singles:['s_demo1']
      },
      {
        id:'a_juana', name:'Juana Coral', initial:'J', kind:'Solista',
        genre:'Cantautora · Montevideo', photo:null,
        albums:[
          { id:'al_raiz', title:'Raíz', year:2024, cover:null, songs:['s_raiz','s_piedra','s_sal'] },
        ],
        singles:[]
      },
      {
        id:'a_terral', name:'Terral', initial:'T', kind:'Banda',
        genre:'Indie · Córdoba', photo:null,
        albums:[ { id:'al_viento', title:'Viento sur', year:2022, cover:null, songs:['s_polvo','s_sierra'] } ],
        singles:['s_brasa']
      },
      {
        id:'a_nube', name:'El Niño Nube', initial:'N', kind:'Solista',
        genre:'Acústico · Lima', photo:null, albums:[], singles:['s_nube1','s_nube2']
      },
    ],

    songs: {
      /* === canción demo, totalmente cargada === */
      s_avenida: {
        id:'s_avenida', title:'Avenida sin nombre', artistId:'a_marea', albumId:'al_orillas',
        duration:'4:12', key:'Am', capo:2, tuningId:'std6',
        notes:'Punteo de intro con púa, suave. En el estribillo entra toda la banda.',
        blocks:[
          { type:'tab', label:'Intro', tuningId:'std6',
            grid: tabGrid(['e','B','G','D','A','E'], 9, {
              '0,1':'0','0,3':'1','0,5':'0',
              '1,0':'1','1,2':'1','1,4':'3','1,6':'1',
              '2,7':'0h2',
              '5,0':'0','5,8':'0'
            })
          },
          { type:'lyric', label:'Estrofa', lines:[
            L('Camino solo por la avenida', [{pos:0,chord:'Am'},{pos:14,chord:'C'}]),
            L('buscando un eco de tu voz', [{pos:0,chord:'F'},{pos:18,chord:'G'}]),
            L('la luna cuelga de una esquina', [{pos:0,chord:'Am'},{pos:14,chord:'C'}]),
            L('y no contesta mi reloj', [{pos:0,chord:'Dm'},{pos:14,chord:'E'}]),
          ]},
          { type:'lyric', label:'Estribillo', lines:[
            L('Y si volvieras esta noche', [{pos:0,chord:'F'},{pos:13,chord:'C'}]),
            L('dejaría la puerta sin cerrar', [{pos:0,chord:'G'},{pos:11,chord:'Am'},{pos:24,chord:'G'}]),
            L('todo el invierno en un derroche', [{pos:0,chord:'F'},{pos:18,chord:'C'}]),
            L('de luces sobre la ciudad', [{pos:0,chord:'G'},{pos:16,chord:'C'}]),
          ]},
          { type:'tab', label:'Puente / Solo', tuningId:'std6',
            grid: tabGrid(['e','B','G','D','A','E'], 12, {
              '0,0':'5','0,1':'7','0,2':'8','0,3':'7','0,4':'5',
              '1,5':'8','1,6':'8b','1,7':'8',
              '2,8':'7','2,9':'5h7','2,10':'7','2,11':'5'
            })
          },
          { type:'lyric', label:'Estrofa', lines:[
            L('El cartel del bar sigue encendido', [{pos:0,chord:'Am'},{pos:11,chord:'C'}]),
            L('aunque ya nadie viene a abrir', [{pos:0,chord:'F'},{pos:20,chord:'G'}]),
            L('guardé tu nombre en el olvido', [{pos:0,chord:'Am'},{pos:14,chord:'C'}]),
            L('para tener algo que decir', [{pos:0,chord:'Dm'},{pos:14,chord:'E'}]),
          ]},
        ]
      },
      /* === resto: cabeceras simples (placeholders navegables) === */
      s_norte:    stub('s_norte','Hacia el norte','a_marea','al_orillas','3:40','G',0),
      s_caracola: stub('s_caracola','Caracola','a_marea','al_orillas','2:58','Em',0),
      s_lampara:  stub('s_lampara','La lámpara','a_marea','al_orillas','5:05','D',2),
      s_humo:     stub('s_humo','Humo de leña','a_marea','al_invierno','4:22','C',0),
      s_trenes:   stub('s_trenes','Trenes lentos','a_marea','al_invierno','3:11','Am',0),
      s_demo1:    stub('s_demo1','Boceto en Mi','a_marea',null,'1:48','E',0),

      s_raiz:     stub('s_raiz','Raíz','a_juana','al_raiz','3:30','Dm',0),
      s_piedra:   stub('s_piedra','Piedra de río','a_juana','al_raiz','4:01','G',3),
      s_sal:      stub('s_sal','Sal','a_juana','al_raiz','2:44','Am',0),

      s_polvo:    stub('s_polvo','Polvo de oro','a_terral','al_viento','3:55','E',0),
      s_sierra:   stub('s_sierra','Sierra adentro','a_terral','al_viento','4:30','A',0),
      s_brasa:    stub('s_brasa','Brasa','a_terral',null,'3:02','Bm',0),

      s_nube1:    stub('s_nube1','Cielo prestado','a_nube',null,'3:18','C',0),
      s_nube2:    stub('s_nube2','Madrugada','a_nube',null,'2:50','G',2),
    }
  };
}

function stub(id,title,artistId,albumId,duration,key,capo){
  return {
    id, title, artistId, albumId, duration, key, capo, tuningId:'std6', notes:'',
    blocks:[
      { type:'lyric', label:'Estrofa', lines:[
        L('Acá va la primera estrofa de la canción', [{pos:0,chord:key.replace(/m$/,'m')},{pos:20,chord:'C'}]),
        L('un renglón más para seguir la idea', [{pos:0,chord:'F'},{pos:16,chord:'G'}]),
        L('', []),
        L('toca el botón Editar para cargar acordes', []),
      ]},
    ]
  };
}

/* exporta a window para los demás scripts */
Object.assign(window, {
  APOLO_TUNINGS, NOTE_OPTIONS, transposeChord, monoColor, apoloSeed, tabGrid,
});
