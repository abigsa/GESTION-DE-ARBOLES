import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:3000/api';

const C = {
  verdeProfundo:  '#1B4D2A',
  verdeMedio:     '#2D7A3E',
  verdeSalvia:    '#4CB968',
  verdeMenta:     '#E8F5E9',
  tierraCalida:   '#8B6F47',
  oroForestal:    '#D4A853',
  rojoAlerta:     '#8B2E2E',
  fondoClaro:     '#F2F7F3',
  pergaminoVerde: '#DCEDDF',
  grafito:        '#4A4A4A',
};

function get(obj, ...keys) {
  for (const k of keys) if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k];
  return null;
}

function fmt(val) {
  if (!val) return '—';
  if (typeof val === 'string') {
    const soloFecha = val.slice(0, 10);
    const [anio, mes, dia] = soloFecha.split('-');
    if (anio && mes && dia) {
      const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
      return `${dia} ${meses[parseInt(mes,10)-1]} ${anio}`;
    }
  }
  const d = new Date(val);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('es-GT', { day:'2-digit', month:'short', year:'numeric' });
}

// ── Generador de PDF de historial ─────────────────────────────
function generarPDFHistorial(datos, estadosMap, arbolesMap) {
  const fecha = new Date().toLocaleDateString('es-GT', { year:'numeric', month:'long', day:'numeric' });

  // Estadísticas del top 5
  const conteos = {};
  datos.forEach(r => {
    const arbol = arbolesMap[get(r,'ID_ARBOL','id_arbol')] || `Árbol #${get(r,'ID_ARBOL','id_arbol')}`;
    conteos[arbol] = (conteos[arbol] || 0) + 1;
  });
  const top5 = Object.entries(conteos)
    .sort((a,b) => b[1] - a[1])
    .slice(0,5);
  const maxCount = Math.max(...top5.map(([,c]) => c), 1);

  const CHART_W = 480, CHART_H = 140;
  const pad = { top:10, right:10, bottom:36, left:40 };
  const bW = Math.floor((CHART_W - pad.left - pad.right) / top5.length) - 6;
  const cH = CHART_H - pad.top - pad.bottom;
  const pieColors = ['#2D7A3E','#D4A853','#8B6F47','#4CB968','#1B4D2A'];

  const barrasTop5 = top5.map(([label, count], i) => {
    const bh = Math.round((count / maxCount) * cH);
    const x  = pad.left + i * ((CHART_W - pad.left - pad.right) / top5.length) + 3;
    const y  = pad.top + cH - bh;
    const color = pieColors[i % pieColors.length];
    const lbl = label.slice(0,14);
    return `
      <rect x="${x}" y="${y}" width="${bW}" height="${bh}" fill="${color}" rx="3"/>
      <text x="${x+bW/2}" y="${pad.top+cH+13}" text-anchor="middle" font-size="7"
            fill="#4A4A4A" transform="rotate(-30,${x+bW/2},${pad.top+cH+13})">${lbl}</text>
      <text x="${x+bW/2}" y="${y-3}" text-anchor="middle" font-size="7" font-weight="bold" fill="#1B4D2A">${count}</text>`;
  }).join('');

  const guias = [0,0.5,1].map(p => {
    const yg = pad.top + cH - Math.round(p*cH);
    const v  = Math.round(p*maxCount);
    return `<line x1="${pad.left}" y1="${yg}" x2="${CHART_W-pad.right}" y2="${yg}" stroke="#DCEDDF" stroke-width="1"/>
      <text x="${pad.left-4}" y="${yg+3}" text-anchor="end" font-size="6.5" fill="#4A4A4A">${v}</text>`;
  }).join('');

  const chartSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${CHART_W}" height="${CHART_H}" viewBox="0 0 ${CHART_W} ${CHART_H}">
    <rect width="${CHART_W}" height="${CHART_H}" fill="#F2F7F3" rx="6"/>
    ${guias}${barrasTop5}
  </svg>`;
  const chartUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(chartSVG)}`;

  // Finca más frecuente y estado más frecuente
  const estConteos = {};
  datos.forEach(r => {
    const est = estadosMap[get(r,'ID_ESTADO_NUEVO','id_estado_nuevo')] || '?';
    estConteos[est] = (estConteos[est] || 0) + 1;
  });
  const estadoTop = Object.entries(estConteos).sort((a,b)=>b[1]-a[1])[0];
  const arbolTop  = top5[0];

  const filas = datos.map((r, idx) => {
    const arbol    = arbolesMap[get(r,'ID_ARBOL','id_arbol')] || `#${get(r,'ID_ARBOL','id_arbol')}`;
    const estAnt   = estadosMap[get(r,'ID_ESTADO_ANTERIOR','id_estado_anterior')] || '—';
    const estNuevo = estadosMap[get(r,'ID_ESTADO_NUEVO','id_estado_nuevo')] || '—';
    const fechaCam = fmt(get(r,'FECHA_CAMBIO','fecha_cambio'));
    const obs      = get(r,'OBSERVACIONES','observaciones') || '—';
    return `<tr class="${idx%2===0?'':'alt'}">
      <td>${idx+1}</td>
      <td><strong>${arbol}</strong></td>
      <td>${estAnt}</td>
      <td><span style="background:#E8F5E9;color:#1B4D2A;padding:2px 6px;border-radius:10px;font-size:8.5px;font-weight:700">${estNuevo}</span></td>
      <td>${fechaCam}</td>
      <td style="color:#8B6F47">${obs}</td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
  <title>Historial de Estados — Gestión de Árboles</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Nunito',Arial,sans-serif;font-size:11px;color:#4A4A4A;background:#fff}
    .header{background:linear-gradient(135deg,#1B4D2A 0%,#2D7A3E 100%);color:#fff;padding:22px 30px 18px;display:flex;align-items:flex-start;justify-content:space-between}
    .header-left{display:flex;align-items:center;gap:14px}
    .h-icon{width:48px;height:48px;background:rgba(255,255,255,.18);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0}
    .header h1{font-size:19px;font-weight:800;letter-spacing:-.3px}
    .header .sub{font-size:10px;opacity:.8;margin-top:3px}
    .badge{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:20px;padding:6px 14px;font-size:10px;text-align:right;white-space:nowrap}
    .badge strong{display:block;font-size:18px;font-weight:800}
    .body{padding:20px 28px}
    .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px}
    .kpi{background:#F2F7F3;border:1px solid #DCEDDF;border-radius:10px;padding:10px 12px;border-left:4px solid #2D7A3E}
    .kpi-label{font-size:8.5px;color:#8B6F47;text-transform:uppercase;letter-spacing:.6px;font-weight:700}
    .kpi-val{font-size:18px;font-weight:800;color:#1B4D2A;margin-top:2px}
    .section{margin-bottom:18px}
    .sec-title{font-size:10px;font-weight:800;color:#1B4D2A;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px;padding-bottom:5px;border-bottom:2px solid #DCEDDF;display:flex;align-items:center;gap:6px}
    .sec-title::before{content:'';display:inline-block;width:4px;height:14px;background:#2D7A3E;border-radius:2px;flex-shrink:0}
    .chart-box{background:#F2F7F3;border:1px solid #DCEDDF;border-radius:10px;padding:12px;margin-bottom:16px}
    .chart-box h3{font-size:9px;color:#8B6F47;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px}
    .chart-box img{width:100%;max-width:500px;height:auto}
    table{width:100%;border-collapse:collapse;font-size:9.5px}
    thead tr{background:#1B4D2A}
    th{color:#fff;padding:8px 10px;text-align:left;font-size:8.5px;text-transform:uppercase;letter-spacing:.5px;font-weight:700}
    td{padding:7px 10px;border-bottom:1px solid #DCEDDF;vertical-align:top}
    tr.alt td{background:#F2F7F3}
    tr:last-child td{border-bottom:none}
    .footer{margin-top:20px;padding:14px 28px;background:#F2F7F3;border-top:2px solid #DCEDDF;display:flex;justify-content:space-between;align-items:center;font-size:8.5px;color:#8B6F47}
    .footer strong{color:#1B4D2A}
    @media print{body{padding:0}.header,.sec-title::before,thead tr{-webkit-print-color-adjust:exact;print-color-adjust:exact}.kpi,.chart-box{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style></head><body>
  <div class="header">
    <div class="header-left">
      <div class="h-icon">🌳</div>
      <div>
        <h1>Historial de Estados de Árboles</h1>
        <div class="sub">Generado el ${fecha} · Sistema de Gestión de Árboles</div>
      </div>
    </div>
    <div class="badge"><span>Total cambios</span><strong>${datos.length}</strong></div>
  </div>
  <div class="body">
    <div class="kpis">
      <div class="kpi"><div class="kpi-label">Total cambios</div><div class="kpi-val">${datos.length}</div></div>
      <div class="kpi"><div class="kpi-label">Árboles únicos</div><div class="kpi-val">${Object.keys(conteos).length}</div></div>
      <div class="kpi"><div class="kpi-label">Estado más frecuente</div><div class="kpi-val" style="font-size:12px">${estadoTop?.[0]||'—'}</div></div>
      <div class="kpi"><div class="kpi-label">Árbol más activo</div><div class="kpi-val" style="font-size:11px">${arbolTop?.[0]?.slice(0,16)||'—'}</div></div>
    </div>
    <div class="section">
      <div class="sec-title">Top 5 árboles con más cambios de estado</div>
      <div class="chart-box">
        <h3>Cantidad de cambios por árbol</h3>
        <img src="${chartUrl}" alt="Gráfico top 5"/>
      </div>
    </div>
    <div class="section">
      <div class="sec-title">Detalle completo del historial</div>
      <table>
        <thead><tr><th>#</th><th>Árbol</th><th>Estado anterior</th><th>Estado nuevo</th><th>Fecha cambio</th><th>Observaciones</th></tr></thead>
        <tbody>${filas}</tbody>
      </table>
    </div>
  </div>
  <div class="footer">
    <span>🌿 <strong>Gestión de Árboles</strong> — Reporte de historial de estados</span>
    <span>${datos.length} cambios registrados · ${fecha}</span>
  </div>
  </body></html>`;

  const win = window.open('', '_blank');
  if (!win) { alert('Permite ventanas emergentes para exportar'); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 600);
}

// ── Componente principal ──────────────────────────────────────
export default function ReporteHistorialEstados({ onBack }) {
  const { usuario } = useAuth();
  const [historial, setHistorial] = useState([]);
  const [estados,   setEstados]   = useState([]);
  const [arboles,   setArboles]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  const [filtroArbol,  setFiltroArbol]  = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [search,       setSearch]       = useState('');
  const [fechaDesde,   setFechaDesde]   = useState('');
  const [fechaHasta,   setFechaHasta]   = useState('');

  const cargar = async () => {
    setLoading(true); setError('');
    try {
      const [rH, rE, rA] = await Promise.all([
        fetch(`${API}/historial-estado`).then(r => r.json()),
        fetch(`${API}/estado-arbol`).then(r => r.json()),
        fetch(`${API}/arbol`).then(r => r.json()),
      ]);
      setHistorial(Array.isArray(rH.data) ? rH.data : []);
      setEstados(Array.isArray(rE.data) ? rE.data : []);
      setArboles(Array.isArray(rA.data) ? rA.data : []);
    } catch (e) {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  // Mapas rápidos
  const estadosMap = useMemo(() => {
    const m = {};
    estados.forEach(e => {
      const id  = get(e,'ID_ESTADO','id_estado');
      const nom = get(e,'NOMBRE_ESTADO','nombre_estado','NOMBRE','nombre') || `#${id}`;
      if (id != null) m[id] = nom;
    });
    return m;
  }, [estados]);

  const arbolesMap = useMemo(() => {
    const m = {};
    arboles.forEach(a => {
      const id  = get(a,'ID_ARBOL','id_arbol');
      const nom = get(a,'CODIGO_ARBOL','codigo_arbol','NOMBRE_ARBOL','nombre_arbol') || `#${id}`;
      if (id != null) m[id] = nom;
    });
    return m;
  }, [arboles]);

  const filtrado = useMemo(() => {
    let rows = historial;
    if (filtroArbol)  rows = rows.filter(r => String(get(r,'ID_ARBOL','id_arbol')) === filtroArbol);
    if (filtroEstado) rows = rows.filter(r =>
      String(get(r,'ID_ESTADO_NUEVO','id_estado_nuevo')) === filtroEstado ||
      String(get(r,'ID_ESTADO_ANTERIOR','id_estado_anterior')) === filtroEstado
    );
    if (fechaDesde) {
      const d = new Date(fechaDesde);
      rows = rows.filter(r => new Date(get(r,'FECHA_CAMBIO','fecha_cambio')) >= d);
    }
    if (fechaHasta) {
      const d = new Date(fechaHasta);
      d.setHours(23,59,59);
      rows = rows.filter(r => new Date(get(r,'FECHA_CAMBIO','fecha_cambio')) <= d);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        [arbolesMap[get(r,'ID_ARBOL','id_arbol')],
         estadosMap[get(r,'ID_ESTADO_NUEVO','id_estado_nuevo')],
         get(r,'OBSERVACIONES','observaciones')]
          .some(v => String(v||'').toLowerCase().includes(q))
      );
    }
    return rows;
  }, [historial, filtroArbol, filtroEstado, search, fechaDesde, fechaHasta, arbolesMap, estadosMap]);

  // Top 5 árboles con más cambios
  const top5 = useMemo(() => {
    const c = {};
    historial.forEach(r => {
      const id = get(r,'ID_ARBOL','id_arbol');
      c[id] = (c[id] || 0) + 1;
    });
    return Object.entries(c)
      .sort((a,b) => b[1] - a[1])
      .slice(0,5)
      .map(([id, count]) => ({ nombre: arbolesMap[id] || `#${id}`, count }));
  }, [historial, arbolesMap]);

  const maxTop = Math.max(...top5.map(t => t.count), 1);

  const st = styles;

  return (
    <div style={st.root}>
      {/* Encabezado */}
      <div style={st.header}>
        <div style={st.breadcrumb}>
          <button style={st.backBtn} onClick={onBack} type="button">
            <span className="material-icons" style={{fontSize:16}}>arrow_back_ios</span> Inicio
          </button>
          <span style={st.sep}>/</span>
          <span style={st.bcCur}>Reporte: Historial de Estados</span>
        </div>
        <div style={st.titleRow}>
          <div style={st.titleBlock}>
            <div style={st.titleIcon}>
              <span className="material-icons">timeline</span>
            </div>
            <div>
              <p style={st.panelLabel}>REPORTES</p>
              <h1 style={st.pageTitle}>Historial de estados</h1>
              <p style={st.pageSub}>Evolución de estado de cada árbol con fechas y observaciones</p>
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button style={st.refreshBtn} onClick={cargar} type="button">
              <span className="material-icons">refresh</span> Actualizar
            </button>
            <button
              style={{...st.refreshBtn, background:C.oroForestal}}
              onClick={() => generarPDFHistorial(filtrado, estadosMap, arbolesMap)}
              type="button"
            >
              <span className="material-icons">picture_as_pdf</span> Exportar PDF
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div style={st.filters}>
          <div style={st.searchWrap}>
            <span className="material-icons" style={{color:C.tierraCalida}}>search</span>
            <input
              style={st.searchInput}
              placeholder="Buscar árbol, estado, observación…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select style={st.sel} value={filtroArbol} onChange={e => setFiltroArbol(e.target.value)}>
            <option value="">Todos los árboles</option>
            {arboles.map(a => {
              const id = get(a,'ID_ARBOL','id_arbol');
              return <option key={id} value={id}>{arbolesMap[id]}</option>;
            })}
          </select>
          <select style={st.sel} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            {estados.map(e => {
              const id = get(e,'ID_ESTADO','id_estado');
              return <option key={id} value={id}>{estadosMap[id]}</option>;
            })}
          </select>
          <input type="date" style={st.sel} value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} title="Desde"/>
          <input type="date" style={st.sel} value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} title="Hasta"/>
        </div>
        <div style={st.counter}>
          Mostrando <strong>{filtrado.length}</strong> de <strong>{historial.length}</strong> registros
        </div>
      </div>

      {/* Top 5 */}
      {top5.length > 0 && (
        <div style={st.topCard}>
          <p style={st.topTitle}>Top 5 — Árboles con más cambios de estado</p>
          <div style={st.topBars}>
            {top5.map(({ nombre, count }, i) => (
              <div key={i} style={st.topItem}>
                <div style={st.topLabel}>{nombre}</div>
                <div style={st.topBarTrack}>
                  <div style={{
                    ...st.topBarFill,
                    width: `${(count / maxTop) * 100}%`,
                    background: i === 0 ? C.verdeMedio : i === 1 ? C.oroForestal : C.tierraCalida,
                  }}/>
                </div>
                <div style={st.topCount}>{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contenido */}
      <div style={st.content}>
        {loading ? (
          <div style={st.center}>
            <div style={st.spinner}/>
            <p>Cargando historial…</p>
          </div>
        ) : error ? (
          <div style={st.errBox}>
            <span className="material-icons">wifi_off</span>
            <p>{error}</p>
            <button onClick={cargar} style={st.refreshBtn}>Reintentar</button>
          </div>
        ) : filtrado.length === 0 ? (
          <div style={st.empty}>
            <span className="material-icons" style={{fontSize:40, color:C.pergaminoVerde}}>history_toggle_off</span>
            <p style={{color:C.tierraCalida, marginTop:8}}>Sin registros</p>
          </div>
        ) : (
          <div style={{overflowX:'auto'}}>
            <table style={st.table}>
              <thead>
                <tr>
                  {['#','Árbol','Estado anterior','Estado nuevo','Fecha cambio','Observaciones'].map(h => (
                    <th key={h} style={st.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrado.map((row, i) => {
                  const arbol   = arbolesMap[get(row,'ID_ARBOL','id_arbol')] || `#${get(row,'ID_ARBOL','id_arbol')}`;
                  const estAnt  = estadosMap[get(row,'ID_ESTADO_ANTERIOR','id_estado_anterior')] || '—';
                  const estNuevo= estadosMap[get(row,'ID_ESTADO_NUEVO','id_estado_nuevo')] || '—';
                  const fCambio = fmt(get(row,'FECHA_CAMBIO','fecha_cambio'));
                  const obs     = get(row,'OBSERVACIONES','observaciones') || '—';
                  return (
                    <tr key={i} style={i%2===0?{}:{background:C.fondoClaro}}>
                      <td style={st.td}>{i+1}</td>
                      <td style={{...st.td, fontWeight:600, color:C.verdeProfundo}}>{arbol}</td>
                      <td style={{...st.td, color:C.tierraCalida}}>{estAnt}</td>
                      <td style={st.td}>
                        <span style={{background:C.verdeMenta, color:C.verdeProfundo,
                          padding:'3px 8px', borderRadius:20, fontSize:11, fontWeight:700}}>
                          {estNuevo}
                        </span>
                      </td>
                      <td style={st.td}>{fCambio}</td>
                      <td style={{...st.td, color:C.tierraCalida, fontSize:11}}>{obs}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  root:       { minHeight:'100vh', background:C.fondoClaro },
  header:     { background:'#fff', borderBottom:`2px solid ${C.pergaminoVerde}`, padding:'20px 28px 12px' },
  breadcrumb: { display:'flex', alignItems:'center', gap:8, fontSize:12, color:C.tierraCalida, marginBottom:12 },
  backBtn:    { background:'none', border:'none', cursor:'pointer', color:C.verdeMedio, fontWeight:700, display:'flex', alignItems:'center', gap:2, fontSize:12 },
  sep:        { color:C.pergaminoVerde },
  bcCur:      { color:C.verdeProfundo, fontWeight:700 },
  titleRow:   { display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:14 },
  titleBlock: { display:'flex', alignItems:'center', gap:14 },
  titleIcon:  { width:48, height:48, background:C.verdeMenta, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', color:C.verdeProfundo, fontSize:26 },
  panelLabel: { fontSize:9, fontWeight:800, color:C.tierraCalida, textTransform:'uppercase', letterSpacing:'.8px', margin:0 },
  pageTitle:  { fontSize:22, fontWeight:800, color:C.verdeProfundo, margin:0 },
  pageSub:    { fontSize:11, color:C.tierraCalida, marginTop:2 },
  refreshBtn: { background:C.verdeMedio, color:'#fff', border:'none', borderRadius:10, padding:'8px 14px', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700 },
  filters:    { display:'flex', flexWrap:'wrap', gap:8, marginBottom:10 },
  searchWrap: { display:'flex', alignItems:'center', gap:6, background:C.fondoClaro, border:`1px solid ${C.pergaminoVerde}`, borderRadius:8, padding:'6px 10px', flex:1, minWidth:200 },
  searchInput:{ border:'none', background:'none', outline:'none', fontSize:12, flex:1, color:C.grafito },
  sel:        { border:`1px solid ${C.pergaminoVerde}`, borderRadius:8, padding:'6px 10px', fontSize:12, color:C.grafito, background:'#fff', cursor:'pointer' },
  counter:    { fontSize:12, color:C.tierraCalida },
  topCard:    { background:'#fff', borderRadius:12, margin:'16px 20px 0', padding:'16px 20px', boxShadow:`0 2px 8px rgba(27,77,42,.06)` },
  topTitle:   { fontSize:11, fontWeight:800, color:C.verdeProfundo, textTransform:'uppercase', letterSpacing:'.6px', marginBottom:12 },
  topBars:    { display:'flex', flexDirection:'column', gap:8 },
  topItem:    { display:'flex', alignItems:'center', gap:10 },
  topLabel:   { width:140, fontSize:11, fontWeight:600, color:C.grafito, flexShrink:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  topBarTrack:{ flex:1, height:12, background:C.pergaminoVerde, borderRadius:6, overflow:'hidden' },
  topBarFill: { height:'100%', borderRadius:6, transition:'width .4s' },
  topCount:   { width:24, fontSize:11, fontWeight:800, color:C.verdeProfundo, textAlign:'right' },
  content:    { padding:'16px 20px' },
  center:     { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 0', color:C.tierraCalida, gap:12 },
  spinner:    { width:32, height:32, border:`3px solid ${C.pergaminoVerde}`, borderTopColor:C.verdeMedio, borderRadius:'50%', animation:'spin 1s linear infinite' },
  errBox:     { display:'flex', alignItems:'center', gap:12, background:'#fff5f5', border:`1px solid #fcc`, borderRadius:12, padding:'16px 20px', color:'#8B2E2E' },
  empty:      { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 0' },
  table:      { width:'100%', borderCollapse:'collapse', background:'#fff', borderRadius:12, overflow:'hidden', boxShadow:`0 2px 8px rgba(27,77,42,.06)` },
  th:         { background:C.verdeProfundo, color:'#fff', padding:'10px 12px', textAlign:'left', fontSize:10, textTransform:'uppercase', letterSpacing:'.5px', fontWeight:700 },
  td:         { padding:'10px 12px', borderBottom:`1px solid ${C.pergaminoVerde}`, fontSize:12 },
};
