import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API = "http://localhost:3000/api";

const estadoConfig = {
  1: { label: "Creciendo", color: "#4CAF50", icon: "🟢" },
  2: { label: "Producción", color: "#F4B400", icon: "🟡" },
  3: { label: "Enfermo",   color: "#E53935", icon: "🔴" },
  4: { label: "Muerto",    color: "#5F6B7A", icon: "⚫" },
};

function MapaPlanoModule() {
  const [fincas,            setFincas]            = useState([]);
  const [fincaSeleccionada, setFincaSeleccionada] = useState("");
  const [sectorFiltro,      setSectorFiltro]      = useState("");
  const [estadoFiltro,      setEstadoFiltro]      = useState("");
  const [datosPlano,        setDatosPlano]        = useState(null);
  const [arbolSeleccionado, setArbolSeleccionado] = useState(null);
  const [cargando,          setCargando]          = useState(false);

  useEffect(() => { cargarFincas(); }, []);
  useEffect(() => { if (fincaSeleccionada) cargarPlano(fincaSeleccionada); }, [fincaSeleccionada]);

  const cargarFincas = async () => {
    try {
      const res   = await axios.get(`${API}/finca`);
      const lista = Array.isArray(res.data) ? res.data : res.data.data || res.data.rows || [];
      setFincas(lista);
      if (lista.length > 0) setFincaSeleccionada(lista[0].ID_FINCA);
    } catch (e) {
      console.error("Error cargando fincas:", e);
      setFincas([]);
    }
  };

  const cargarPlano = async (idFinca) => {
    try {
      setCargando(true);
      const res = await axios.get(`${API}/mapa-plano/${idFinca}`);
      setDatosPlano(res.data);
    } catch (e) {
      console.error("Error cargando plano:", e);
      setDatosPlano(null);
    } finally {
      setCargando(false);
    }
  };

  const sectores  = datosPlano?.sectores || [];
  const arboles   = datosPlano?.arboles  || [];
  const finca     = datosPlano?.finca    || null;

  const arbolesFiltrados = useMemo(() => arboles.filter((a) => {
    const cumpleSector = sectorFiltro ? String(a.ID_SECTOR) === String(sectorFiltro) : true;
    const cumpleEstado = estadoFiltro ? String(a.ID_ESTADO) === String(estadoFiltro) : true;
    return cumpleSector && cumpleEstado;
  }), [arboles, sectorFiltro, estadoFiltro]);

  const totalAlertas    = arboles.filter((a) => Number(a.ID_ESTADO) === 3 || Number(a.ID_ESTADO) === 4).length;
  const totalCreciendo  = arboles.filter((a) => Number(a.ID_ESTADO) === 1).length;
  const totalProduccion = arboles.filter((a) => Number(a.ID_ESTADO) === 2).length;
  const totalEnfermos   = arboles.filter((a) => Number(a.ID_ESTADO) === 3).length;
  const totalMuertos    = arboles.filter((a) => Number(a.ID_ESTADO) === 4).length;

  const obtenerNombreSector = (idSector) => {
    const s = sectores.find((x) => String(x.ID_SECTOR) === String(idSector));
    return s?.NOMBRE_SECTOR || "Sin sector";
  };

  const obtenerInfoEstado = (idEstado) =>
    estadoConfig[idEstado] || { label: "Otro", color: "#4B5563", icon: "⚪" };

  const getPosicionPorcentaje = (valor, max) => {
    if (!max || Number(max) === 0) return 5;
    return Math.max(3, Math.min((Number(valor) / Number(max)) * 100, 97));
  };

  return (
    <div style={s.root}>
      <div style={s.layout}>

        {/* ── ASIDE IZQUIERDO ──────────────────────── */}
        <aside style={s.aside}>

          {/* Diagnóstico */}
          <div style={s.card}>
            <p style={s.cardTitle}>Diagnóstico General</p>
            {[
              { label: "Árboles Totales",  val: arboles.length,   color: "#1B4D2A" },
              { label: "🌱 Crecimiento",   val: totalCreciendo,   color: "#2E7D32" },
              { label: "🍊 Producción",    val: totalProduccion,  color: "#D68B00" },
              { label: "✚ Enfermos",       val: totalEnfermos,    color: "#D32F2F" },
              { label: "☠ Muertos",        val: totalMuertos,     color: "#374151" },
            ].map(({ label, val, color }) => (
              <div key={label} style={s.diagItem}>
                <span style={{ fontSize: 12 }}>{label}</span>
                <strong style={{ fontSize: 20, color }}>{val}</strong>
              </div>
            ))}
          </div>

          {/* Filtros */}
          <div style={s.card}>
            <p style={s.cardTitle}>Filtros</p>
            <label style={s.label}>Finca</label>
            <select style={s.select} value={fincaSeleccionada}
              onChange={(e) => {
                setFincaSeleccionada(e.target.value);
                setSectorFiltro(""); setEstadoFiltro(""); setArbolSeleccionado(null);
              }}>
              {fincas.map((f) => (
                <option key={f.ID_FINCA} value={f.ID_FINCA}>{f.NOMBRE_FINCA}</option>
              ))}
            </select>

            <label style={s.label}>Sección</label>
            <select style={s.select} value={sectorFiltro}
              onChange={(e) => setSectorFiltro(e.target.value)}>
              <option value="">Todos</option>
              {sectores.map((sec) => (
                <option key={sec.ID_SECTOR} value={sec.ID_SECTOR}>{sec.NOMBRE_SECTOR}</option>
              ))}
            </select>

            <label style={s.label}>Estado</label>
            <select style={s.select} value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}>
              <option value="">Todos</option>
              <option value="1">Creciendo</option>
              <option value="2">Producción</option>
              <option value="3">Enfermo</option>
              <option value="4">Muerto</option>
            </select>
          </div>

          {/* Resumen */}
          <div style={s.card}>
            <p style={s.cardTitle}>Resumen</p>
            {[
              { label: "Finca",       val: finca?.NOMBRE_FINCA || "—" },
              { label: "Dimensiones", val: finca ? `${finca.ANCHO||0}m x ${finca.LARGO||0}m` : "—" },
              { label: "Sectores",    val: sectores.length },
              { label: "Árboles",     val: arboles.length  },
              { label: "Alertas",     val: totalAlertas    },
            ].map(({ label, val }) => (
              <div key={label} style={s.summaryRow}>
                <span style={{ color: "#8B6F47", fontSize: 11 }}>{label}:</span>
                <strong style={{ fontSize: 12, color: "#1B4D2A" }}>{val}</strong>
              </div>
            ))}
          </div>
        </aside>

        {/* ── CENTRO ──────────────────────────────── */}
        <section style={s.center}>

          {/* Mapa */}
          <div style={s.card}>
            <div style={s.mapHeader}>
              <div>
                <p style={{ ...s.cardTitle, marginBottom: 2 }}>Mapa de Árboles</p>
                {finca && (
                  <span style={{ fontSize: 11, color: "#8B6F47" }}>
                    {finca.NOMBRE_FINCA} — {finca.ANCHO||100}m x {finca.LARGO||200}m
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={s.btnPrimary}>＋ Nuevo Árbol</button>
                <button style={s.btnSecondary}>🔍 Buscar</button>
              </div>
            </div>

            {/* Canvas */}
            <div style={s.mapCanvas}>
              {cargando ? (
                <div style={s.mapCenter}>Cargando mapa agrícola...</div>
              ) : !datosPlano?.success ? (
                <div style={s.mapCenter}>No se pudo cargar el mapa.</div>
              ) : (
                <>
                  <div style={s.mapBg} />

                  {/* Caminos */}
                  <div style={s.caminoH} />
                  <div style={s.caminoV} />

                  {/* Sectores */}
                  {sectores.map((sector, i) => (
                    <div key={sector.ID_SECTOR} style={{
                      ...s.sectorBox,
                      left:       `${8 + i * 44}%`,
                      top:        `${12 + (i % 2) * 28}%`,
                      borderColor: String(sectorFiltro) === String(sector.ID_SECTOR)
                        ? "#2D7A3E" : "rgba(255,255,255,.45)",
                      background:  String(sectorFiltro) === String(sector.ID_SECTOR)
                        ? "rgba(45,122,62,.12)" : "rgba(255,255,255,.08)",
                    }}>
                      <div style={s.sectorLabel}>
                        <strong style={{ fontSize: 11 }}>{sector.NOMBRE_SECTOR}</strong>
                        <span style={{ fontSize: 10, color: "#555" }}>{sector.TIPO_CULTIVO || "Cultivo"}</span>
                      </div>
                    </div>
                  ))}

                  {/* Árboles */}
                  {arbolesFiltrados.map((arbol) => {
                    const estado = obtenerInfoEstado(arbol.ID_ESTADO);
                    const left   = getPosicionPorcentaje(arbol.POSICION_X || 10, finca?.ANCHO  || 100);
                    const top    = getPosicionPorcentaje(arbol.POSICION_Y || 10, finca?.LARGO || 200);
                    const activo = arbolSeleccionado?.ID_ARBOL === arbol.ID_ARBOL;
                    return (
                      <button key={arbol.ID_ARBOL}
                        onClick={() => setArbolSeleccionado(arbol)}
                        title={`${arbol.NOMBRE_ARBOL} — ${estado.label}`}
                        style={{
                          ...s.treeMarker,
                          left: `${left}%`, top: `${top}%`,
                          borderColor: estado.color,
                          boxShadow:   `0 0 0 3px ${estado.color}25`,
                          transform:   `translate(-50%,-50%) scale(${activo ? 1.3 : 1})`,
                        }}>
                        <span style={{ ...s.treeDot, backgroundColor: estado.color }} />
                      </button>
                    );
                  })}
                </>
              )}
            </div>

            {/* Leyenda */}
            <div style={s.legend}>
              {[
                { color:"#4CAF50", label:"Crecimiento" },
                { color:"#F4B400", label:"Producción"  },
                { color:"#E53935", label:"Enfermo"     },
                { color:"#5F6B7A", label:"Muerto"      },
              ].map(({ color, label }) => (
                <span key={label} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11 }}>
                  <i style={{ width:10, height:10, borderRadius:"50%", background:color, display:"inline-block" }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Tabla */}
          <div style={{ ...s.card, marginTop: 12 }}>
            <p style={{ ...s.cardTitle, marginBottom: 10 }}>Listado de Árboles</p>
            <div style={{ overflowX: "auto" }}>
              <table style={s.table}>
                <thead>
                  <tr style={{ background: "#E8F5E9" }}>
                    {["ID","Ubicación","Estado","Tipo","Acciones"].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {arbolesFiltrados.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign:"center", padding:16, color:"#8B6F47", fontSize:13 }}>
                      No hay árboles registrados
                    </td></tr>
                  ) : arbolesFiltrados.map((a) => {
                    const estado = obtenerInfoEstado(a.ID_ESTADO);
                    return (
                      <tr key={a.ID_ARBOL}
                        onClick={() => setArbolSeleccionado(a)}
                        style={{
                          cursor: "pointer",
                          background: arbolSeleccionado?.ID_ARBOL === a.ID_ARBOL ? "#F1F8F1" : "white",
                        }}>
                        <td style={s.td}>A-{a.ID_ARBOL}</td>
                        <td style={s.td}>{finca?.NOMBRE_FINCA}, {obtenerNombreSector(a.ID_SECTOR)}, Surco {a.NUMERO_SURCO||"-"}</td>
                        <td style={s.td}>
                          <span style={{
                            display:"inline-flex", alignItems:"center", gap:5,
                            padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:700,
                            background:`${estado.color}18`, color:estado.color,
                            border:`1px solid ${estado.color}40`,
                          }}>
                            {estado.icon} {estado.label}
                          </span>
                        </td>
                        <td style={s.td}>{a.NOMBRE_ARBOL || "Árbol"}</td>
                        <td style={s.td}>
                          <span style={{ color:"#2D7A3E", fontWeight:700, fontSize:12, cursor:"pointer" }}>Actualizar</span>
                          {" | "}
                          <span style={{ color:"#D97706", fontWeight:700, fontSize:12, cursor:"pointer" }}>Alerta</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── DETALLE DERECHO ──────────────────────── */}
        <aside style={{ ...s.aside, maxWidth: 210 }}>
          <div style={s.card}>
            <p style={s.cardTitle}>Detalle del Árbol</p>
            {!arbolSeleccionado ? (
              <p style={{ color:"#8B6F47", fontSize:12, lineHeight:1.6 }}>
                Haz clic en un árbol del mapa para ver su información.
              </p>
            ) : (
              <>
                {[
                  { label:"ID",         val:`A-${arbolSeleccionado.ID_ARBOL}` },
                  { label:"Nombre",     val:arbolSeleccionado.NOMBRE_ARBOL||"Árbol" },
                  { label:"Sector",     val:arbolSeleccionado.NOMBRE_SECTOR||"—" },
                  { label:"Surco",      val:arbolSeleccionado.NUMERO_SURCO||"—" },
                  { label:"Estado",     val:obtenerInfoEstado(arbolSeleccionado.ID_ESTADO).label },
                  { label:"Posición X", val:arbolSeleccionado.POSICION_X??"-" },
                  { label:"Posición Y", val:arbolSeleccionado.POSICION_Y??"-" },
                ].map(({ label, val }) => (
                  <div key={label} style={s.summaryRow}>
                    <span style={{ color:"#8B6F47", fontSize:11 }}>{label}:</span>
                    <strong style={{ fontSize:12, color:"#1B4D2A" }}>{val}</strong>
                  </div>
                ))}
                {arbolSeleccionado.DESCRIPCION && (
                  <p style={{ marginTop:8, fontSize:12, color:"#4A4A4A", lineHeight:1.5 }}>
                    {arbolSeleccionado.DESCRIPCION}
                  </p>
                )}
              </>
            )}
          </div>
        </aside>

      </div>
    </div>
  );
}

// ── Estilos ───────────────────────────────────────
const s = {
  root: {
    background: "#F2F7F3",
    height: "100%",
    overflowY: "auto",
    padding: 16,
    fontFamily: "'Segoe UI', sans-serif",
    color: "#1f2937",
    boxSizing: "border-box",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "190px 1fr 210px",
    gap: 12,
    alignItems: "start",
  },
  aside: { display:"flex", flexDirection:"column", gap:12 },
  center:{ display:"flex", flexDirection:"column", minWidth:0 },
  card: {
    background: "#fff",
    border: "1px solid #DCEDDF",
    borderRadius: 12,
    padding: 14,
    boxShadow: "0 2px 8px rgba(27,77,42,.06)",
  },
  cardTitle: {
    margin: "0 0 10px",
    color: "#1B4D2A",
    fontSize: 13,
    fontWeight: 700,
  },
  diagItem: {
    display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"7px 10px", background:"#F9FBF9",
    border:"1px solid #DCEDDF", borderRadius:8, marginBottom:6,
  },
  summaryRow: {
    display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"5px 0", borderBottom:"1px solid #EDF2F7", gap:8,
  },
  label: { display:"block", fontWeight:600, fontSize:11, color:"#374151", marginBottom:3, marginTop:8 },
  select: {
    width:"100%", height:34, border:"1px solid #DCEDDF",
    borderRadius:8, padding:"0 8px", fontSize:12,
    background:"#F2F7F3", color:"#1B4D2A", outline:"none",
  },
  mapHeader: {
    display:"flex", justifyContent:"space-between",
    alignItems:"flex-start", marginBottom:10, flexWrap:"wrap", gap:8,
  },
  btnPrimary: {
    background:"linear-gradient(180deg,#2D7A3E,#1B4D2A)",
    color:"#fff", border:"none", borderRadius:8,
    padding:"6px 12px", fontSize:12, fontWeight:700, cursor:"pointer",
  },
  btnSecondary: {
    background:"#E8F5E9", color:"#1B4D2A",
    border:"1px solid #DCEDDF", borderRadius:8,
    padding:"6px 12px", fontSize:12, fontWeight:700, cursor:"pointer",
  },
  mapCanvas: {
    position:"relative", width:"100%", height:300,
    borderRadius:10, overflow:"hidden",
    border:"1px solid #C7D8C8", background:"#d8e6cf",
  },
  mapBg: {
    position:"absolute", inset:0,
    background:`
      linear-gradient(rgba(20,20,20,.06),rgba(20,20,20,.06)),
      repeating-linear-gradient(90deg,#6f8d4f 0px,#6f8d4f 6px,#688248 6px,#688248 12px,#7d9759 12px,#7d9759 18px),
      repeating-linear-gradient(0deg,rgba(130,100,65,.18) 0px,rgba(130,100,65,.18) 3px,transparent 3px,transparent 34px)
    `,
  },
  caminoH: { position:"absolute", width:"100%", height:8, top:"48%", left:0, background:"rgba(190,168,133,.8)", zIndex:1 },
  caminoV: { position:"absolute", width:8, height:"100%", left:"50%", top:0, background:"rgba(190,168,133,.8)", zIndex:1 },
  sectorBox: {
    position:"absolute", width:170, height:90,
    borderRadius:10, border:"2px dashed", backdropFilter:"blur(1px)", zIndex:2,
  },
  sectorLabel: {
    position:"absolute", top:5, left:7,
    background:"rgba(255,255,255,.92)",
    padding:"3px 8px", borderRadius:6,
    display:"flex", flexDirection:"column",
    boxShadow:"0 2px 5px rgba(0,0,0,.08)",
  },
  treeMarker: {
    position:"absolute", width:16, height:16,
    borderRadius:"50%", border:"3px solid",
    background:"#fff", cursor:"pointer", zIndex:5,
    transition:"transform .2s ease",
    display:"flex", alignItems:"center", justifyContent:"center",
  },
  treeDot: { width:6, height:6, borderRadius:"50%", display:"block" },
  legend: { display:"flex", gap:14, marginTop:8, flexWrap:"wrap", fontWeight:600 },
  table:  { width:"100%", borderCollapse:"collapse", fontSize:12 },
  th: { padding:"9px 10px", textAlign:"left", fontWeight:700, color:"#1B4D2A", fontSize:11, borderBottom:"1px solid #DCEDDF" },
  td: { padding:"9px 10px", borderBottom:"1px solid #F0F4F0", verticalAlign:"middle" },
  mapCenter: { height:"100%", display:"flex", alignItems:"center", justifyContent:"center", color:"#475569", fontSize:13, fontWeight:600 },
};

export default MapaPlanoModule;