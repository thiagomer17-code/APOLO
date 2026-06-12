/* ===================================================================
   APOLO — Editor de canción (acordes sobre la letra) + ajustes + lectura
   =================================================================== */

/* ---- input flotante para escribir un acorde ---- */
function ChordInput({initial, onSubmit, onCancel}){
  const ref = React.useRef(null);
  const [v,setV] = React.useState(initial||'');
  React.useEffect(()=>{ const t=setTimeout(()=>{ ref.current && ref.current.focus(); ref.current && ref.current.select(); },10); return ()=>clearTimeout(t); },[]);
  return (
    <input ref={ref} className="chord-input" value={v} spellCheck="false"
      onChange={e=>setV(e.target.value)}
      onKeyDown={e=>{
        if(e.key==='Enter'){ e.preventDefault(); onSubmit(v.trim()); }
        else if(e.key==='Escape'){ e.preventDefault(); onCancel(); }
      }}
      onBlur={()=>onSubmit(v.trim())}
      placeholder="Am"
    />
  );
}

/* ---- una línea de letra con acordes anclados ---- */
function LyricLine({line, editing, semis, preferFlat, edit, onOpen, onSet}){
  const chordAt = {};
  line.chords.forEach(c=>{ chordAt[c.pos]=c.chord; });
  const disp = ch => transposeChord(ch, semis, preferFlat);
  const txt = line.text;
  const isEditingHere = p => editing && edit && edit.pos===p;

  if(txt.length===0){
    const ch = chordAt[0];
    return (
      <div className="lyric-line blank">
        {editing ? (
          <span className="ch cspot" style={{display:'inline-block',minWidth:'3ch'}} onClick={()=>onOpen(0)}>
            {isEditingHere(0)
              ? <ChordInput initial={ch||''} onSubmit={v=>onSet(0,v)} onCancel={()=>onSet(0,ch||'',true)}/>
              : (ch ? <span className="chord">{disp(ch)}</span> : '\u00a0')}
          </span>
        ) : (ch ? <span className="ch"><ReadChord label={disp(ch)}/>{'\u00a0'}</span> : '\u00a0')}
      </div>
    );
  }

  const spans = [];
  for(let i=0;i<txt.length;i++){
    const ch = chordAt[i];
    spans.push(
      <span className={'ch'+(editing?' cspot':'')} key={i} onClick={editing?(()=>onOpen(i)):undefined}>
        {isEditingHere(i)
          ? <ChordInput initial={ch||''} onSubmit={v=>onSet(i,v)} onCancel={()=>onSet(i,ch||'',true)}/>
          : (ch!=null ? (editing ? <span className="chord">{disp(ch)}</span> : <ReadChord label={disp(ch)}/>) : null)}
        {txt[i]}
      </span>
    );
  }
  return <div className="lyric-line">{spans}</div>;
}

/* ---- bloque de letra (con su sección + edición de texto) ---- */
function LyricBlock({block, editing, semis, preferFlat, onChange, onDelete}){
  const [edit, setEdit] = React.useState(null);      // {line, pos}
  const [rawIdx, setRawIdx] = React.useState(-1);     // línea en edición de texto -> editamos bloque completo
  const [rawText, setRawText] = React.useState('');

  function setChord(lineIdx, pos, val, cancel){
    if(!cancel){
      const lines = block.lines.map((ln,i)=>{
        if(i!==lineIdx) return ln;
        let chords = ln.chords.filter(c=>c.pos!==pos);
        if(val) chords = [...chords, {pos, chord:val}].sort((a,b)=>a.pos-b.pos);
        return {...ln, chords};
      });
      onChange({...block, lines});
    }
    setEdit(null);
  }
  function setLabel(v){ onChange({...block, label:v}); }

  function openRaw(){
    setRawText(block.lines.map(l=>l.text).join('\n'));
    setRawIdx(1);
  }
  function saveRaw(){
    const newTexts = rawText.split('\n');
    const lines = newTexts.map((t,i)=>{
      const old = block.lines[i];
      const chords = old ? old.chords.filter(c=>c.pos<=t.length) : [];
      return {text:t, chords};
    });
    onChange({...block, lines});
    setRawIdx(-1);
  }

  return (
    <div className="block">
      {(block.label || editing) && (
        <div className="block-label">
          {editing
            ? <input className="edit-label" value={block.label||''} onChange={e=>setLabel(e.target.value)} placeholder="Sección" spellCheck="false"/>
            : block.label}
          <span className="bar"></span>
        </div>
      )}

      {rawIdx>=0 ? (
        <div>
          <textarea className="lyric-edit" autoFocus value={rawText} onChange={e=>setRawText(e.target.value)} />
          <div className="block-tools" style={{opacity:1,marginTop:10}}>
            <button className="mini" onClick={saveRaw}>Guardar letra</button>
            <button className="mini" onClick={()=>setRawIdx(-1)}>Cancelar</button>
            <span className="muted" style={{fontSize:11,alignSelf:'center'}}>Los acordes se reacomodan por línea.</span>
          </div>
        </div>
      ) : (
        <div className="lyrics">
          {block.lines.map((ln,i)=>(
            <LyricLine key={i} line={ln} editing={editing} semis={semis} preferFlat={preferFlat}
              edit={edit && edit.line===i ? edit : null}
              onOpen={pos=>setEdit({line:i,pos})}
              onSet={(pos,val,cancel)=>setChord(i,pos,val,cancel)}
            />
          ))}
        </div>
      )}

      {editing && rawIdx<0 && (
        <div className="block-tools">
          <button className="mini" onClick={openRaw}><Ico n="edit"/> Editar letra</button>
          <span className="muted" style={{fontSize:11,alignSelf:'center'}}>Tocá sobre una sílaba para poner un acorde.</span>
          {onDelete && <button className="mini danger" style={{marginLeft:'auto'}} onClick={onDelete}><Ico n="trash"/> Quitar</button>}
        </div>
      )}
    </div>
  );
}

