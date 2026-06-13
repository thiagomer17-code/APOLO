/* ===================================================================
   APOLO — App raíz: router, persistencia, ventana, editor screen, modales
   =================================================================== */
const { useState, useEffect, useRef, useMemo } = React;

const LS_DATA = 'apolo-data-v3';
const LS_ROUTE = 'apolo-route-v3';
const LS_RECENTS = 'apolo-recents-v3';
const LS_PINS = 'apolo-pins-v3';
const LS_HIDDEN = 'apolo-hidden-v3';
const SCROLL_SPEEDS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3];

function normalize(data){
  Object.values(data.songs).forEach(s=>{
    (s.blocks||[]).forEach((b,i)=>{ if(!b._k) b._k = s.id+'_b'+i+'_'+Math.random().toString(36).slice(2,6);
      if(b.type==='lyric' && !b.lines) b.lines=[];
      if(b.type==='lyric') b.lines.forEach(l=>{ if(!l.chords) l.chords=[]; });
    });
  });
  return data;
}
/* ---------- persistencia ----------
   En Electron la biblioteca y los acordes viven en ARCHIVOS JSON reales
   (via window.apolo.store). localStorage queda como legado: se migra de
   ahí la primera vez y sirve de fallback si la app corre en un browser. */
const hasStore = ()=> !!(window.apolo && window.apolo.store);
/* Modo seguro: si el archivo del store EXISTE pero su JSON está corrupto/truncado,
   NO debemos pisarlo con el seed (sería pérdida permanente de datos del usuario).
   Marcamos la clave afectada y bloqueamos su persistencia hasta reiniciar limpio. */
const storeLoadFailed = {};   // {data:true} / {chordlib:true} si la carga falló por parse
function loadData(){
  if(hasStore()){
    let r=null; try{ r=window.apolo.store.load('data'); }catch(e){}
    if(r){ try{ return normalize(JSON.parse(r)); }catch(e){ storeLoadFailed.data=true; console.error('[apolo] apolo-data.json corrupto: persistencia bloqueada para no perder datos', e); return normalize(apoloSeed()); } }
  }
  try{ const r=localStorage.getItem(LS_DATA); if(r) return normalize(JSON.parse(r)); }catch(e){}
  return normalize(apoloSeed());
}
function loadChordLib(){
  if(hasStore()){
    let r=null; try{ r=window.apolo.store.load('chordlib'); }catch(e){}
    if(r){ try{ return JSON.parse(r); }catch(e){ storeLoadFailed.chordlib=true; console.error('[apolo] apolo-chordlib.json corrupto: persistencia bloqueada para no perder datos', e); return seedChordLib(); } }
  }
  try{ const r=localStorage.getItem('apolo-chordlib-v1'); if(r) return JSON.parse(r); }catch(e){}
  return seedChordLib();
}
function persist(key, lsKey, obj){
  if(storeLoadFailed[key]) return;   // archivo corrupto: no sobrescribir con seed
  const json=JSON.stringify(obj);
  if(hasStore()) window.apolo.store.save(key, json);
  else localStorage.setItem(lsKey, json);
}

/* =================================================================
   Pantalla del EDITOR de canción
   ================================================================= */
