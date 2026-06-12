/* ===================================================================
   APOLO — Diagramas de acordes (modo lectura)
   Genera hasta 3 variantes por acorde: forma abierta + cejillas movibles
   (shape de Mi y de La), de la más fácil a la más difícil.
   =================================================================== */

const CHORD_NOTE = {C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,'E#':5,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11,'Cb':11};

/* formas abiertas conocidas (cuerda 6=Mi grave → 1=mi agudo; -1 = muteada) */
const OPEN_SHAPES = {
  'C':[-1,3,2,0,1,0], 'D':[-1,-1,0,2,3,2], 'E':[0,2,2,1,0,0], 'G':[3,2,0,0,0,3],
  'A':[-1,0,2,2,2,0], 'F':[1,3,3,2,1,1],
  'Em':[0,2,2,0,0,0], 'Am':[-1,0,2,2,1,0], 'Dm':[-1,-1,0,2,3,1],
};

function chordRoot(name){ const m=(name||'').match(/^([A-G][#b]?)/); return m?CHORD_NOTE[m[1]] : null; }
function chordIsMinor(name){
  const tail=(name||'').replace(/^[A-G][#b]?/,'');
  return /^m(?!aj)/.test(tail) || /^min/.test(tail);
}
function shiftShape(rel, fret){ return rel.map(v=> v<0 ? -1 : v+fret); }
function minPositive(shape){ const p=shape.filter(v=>v>0); return p.length?Math.min(...p):0; }

/* devuelve un array de hasta 3 formas [cuerda6..cuerda1], de fácil a difícil */
function chordShapes(name){
  const base=(name||'').split('/')[0].trim();
  const R=chordRoot(base); if(R==null) return [];
  const minor=chordIsMinor(base);
  const eRel = minor ? [0,2,2,0,0,0] : [0,2,2,1,0,0];   // shape de Mi (raíz en 6ª)
  const aRel = minor ? [-1,0,2,2,1,0] : [-1,0,2,2,2,0]; // shape de La (raíz en 5ª)
  const Be=((R-4)%12+12)%12;   // cejilla shape-Mi
  const Ba=((R-9)%12+12)%12;   // cejilla shape-La
  const cand=[];
  const open=OPEN_SHAPES[base];
  if(open) cand.push(open);
  [Be, Be+12].forEach(f=> cand.push(shiftShape(eRel,f)));
  [Ba, Ba+12].forEach(f=> cand.push(shiftShape(aRel,f)));
  const valid = cand.filter(s=>{ const mx=Math.max(...s.filter(v=>v>=0)); return mx>0 && mx<=17; })
                    .sort((x,y)=> minPositive(x)-minPositive(y));
  const seen=new Set(), out=[];
  for(const s of valid){ const k=s.join(','); if(!seen.has(k)){ seen.add(k); out.push(s); } }
  return out.slice(0,3);
}

/* ------- diagrama SVG ------- */
function ChordDiagram({shape}){
  const FR=5;
  const pos=shape.filter(v=>v>0);
  const maxF=pos.length?Math.max(...pos):0;
  const minF=pos.length?Math.min(...pos):0;
  const base = maxF>FR ? minF : 1;
  const W=104, H=128, padX=15, padTop=26, padBottom=12;
  const gW=W-padX*2, gH=H-padTop-padBottom, sp=gW/5, fh=gH/FR;
  const sx=i=>padX+sp*i;
  const fy=f=>padTop+fh*f;
  const line='var(--text-3)';
  const dot='var(--text)';

  /* ¿cejilla? la 1ª cuerda y la cuerda grave más grave tocada están en el traste
     más bajo, y ese traste se repite en 2+ cuerdas → barra horizontal */
  const lo = shape.findIndex(v=>v>=0);
  const barreCount = shape.filter(v=>v===minF).length;
  const isBarre = pos.length>0 && lo>=0 && shape[lo]===minF && shape[5]===minF && barreCount>=2;
  const barreRow = isBarre ? (minF-base) : -1;   // índice de fila (0 = primer traste mostrado)

  const marks=[];
  shape.forEach((v,s)=>{
    const x=sx(s);
    if(v===-1) marks.push(<text key={'m'+s} x={x} y={padTop-9} textAnchor="middle" fontSize="11" fill="var(--text-3)" fontFamily="var(--font-mono)">×</text>);
    else if(v===0) marks.push(<circle key={'o'+s} cx={x} cy={padTop-12} r="3.6" fill="none" stroke="var(--text-2)" strokeWidth="1.4"/>);
    else if(isBarre && v===minF){ /* cubierto por la barra */ }
    else { const rf=v-base+1; marks.push(<circle key={'d'+s} cx={x} cy={fy(rf-1)+fh/2} r="6" fill={dot}/>); }
  });

  /* barra de cejilla */
  let barre=null;
  if(isBarre){
    const x1=sx(lo), x2=sx(5), cy=fy(barreRow)+fh/2, bh=11, cap=5.5;
    barre=<rect x={x1-cap} y={cy-bh/2} width={x2-x1+cap*2} height={bh} rx={bh/2} fill={dot}/>;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="chorddiag">
      {/* cuerdas */}
      {[0,1,2,3,4,5].map(i=> <line key={'s'+i} x1={sx(i)} y1={fy(0)} x2={sx(i)} y2={fy(FR)} stroke={line} strokeWidth="1"/>)}
      {/* trastes */}
      {[0,1,2,3,4,5].map(f=> <line key={'f'+f} x1={sx(0)} y1={fy(f)} x2={sx(5)} y2={fy(f)} stroke={line} strokeWidth={base===1&&f===0?3:1}/>)}
      {base>1 && <text x={sx(5)+9} y={fy(0)+fh/2+4} fontSize="11" fill="var(--text-3)" fontFamily="var(--font-mono)">{base}fr</text>}
      {barre}
      {marks}
    </svg>
  );
}

/* ------- acorde en modo lectura (texto, anclado para sincronía) ------- */
function ReadChord({label}){
  return <span className="chord rchord" data-chord={label}>{label}</span>;
}

/* ------- recolecta los acordes mencionados (únicos, transpuestos, en orden) ------- */
function collectChords(blocks, semis, preferFlat){
  const seen=new Set(), out=[];
  (blocks||[]).forEach(b=>{
    if(b.type!=='lyric') return;
    (b.lines||[]).forEach(ln=>{
      (ln.chords||[]).forEach(c=>{
        const name = transposeChord(c.chord, semis||0, preferFlat||false);
        if(name && !seen.has(name)){ seen.add(name); out.push({name, shapes:chordShapes(name)}); }
      });
    });
  });
  return out;
}

/* ------- una tarjeta de acorde en el panel ------- */
function ChordCard({name, shapes, current, visible}){
  const [vi,setVi]=React.useState(0);
  const diff=['Fácil','Media','Difícil'];
  const n=shapes.length;
  return (
    <div className={'cpanel-card'+(current?' cur':'')+(visible?' vis':'')} data-chord={name}>
      <div className="cpc-top">
        <span className="cpc-name">{name}</span>
        {n>1 && (
          <button type="button" className="cpc-cyc" title="Otra posición"
            onClick={()=>setVi(v=>(v+1)%n)}>
            <span className="cpc-diff">{diff[vi%n]||''}</span>
            <span className="cpc-count">{(vi%n)+1}/{n}</span>
          </button>
        )}
      </div>
      {n>0
        ? <ChordDiagram shape={shapes[vi%n]}/>
        : <div className="cpc-noshape">sin diagrama</div>}
    </div>
  );
}

/* ------- panel lateral de acordes ------- */
function ChordPanel({chords, currentChord, visibleSet, onClose, panelRef}){
  return (
    <aside className="chordpanel" ref={panelRef}>
      <div className="cpanel-head">
        <span className="cpanel-ttl"><Ico n="chord"/> Acordes</span>
        <span className="cpanel-count">{chords.length}</span>
        <button className="cpanel-x" onClick={onClose} title="Cerrar"><Ico n="close"/></button>
      </div>
      {chords.length>0 ? (
        <div className="cpanel-body">
          {chords.map(c=>(
            <ChordCard key={c.name} name={c.name} shapes={c.shapes}
              current={currentChord===c.name}
              visible={!!visibleSet && visibleSet.has(c.name)}/>
          ))}
        </div>
      ) : (
        <div className="cpanel-empty">Esta canción todavía no tiene acordes marcados sobre la letra.</div>
      )}
    </aside>
  );
}

Object.assign(window, { chordShapes, ChordDiagram, ReadChord, collectChords, ChordCard, ChordPanel });