/* ---- inserción de bloque ---- */
function Inserter({onLyric, onTab}){
  return (
    <div className="inserter">
      <span className="ln"></span>
      <div className="acts">
        <button className="ins-btn" onClick={onLyric}><Ico n="plus"/> Texto + acordes</button>
        <button className="ins-btn" onClick={onTab}><Ico n="chord"/> Tablatura</button>
      </div>
      <span className="ln"></span>
    </div>
  );
}

/* ---- chip de tono con transposición ---- */
function ToneChip({songKey, semis, setSemis, preferFlat}){
  const shown = transposeChord(songKey||'C', semis, preferFlat);
  return (
    <div className="chip" title="Transponer">
      <span className="k">Tono</span>
      <button className="col-btn" style={{width:24,height:24,background:'transparent'}} onClick={()=>setSemis(semis-1)}><Ico n="minus"/></button>
      <span className="v" style={{minWidth:34,textAlign:'center'}}>{shown}</span>
      <button className="col-btn" style={{width:24,height:24,background:'transparent'}} onClick={()=>setSemis(semis+1)}><Ico n="plusc"/></button>
    </div>
  );
}

/* ---- panel de ajustes lateral ---- */
function SettingsSheet({song, semis, setSemis, preferFlat, setPreferFlat, onChange, onClose}){
  const strings = song.strings && song.strings.length ? song.strings : (APOLO_TUNINGS.find(t=>t.id===song.tuningId)?.strings || ['e','B','G','D','A','E']);
  function set(p){ onChange({...song, ...p}); }
  return (
    <>
      <div className="sheet-overlay" onClick={onClose}></div>
      <div className="sheet">
        <div className="sheet-head">
          <h3>Ajustes de la canción</h3>
          <button className="nav-btn" onClick={onClose}><Ico n="close"/></button>
        </div>
        <div className="sheet-body">
          <div className="set-group">
            <span className="lbl">Tono</span>
            <div className="stepper">
              <select className="input" value={song.key} onChange={e=>set({key:e.target.value})} style={{border:'none',background:'transparent'}}>
                {['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B','Cm','C#m','Dm','Ebm','Em','Fm','F#m','Gm','G#m','Am','Bbm','Bm'].map(k=><option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>

          <div className="set-group">
            <span className="lbl">Transposición ({semis>0?'+':''}{semis} st)</span>
            <div className="transpose">
              <div className="stepper">
                <button onClick={()=>setSemis(semis-1)}><Ico n="minus"/></button>
                <span className="val">{semis>0?'+':''}{semis}</span>
                <button onClick={()=>setSemis(semis+1)}><Ico n="plusc"/></button>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={()=>setSemis(0)}>Reset</button>
            </div>
            <label style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'var(--text-2)',marginTop:4,cursor:'pointer'}}>
              <input type="checkbox" checked={preferFlat} onChange={e=>setPreferFlat(e.target.checked)}/> Mostrar bemoles (♭)
            </label>
          </div>

          <div className="set-group">
            <span className="lbl">Capo</span>
            <div className="stepper">
              <button onClick={()=>set({capo:Math.max(0,song.capo-1)})}><Ico n="minus"/></button>
              <span className="val">{song.capo===0?'Sin capo':'Traste '+song.capo}</span>
              <button onClick={()=>set({capo:Math.min(12,song.capo+1)})}><Ico n="plusc"/></button>
            </div>
          </div>

          <div className="set-group">
            <span className="lbl">Afinación por defecto</span>
            <div className="preset-grid">
              {APOLO_TUNINGS.map(t=>(
                <button key={t.id} className={'preset'+(song.tuningId===t.id?' sel':'')} onClick={()=>set({tuningId:t.id, strings:t.strings.slice()})}>
                  <div className="pn">{t.name}</div>
                  <div className="pt">{t.strings.join(' ')}</div>
                </button>
              ))}
            </div>
            <div className="tuning-strings" style={{marginTop:6}}>
              {strings.map((s,i)=>(
                <div className="tstr" key={i}>
                  <span className="n">{i+1}</span>
                  <select value={s} onChange={e=>{ const ns=strings.slice(); ns[i]=e.target.value; set({strings:ns, tuningId:'custom'}); }}>
                    {NOTE_OPTIONS.map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="set-group">
            <span className="lbl">Notas</span>
            <textarea className="input" value={song.notes||''} onChange={e=>set({notes:e.target.value})} placeholder="Anotaciones, ritmo, dinámica…"/>
          </div>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { ChordInput, LyricLine, LyricBlock, Inserter, ToneChip, SettingsSheet });