function SongEditorScreen({data, song, chordLib, onChange, onBack, onNavArtist, onNavAlbum, onEditChord}){
  const VK = 'apolo-view-'+song.id;
  const init = (()=>{ try{ return JSON.parse(localStorage.getItem(VK))||{}; }catch(e){ return {}; } })();
  const [mode, setMode] = useState(init.mode||'edit');
  const [semis, setSemis] = useState(init.semis||0);
  const [preferFlat, setPreferFlat] = useState(init.preferFlat||false);
  const [lyricSize, setLyricSize] = useState(init.lyricSize||18);
  const [settings, setSettings] = useState(false);
  const [autoscroll, setAutoscroll] = useState(false);
  const [speed, setSpeed] = useState(0.5);
  const [chordPanel, setChordPanel] = useState(init.chordPanel||false);
  const [cols, setCols] = useState(init.cols||1);          // columnas en modo lectura (1-4)
  const [currentChord, setCurrentChord] = useState(null);
  const [visibleChords, setVisibleChords] = useState(()=>new Set());
  const scrollRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(()=>{ localStorage.setItem(VK, JSON.stringify({mode,semis,preferFlat,lyricSize,chordPanel,cols})); },[mode,semis,preferFlat,lyricSize,chordPanel,cols]);

  /* acordes mencionados en la canción (únicos, transpuestos, con la biblioteca) */
  const chordList = useMemo(()=> collectChords(song.blocks, semis, preferFlat, chordLib), [song.blocks, semis, preferFlat, chordLib]);

  /* autoscroll — acumula posición en flotante (scrollTop se redondea al leerlo) */
  useEffect(()=>{
    if(!autoscroll || mode!=='read') return;
    const el = scrollRef.current; if(!el) return;
    let pos = el.scrollTop;
    const id = setInterval(()=>{
      pos += speed*0.5;
      el.scrollTop = pos;
      if(el.scrollTop + el.clientHeight >= el.scrollHeight-1){ setAutoscroll(false); }
    },16);
    return ()=>clearInterval(id);
  },[autoscroll, speed, mode]);

  const artist = data.artists.find(a=>a.id===song.artistId);
  const album = artist && song.albumId ? artist.albums.find(al=>al.id===song.albumId) : null;
  const strings = song.strings && song.strings.length ? song.strings : (APOLO_TUNINGS.find(t=>t.id===song.tuningId)?.strings||['e','B','G','D','A','E']);
  const tuningName = APOLO_TUNINGS.find(t=>t.id===song.tuningId)?.name || 'Personalizada';
  const editing = mode==='edit';

  function updateBlock(i,b){ const blocks=song.blocks.slice(); blocks[i]=b; onChange({...song, blocks}); }
  function deleteBlock(i){ const blocks=song.blocks.slice(); blocks.splice(i,1); onChange({...song, blocks}); }
  function insertBlock(i,type){
    const _k = song.id+'_b'+Date.now().toString(36);
    const b = type==='tab'
      ? { type:'tab', _k, label:'Tablatura', tuningId:song.tuningId||'std6', strings:strings.slice(), grid: tabGrid(strings, 8, {}) }
      : { type:'lyric', _k, label:'Sección', lines:[{text:'Escribí la letra acá…', chords:[]}] };
    const blocks=song.blocks.slice(); blocks.splice(i,0,b); onChange({...song, blocks});
  }

  return (
    <div className="editor">
      <div className="ed-bar">
        <button className="nav-btn" onClick={onBack} title="Volver"><Ico n="back"/></button>
        <div className="ed-crumb">
          <div className="path">
            <b style={{cursor:'pointer'}} onClick={()=>onNavArtist(artist.id)}>{artist?.name}</b>
            {album && <><span>·</span><b style={{cursor:'pointer'}} onClick={()=>onNavAlbum(artist.id, album.id)}>{album.title}</b></>}
          </div>
          <div className="ttl">{song.title}</div>
        </div>
        <div className="spacer"></div>

        <button className="chip" onClick={()=>setSettings(true)} title="Afinación">
          <span className="k">Afin.</span><span className="v">{strings.join(' ')}</span>
        </button>
        {song.capo>0 && <button className="chip" onClick={()=>setSettings(true)}><span className="k">Capo</span><span className="v">{song.capo}</span></button>}
        <ToneChip songKey={song.key} semis={semis} setSemis={setSemis} preferFlat={preferFlat}/>
        <button className={'chip chip-btn'+(chordPanel?' chip-on':'')} onClick={()=>setChordPanel(v=>!v)} title="Diagramas de acordes">
          <Ico n="chord"/><span className="k">Acordes</span>
        </button>

        <div className="segment">
          <button className={editing?'on':''} onClick={()=>setMode('edit')}><Ico n="edit"/> Editar</button>
          <button className={!editing?'on':''} onClick={()=>{setMode('read'); setAutoscroll(false);}}><Ico n="read"/> Leer</button>
        </div>
        <button className="nav-btn" onClick={()=>setSettings(true)} title="Ajustes"><Ico n="gear"/></button>
      </div>

      <div className="ed-main">
        <div className="ed-scroll" ref={scrollRef}>
        <div className={'ed-canvas'+(editing?' editing':' read')+(!editing&&cols>1?' multi cols-'+cols:'')} style={{'--lyric-size':lyricSize+'px'}}>
          <div className="song-meta">
            <h1>{song.title}</h1>
            <div className="by">{artist?.name}{album?` — ${album.title}`:''}</div>
            <div className="specs">
              <span className="spec">Tono <b>{transposeChord(song.key,semis,preferFlat)}</b></span>
              <span className="spec">Capo <b>{song.capo||'0'}</b></span>
              <span className="spec">Afinación <b>{strings.join(' ')}</b></span>
              {song.duration && <span className="spec">Duración <b>{song.duration}</b></span>}
            </div>
          </div>

          <div className="song-flow">
            {editing && <Inserter onLyric={()=>insertBlock(0,'lyric')} onTab={()=>insertBlock(0,'tab')}/>}
            {song.blocks.map((b,i)=>(
              <React.Fragment key={b._k}>
                {b.type==='tab'
                  ? <TabBlock block={b} editing={editing} onChange={nb=>updateBlock(i,nb)} onDelete={editing?()=>deleteBlock(i):null}/>
                  : <LyricBlock block={b} editing={editing} semis={semis} preferFlat={preferFlat} onChange={nb=>updateBlock(i,nb)} onDelete={editing && song.blocks.length>1?()=>deleteBlock(i):null}/>
                }
                {editing && <Inserter onLyric={()=>insertBlock(i+1,'lyric')} onTab={()=>insertBlock(i+1,'tab')}/>}
              </React.Fragment>
            ))}

            {song.notes && !editing && (
              <div style={{marginTop:34,paddingTop:18,borderTop:'1px solid var(--border-soft)',color:'var(--text-2)',fontSize:14,lineHeight:1.6,breakInside:'avoid'}}>
                <div className="block-label" style={{display:'flex',margin:'0 0 8px'}}>Notas</div>
                {song.notes}
              </div>
            )}
          </div>
        </div>
        </div>
        {chordPanel && (
          <ChordPanel chords={chordList} currentChord={null}
            visibleSet={null} onClose={()=>setChordPanel(false)} onEditChord={onEditChord} panelRef={panelRef}/>
        )}
      </div>

      {mode==='read' && (
        <div className={'read-tools'+(chordPanel?' shift':'')}>
          <button onClick={()=>setLyricSize(s=>Math.max(13,s-1))} title="Letra más chica"><span style={{fontSize:13,fontWeight:800}}>A−</span></button>
          <span className="scr-val">{lyricSize}</span>
          <button onClick={()=>setLyricSize(s=>Math.min(30,s+1))} title="Letra más grande"><span style={{fontSize:17,fontWeight:800}}>A+</span></button>
          <span className="sep"></span>
          <button className={cols>1?'on':''} onClick={()=>setCols(c=> c>=4 ? 1 : c+1)} title="Columnas de lectura (1 a 4)"><Ico n="cols"/></button>
          <span className="scr-val">{cols} col</span>
          <span className="sep"></span>
          <button className={autoscroll?'on':''} onClick={()=>setAutoscroll(a=>!a)} title="Autoscroll">
            {autoscroll ? <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg> : <Ico n="scroll"/>}
          </button>
          <span className="scr-val">{speed}×</span>
          <button onClick={()=>setSpeed(s=>{ const i=SCROLL_SPEEDS.indexOf(s); return SCROLL_SPEEDS[(i+1)%SCROLL_SPEEDS.length]; })} title="Velocidad de scroll"><span style={{fontSize:12,fontWeight:800}}>▸▸</span></button>
          <span className="sep"></span>
          <button onClick={()=>setSemis(s=>s-1)} title="Bajar tono"><Ico n="minus"/></button>
          <span className="scr-val" style={{color:'var(--accent)',fontWeight:700}}>{transposeChord(song.key,semis,preferFlat)}</span>
          <button onClick={()=>setSemis(s=>s+1)} title="Subir tono"><Ico n="plusc"/></button>
        </div>
      )}

      {settings && <SettingsSheet song={song} semis={semis} setSemis={setSemis} preferFlat={preferFlat} setPreferFlat={setPreferFlat} onChange={onChange} onClose={()=>setSettings(false)}/>}
    </div>
  );
}

