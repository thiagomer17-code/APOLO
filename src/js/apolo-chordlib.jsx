/* ===================================================================
   APOLO — Biblioteca de acordes
   Vista de biblioteca + creador/editor de acordes (vertical, estilo
   diagrama). Los acordes de la biblioteca alimentan el panel "Acordes"
   del modo lectura (con dedos y cejilla).

   Variante: { frets:[c6..c1], fingers:[c6..c1], barre:{fret,from}|null,
               baseFret:1, label? }
   =================================================================== */

const CHORDLIB_ROOTS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const CHORDLIB_ENH = {'Db':'C#','Eb':'D#','Gb':'F#','Ab':'G#','Bb':'A#'};

/* --- digitaciones conocidas de posiciones abiertas: name -> [frets, fingers] --- */
const OPEN_FINGERINGS = {
  'C'  : [[-1,3,2,0,1,0],  [0,3,2,0,1,0]],
  'D'  : [[-1,-1,0,2,3,2], [0,0,0,1,3,2]],
  'E'  : [[0,2,2,1,0,0],   [0,2,3,1,0,0]],
  'G'  : [[3,2,0,0,0,3],   [2,1,0,0,0,3]],
  'A'  : [[-1,0,2,2,2,0],  [0,0,1,2,3,0]],
  'Em' : [[0,2,2,0,0,0],   [0,2,3,0,0,0]],
  'Am' : [[-1,0,2,2,1,0],  [0,0,2,3,1,0]],
  'Dm' : [[-1,-1,0,2,3,1], [0,0,0,2,3,1]],
  'C7' : [[-1,3,2,3,1,0],  [0,3,2,4,1,0]],
  'D7' : [[-1,-1,0,2,1,2], [0,0,0,2,1,3]],
  'E7' : [[0,2,0,1,0,0],   [0,2,0,1,0,0]],
  'G7' : [[3,2,0,0,0,1],   [3,2,0,0,0,1]],
  'A7' : [[-1,0,2,0,2,0],  [0,0,2,0,3,0]],
  'B7' : [[-1,2,1,2,0,2],  [0,2,1,3,0,4]],
};

/* --- variantes con cejilla (shape de Mi y de La) con digitación estándar --- */
function chordlibBarres(root, quality){
  const out=[];
  const R=CHORD_NOTE[root];
  if(R==null) return out;
  const eF=((R-4)%12+12)%12;   // traste de cejilla, forma de Mi (raíz en 6ª)
  const aF=((R-9)%12+12)%12;   // traste de cejilla, forma de La (raíz en 5ª)
  const E={ ''  : [[0,2,2,1,0,0],  [1,3,4,2,1,1]],
            'm' : [[0,2,2,0,0,0],  [1,3,4,1,1,1]],
            '7' : [[0,2,0,1,0,0],  [1,3,1,2,1,1]] };
  const A={ ''  : [[-1,0,2,2,2,0], [0,1,3,3,3,1]],
            'm' : [[-1,0,2,2,1,0], [0,1,3,4,2,1]],
            '7' : [[-1,0,2,0,2,0], [0,1,3,1,4,1]] };
  if(eF>0){
    const t=E[quality];
    out.push({ frets:t[0].map(v=>v<0?-1:v+eF), fingers:t[1].slice(),
               barre:{fret:eF, from:0}, baseFret:eF, label:'Cejilla '+eF });
  }
  if(aF>0){
    const t=A[quality];
    out.push({ frets:t[0].map(v=>v<0?-1:v+aF), fingers:t[1].slice(),
               barre:{fret:aF, from:1}, baseFret:aF, label:'Cejilla '+aF });
  }
  return out.sort((x,y)=>x.baseFret-y.baseFret);
}

/* --- biblioteca inicial: mayores, menores y séptimas de las 12 raíces --- */
function seedChordLib(){
  const lib={};
  CHORDLIB_ROOTS.forEach(root=>{
    ['','m','7'].forEach(q=>{
      const name=root+q;
      const variants=[];
      const open=OPEN_FINGERINGS[name];
      if(open) variants.push({ frets:open[0].slice(), fingers:open[1].slice(),
                               barre:null, baseFret:1, label:'Abierto' });
      variants.push(...chordlibBarres(root, q));
      if(variants.length) lib[name]={ name, variants:variants.slice(0,3) };
    });
  });
  return lib;
}

