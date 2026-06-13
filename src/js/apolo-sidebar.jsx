/* ===================================================================
   APOLO — iconos compartidos + Sidebar
   =================================================================== */
const I = {
  search: <path d="M11 4a7 7 0 1 0 4.2 12.6L20 21l1-1-4.4-4.8A7 7 0 0 0 11 4Zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" />,
  plus: <path d="M12 5v14M5 12h14" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" />,
  back: <path d="M15 5l-7 7 7 7" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  fwd: <path d="M9 5l7 7-7 7" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  home: <path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-8Z" strokeWidth="1.6" stroke="currentColor" fill="none" strokeLinejoin="round" />,
  play: <path d="M7 5v14l12-7L7 5Z" />,
  edit: <path d="M4 16.5V20h3.5L18 9.5 14.5 6 4 16.5ZM16 4.5L19.5 8 21 6.5 17.5 3 16 4.5Z" />,
  read: <path d="M4 5h7v15H4zM13 5h7v15h-7z" strokeWidth="1.6" stroke="currentColor" fill="none" strokeLinejoin="round" />,
  gear: <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm9 4-2-1.2.3-2.3-2.2-1.3L15 9 13.2 7 12 5 10.8 7 9 9 6.9 7.2 4.7 8.5 5 10.8 3 12l2 1.2-.3 2.3 2.2 1.3L9 15l1.8 2 1.2 2 1.2-2L15 15l2.1 1.8 2.2-1.3-.3-2.3L21 12Z" strokeWidth="0" />,
  close: <path d="M6 6l12 12M18 6L6 18" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" />,
  win_min: <path d="M5 12h14" strokeWidth="1.4" stroke="currentColor" fill="none" />,
  win_max: <rect x="5.5" y="5.5" width="13" height="13" rx="1.5" strokeWidth="1.4" stroke="currentColor" fill="none" />,
  win_x: <path d="M6 6l12 12M18 6L6 18" strokeWidth="1.4" stroke="currentColor" fill="none" />,
  trash: <path d="M6 7h12M9 7V5h6v2m-7 0 1 13h6l1-13" strokeWidth="1.6" stroke="currentColor" fill="none" strokeLinejoin="round" />,
  colplus: <path d="M12 6v12M6 12h12" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" />,
  colminus: <path d="M6 12h12" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" />,
  guitar: <path d="M14 3l3 3-2 2 1.5 1.5a3 3 0 0 1 .5 1.7c0 2-1.7 3.3-3.5 5C11 19 9 21 6.5 21A3.5 3.5 0 0 1 3 17.5C3 15 5 13 6.8 10.5 8.5 8.7 9.8 7 11.8 7c.6 0 1.2.2 1.7.5L15 6l-2-2 1-1ZM7 16a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" strokeWidth="0" />,
  music: <path d="M9 18V6l10-2v12" strokeWidth="1.6" stroke="currentColor" fill="none" strokeLinejoin="round" />,
  note: <path d="M9 17a2 2 0 1 1-2-2 2 2 0 0 1 2 2Zm10-2a2 2 0 1 1-2-2 2 2 0 0 1 2 2ZM9 15V6l10-2v9" strokeWidth="1.6" stroke="currentColor" fill="none" strokeLinejoin="round" />,
  plusc: <path d="M12 5v14M5 12h14" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" />,
  minus: <path d="M5 12h14" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" />,
  chord: <path d="M5 6h14M5 10h14M5 14h14M5 18h14" strokeWidth="1.4" stroke="currentColor" fill="none" />,
  scroll: <path d="M12 4v16m0 0l-4-4m4 4l4-4M12 4L8 8m4-4l4 4" strokeWidth="1.6" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  minustxt: <path d="M6 12h12" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" />,
  aA: <path d="M3 18l4-11 4 11M4.5 14h5M14 18V9m0 0h3a2.5 2.5 0 0 1 0 5h-3" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  cam: <path d="M4 8a2 2 0 0 1 2-2h1.2l1-1.6h5.6l1 1.6H18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Zm8 2.2A3.3 3.3 0 1 0 12 16.8 3.3 3.3 0 0 0 12 10.2Z" strokeWidth="0" />,
  clock: <path d="M12 7v5l3.5 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeWidth="1.6" stroke="currentColor" fill="none" strokeLinejoin="round" />,
  sun: <path d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.7 5.7 1.4 1.4M4.9 4.9l1.4 1.4m0 11.4-1.4 1.4M19.1 4.9l-1.4 1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" strokeWidth="1.7" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z" strokeWidth="1.7" stroke="currentColor" fill="none" strokeLinejoin="round" />,
  pin: <path d="M12 17v4M8 4h8l-1.1 6L18 13.5H6L9.1 10 8 4Z" strokeWidth="1.6" stroke="currentColor" fill="none" strokeLinejoin="round" strokeLinecap="round" />,
  rotl: <path d="M4 9h7a5 5 0 1 1-5 5M4 9l2.5-3M4 9l3 2" strokeWidth="1.7" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  rotr: <path d="M20 9h-7a5 5 0 1 0 5 5M20 9l-2.5-3M20 9l-3 2" strokeWidth="1.7" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  center: <path d="M12 3v3m0 12v3M3 12h3m12 0h3M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" strokeWidth="1.6" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  side: <path d="M4.5 5.5h15a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1ZM9.5 5.5v13" strokeWidth="1.6" stroke="currentColor" fill="none" strokeLinejoin="round" />,
  cols: <path d="M4 5h4.5v14H4zM9.75 5h4.5v14h-4.5zM15.5 5H20v14h-4.5z" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinejoin="round" />
};
function Ico({ n, className }) {
  return <svg viewBox="0 0 24 24" className={className} fill={['search', 'play', 'edit', 'gear', 'guitar', 'cam'].includes(n) ? 'currentColor' : 'none'} aria-hidden="true">{I[n]}</svg>;
}

