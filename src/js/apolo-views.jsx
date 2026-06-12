/* ===================================================================
   APOLO — Vistas: Biblioteca · Artista · Álbum + Modales
   =================================================================== */

/* abre el selector de archivos → pasa por el ajustador → devuelve dataURL recortado */
function pickImage(cb, opts){
  const inp = document.createElement('input');
  inp.type='file'; inp.accept='image/*';
  inp.onchange = ()=>{
    const f=inp.files && inp.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=()=>{
      const src=r.result;
      if(typeof window.__apoloAdjust==='function') window.__apoloAdjust(src, cb, opts||{});
      else cb(src);
    };
    r.readAsDataURL(f);
  };
  inp.click();
}
/* inclinación sutil determinística para el polaroid */
function tiltFor(seed){ let h=0; for(const c of (seed||'')) h=(h*31+c.charCodeAt(0))>>>0; return (((h%50)/10)-2.5).toFixed(2); }

/* Marco Polaroid reutilizable (rectangular, pie blanco) */
function Polaroid({seed, label, photo, caption, onPick, camAlways, camCompact, showPlay, hero, noTilt}){
  return (
    <div className={'polaroid'+(hero?' hero-pol':'')+(camAlways?' cam-on':'')} style={noTilt?null:{'--tilt':tiltFor(seed)+'deg'}}>
      <div className="photo" style={photo?null:{background:monoColor(seed)}}>
        {photo ? <img src={photo} alt=""/> : <span className="mono-fill">{(label||'?')[0].toUpperCase()}</span>}
        {onPick && (camCompact
          ? <button className="cam cam-mini" onClick={e=>{e.stopPropagation(); pickImage(onPick);}} title="Cambiar carátula"><Ico n="cam"/></button>
          : <button className="cam" onClick={e=>{e.stopPropagation(); pickImage(onPick);}} title="Subir imagen"><Ico n="cam"/> {camAlways?'Cambiar portada':'Cambiar'}</button>)}
        {showPlay && <span className="pol-play"><Ico n="play"/></span>}
      </div>
      {caption!=null && <div className="cap">{caption}</div>}
    </div>
  );
}

/* Tarjeta simple cuadrada (estilo Spotify) */
function PolCard({seed, label, photo, title, sub, onClick, onPick, onContext, drag}){
  return (
    <div className="scard" role="button" tabIndex={0} onClick={onClick} onContextMenu={onContext} {...(drag||{})}>
      <div className="scard-art" style={photo?null:{background:monoColor(seed)}}>
        {photo ? <img src={photo} alt=""/> : <span className="mono-fill">{(label||'?')[0].toUpperCase()}</span>}
        {onPick && <button className="cam" onClick={e=>{e.stopPropagation(); pickImage(onPick);}} title="Cambiar carátula"><Ico n="cam"/></button>}
      </div>
      <div className="scard-title">{title}</div>
      <div className="scard-sub">{sub}</div>
    </div>
  );
}