/* --- orden musical para el listado: por raíz (C, C#, D…) y largo del nombre --- */
function chordlibOrder(name){
  const m=(name||'').match(/^([A-G][#b]?)/);
  if(!m) return 99;
  const i=CHORDLIB_ROOTS.indexOf(CHORDLIB_ENH[m[1]]||m[1]);
  return i<0 ? 99 : i;
}

/* =================================================================
   Editor de acorde (creador vertical) — edita UNA variante
   ================================================================= */
function ChordEditor({initial, canSave=true, onSave, onCancel}){
  const ROWS=5, STR=6, CELLW=36, FNUMW=26, CAP=9;
  const [base,setBase]=React.useState((initial&&initial.baseFret)||1);
  const [cells,setCells]=React.useState(()=>{
    const c=Array.from({length:STR},()=>({row:0,mark:'o'}));
    if(initial) initial.frets.forEach((v,s)=>{
      if(v===-1) c[s]={row:0,mark:'x'};
      else if(v===0) c[s]={row:0,mark:'o'};
      else {
        const r=v-((initial.baseFret)||1)+1;
        c[s]= (r>=1&&r<=ROWS) ? {row:r,mark:null} : {row:0,mark:'o'};
      }
    });
    return c;
  });
  const [fingers,setFingers]=React.useState(()=> (initial&&initial.fingers)? initial.fingers.slice() : [0,0,0,0,0,0]);
  const [barre,setBarre]=React.useState(()=>{
    if(initial&&initial.barre){
      const r=initial.barre.fret-((initial.baseFret)||1)+1;
      if(r>=1&&r<=ROWS) return {row:r, from:initial.barre.from};
    }
    return null;
  });
  const [tool,setTool]=React.useState(1);          // dedo: 1-4 · 'T' · 0 (sin número)
  const [barreMode,setBarreMode]=React.useState(false);
  const [label,setLabel]=React.useState((initial&&initial.label)||'');

  function clickCell(s,row){
    if(barreMode){
      setBarre(b=> (b && b.row===row && b.from===s) ? null : {row, from:s});
      setBarreMode(false);
      return;
    }
    const had = cells[s].row===row;
    const nc=cells.slice(); nc[s]= had ? {row:0,mark:'o'} : {row,mark:null};
    const nf=fingers.slice(); nf[s]= had ? 0 : tool;
    setCells(nc); setFingers(nf);
  }
  function clickMark(s){
    const nc=cells.slice();
    if(nc[s].row>0){
      nc[s]={row:0,mark:'o'};
      const nf=fingers.slice(); nf[s]=0; setFingers(nf);
    } else {
      nc[s]={row:0, mark: nc[s].mark==='o' ? 'x' : 'o'};
    }
    setCells(nc);
  }

  /* arma la variante final: las cuerdas cubiertas solo por la cejilla
     suenan en el traste de la barra con el dedo 1 */
  function compose(){
    const frets=[], fing=[];
    for(let s=0;s<STR;s++){
      const c=cells[s];
      let f = c.row>0 ? base+c.row-1 : (c.mark==='x' ? -1 : 0);
      let g = c.row>0 ? (fingers[s]||0) : 0;
      if(barre && s>=barre.from && c.mark!=='x'){
        const bf=base+barre.row-1;
        if(f<=0){ f=bf; g=1; }
        else if(f===bf && !g) g=1;
      }
      frets.push(f); fing.push(g);
    }
    return { frets, fingers:fing,
             barre: barre ? {fret: base+barre.row-1, from: barre.from} : null,
             baseFret: base,
             label: label.trim() || undefined };
  }
  const v=compose();

  return (
    <div className="ced-wrap">
      <div>
        <div className="ced-tools">
          <span className="ced-lbl">Dedo</span>
          {[1,2,3,4,'T',0].map(t=>(
            <button key={String(t)} type="button" className={'ced-tool'+(tool===t?' on':'')}
              onClick={()=>setTool(t)}
              title={t===0?'Sin número':(t==='T'?'Pulgar':'Dedo '+t)}>{t===0?'·':t}</button>
          ))}
          <span style={{width:8}}></span>
          <button type="button" className={'ced-tool'+(barreMode?' on':'')} style={{minWidth:0,padding:'0 11px'}}
            onClick={()=>setBarreMode(m=>!m)}>Cejilla</button>
          {barre && <button type="button" className="mini" onClick={()=>setBarre(null)}>Quitar cejilla</button>}
        </div>
        <div className="ced-hint">
          {barreMode
            ? 'Tocá la celda donde EMPIEZA la cejilla (la barra cubre hasta la 1ª cuerda).'
            : 'Tocá una celda para poner o sacar el dedo elegido. Arriba de cada cuerda: ○ al aire · × muteada.'}
        </div>

        <div className="ced-board">
          <div className="ced-mrow">
            <span className="ced-fnum"></span>
            {Array.from({length:STR}).map((_,s)=>(
              <button key={s} type="button" className="ced-mark" onClick={()=>clickMark(s)}
                title="Alternar al aire (○) / muteada (×)">
                {cells[s].row>0 ? '' : (cells[s].mark==='x'?'×':'○')}
              </button>
            ))}
          </div>
          {Array.from({length:ROWS}).map((_,r)=>{
            const row=r+1;
            return (
              <div className={'ced-row'+(base===1&&r===0?' first':'')+(r===ROWS-1?' last':'')} key={r}>
                <span className="ced-fnum">{base+r}</span>
                {Array.from({length:STR}).map((_,s)=>(
                  <button key={s} type="button" className="ced-cell" onClick={()=>clickCell(s,row)}>
                    {cells[s].row===row && <span className="ced-dot">{fingers[s]||''}</span>}
                  </button>
                ))}
                {barre && barre.row===row && (
                  <span className="ced-bar" style={{
                    left: FNUMW + barre.from*CELLW + CELLW*0.5 - CAP,
                    width: (STR-1-barre.from)*CELLW + CAP*2
                  }}></span>
                )}
              </div>
            );
          })}
          <div className="ced-srow">
            <span className="ced-fnum"></span>
            {['E','A','D','G','B','e'].map((n,s)=><span key={s} className="ced-sname">{n}</span>)}
          </div>
        </div>

        <div className="ced-base">
          <span className="ced-lbl">Desde traste</span>
          <div className="stepper">
            <button type="button" onClick={()=>setBase(b=>Math.max(1,b-1))}><Ico n="minus"/></button>
            <span className="val">{base}</span>
            <button type="button" onClick={()=>setBase(b=>Math.min(15,b+1))}><Ico n="plusc"/></button>
          </div>
        </div>
      </div>

      <div className="ced-preview">
        <span className="ced-lbl">Vista previa</span>
        <ChordDiagram shape={v.frets} fingers={v.fingers} barre={v.barre} base={base} scale={1.35}/>
        <div className="field" style={{width:172,marginBottom:0}}>
          <label>Etiqueta (opcional)</label>
          <input className="input" value={label} onChange={e=>setLabel(e.target.value)} placeholder="Abierto, Cejilla 5…"/>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancelar</button>
          <button type="button" className="btn btn-primary btn-sm" disabled={!canSave} onClick={()=>onSave(compose())}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

/* =================================================================
   Modal de detalle: variantes de un acorde (editar / borrar / agregar)
   ================================================================= */
function ChordDetailModal({chord, onClose, onSave, onDelete}){
  const [editing,setEditing]=React.useState(null);  // null | {idx} (-1 = nueva)
  /* Escape vuelve un nivel: del editor de variante a la grilla; recién ahí cierra */
  React.useEffect(()=>{
    const h=e=>{ if(e.key==='Escape'){ if(editing!==null) setEditing(null); else onClose(); } };
    window.addEventListener('keydown',h); return ()=>window.removeEventListener('keydown',h);
  },[editing]);
  function saveVariant(v){
    const vs=chord.variants.slice();
    if(editing.idx>=0) vs[editing.idx]=v; else vs.push(v);
    onSave(vs); setEditing(null);
  }
  function delVariant(i){
    const vs=chord.variants.slice(); vs.splice(i,1); onSave(vs);
  }
  return (
    <div className="overlay" onMouseDown={e=>{ if(e.target===e.currentTarget){ if(editing!==null) setEditing(null); else onClose(); } }}>
      <div className="modal modal-lg">
        {editing===null ? (
          <>
            <h3 style={{fontFamily:'var(--font-mono)'}}>{chord.name}</h3>
            <div className="sub">{chord.variants.length} variante{chord.variants.length!==1?'s':''} · editá, borrá o sumá posiciones</div>
            <div className="cdet-grid">
              {chord.variants.map((v,i)=>(
                <div key={i} className="cdet-card">
                  <ChordDiagram shape={v.frets} fingers={v.fingers}
                    barre={'barre' in v ? (v.barre||null) : undefined} base={v.baseFret}/>
                  <div className="cdet-lbl">{v.label || 'Variante '+(i+1)}</div>
                  <div className="cdet-acts">
                    <button className="mini" onClick={()=>setEditing({idx:i})}><Ico n="edit"/> Editar</button>
                    <button className="mini danger" onClick={()=>delVariant(i)} title="Borrar variante"><Ico n="trash"/></button>
                  </div>
                </div>
              ))}
              <button className="cdet-add" onClick={()=>setEditing({idx:-1})}><Ico n="plus"/> Agregar variante</button>
            </div>
            <div className="modal-actions" style={{justifyContent:'space-between'}}>
              <button className="btn btn-ghost btn-sm" style={{color:'var(--error)'}} onClick={onDelete}><Ico n="trash"/> Borrar acorde</button>
              <button className="btn btn-primary btn-sm" onClick={onClose}>Listo</button>
            </div>
          </>
        ) : (
          <>
            <h3 style={{fontFamily:'var(--font-mono)'}}>{chord.name} <span style={{color:'var(--text-3)',fontWeight:600,fontSize:13,fontFamily:'var(--font-ui)'}}>· {editing.idx>=0?'editar variante':'nueva variante'}</span></h3>
            <ChordEditor initial={editing.idx>=0 ? chord.variants[editing.idx] : null}
              onSave={saveVariant} onCancel={()=>setEditing(null)}/>
          </>
        )}
      </div>
    </div>
  );
}

/* =================================================================
   Modal de creación: nombre + editor
   ================================================================= */
function NewChordModal({initialName, lib, onClose, onCreate}){
  const [name,setName]=React.useState(initialName||'');
  React.useEffect(()=>{
    const h=e=>{ if(e.key==='Escape') onClose(); };
    window.addEventListener('keydown',h); return ()=>window.removeEventListener('keydown',h);
  },[]);
  const trimmed=name.trim();
  const existing = trimmed ? libLookup(lib, trimmed) : null;
  /* si el nombre tiene forma generable, arrancar el editor con esa sugerencia */
  const suggestion=React.useMemo(()=>{
    if(!initialName) return null;
    const s=chordShapes(initialName)[0];
    if(!s) return null;
    const pos=s.filter(x=>x>0);
    const mx=pos.length?Math.max(...pos):0, mn=pos.length?Math.min(...pos):0;
    return { frets:s, baseFret: mx>5 ? mn : 1 };
  },[initialName]);
  return (
    <div className="overlay" onMouseDown={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="modal modal-lg">
        <h3>Nuevo acorde</h3>
        <div className="field" style={{maxWidth:230,marginTop:12}}>
          <label>Nombre</label>
          <input className="input" autoFocus={!initialName} value={name} spellCheck="false"
            style={{fontFamily:'var(--font-mono)'}}
            onChange={e=>setName(e.target.value)} placeholder="Ej. Cadd9, F#m7, C/G"/>
        </div>
        {existing && <div className="muted" style={{fontSize:12,margin:'-6px 0 10px'}}>«{existing.name}» ya está en la biblioteca — esto se agrega como variante nueva.</div>}
        <ChordEditor initial={suggestion} canSave={!!trimmed}
          onSave={vv=>onCreate(trimmed, vv)} onCancel={onClose}/>
      </div>
    </div>
  );
}

/* =================================================================
   Vista: Biblioteca de acordes
   ================================================================= */
function ChordLibraryView({lib, focusName, onSaveChord, onDeleteChord}){
  const [q,setQ]=React.useState('');
  const focused = focusName ? libLookup(lib, focusName) : null;
  const [detail,setDetail]=React.useState(()=> focused ? focused.name : null);
  const [createName,setCreateName]=React.useState(()=> (focusName && !focused) ? focusName : null);
  const [confirmDel,setConfirmDel]=React.useState(false);

  const qq=q.trim().toLowerCase();
  const chords=Object.values(lib)
    .filter(c=>!qq || c.name.toLowerCase().includes(qq))
    .sort((a,b)=> chordlibOrder(a.name)-chordlibOrder(b.name)
      || a.name.length-b.name.length
      || a.name.localeCompare(b.name));
  const totalVars=Object.values(lib).reduce((n,c)=>n+c.variants.length,0);

  function create(nm, variant){
    const ex=libLookup(lib, nm);
    const key=ex ? ex.name : nm;
    onSaveChord(key, ex ? [...ex.variants, variant] : [variant]);
    setCreateName(null);
    setDetail(key);
  }

  return (
    <div className="page">
      <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginTop:6}}>
        <h1 style={{fontSize:30,fontWeight:800,letterSpacing:'-0.02em'}}>Biblioteca de acordes</h1>
        <button className="btn btn-soft btn-sm" onClick={()=>setCreateName('')}><Ico n="plus"/> Nuevo acorde</button>
      </div>

      <div className="clib-bar">
        <div className="search clib-search">
          <Ico n="search"/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar acorde (Am, F#, C7…)"/>
          {q && <button className="search-clear" onClick={()=>setQ('')} title="Limpiar"><Ico n="close"/></button>}
        </div>
        <span className="muted" style={{fontSize:12.5}}>{chords.length} acorde{chords.length!==1?'s':''} · {totalVars} variantes</span>
      </div>

      <div className="clib-grid">
        {chords.map(c=>(
          <div key={c.name} className="clib-card" role="button" tabIndex={0}
            onClick={()=>setDetail(c.name)}
            onKeyDown={e=>{ if(e.key==='Enter') setDetail(c.name); }}>
            <div className="clib-name">{c.name}</div>
            {c.variants.length
              ? <ChordDiagram shape={c.variants[0].frets} fingers={c.variants[0].fingers}
                  barre={'barre' in c.variants[0] ? (c.variants[0].barre||null) : undefined}
                  base={c.variants[0].baseFret}/>
              : <div className="cpc-noshape">sin diagrama</div>}
            <div className="clib-count">{c.variants.length} variante{c.variants.length!==1?'s':''}</div>
          </div>
        ))}
        {chords.length===0 && (
          <div className="muted" style={{gridColumn:'1 / -1',padding:'34px 0',textAlign:'center',fontSize:13.5}}>
            Sin resultados para «{q.trim()}». Podés crearlo con «Nuevo acorde».
          </div>
        )}
      </div>

      {detail && lib[detail] && !confirmDel && (
        <ChordDetailModal chord={lib[detail]}
          onClose={()=>setDetail(null)}
          onSave={vs=>{ vs.length ? onSaveChord(detail, vs) : setConfirmDel(true); }}
          onDelete={()=>setConfirmDel(true)}/>
      )}
      {detail && confirmDel && (
        <ConfirmModal title="Borrar acorde"
          message={`Se eliminará «${detail}» de la biblioteca con todas sus variantes. Las canciones que lo usan vuelven al diagrama automático.`}
          onClose={()=>setConfirmDel(false)}
          onConfirm={()=>{ onDeleteChord(detail); setConfirmDel(false); setDetail(null); }}/>
      )}
      {createName!=null && (
        <NewChordModal initialName={createName} lib={lib}
          onClose={()=>setCreateName(null)} onCreate={create}/>
      )}
    </div>
  );
}

Object.assign(window, { seedChordLib, ChordLibraryView, ChordEditor, ChordDetailModal, NewChordModal });