function Avatar({ name, initial, photo, square, size }) {
  const st = { background: monoColor(name), width: size, height: size };
  return (
    <div className={'avatar' + (square ? ' sq' : '')} style={st}>
      {photo ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initial || (name || '?')[0].toUpperCase()}
    </div>);

}

/* props de drag&drop para reordenar (fuente + destino en el mismo elemento) */
function dragProps(type, id, onMove) {
  return {
    draggable: true,
    onDragStart: (e) => {e.stopPropagation();e.dataTransfer.effectAllowed = 'move';e.dataTransfer.setData('text/plain', type + ':' + id);e.currentTarget.classList.add('dragging');},
    onDragEnd: (e) => {e.currentTarget.classList.remove('dragging');document.querySelectorAll('.drop-target,.side-droppable').forEach((el) => el.classList.remove('drop-target', 'side-droppable'));},
    onDragOver: (e) => {e.preventDefault();e.dataTransfer.dropEffect = 'move';},
    onDragEnter: (e) => {e.currentTarget.classList.add('drop-target');},
    onDragLeave: (e) => {if (!e.currentTarget.contains(e.relatedTarget)) e.currentTarget.classList.remove('drop-target');},
    onDrop: (e) => {e.preventDefault();e.stopPropagation();e.currentTarget.classList.remove('drop-target');const raw = e.dataTransfer.getData('text/plain') || '';const i = raw.indexOf(':');const t = raw.slice(0, i),fromId = raw.slice(i + 1);if (t !== type) return;if (fromId && fromId !== id) onMove(fromId, id);}
  };
}