/* =================================================================
   Modales de creación
   ================================================================= */
function CreateModal({type, ctx, onClose, onCreate}){
  const [name,setName] = useState('');
  const [kind,setKind] = useState('Banda');
  const [genre,setGenre] = useState('');
  const [year,setYear] = useState(new Date().getFullYear());
  if(type==='artist'){
    return (
      <Modal title="Nuevo artista" sub="Creá el perfil de un artista o banda." onClose={onClose}
        canSubmit={!!name.trim()} onSubmit={()=>onCreate({name:name.trim(),kind,genre:genre.trim()||'Sin género'})}>
        <div className="field"><label>Nombre</label><input className="input" autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Ej. La Marea Quieta"/></div>
        <div className="field"><label>Tipo</label>
          <select className="input" value={kind} onChange={e=>setKind(e.target.value)}><option>Banda</option><option>Solista</option></select>
        </div>
        <div className="field"><label>Género / Origen</label><input className="input" value={genre} onChange={e=>setGenre(e.target.value)} placeholder="Folk rock · Rosario"/></div>
      </Modal>
    );
  }
  if(type==='album'){
    return (
      <Modal title="Nuevo álbum" onClose={onClose} canSubmit={!!name.trim()} onSubmit={()=>onCreate({title:name.trim(),year:+year||new Date().getFullYear()})}>
        <div className="field"><label>Título</label><input className="input" autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Ej. Orillas"/></div>
        <div className="field"><label>Año</label><input className="input" type="number" value={year} onChange={e=>setYear(e.target.value)}/></div>
      </Modal>
    );
  }
  /* song */
  return (
    <Modal title="Nueva canción" sub={ctx.albumTitle?`En el álbum «${ctx.albumTitle}»`:'Canción suelta'} onClose={onClose}
      canSubmit={!!name.trim()} onSubmit={()=>onCreate({title:name.trim()})}>
      <div className="field"><label>Título</label><input className="input" autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Ej. Avenida sin nombre"/></div>
    </Modal>
  );
}

