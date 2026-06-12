/* ===================================================================
   APOLO — Bloque de TABLATURA
   Grilla editable: filas = cuerdas, columnas = tiempo.
   Afinación configurable (n.º de cuerdas + nota de cada una).
   =================================================================== */
const TECH_RE = /[hpb\/\\x~]/;
const TAB_LEGEND = 'h hammer · p pull · / slide↑ · \\ slide↓ · b bend · x mute';

function stringsFor(block){
  if(block.strings && block.strings.length) return block.strings;
  const t = APOLO_TUNINGS.find(t=>t.id===block.tuningId);
  return (t && t.strings) || ['e','B','G','D','A','E'];
}

function TabBlock({block, editing, onChange, onDelete}){
  const strings = stringsFor(block);
  const cols = (block.grid[0]||[]).length || 8;
  const [menu, setMenu] = React.useState(false);

  function setCell(r,c,val){
    val = val.replace(/\s/g,'').slice(0,4);
    const grid = block.grid.map(row=>row.slice());
    grid[r][c] = val;
    onChange({...block, grid});
  }
  function setLabel(v){ onChange({...block, label:v}); }
  function setStringLabel(r,v){
    const ns = strings.slice(); ns[r]=v.slice(0,3);
    onChange({...block, strings:ns});
  }
  function addCol(){ onChange({...block, grid:block.grid.map(row=>[...row,''])}); }
  function delCol(){ if(cols<=2) return; onChange({...block, grid:block.grid.map(row=>row.slice(0,-1))}); }
  function applyTuning(t){
    const grid = t.strings.map((_,r)=> block.grid[r] ? block.grid[r].slice() : Array(cols).fill(''));
    onChange({...block, tuningId:t.id, strings:t.strings.slice(), grid});
    setMenu(false);
  }
  function addString(){
    const ns=[...strings,'E']; const grid=[...block.grid.map(r=>r.slice()), Array(cols).fill('')];
    onChange({...block, strings:ns, grid, tuningId:'custom'});
  }
  function delString(){
    if(strings.length<=2) return;
    onChange({...block, strings:strings.slice(0,-1), grid:block.grid.slice(0,-1), tuningId:'custom'});
  }

  /* navegación con flechas entre celdas */
  function onKey(e,r,c){
    const focusCell=(rr,cc)=>{ const el=document.querySelector(`[data-tab="${block._k}"][data-r="${rr}"][data-c="${cc}"]`); if(el){el.focus(); el.select&&el.select();} };
    if(e.key==='ArrowRight'){ e.preventDefault(); focusCell(r, Math.min(cols-1,c+1)); }
    else if(e.key==='ArrowLeft'){ e.preventDefault(); focusCell(r, Math.max(0,c-1)); }
    else if(e.key==='ArrowUp'){ e.preventDefault(); focusCell(Math.max(0,r-1), c); }
    else if(e.key==='ArrowDown'){ e.preventDefault(); focusCell(Math.min(strings.length-1,r+1), c); }
    else if(e.key==='Backspace' && !block.grid[r][c]){ e.preventDefault(); focusCell(r, Math.max(0,c-1)); }
  }

  const tuning = APOLO_TUNINGS.find(t=>t.id===block.tuningId);
  const tuningName = block.tuningId==='custom' ? 'Personalizada' : (tuning?tuning.name:'Personalizada');

  if(!editing){
    return <TabStatic block={block} strings={strings}/>;
  }

  return (
    <div className="tabwrap editing">
      <div className="tab-head">
        <input className="tlabel" value={block.label||''} onChange={e=>setLabel(e.target.value)} placeholder="SECCIÓN" spellCheck="false"/>
        <div style={{position:'relative'}}>
          <button className="tuning-pill" onClick={()=>setMenu(m=>!m)} title="Afinación de la grilla">
            {strings.length} cuerdas · {strings.join(' ')} ▾
          </button>
          {menu && (
            <div className="menu" style={{top:'120%',left:0}}>
              {APOLO_TUNINGS.map(t=>(
                <button key={t.id} onClick={()=>applyTuning(t)}>
                  {t.name}<span className="mono">{t.strings.join(' ')}</span>
                </button>
              ))}
              <div className="sep"></div>
              <button onClick={()=>{addString(); }}><Ico n="plusc"/> Agregar cuerda</button>
              <button onClick={()=>{delString(); }}><Ico n="minus"/> Quitar cuerda</button>
              <div style={{padding:'6px 11px 2px',fontSize:11,color:'var(--text-3)'}}>Tocá la nota a la izquierda de cada cuerda para cambiarla.</div>
            </div>
          )}
        </div>
        <div className="spacer"></div>
        {onDelete && <button className="mini danger" onClick={onDelete} title="Eliminar bloque"><Ico n="trash"/></button>}
      </div>

      <div className="tab-grid-wrap">
        <div className="tab-grid">
          {strings.map((s,r)=>(
            <div className="tab-strow" key={r}>
              <div className="tab-slabel">
                <input value={s} onChange={e=>setStringLabel(r,e.target.value)} spellCheck="false"/>
              </div>
              {block.grid[r].map((v,c)=>{
                const tech = TECH_RE.test(v);
                return (
                  <div className={'tab-cell'+(v?' has-val':'')+(tech?' tech':'')} key={c}>
                    <input
                      data-tab={block._k} data-r={r} data-c={c}
                      value={v}
                      placeholder="—"
                      onChange={e=>setCell(r,c,e.target.value)}
                      onKeyDown={e=>onKey(e,r,c)}
                      onFocus={e=>e.target.select()}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="tab-foot">
        <button className="col-btn" onClick={delCol} title="Quitar columna"><Ico n="colminus"/></button>
        <button className="col-btn" onClick={addCol} title="Agregar columna"><Ico n="colplus"/></button>
        <span className="legend">{TAB_LEGEND}</span>
      </div>
    </div>
  );
}

/* render moderno (modo lectura) — grilla estilo TabMaker */
function TabStatic({block, strings}){
  strings = strings || stringsFor(block);
  const cols = (block.grid[0]||[]).length;
  // ancho fijo por columna = máximo de la columna (para que TODAS las cuerdas alineen)
  const colW = [];
  for(let c=0;c<cols;c++){
    let w=1;
    for(let r=0;r<strings.length;r++){ w=Math.max(w,(block.grid[r][c]||'').length); }
    colW[c]=w;
  }
  return (
    <div className="tabread">
      {block.label && <div className="tabread-sec">{block.label}</div>}
      <div className="tabread-scroll">
        <div className="tabread-grid">
          {strings.map((s,r)=>(
            <div className="tabread-row" key={r}>
              <span className="tabread-lbl">{s}</span>
              <span className="tabread-bar"></span>
              {Array.from({length:cols}).map((_,c)=>{
                const v = block.grid[r][c]||'';
                const tech = TECH_RE.test(v);
                return (
                  <span className={'tabread-cell'+(v?' on':'')+(tech?' tech':'')} key={c}
                    style={{width:`calc(${colW[c]}ch + 0.55em)`}}>
                    {v && <span className="cv">{v}</span>}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TabBlock, TabStatic, stringsFor });