function Sidebar({ data, route, query, setQuery, recents, pinned, hiddenArtists, theme, open, onToggleTheme, onHome, onChordLib, onArtist, onSong, onNewArtist, onContextItem, onMoveArtist, onPlaceArtist }) {
  const q = query.trim().toLowerCase();
  const pinnedA = pinned && pinned.artists || [];
  const pinnedS = pinned && pinned.songs || [];
  const hidden = hiddenArtists || [];
  const activeArtist = route.artistId;

  const searching = q.length > 0;

  /* Artistas: al buscar recorre TODA la biblioteca (incluso los ocultos);
     sin búsqueda, sólo los visibles en la sidebar. */
  const artists = data.artists.
  filter((a) => searching ? true : !hidden.includes(a.id)).
  filter((a) => !q || a.name.toLowerCase().includes(q) || a.genre.toLowerCase().includes(q)).
  slice().
  sort((a, b) => {
    const pa = pinnedA.includes(a.id),pb = pinnedA.includes(b.id);
    if (pa && !pb) return -1;if (pb && !pa) return 1;
    if (pa && pb) return pinnedA.indexOf(a.id) - pinnedA.indexOf(b.id);
    return 0;
  });

  const songInfo = (s) => {
    const ar = data.artists.find((x) => x.id === s.artistId);
    const al = ar && s.albumId ? ar.albums.find((x) => x.id === s.albumId) : null;
    return { ar, al };
  };

  /* Canciones: la búsqueda abarca toda la biblioteca (título, artista, álbum o tono),
     no sólo las que están en la sidebar. */
  const songResults = searching ?
  Object.values(data.songs).
  filter((s) => {
    const { ar, al } = songInfo(s);
    return (s.title || '').toLowerCase().includes(q) ||
    ar && ar.name.toLowerCase().includes(q) ||
    al && (al.title || '').toLowerCase().includes(q) ||
    (s.key || '').toLowerCase() === q;
  }).
  sort((a, b) => (a.title || '').localeCompare(b.title || '')).
  slice(0, 40) :
  [];

  const recIds = [...pinnedS, ...(recents || []).filter((id) => !pinnedS.includes(id))];
  const recentSongs = recIds.map((id) => data.songs[id]).filter(Boolean).slice(0, 9);

  const songRow = (s) => {
    const { ar, al } = songInfo(s);
    const cover = al && al.cover;
    return (
      <button key={s.id} className="recent-row" onClick={() => onSong(s.id)}
      onContextMenu={(e) => onContextItem(e, { source: 'side', kind: 'song', songId: s.id, name: s.title, pinned: pinnedS.includes(s.id) })}>
        <div className="recent-thumb" style={cover ? null : { background: monoColor(s.title) }}>
          {cover ? <img src={cover} alt="" /> : (s.title[0] || '?').toUpperCase()}
        </div>
        <div className="meta">
          <div className="nm">{s.title}</div>
          <div className="sub">{ar?.name || ''}{al ? ` · ${al.title}` : ''}</div>
        </div>
        {pinnedS.includes(s.id) && <span className="pin-badge"><Ico n="pin" /></span>}
      </button>);
  };

  const noResults = searching && artists.length === 0 && songResults.length === 0;

  return (
    <aside className={'sidebar' + (open === false ? ' collapsed' : '')}>
      <div className="search">
        <Ico n="search" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar artista o canción" data-comment-anchor="c6e4f54cec-input-91-9" />
        {searching && <button className="search-clear" onClick={() => setQuery('')} title="Limpiar búsqueda"><Ico n="close" /></button>}
      </div>

      <div className="side-scroll">
        {(!searching || artists.length > 0) &&
        <div>
          <div className="side-head">
            <span className="side-section-label">Artistas</span>
            {!searching && <button className="side-add" onClick={onNewArtist} title="Nuevo artista"><Ico n="plus" /></button>}
          </div>
          <div className="side-artist-list" style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}
          onDragOver={(e) => {const ty = e.dataTransfer.types || [];e.preventDefault();e.currentTarget.classList.add('side-droppable');}}
          onDragLeave={(e) => {if (!e.currentTarget.contains(e.relatedTarget)) e.currentTarget.classList.remove('side-droppable');}}
          onDrop={(e) => {e.preventDefault();e.currentTarget.classList.remove('side-droppable');const raw = e.dataTransfer.getData('text/plain') || '';const i = raw.indexOf(':');if (raw.slice(0, i) !== 'artist') return;const fromId = raw.slice(i + 1);if (fromId) onPlaceArtist(fromId, null);}}>
            {artists.map((a) =>
            <button key={a.id} className={'artist-row' + (activeArtist === a.id ? ' active' : '')} onClick={() => onArtist(a.id)}
            {...(searching ? {} : dragProps('artist', a.id, onPlaceArtist))}
            onContextMenu={(e) => onContextItem(e, { source: 'side', kind: 'artist', artistId: a.id, name: a.name, pinned: pinnedA.includes(a.id) })}>
                <Avatar name={a.name} initial={a.initial} photo={a.photo} size={34} />
                <div className="meta">
                  <div className="nm">{a.name}</div>
                  <div className="sub">{a.kind} · {a.albums.length} álbum{a.albums.length !== 1 ? 'es' : ''}</div>
                </div>
                {pinnedA.includes(a.id) && <span className="pin-badge"><Ico n="pin" /></span>}
              </button>
            )}
          </div>
        </div>
        }

        {searching && songResults.length > 0 &&
        <div>
          <div className="side-head">
            <span className="side-section-label">Canciones</span>
            <span className="side-count">{songResults.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
            {songResults.map((s) => songRow(s))}
          </div>
        </div>
        }

        {!searching && recentSongs.length > 0 &&
        <div>
            <div className="side-head">
              <span className="side-section-label">Canciones recientes</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
              {recentSongs.map((s) => songRow(s))}
            </div>
          </div>
        }

        {noResults &&
        <div className="muted" style={{ padding: '14px 10px', fontSize: 13, lineHeight: 1.5 }}>
          Sin resultados para «{query.trim()}».
        </div>
        }
      </div>

      <div className="side-foot">
        <button className={'side-nav' + (route.view === 'chordlib' ? ' active' : '')} onClick={onChordLib}><Ico n="chord" /> Acordes</button>
        <div className="side-foot-row">
          <button className={'side-nav' + (route.view === 'library' ? ' active' : '')} onClick={onHome}><Ico n="home" /> Biblioteca</button>
          <button className="theme-toggle" onClick={onToggleTheme} title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
            <Ico n={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
        </div>
      </div>
    </aside>);

}

Object.assign(window, { Ico, Avatar, Sidebar, dragProps });