/* =================================================================
   APP
   ================================================================= */
function App(){
  const [data,setData] = useState(loadData);
  const [query,setQuery] = useState('');
  const [modal,setModal] = useState(null);   // {type, ctx}
  const [adjust,setAdjust] = useState(null);  // {src, cb, round} — ajustador de imagen
  const [ctxMenu,setCtxMenu] = useState(null); // {x,y,kind,artistId,albumId,name}
  const [recents,setRecents] = useState(()=>{ try{ return JSON.parse(localStorage.getItem(LS_RECENTS))||[]; }catch(e){ return []; } });
  const [pinned,setPinned] = useState(()=>{ try{ return JSON.parse(localStorage.getItem(LS_PINS))||{artists:[],songs:[]}; }catch(e){ return {artists:[],songs:[]}; } });
  const [hiddenArtists,setHiddenArtists] = useState(()=>{ try{ return JSON.parse(localStorage.getItem(LS_HIDDEN))||[]; }catch(e){ return []; } });
  const [albumOrder,setAlbumOrder] = useState(()=>{ try{ return JSON.parse(localStorage.getItem('apolo-aorder-v3'))||[]; }catch(e){ return []; } });
  const [chordLib,setChordLib] = useState(loadChordLib);
  const [theme,setTheme] = useState(()=> localStorage.getItem('apolo-theme')||'dark');
  const [sidebarOpen,setSidebarOpen] = useState(()=>{ const v=localStorage.getItem('apolo-sidebar'); return v===null ? true : v==='1'; });
  useEffect(()=>{ localStorage.setItem('apolo-sidebar', sidebarOpen?'1':'0'); },[sidebarOpen]);
  useEffect(()=>{ document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('apolo-theme', theme); },[theme]);
  const toggleTheme = ()=> setTheme(t=> t==='dark'?'light':'dark');
  const [hist,setHist] = useState(()=>{ try{ const r=JSON.parse(localStorage.getItem(LS_ROUTE)); if(r&&r.stack) return r; }catch(e){} return {stack:[{view:'library'}], idx:0}; });

  const route = hist.stack[hist.idx];

  const [t,setTweak] = useTweaks(TWEAK_DEFAULTS);
  useEffect(()=>{
    const r=document.documentElement.style;
    r.setProperty('--accent', t.accent);
    r.setProperty('--font-lyric', t.lyricFont);
  },[t.accent, t.lyricFont]);

  /* biblioteca y acordes → archivo (debounce: evita reescribir 200KB por tecla)
     CRÍTICO: el primer render NO debe persistir lo que devolvió loadData(). Si la
     lectura del archivo falló transitoriamente (antivirus/lock/I-O), loadData() cae
     a localStorage y luego al SEED; persistir en el montaje pisaría apolo-data.json
     con ese seed. Solo escribimos tras una MUTACIÓN real (cambio posterior al montaje). */
  const dataDirty = useRef(false);
  const chordDirty = useRef(false);
  useEffect(()=>{ if(!dataDirty.current){ dataDirty.current=true; return; } const t=setTimeout(()=>persist('data', LS_DATA, data), 400); return ()=>clearTimeout(t); },[data]);
  useEffect(()=>{ if(!chordDirty.current){ chordDirty.current=true; return; } const t=setTimeout(()=>persist('chordlib', 'apolo-chordlib-v1', chordLib), 400); return ()=>clearTimeout(t); },[chordLib]);
  /* al cerrar la ventana: volcado sincrónico garantizado del estado más reciente */
  const dataRef = useRef(data); dataRef.current = data;
  const chordLibRef = useRef(chordLib); chordLibRef.current = chordLib;
  useEffect(()=>{
    const h=()=>{ if(hasStore()){ try{
      if(dataDirty.current && !storeLoadFailed.data) window.apolo.store.flush('data', JSON.stringify(dataRef.current));
      if(chordDirty.current && !storeLoadFailed.chordlib) window.apolo.store.flush('chordlib', JSON.stringify(chordLibRef.current));
    }catch(e){} } };
    window.addEventListener('beforeunload', h);
    return ()=>window.removeEventListener('beforeunload', h);
  },[]);
  useEffect(()=>{ localStorage.setItem(LS_ROUTE, JSON.stringify(hist)); },[hist]);
  useEffect(()=>{ localStorage.setItem(LS_RECENTS, JSON.stringify(recents)); },[recents]);
  useEffect(()=>{ localStorage.setItem(LS_PINS, JSON.stringify(pinned)); },[pinned]);
  useEffect(()=>{ localStorage.setItem(LS_HIDDEN, JSON.stringify(hiddenArtists)); },[hiddenArtists]);
  useEffect(()=>{ localStorage.setItem('apolo-aorder-v3', JSON.stringify(albumOrder)); },[albumOrder]);

  useEffect(()=>{
    window.__apoloAdjust = (src, cb, opts)=> setAdjust({src, cb, round:!!(opts&&opts.round)});
    return ()=>{ delete window.__apoloAdjust; };
  },[]);

  function go(r){ setHist(h=>{ const stack=h.stack.slice(0,h.idx+1); stack.push(r); return {stack, idx:stack.length-1}; }); }
  function back(){ setHist(h=> h.idx>0 ? {...h, idx:h.idx-1} : h); }
  function fwd(){ setHist(h=> h.idx<h.stack.length-1 ? {...h, idx:h.idx+1} : h); }

  const goHome   = ()=>go({view:'library'});
  const goArtist = id=>go({view:'artist', artistId:id});
  const goAlbum  = (aid,alid)=>go({view:'album', artistId:aid, albumId:alid});
  const goSong   = sid=>{ const s=data.songs[sid]; if(s){ setRecents(r=>[sid, ...r.filter(x=>x!==sid)].slice(0,8)); go({view:'editor', songId:sid, artistId:s.artistId, albumId:s.albumId}); } };
  const goChordLib = focus=> go(focus ? {view:'chordlib', focus} : {view:'chordlib'});

  /* biblioteca de acordes */
  function saveChord(name, variants){ setChordLib(l=>({...l, [name]:{name, variants}})); }
  function deleteChord(name){ setChordLib(l=>{ const c={...l}; delete c[name]; return c; }); }

  /* mutaciones */
  function updateSong(s){ setData(d=>({...d, songs:{...d.songs,[s.id]:s}})); }
  function setArtistPhoto(aid,url){ setData(d=>({...d, artists:d.artists.map(a=> a.id===aid?{...a, photo:url}:a)})); }
  function setAlbumCover(aid,alid,url){ setData(d=>({...d, artists:d.artists.map(a=> a.id===aid?{...a, albums:a.albums.map(al=> al.id===alid?{...al, cover:url}:al)}:a)})); }
  function saveArtist(aid,patch){ setData(d=>({...d, artists:d.artists.map(a=> a.id===aid?{...a, ...patch}:a)})); }
  function saveAlbum(aid,alid,patch){ setData(d=>({...d, artists:d.artists.map(a=> a.id===aid?{...a, albums:a.albums.map(al=> al.id===alid?{...al, ...patch}:al)}:a)})); }
  function deleteArtist(aid){
    setData(d=>{
      const a=d.artists.find(x=>x.id===aid); if(!a) return d;
      const ids=new Set(); a.albums.forEach(al=>al.songs.forEach(s=>ids.add(s))); a.singles.forEach(s=>ids.add(s));
      const songs={...d.songs}; ids.forEach(s=>delete songs[s]);
      return {...d, songs, artists:d.artists.filter(x=>x.id!==aid)};
    });
    setRecents(r=>r.filter(id=>{ const s=data.songs[id]; return s && s.artistId!==aid; }));
    if(route.artistId===aid) setHist({stack:[{view:'library'}], idx:0});
  }
  function deleteAlbum(aid,alid){
    setData(d=>{
      const a=d.artists.find(x=>x.id===aid); const al=a&&a.albums.find(x=>x.id===alid); if(!al) return d;
      const songs={...d.songs}; al.songs.forEach(s=>delete songs[s]);
      return {...d, songs, artists:d.artists.map(x=> x.id===aid?{...x, albums:x.albums.filter(y=>y.id!==alid)}:x)};
    });
    setRecents(r=>r.filter(id=>{ const s=data.songs[id]; return s && s.albumId!==alid; }));
    if(route.view==='album' && route.albumId===alid) go({view:'artist', artistId:aid});
  }
  function openCtxMenu(e, info){
    e.preventDefault(); e.stopPropagation();
    const x=Math.min(e.clientX, window.innerWidth-200);
    const y=Math.min(e.clientY, window.innerHeight-170);
    setCtxMenu({...info, x, y});
  }
  function togglePinArtist(id){ setPinned(p=>({...p, artists: p.artists.includes(id) ? p.artists.filter(x=>x!==id) : [id, ...p.artists]})); }
  function togglePinSong(id){ setPinned(p=>({...p, songs: p.songs.includes(id) ? p.songs.filter(x=>x!==id) : [id, ...p.songs]})); }
  function hideArtistFromSidebar(id){ setHiddenArtists(h=> h.includes(id)?h:[...h,id]); setPinned(p=>({...p, artists:p.artists.filter(x=>x!==id)})); }
  function removeRecent(id){ setRecents(r=>r.filter(x=>x!==id)); setPinned(p=>({...p, songs:p.songs.filter(x=>x!==id)})); }

  /* --- reordenamiento por drag --- */
  function moveById(arr, fromId, toId, key){
    const f=arr.findIndex(x=> key?x[key]===fromId:x===fromId);
    const t=arr.findIndex(x=> key?x[key]===toId:x===toId);
    if(f<0||t<0||f===t) return arr;
    const c=arr.slice(); const [it]=c.splice(f,1); c.splice(t,0,it); return c;
  }
  function moveArtist(fromId,toId){ setData(d=>({...d, artists:moveById(d.artists, fromId, toId, 'id')})); }
  function moveAlbum(artistId, fromId, toId){ setData(d=>({...d, artists:d.artists.map(a=> a.id===artistId?{...a, albums:moveById(a.albums, fromId, toId, 'id')}:a)})); }
  function moveSong(artistId, albumId, fromId, toId){ setData(d=>({...d, artists:d.artists.map(a=> a.id===artistId?{...a, albums:a.albums.map(al=> al.id===albumId?{...al, songs:moveById(al.songs, fromId, toId)}:al)}:a)})); }
  function moveAlbumHome(orderedIds, fromId, toId){ setAlbumOrder(moveById(orderedIds, fromId, toId)); }
  /* soltar un artista sobre el sidebar: lo des-oculta (si estaba quitado) y lo ubica */
  function placeArtistInSidebar(fromId, toId){
    setHiddenArtists(h=>h.filter(x=>x!==fromId));
    if(toId){ moveArtist(fromId, toId); }
    else setData(d=>{ const i=d.artists.findIndex(a=>a.id===fromId); if(i<0) return d; const c=d.artists.slice(); const [it]=c.splice(i,1); c.push(it); return {...d, artists:c}; });
  }
  function createArtist(v){
    const id='a_'+Date.now().toString(36);
    setData(d=>({...d, artists:[...d.artists, {id, name:v.name, kind:v.kind, genre:v.genre, initial:v.name[0].toUpperCase(), photo:null, albums:[], singles:[]}]}));
    setModal(null); go({view:'artist', artistId:id});
  }
  function createAlbum(aid,v){
    const id='al_'+Date.now().toString(36);
    setData(d=>({...d, artists:d.artists.map(a=> a.id===aid ? {...a, albums:[...a.albums, {id, title:v.title, year:v.year, cover:null, songs:[]}]} : a)}));
    setModal(null); go({view:'album', artistId:aid, albumId:id});
  }
  function createSong(aid, alid, v){
    const id='s_'+Date.now().toString(36);
    const song = {id, title:v.title, artistId:aid, albumId:alid, duration:'', key:'C', capo:0, tuningId:'std6', notes:'',
      blocks:[{type:'lyric', _k:id+'_b0', label:'Estrofa', lines:[{text:'Escribí o pegá la letra acá…', chords:[]}]}]};
    setData(d=>{
      const songs={...d.songs,[id]:song};
      const artists=d.artists.map(a=>{
        if(a.id!==aid) return a;
        if(alid) return {...a, albums:a.albums.map(al=> al.id===alid?{...al, songs:[...al.songs,id]}:al)};
        return {...a, singles:[...a.singles, id]};
      });
      return {...d, songs, artists};
    });
    setModal(null); go({view:'editor', songId:id, artistId:aid, albumId:alid});
  }

  const song = route.view==='editor' ? data.songs[route.songId] : null;
  const isEditor = route.view==='editor' && song;

  return (
    <div className={'app'+(sidebarOpen?'':' sidebar-hidden')}>
      {/* Title bar (Windows) */}
      <div className="titlebar">
        <div className="tb-left">
          <button className="tb-toggle" onClick={()=>setSidebarOpen(v=>!v)} title={sidebarOpen?'Ocultar panel':'Mostrar panel'} aria-label="Mostrar u ocultar panel lateral"><Ico n="side"/></button>
          <div className="tb-logo"></div>
          <span className="tb-title">APOLO</span>
        </div>
        <div className="tb-controls">
          <button className="tb-btn" onClick={()=>window.apolo&&window.apolo.win.minimize()} title="Minimizar" aria-label="Minimizar"><Ico n="win_min"/></button>
          <button className="tb-btn" onClick={()=>window.apolo&&window.apolo.win.toggleMaximize()} title="Maximizar" aria-label="Maximizar"><Ico n="win_max"/></button>
          <button className="tb-btn close" onClick={()=>window.apolo&&window.apolo.win.close()} title="Cerrar" aria-label="Cerrar"><Ico n="win_x"/></button>
        </div>
      </div>

      <div className="app-body">
        <Sidebar data={data} route={route} query={query} setQuery={setQuery} recents={recents} pinned={pinned} hiddenArtists={hiddenArtists} theme={theme} open={sidebarOpen} onToggleTheme={toggleTheme}
          onHome={goHome} onChordLib={()=>goChordLib()} onArtist={goArtist} onSong={goSong} onNewArtist={()=>setModal({type:'artist'})} onContextItem={openCtxMenu} onMoveArtist={moveArtist} onPlaceArtist={placeArtistInSidebar}/>

        <main className={'main'+(isEditor?' editor-bg':'')}>
          {!isEditor && (
            <div className="topbar">
              <button className="nav-btn" onClick={back} disabled={hist.idx===0}><Ico n="back"/></button>
              <button className="nav-btn" onClick={fwd} disabled={hist.idx>=hist.stack.length-1}><Ico n="fwd"/></button>
              <div className="spacer"></div>
            </div>
          )}

          {route.view==='library' && <LibraryView data={data} albumOrder={albumOrder} onArtist={goArtist} onAlbum={goAlbum} onNewArtist={()=>setModal({type:'artist'})} onPickArtist={setArtistPhoto} onPickAlbum={setAlbumCover} onContext={openCtxMenu} onMoveArtist={moveArtist} onMoveAlbumHome={moveAlbumHome}/>}
          {route.view==='chordlib' && <ChordLibraryView key={route.focus||''} lib={chordLib} focusName={route.focus} onSaveChord={saveChord} onDeleteChord={deleteChord}/>}
          {route.view==='artist' && <ArtistView data={data} artistId={route.artistId} onAlbum={goAlbum} onSong={goSong} onNewAlbum={aid=>setModal({type:'album', ctx:{aid}})} onNewSong={(aid,alid)=>setModal({type:'song', ctx:{aid,alid}})} onPickArtist={setArtistPhoto} onPickAlbum={setAlbumCover} onContext={openCtxMenu} onMoveAlbum={moveAlbum}/>}
          {route.view==='album' && <AlbumView data={data} artistId={route.artistId} albumId={route.albumId} onSong={goSong} onPickAlbum={setAlbumCover} onMoveSong={moveSong} onNewSong={(aid,alid)=>setModal({type:'song', ctx:{aid,alid, albumTitle:(data.artists.find(a=>a.id===aid)?.albums.find(al=>al.id===alid)?.title)}})}/>}
          {isEditor && <SongEditorScreen key={song.id} data={data} song={song} chordLib={chordLib} onChange={updateSong} onBack={back} onNavArtist={goArtist} onNavAlbum={goAlbum} onEditChord={name=>goChordLib(name)}/>}
        </main>
      </div>

      {modal && (modal.type==='artist'||modal.type==='album'||modal.type==='song') && (
        <CreateModal type={modal.type} ctx={modal.ctx||{}} onClose={()=>setModal(null)}
          onCreate={v=>{
            if(modal.type==='artist') createArtist(v);
            else if(modal.type==='album') createAlbum(modal.ctx.aid, v);
            else createSong(modal.ctx.aid, modal.ctx.alid, v);
          }}/>
      )}
      {modal && modal.type==='edit-artist' && (()=>{
        const a=data.artists.find(x=>x.id===modal.ctx.artistId);
        return a ? <EditModal kind="artist" entity={a} onClose={()=>setModal(null)} onSave={p=>{ saveArtist(a.id,p); setModal(null); }}/> : null;
      })()}
      {modal && modal.type==='edit-album' && (()=>{
        const a=data.artists.find(x=>x.id===modal.ctx.artistId); const al=a&&a.albums.find(x=>x.id===modal.ctx.albumId);
        return al ? <EditModal kind="album" entity={al} onClose={()=>setModal(null)} onSave={p=>{ saveAlbum(a.id,al.id,p); setModal(null); }}/> : null;
      })()}
      {modal && modal.type==='confirm-del' && (
        <ConfirmModal
          title={modal.ctx.kind==='artist'?'Borrar artista':'Borrar álbum'}
          message={modal.ctx.kind==='artist'
            ? `Se eliminará «${modal.ctx.name}» junto con sus álbumes y canciones. Esta acción no se puede deshacer.`
            : `Se eliminará el álbum «${modal.ctx.name}» y sus canciones. Esta acción no se puede deshacer.`}
          onClose={()=>setModal(null)}
          onConfirm={()=>{ modal.ctx.kind==='artist' ? deleteArtist(modal.ctx.artistId) : deleteAlbum(modal.ctx.artistId, modal.ctx.albumId); setModal(null); }}
        />
      )}

      {ctxMenu && (
        <>
          <div style={{position:'fixed',inset:0,zIndex:300}} onClick={()=>setCtxMenu(null)} onContextMenu={e=>{e.preventDefault(); setCtxMenu(null);}}></div>
          <div className="menu" style={{position:'fixed',left:ctxMenu.x,top:ctxMenu.y,zIndex:301,minWidth:172}}>
            {ctxMenu.source==='side' ? <>
              <button onClick={()=>{ ctxMenu.kind==='artist'?goArtist(ctxMenu.artistId):goSong(ctxMenu.songId); setCtxMenu(null); }}><Ico n="fwd"/> Abrir</button>
              <button onClick={()=>{ ctxMenu.kind==='artist'?togglePinArtist(ctxMenu.artistId):togglePinSong(ctxMenu.songId); setCtxMenu(null); }}><Ico n="pin"/> {ctxMenu.pinned?'Desanclar':'Anclar'}</button>
              <div className="sep"></div>
              <button onClick={()=>{ ctxMenu.kind==='artist'?hideArtistFromSidebar(ctxMenu.artistId):removeRecent(ctxMenu.songId); setCtxMenu(null); }}><Ico n="close"/> Quitar</button>
            </> : <>
              <button onClick={()=>{ ctxMenu.kind==='artist'?goArtist(ctxMenu.artistId):goAlbum(ctxMenu.artistId,ctxMenu.albumId); setCtxMenu(null); }}><Ico n="fwd"/> Abrir</button>
              <button onClick={()=>{ setModal({type: ctxMenu.kind==='artist'?'edit-artist':'edit-album', ctx:ctxMenu}); setCtxMenu(null); }}><Ico n="edit"/> Editar</button>
              <div className="sep"></div>
              <button style={{color:'var(--error)'}} onClick={()=>{ setModal({type:'confirm-del', ctx:ctxMenu}); setCtxMenu(null); }}><Ico n="trash"/> Borrar</button>
            </>}
          </div>
        </>
      )}

      {adjust && (
        <ImageAdjuster src={adjust.src} round={adjust.round}
          onCancel={()=>setAdjust(null)}
          onApply={url=>{ adjust.cb(url); setAdjust(null); }}/>
      )}

      <TweaksPanel>
        <TweakSection label="Apariencia"/>
        <TweakRadio label="Tema" value={theme} options={[{label:'Oscuro',value:'dark'},{label:'Claro',value:'light'}]} onChange={setTheme}/>
        <TweakColor label="Acento (acordes)" value={t.accent} options={['#CC785C','#D4A27F','#BF4D43','#61AAF2']} onChange={v=>setTweak('accent',v)}/>
        <TweakRadio label="Tipografía letra" value={t.lyricFont}
          options={[{label:'Sans',value:'"Hanken Grotesk", sans-serif'},{label:'Serif',value:'"Source Serif 4", serif'}]}
          onChange={v=>setTweak('lyricFont',v)}/>
      </TweaksPanel>
    </div>
  );
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#CC785C",
  "lyricFont": "\"Hanken Grotesk\", sans-serif"
}/*EDITMODE-END*/;

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