/* Arte de encabezado (hero) */
function HeroArt({seed, label, photo, round, fontSize, onPick}){
  return (
    <div className={'hero-art'+(round?' round':'')} style={photo?null:{background:monoColor(seed), fontSize, color:'#fff'}}>
      {photo ? <img src={photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <span className="mono-fill" style={{fontSize}}>{(label||'?')[0].toUpperCase()}</span>}
      {onPick && <button className="hero-cam" onClick={e=>{e.stopPropagation(); pickImage(onPick, {round});}}><Ico n="cam"/> Cambiar portada</button>}
    </div>
  );
}

/* ---------------- Biblioteca (home) ---------------- */
function LibraryView({data, albumOrder, onArtist, onAlbum, onNewArtist, onPickArtist, onPickAlbum, onContext, onMoveArtist, onMoveAlbumHome}){
  const albums = [];
  data.artists.forEach(a => a.albums.forEach(al => albums.push({...al, artist:a})));
  const orderIdx = {}; (albumOrder||[]).forEach((id,i)=>{ orderIdx[id]=i; });
  albums.sort((x,y)=> (orderIdx[x.id]??9999) - (orderIdx[y.id]??9999));
  const orderedAlbumIds = albums.map(al=>al.id);
  const hour = new Date().getHours();
  const saludo = hour<6?'Buenas noches':hour<13?'Buenos días':hour<20?'Buenas tardes':'Buenas noches';

  if(data.artists.length===0){
    return (
      <div className="page">
        <div className="empty" style={{paddingTop:120}}>
          <div className="ico"><Ico n="guitar"/></div>
          <h3>Tu biblioteca está vacía</h3>
          <p>Empezá creando el perfil de un artista o banda. Después vas a poder sumarle álbumes y canciones con sus acordes y tablaturas.</p>
          <button className="btn btn-primary" onClick={onNewArtist}><Ico n="plus"/> Nuevo artista</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginTop:6,marginBottom:6}}>
        <h1 style={{fontSize:30,fontWeight:800,letterSpacing:'-0.02em'}}>{saludo}</h1>
        <button className="btn btn-soft btn-sm" onClick={onNewArtist}><Ico n="plus"/> Nuevo artista</button>
      </div>

      <div className="section-title"><h2>Artistas</h2></div>
      <div className="grid">
        {data.artists.map(a=>(
          <PolCard key={a.id} seed={a.name} label={a.name} photo={a.photo} title={a.name} sub={`${a.kind} · ${a.genre}`} onClick={()=>onArtist(a.id)} onPick={url=>onPickArtist(a.id,url)} onContext={e=>onContext(e,{kind:'artist',artistId:a.id,name:a.name})} drag={dragProps('artist', a.id, onMoveArtist)}/>
        ))}
      </div>

      {albums.length>0 && <>
        <div className="section-title"><h2>Álbumes</h2></div>
        <div className="grid">
          {albums.map(al=>(
            <PolCard key={al.id} seed={al.title} label={al.title} photo={al.cover} title={al.title} sub={`${al.year} · ${al.artist.name}`} onClick={()=>onAlbum(al.artist.id, al.id)} onPick={url=>onPickAlbum(al.artist.id, al.id, url)} onContext={e=>onContext(e,{kind:'album',artistId:al.artist.id,albumId:al.id,name:al.title})} drag={dragProps('album', al.id, (from,to)=>onMoveAlbumHome(orderedAlbumIds, from, to))}/>
          ))}
        </div>
      </>}
    </div>
  );
}

/* ---------------- Perfil de artista ---------------- */
function ArtistView({data, artistId, onAlbum, onSong, onNewAlbum, onNewSong, onPickArtist, onPickAlbum, onContext, onMoveAlbum}){
  const a = data.artists.find(x=>x.id===artistId);
  if(!a) return null;
  const songCount = a.albums.reduce((n,al)=>n+al.songs.length,0) + a.singles.length;
  return (
    <div>
      <div className="hero" style={{'--hero-tint': monoColor(a.name).match(/#\w+/)[0]+'66'}}>
        <HeroArt round seed={a.name} label={a.name} photo={a.photo} fontSize={84} onPick={url=>onPickArtist(a.id,url)}/>
        <div className="hero-info">
          <div className="hero-kicker"><Ico n="music"/> {a.kind}</div>
          <div className="hero-title">{a.name}</div>
          <div className="hero-sub"><span>{a.genre}</span><span className="dot"></span><span>{a.albums.length} álbum{a.albums.length!==1?'es':''}</span><span className="dot"></span><span>{songCount} canciones</span></div>
        </div>
      </div>

      <div className="page">
        <div className="section-title">
          <h2>Álbumes</h2>
          <button className="btn btn-soft btn-sm" onClick={()=>onNewAlbum(a.id)}><Ico n="plus"/> Nuevo álbum</button>
        </div>
        {a.albums.length>0 ? (
          <div className="grid">
            {a.albums.map(al=>(
              <PolCard key={al.id} seed={al.title} label={al.title} photo={al.cover} title={al.title} sub={`${al.year} · ${al.songs.length} canciones`} onClick={()=>onAlbum(a.id, al.id)} onPick={url=>onPickAlbum(a.id, al.id, url)} onContext={e=>onContext(e,{kind:'album',artistId:a.id,albumId:al.id,name:al.title})} drag={dragProps('album', al.id, (from,to)=>onMoveAlbum(a.id, from, to))}/>
            ))}
          </div>
        ) : <div className="muted" style={{fontSize:13.5,padding:'4px 2px 8px'}}>Todavía no hay álbumes.</div>}

        <div className="section-title">
          <h2>Canciones sueltas</h2>
          <button className="btn btn-soft btn-sm" onClick={()=>onNewSong(a.id, null)}><Ico n="plus"/> Nueva canción</button>
        </div>
        {a.singles.length>0 ? (
          <div className="songlist">
            <div className="song-head"><span style={{textAlign:'center'}}>#</span><span>Título</span><span>Tono</span></div>
            {a.singles.map((sid,i)=>{
              const s = data.songs[sid]; if(!s) return null;
              return <SongRow key={sid} s={s} i={i} onClick={()=>onSong(sid)}/>;
            })}
          </div>
        ) : <div className="muted" style={{fontSize:13.5,padding:'4px 2px'}}>Sin canciones sueltas. Creá una con el botón de arriba.</div>}
      </div>
    </div>
  );
}

/* ---------------- Álbum ---------------- */
function AlbumView({data, artistId, albumId, onSong, onNewSong, onPickAlbum, onMoveSong}){
  const a = data.artists.find(x=>x.id===artistId);
  const al = a && a.albums.find(x=>x.id===albumId);
  if(!al) return null;
  return (
    <div>
      <div className="hero" style={{'--hero-tint': monoColor(al.title).match(/#\w+/)[0]+'66'}}>
        <HeroArt seed={al.title} label={al.title} photo={al.cover} fontSize={74} onPick={url=>onPickAlbum(a.id, al.id, url)}/>
        <div className="hero-info">
          <div className="hero-kicker">Álbum</div>
          <div className="hero-title">{al.title}</div>
          <div className="hero-sub"><b style={{color:'var(--text)'}}>{a.name}</b><span className="dot"></span><span>{al.year}</span><span className="dot"></span><span>{al.songs.length} canciones</span></div>
        </div>
      </div>

      <div className="page">
        <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:6}}>
          <button className="btn btn-primary btn-sm" onClick={()=>onSong(al.songs[0])} disabled={!al.songs.length}><Ico n="play"/> Tocar</button>
          <button className="btn btn-ghost btn-sm" onClick={()=>onNewSong(a.id, al.id)}><Ico n="plus"/> Nueva canción</button>
        </div>
        <div className="songlist" style={{marginTop:18}}>
          <div className="song-head"><span style={{textAlign:'center'}}>#</span><span>Título</span><span>Tono</span></div>
          {al.songs.map((sid,i)=>{
            const s = data.songs[sid]; if(!s) return null;
            return <SongRow key={sid} s={s} i={i} onClick={()=>onSong(sid)} drag={dragProps('song', sid, (from,to)=>onMoveSong(a.id, al.id, from, to))}/>;
          })}
          {al.songs.length===0 && <div className="muted" style={{fontSize:13.5,padding:'16px 2px'}}>Álbum vacío. Agregá la primera canción.</div>}
        </div>
      </div>
    </div>
  );
}

function SongRow({s, i, onClick, drag}){
  const tabs = (s.blocks||[]).filter(b=>b.type==='tab').length;
  return (
    <div className="song-row" onClick={onClick} {...(drag||{})}>
      <span className="idx">
        <span className="num">{i+1}</span>
        <span className="pl" style={{placeItems:'center'}}><Ico n="play"/></span>
      </span>
      <span style={{minWidth:0}}>
        <div className="s-title">{s.title}</div>
        <div className="s-meta">{s.capo>0?`Capo ${s.capo} · `:''}{tabs>0?`${tabs} tablatura${tabs>1?'s':''}`:'Cifrado'}</div>
      </span>
      <span className="s-tags"><span className="tag accent">{s.key}</span></span>
    </div>
  );
}

/* ---------------- Modal genérico ---------------- */
function Modal({title, sub, onClose, children, onSubmit, submitLabel='Crear', canSubmit=true, danger=false}){
  React.useEffect(()=>{
    const h = e=>{ if(e.key==='Escape') onClose(); };
    window.addEventListener('keydown',h); return ()=>window.removeEventListener('keydown',h);
  },[]);
  return (
    <div className="overlay" onMouseDown={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <form className="modal" onSubmit={e=>{e.preventDefault(); if(canSubmit) onSubmit();}}>
        <h3>{title}</h3>
        {sub && <div className="sub">{sub}</div>}
        {children}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={!canSubmit} style={danger?{background:'var(--error)',color:'#fff'}:null}>{submitLabel}</button>
        </div>
      </form>
    </div>
  );
}

/* ---------------- Editar artista / álbum ---------------- */
function EditModal({kind, entity, onClose, onSave}){
  const isArtist = kind==='artist';
  const [name,setName] = React.useState(isArtist?entity.name:entity.title);
  const [kindv,setKindv] = React.useState(entity.kind||'Banda');
  const [genre,setGenre] = React.useState(entity.genre||'');
  const [year,setYear] = React.useState(entity.year||new Date().getFullYear());
  const [img,setImg] = React.useState(isArtist?entity.photo:entity.cover);
  function save(){
    onSave(isArtist
      ? {name:name.trim(), kind:kindv, genre:genre.trim()||'Sin género', photo:img}
      : {title:name.trim(), year:+year||new Date().getFullYear(), cover:img});
  }
  return (
    <Modal title={isArtist?'Editar artista':'Editar álbum'} onClose={onClose} canSubmit={!!name.trim()} onSubmit={save} submitLabel="Guardar">
      <div className="field"><label>{isArtist?'Nombre':'Título'}</label><input className="input" autoFocus value={name} onChange={e=>setName(e.target.value)}/></div>
      {isArtist ? <>
        <div className="field"><label>Tipo</label><select className="input" value={kindv} onChange={e=>setKindv(e.target.value)}><option>Banda</option><option>Solista</option></select></div>
        <div className="field"><label>Género / Origen</label><input className="input" value={genre} onChange={e=>setGenre(e.target.value)} placeholder="Folk rock · Rosario"/></div>
      </> : (
        <div className="field"><label>Año</label><input className="input" type="number" value={year} onChange={e=>setYear(e.target.value)}/></div>
      )}
      <div className="field">
        <label>{isArtist?'Foto':'Portada'}</label>
        <div className="edit-cover">
          <div className={'edit-cover-thumb'+(isArtist?' round':'')} style={img?null:{background:monoColor(name)}}>
            {img ? <img src={img} alt=""/> : <span>{(name||'?')[0].toUpperCase()}</span>}
          </div>
          <div className="edit-cover-acts">
            <button type="button" className="btn btn-soft btn-sm" onClick={()=>pickImage(setImg, {round:isArtist})}><Ico n="cam"/> Subir imagen</button>
            {img && <button type="button" className="btn btn-ghost btn-sm" onClick={()=>setImg(null)}>Quitar</button>}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ConfirmModal({title, message, confirmLabel, onConfirm, onClose}){
  return (
    <Modal title={title} onClose={onClose} onSubmit={onConfirm} submitLabel={confirmLabel||'Borrar'} danger>
      <p style={{color:'var(--text-2)',fontSize:14,lineHeight:1.55}}>{message}</p>
    </Modal>
  );
}

/* ---------------- Ajustar imagen (mover · zoom · rotar · recortar) ---------------- */
function ImageAdjuster({src, round, onCancel, onApply}){
  const S = 320, OUT = 800;
  const imgRef = React.useRef(null);
  const [nat, setNat] = React.useState(null);
  const [zoom, setZoom] = React.useState(1);
  const [rot, setRot] = React.useState(0);
  const [off, setOff] = React.useState({x:0, y:0});
  const offRef = React.useRef(off); offRef.current = off;

  React.useEffect(()=>{
    const h = e=>{ if(e.key==='Escape') onCancel(); };
    window.addEventListener('keydown', h); return ()=>window.removeEventListener('keydown', h);
  },[]);

  /* tamaño base: la imagen "cubre" el cuadro (dimensión menor = S) */
  const base = React.useMemo(()=>{
    if(!nat) return null;
    const k = S/Math.min(nat.w, nat.h);
    return {w:nat.w*k, h:nat.h*k};
  },[nat]);

  function extents(z, r){
    if(!base) return {x:0, y:0};
    const horiz = (r%180===0) ? base.w : base.h;
    const vert  = (r%180===0) ? base.h : base.w;
    return { x:Math.max(0,(horiz*z - S)/2), y:Math.max(0,(vert*z - S)/2) };
  }
  function clampOff(o, z, r){
    const e = extents(z, r);
    return { x:Math.max(-e.x, Math.min(e.x, o.x)), y:Math.max(-e.y, Math.min(e.y, o.y)) };
  }
  React.useEffect(()=>{ setOff(o=>clampOff(o, zoom, rot)); },[zoom, rot, base]);

  function onDown(e){
    e.preventDefault();
    const sx=e.clientX, sy=e.clientY, o0={...offRef.current};
    const move=(ev)=> setOff(clampOff({x:o0.x+(ev.clientX-sx), y:o0.y+(ev.clientY-sy)}, zoom, rot));
    const up=()=>{ window.removeEventListener('mousemove',move); window.removeEventListener('mouseup',up); };
    window.addEventListener('mousemove',move); window.addEventListener('mouseup',up);
  }
  function onWheel(e){ e.preventDefault(); setZoom(z=>Math.max(1, Math.min(4, +(z - e.deltaY*0.0016).toFixed(3)))); }
  function rotate(dir){ setRot(r=>((r+dir*90)%360+360)%360); }
  function recenter(){ setZoom(1); setRot(0); setOff({x:0, y:0}); }

  function apply(){
    const img=imgRef.current;
    if(!img || !base){ onApply(src); return; }
    const ratio=OUT/S;
    const canvas=document.createElement('canvas'); canvas.width=OUT; canvas.height=OUT;
    const ctx=canvas.getContext('2d');
    ctx.imageSmoothingQuality='high';
    ctx.fillStyle='#000'; ctx.fillRect(0,0,OUT,OUT);
    ctx.save();
    ctx.translate(OUT/2 + off.x*ratio, OUT/2 + off.y*ratio);
    ctx.rotate(rot*Math.PI/180);
    ctx.scale(zoom, zoom);
    const dw=base.w*ratio, dh=base.h*ratio;
    ctx.drawImage(img, -dw/2, -dh/2, dw, dh);
    ctx.restore();
    onApply(canvas.toDataURL('image/jpeg', 0.92));
  }

  const imgStyle = base ? {
    position:'absolute', left:'50%', top:'50%',
    width:base.w, height:base.h,
    marginLeft:-base.w/2, marginTop:-base.h/2,
    transform:`translate(${off.x}px, ${off.y}px) rotate(${rot}deg) scale(${zoom})`,
    transformOrigin:'center', userSelect:'none', WebkitUserDrag:'none', pointerEvents:'none',
  } : {opacity:0};

  return (
    <div className="overlay imgadj-overlay" onMouseDown={e=>{ if(e.target===e.currentTarget) onCancel(); }}>
      <div className="imgadj">
        <h3>Ajustar {round?'foto':'portada'}</h3>
        <div className="imgadj-sub">Arrastrá para mover · rueda del mouse o control para acercar</div>

        <div className={'imgadj-stage'+(round?' round':'')} style={{width:S, height:S}}
             onMouseDown={onDown} onWheel={onWheel}>
          <img ref={imgRef} src={src} alt="" draggable="false" style={imgStyle}
               onLoad={e=>setNat({w:e.target.naturalWidth, h:e.target.naturalHeight})}/>
          <div className="imgadj-grid" aria-hidden="true"></div>
          <div className="imgadj-mask" aria-hidden="true"></div>
        </div>

        <div className="imgadj-ctl">
          <button type="button" className="imgadj-ico" title="Rotar a la izquierda" onClick={()=>rotate(-1)}><Ico n="rotl"/></button>
          <button type="button" className="imgadj-ico" title="Rotar a la derecha" onClick={()=>rotate(1)}><Ico n="rotr"/></button>
          <input type="range" className="imgadj-zoom" min="1" max="4" step="0.01" value={zoom}
                 onChange={e=>{ const z=+e.target.value; setZoom(z); setOff(o=>clampOff(o, z, rot)); }}/>
          <button type="button" className="imgadj-ico" title="Centrar y restablecer" onClick={recenter}><Ico n="center"/></button>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancelar</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={apply}>Aplicar</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LibraryView, ArtistView, AlbumView, SongRow, Modal, EditModal, ConfirmModal, ImageAdjuster, Polaroid, PolCard, HeroArt, pickImage });
