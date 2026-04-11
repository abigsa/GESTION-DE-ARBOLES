import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API = "http://localhost:3000/api";

// ── Estilos por NOMBRE_ESTADO ─────────────────────
const ESTADO_ESTILOS = {
  CRECIMIENTO: { color: "#2E7D32", bg: "#E8F5E9", icon: "🌱", desc: "En desarrollo" },
  PRODUCCION: { color: "#1565C0", bg: "#E3F2FD", icon: "🍊", desc: "Produciendo" },
  "PRODUCCIÓN": { color: "#1565C0", bg: "#E3F2FD", icon: "🍊", desc: "Produciendo" },
  ENFERMO: { color: "#E65100", bg: "#FFF3E0", icon: "⚠️", desc: "Requiere atención" },
  MUERTO: { color: "#B71C1C", bg: "#FFEBEE", icon: "☠", desc: "Para resiembra" },
  RESIEMBRA: { color: "#6A1B9A", bg: "#F3E5F5", icon: "🌿", desc: "Resiembra aplicada" },
};

const getEstilo = (nombreEstado) => {
  if (!nombreEstado) {
    return { color: "#78909C", bg: "#ECEFF1", icon: "⚪", desc: "Sin estado" };
  }

  return (
    ESTADO_ESTILOS[String(nombreEstado).toUpperCase().trim()] || {
      color: "#78909C",
      bg: "#ECEFF1",
      icon: "⚪",
      desc: nombreEstado,
    }
  );
};

const RIESGO_COLOR = { ALTO: "#B71C1C", MEDIO: "#E65100", BAJO: "#F57F17" };
const VISTA = { MAPA: "mapa", ALERTAS: "alertas", RESIEMBRA: "resiembra" };

export default function MapaPlanoModule() {
  const [fincas, setFincas] = useState([]);
  const [fincaSeleccionada, setFincaSeleccionada] = useState("");
  const [sectorFiltro, setSectorFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [datosPlano, setDatosPlano] = useState(null);
  const [arbolSeleccionado, setArbolSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [vista, setVista] = useState(VISTA.MAPA);
  const [tooltip, setTooltip] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    cargarFincas();
  }, []);

  useEffect(() => {
    if (fincaSeleccionada) {
      setArbolSeleccionado(null);
      setSectorFiltro("");
      setEstadoFiltro("");
      setErrorMsg(null);
      cargarPlano(fincaSeleccionada);
    }
  }, [fincaSeleccionada]);

  const cargarFincas = async () => {
    try {
      const res = await axios.get(`${API}/finca`);
      const lista = Array.isArray(res.data) ? res.data : res.data.data || res.data.rows || [];
      setFincas(lista);

      if (lista.length > 0) {
        setFincaSeleccionada(lista[0].ID_FINCA);
      }
    } catch (e) {
      console.error("Error fincas:", e);
    }
  };

  const cargarPlano = async (idFinca) => {
    try {
      setCargando(true);
      const res = await axios.get(`${API}/mapa-plano/${idFinca}`);

      if (res.data.success) {
        setDatosPlano(res.data);
        setErrorMsg(null);
      } else {
        setErrorMsg(res.data.message || "Error al cargar");
        setDatosPlano(null);
      }
    } catch (e) {
      setErrorMsg("No se pudo conectar con el servidor");
      setDatosPlano(null);
    } finally {
      setCargando(false);
    }
  };

  const finca = datosPlano?.finca || null;
  const sectores = datosPlano?.sectores || [];
  const arboles = datosPlano?.arboles || [];

  const anchoFinca = Number(finca?.ANCHO || 100);
  const largoFinca = Number(finca?.LARGO || 200);

  const estadosUnicos = useMemo(
    () => [...new Set(arboles.map((a) => a.NOMBRE_ESTADO).filter(Boolean))],
    [arboles]
  );

  const arbolesFiltrados = useMemo(
    () =>
      arboles.filter((a) => {
        const ok1 = sectorFiltro ? String(a.ID_SECTOR) === String(sectorFiltro) : true;
        const ok2 = estadoFiltro
          ? String(a.NOMBRE_ESTADO || "").toUpperCase().trim() ===
            String(estadoFiltro).toUpperCase().trim()
          : true;
        return ok1 && ok2;
      }),
    [arboles, sectorFiltro, estadoFiltro]
  );

  const stats = useMemo(() => {
    const conteo = {};

    arboles.forEach((a) => {
      const k = String(a.NOMBRE_ESTADO || "SIN ESTADO").toUpperCase().trim();
      conteo[k] = (conteo[k] || 0) + 1;
    });

    return {
      total: arboles.length,
      conteo,
      alertas: (conteo.ENFERMO || 0) + (conteo.MUERTO || 0),
      muertos: conteo.MUERTO || 0,
      enfermos: conteo.ENFERMO || 0,
    };
  }, [arboles]);

  const arbolesConPlagas = useMemo(
    () => arboles.filter((a) => a.PLAGAS?.length > 0),
    [arboles]
  );

  const arbolesAlerta = useMemo(
    () =>
      arboles.filter((a) =>
        ["ENFERMO", "MUERTO"].includes(String(a.NOMBRE_ESTADO || "").toUpperCase().trim())
      ),
    [arboles]
  );

  const arbolesResiembra = useMemo(
    () =>
      arboles.filter(
        (a) => String(a.NOMBRE_ESTADO || "").toUpperCase().trim() === "MUERTO"
      ),
    [arboles]
  );

  const getNumeroPosicionArbol = (arbol) => {
    return Math.max(Number(arbol?.POSICION_X || 1), 1);
  };

  const formatFecha = (f) => {
    if (!f) return "—";
    const d = new Date(f);
    return isNaN(d) ? String(f) : d.toLocaleDateString("es-GT");
  };

  // ── Distribución general y ordenada de sectores ─────────────────
  const getSectorBox = (_sector, idx, total) => {
    const count = Math.max(Number(total || 1), 1);

    const outerLeft = 4;
    const outerTop = 6;
    const outerWidth = 92;
    const outerHeight = 78;

    const gapX = 2.2;
    const gapY = 2.6;

    let cols = Math.ceil(Math.sqrt(count));
    let rows = Math.ceil(count / cols);

    if (count === 1) {
      cols = 1;
      rows = 1;
    }

    if (count === 2) {
      cols = 2;
      rows = 1;
    }

    if (count === 3 || count === 4) {
      cols = 2;
      rows = Math.ceil(count / cols);
    }

    if (count >= 5 && count <= 6) {
      cols = 3;
      rows = Math.ceil(count / cols);
    }

    const cellWidth = (outerWidth - gapX * (cols - 1)) / cols;
    const cellHeight = (outerHeight - gapY * (rows - 1)) / rows;

    const col = idx % cols;
    const row = Math.floor(idx / cols);

    return {
      left: outerLeft + col * (cellWidth + gapX),
      top: outerTop + row * (cellHeight + gapY),
      width: cellWidth,
      height: cellHeight,
    };
  };

  // ── Posición lógica del árbol en matriz ─────────────────────────
  // X = posición dentro del surco
  // Y = surco
  const getArbolPositionByMatriz = (arbol) => {
    const idxSector = sectores.findIndex(
      (s) => String(s.ID_SECTOR) === String(arbol.ID_SECTOR)
    );

    const sector = sectores[idxSector];

    if (!sector) {
      return { left: 50, top: 50 };
    }

    const box = getSectorBox(sector, idxSector, sectores.length);

    const totalSurcos = Math.max(Number(sector.NUMERO_SURCOS || 1), 1);
    const posicionesPorSurco = Math.max(Number(sector.POSICIONES_POR_SURCO || 1), 1);

    const numeroSurco = Math.max(Number(arbol.NUMERO_SURCO || 1), 1);
    const numeroPosicion = getNumeroPosicionArbol(arbol);

    const relX = ((numeroPosicion - 0.5) / posicionesPorSurco) * 100;
    const relY = ((numeroSurco - 0.5) / totalSurcos) * 100;

    const safeX = Math.max(8, Math.min(relX, 92));
    const safeY = Math.max(10, Math.min(relY, 90));

    const left = box.left + (box.width * safeX) / 100;
    const top = box.top + (box.height * safeY) / 100;

    return { left, top };
  };

  return (
    <div style={s.root}>
      <div style={s.topBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={s.logo}>🌿</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1B4D2A" }}>
              {finca?.NOMBRE_FINCA || "Inventario Agrícola"}
            </div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>
              {finca
                ? `${anchoFinca}m × ${largoFinca}m · ${sectores.length} sectores · ${arboles.length} árboles`
                : "Selecciona una finca"}
            </div>
          </div>
        </div>

        <div style={s.tabs}>
          {[
            { id: VISTA.MAPA, ic: "🗺", tx: "Mapa" },
            { id: VISTA.ALERTAS, ic: "⚠️", tx: `Alertas (${stats.alertas})` },
            { id: VISTA.RESIEMBRA, ic: "🌿", tx: `Resiembra (${stats.muertos})` },
          ].map((t) => (
            <button
              key={t.id}
              style={{ ...s.tab, ...(vista === t.id ? s.tabActivo : {}) }}
              onClick={() => setVista(t.id)}
            >
              <span style={{ fontSize: 13 }}>{t.ic}</span> {t.tx}
            </button>
          ))}
        </div>

        <select
          style={s.selectFinca}
          value={fincaSeleccionada}
          onChange={(e) => setFincaSeleccionada(e.target.value)}
        >
          {fincas.map((f) => (
            <option key={f.ID_FINCA} value={f.ID_FINCA}>
              {f.NOMBRE_FINCA}
            </option>
          ))}
        </select>
      </div>

      <div style={s.layout}>
        <aside style={s.aside}>
          <div style={s.card}>
            <p style={s.cardTitle}>Diagnóstico General</p>

            <div style={{ ...s.diagItem, background: "#E8F5E9" }}>
              <span style={{ fontSize: 11 }}>Total árboles</span>
              <strong style={{ fontSize: 22, color: "#1B4D2A" }}>{stats.total}</strong>
            </div>

            {estadosUnicos.map((nombre) => {
              const est = getEstilo(nombre);
              return (
                <div key={nombre} style={{ ...s.diagItem, background: est.bg }}>
                  <span style={{ fontSize: 11 }}>
                    {est.icon} {nombre}
                  </span>
                  <strong style={{ fontSize: 20, color: est.color }}>
                    {stats.conteo[String(nombre).toUpperCase().trim()] || 0}
                  </strong>
                </div>
              );
            })}

            {arbolesConPlagas.length > 0 && (
              <div style={{ ...s.diagItem, background: "#FFF8E1" }}>
                <span style={{ fontSize: 11 }}>🦠 Plagas activas</span>
                <strong style={{ fontSize: 20, color: "#F57F17" }}>
                  {arbolesConPlagas.length}
                </strong>
              </div>
            )}
          </div>

          <div style={s.card}>
            <p style={s.cardTitle}>Filtros</p>

            <label style={s.label}>Sección</label>
            <select
              style={s.select}
              value={sectorFiltro}
              onChange={(e) => setSectorFiltro(e.target.value)}
            >
              <option value="">Todos los sectores</option>
              {sectores.map((sec) => (
                <option key={sec.ID_SECTOR} value={sec.ID_SECTOR}>
                  {sec.NOMBRE_SECTOR}
                </option>
              ))}
            </select>

            <label style={s.label}>Estado del árbol</label>
            <select
              style={s.select}
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="">Todos</option>
              {estadosUnicos.map((nombre) => (
                <option key={nombre} value={nombre}>
                  {getEstilo(nombre).icon} {nombre}
                </option>
              ))}
            </select>

            {(sectorFiltro || estadoFiltro) && (
              <button
                style={s.btnLimpiar}
                onClick={() => {
                  setSectorFiltro("");
                  setEstadoFiltro("");
                }}
              >
                ✕ Limpiar · {arbolesFiltrados.length} resultado(s)
              </button>
            )}
          </div>

          <div style={s.card}>
            <p style={s.cardTitle}>Resumen</p>
            {[
              { l: "Finca", v: finca?.NOMBRE_FINCA || "—" },
              { l: "Área", v: finca ? `${anchoFinca}m × ${largoFinca}m` : "—" },
              { l: "Sectores", v: sectores.length },
              { l: "Árboles", v: arboles.length },
              { l: "Con alertas", v: stats.alertas, warn: stats.alertas > 0 },
              { l: "Con plagas", v: arbolesConPlagas.length, warn: arbolesConPlagas.length > 0 },
            ].map(({ l, v, warn }) => (
              <div key={l} style={s.summaryRow}>
                <span style={{ color: "#6B7280", fontSize: 11 }}>{l}</span>
                <strong style={{ fontSize: 12, color: warn ? "#B71C1C" : "#1B4D2A" }}>
                  {v}
                </strong>
              </div>
            ))}
          </div>

          {sectores.length > 0 && (
            <div style={s.card}>
              <p style={s.cardTitle}>Sectores</p>
              {sectores.map((sec) => {
                const cnt = arboles.filter(
                  (a) => String(a.ID_SECTOR) === String(sec.ID_SECTOR)
                ).length;
                const activo = String(sectorFiltro) === String(sec.ID_SECTOR);

                return (
                  <div
                    key={sec.ID_SECTOR}
                    onClick={() => setSectorFiltro(activo ? "" : String(sec.ID_SECTOR))}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      marginBottom: 6,
                      cursor: "pointer",
                      background: activo ? "#E8F5E9" : "#F9FAFB",
                      border: activo ? "1px solid #A5D6A7" : "1px solid #E5E7EB",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 12, color: "#1B4D2A" }}>
                      {sec.NOMBRE_SECTOR}
                    </div>
                    <div style={{ fontSize: 10, color: "#6B7280", marginTop: 1 }}>
                      {sec.TIPO_CULTIVO} · {sec.AREA_HECTAREAS ? `${sec.AREA_HECTAREAS} ha` : ""}
                    </div>
                    <div style={{ fontSize: 10, color: "#9CA3AF" }}>
                      {sec.NUMERO_SURCOS || "—"} surcos · {cnt} árboles
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </aside>

        <section style={s.center}>
          {vista === VISTA.MAPA && (
            <div style={s.card}>
              <div style={s.mapHeader}>
                <div>
                  <p style={{ ...s.cardTitle, margin: 0 }}>Mapa de Árboles</p>
                  {finca && (
                    <span style={{ fontSize: 11, color: "#6B7280" }}>
                      {finca.NOMBRE_FINCA} · {anchoFinca}m × {largoFinca}m
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button style={s.btnZoom} onClick={() => setZoom((z) => Math.min(z + 0.25, 2.5))}>
                    ＋
                  </button>
                  <span style={{ fontSize: 11, color: "#6B7280", minWidth: 34, textAlign: "center" }}>
                    {Math.round(zoom * 100)}%
                  </span>
                  <button style={s.btnZoom} onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}>
                    －
                  </button>
                  <button style={s.btnZoom} onClick={() => setZoom(1)}>
                    ↺
                  </button>
                  <button style={s.btnPrimary}>＋ Nuevo Árbol</button>
                </div>
              </div>

              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: 420,
                  borderRadius: 10,
                  overflow: "hidden",
                  border: "1px solid #C7D8C8",
                }}
              >
                {cargando ? (
                  <div style={s.mapCenter}>
                    <span style={{ fontSize: 22 }}>🌿</span> Cargando mapa agrícola...
                  </div>
                ) : errorMsg ? (
                  <div style={{ ...s.mapCenter, flexDirection: "column", gap: 8 }}>
                    <span style={{ fontSize: 28 }}>⚠️</span>
                    <span style={{ color: "#E65100" }}>{errorMsg}</span>
                    <button style={s.btnSecondary} onClick={() => cargarPlano(fincaSeleccionada)}>
                      Reintentar
                    </button>
                  </div>
                ) : (
                  <div
                    data-mapa="1"
                    style={{
                      position: "absolute",
                      inset: 0,
                      transform: `scale(${zoom})`,
                      transformOrigin: "top left",
                      width: `${100 / zoom}%`,
                      height: `${100 / zoom}%`,
                    }}
                  >
                    <div style={s.mapBg} />

                    {sectores.map((sector, i) => {
                      const pos = getSectorBox(sector, i, sectores.length);
                      const activo = String(sectorFiltro) === String(sector.ID_SECTOR);
                      const cnt = arboles.filter(
                        (a) => String(a.ID_SECTOR) === String(sector.ID_SECTOR)
                      ).length;

                      return (
                        <div
                          key={sector.ID_SECTOR}
                          onClick={() => setSectorFiltro(activo ? "" : String(sector.ID_SECTOR))}
                          style={{
                            ...s.sectorBox,
                            left: `${pos.left}%`,
                            top: `${pos.top}%`,
                            width: `${pos.width}%`,
                            height: `${pos.height}%`,
                            borderColor: activo ? "#1B4D2A" : "rgba(255,255,255,.55)",
                            background: activo ? "rgba(27,77,42,.12)" : "rgba(255,255,255,.10)",
                            boxShadow: activo ? "inset 0 0 0 1px rgba(27,77,42,.08)" : "none",
                            cursor: "pointer",
                          }}
                        >
                          <div style={s.sectorLabel}>
                            <strong style={{ fontSize: 10, color: "#1B4D2A" }}>
                              {sector.NOMBRE_SECTOR}
                            </strong>
                            <span style={{ fontSize: 9, color: "#6B7280" }}>
                              {sector.TIPO_CULTIVO} · {cnt} árboles
                            </span>
                            {sector.AREA_HECTAREAS && (
                              <span style={{ fontSize: 9, color: "#9CA3AF" }}>
                                {sector.AREA_HECTAREAS} ha
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {arbolesFiltrados.map((arbol) => {
                      const est = getEstilo(arbol.NOMBRE_ESTADO);
                      const pos = getArbolPositionByMatriz(arbol);
                      const left = pos.left;
                      const top = pos.top;
                      const activo = arbolSeleccionado?.ID_ARBOL === arbol.ID_ARBOL;
                      const muerto =
                        String(arbol.NOMBRE_ESTADO || "").toUpperCase().trim() === "MUERTO";
                      const conPlaga = arbol.PLAGAS?.length > 0;

                      return (
                        <button
                          key={arbol.ID_ARBOL}
                          onClick={() => setArbolSeleccionado(arbol)}
                          onMouseEnter={() => setTooltip(arbol)}
                          onMouseLeave={() => setTooltip(null)}
                          style={{
                            position: "absolute",
                            left: `${left}%`,
                            top: `${top}%`,
                            width: activo ? 20 : 14,
                            height: activo ? 20 : 14,
                            borderRadius: muerto ? 3 : "50%",
                            border: `3px solid ${est.color}`,
                            background: activo ? est.color : "#fff",
                            cursor: "pointer",
                            zIndex: activo ? 10 : 5,
                            transform: `translate(-50%,-50%) scale(${activo ? 1.35 : 1})`,
                            transition: "transform .15s, background .15s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            outline: conPlaga ? "2px dashed #F57F17" : "none",
                            outlineOffset: 2,
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              display: "block",
                              borderRadius: muerto ? 2 : "50%",
                              background: activo ? "#fff" : est.color,
                            }}
                          />
                        </button>
                      );
                    })}

                    {tooltip &&
                      (() => {
                        const est = getEstilo(tooltip.NOMBRE_ESTADO);
                        const pos = getArbolPositionByMatriz(tooltip);
                        const left = pos.left;
                        const top = pos.top;

                        return (
                          <div
                            style={{
                              position: "absolute",
                              left: `${left}%`,
                              top: `${top}%`,
                              transform: "translate(14px,-50%)",
                              background: "#fff",
                              borderRadius: 8,
                              padding: "8px 12px",
                              boxShadow: "0 4px 14px rgba(0,0,0,.14)",
                              border: "1px solid #E5E7EB",
                              zIndex: 20,
                              pointerEvents: "none",
                              minWidth: 165,
                            }}
                          >
                            <div style={{ fontWeight: 700, fontSize: 12, color: "#111827" }}>
                              {tooltip.NOMBRE_ARBOL || "Árbol"} #{tooltip.ID_ARBOL}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: est.color,
                                fontWeight: 600,
                                margin: "2px 0",
                              }}
                            >
                              {est.icon} {tooltip.NOMBRE_ESTADO}
                            </div>
                            <div style={{ fontSize: 10, color: "#6B7280" }}>
                              {tooltip.NOMBRE_SECTOR}
                            </div>
                            <div style={{ fontSize: 10, color: "#9CA3AF" }}>
                              Surco {tooltip.NUMERO_SURCO || "—"} · Posición {getNumeroPosicionArbol(tooltip)}
                            </div>
                            {tooltip.NOMBRE_TRATAMIENTO && (
                              <div style={{ fontSize: 10, color: "#1565C0", marginTop: 3 }}>
                                💊 {tooltip.NOMBRE_TRATAMIENTO}
                                {tooltip.NOMBRE_FERTILIZANTE &&
                                  ` + ${tooltip.NOMBRE_FERTILIZANTE}`}
                              </div>
                            )}
                            {tooltip.PLAGAS?.length > 0 && (
                              <div style={{ fontSize: 10, color: "#E65100", marginTop: 2 }}>
                                🦠 {tooltip.PLAGAS.length} plaga(s) activa(s)
                              </div>
                            )}
                          </div>
                        );
                      })()}
                  </div>
                )}
              </div>

              <div style={s.legend}>
                {estadosUnicos.map((nombre) => {
                  const est = getEstilo(nombre);
                  const activo = estadoFiltro === nombre;

                  return (
                    <button
                      key={nombre}
                      onClick={() => setEstadoFiltro(activo ? "" : nombre)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        background: activo ? est.bg : "transparent",
                        border: activo ? `1px solid ${est.color}` : "1px solid transparent",
                        borderRadius: 20,
                        padding: "3px 10px",
                        color: "#374151",
                      }}
                    >
                      <i
                        style={{
                          width: 9,
                          height: 9,
                          display: "inline-block",
                          flexShrink: 0,
                          borderRadius:
                            String(nombre).toUpperCase() === "MUERTO" ? 2 : "50%",
                          background: est.color,
                        }}
                      />
                      {nombre}
                    </button>
                  );
                })}

                {arbolesConPlagas.length > 0 && (
                  <span style={{ fontSize: 10, color: "#9CA3AF" }}>
                    · contorno naranja = plaga activa
                  </span>
                )}
              </div>
            </div>
          )}

          {vista === VISTA.ALERTAS && (
            <div style={s.card}>
              <p style={s.cardTitle}>
                ⚠️ Árboles que requieren atención
                <span style={{ fontSize: 11, fontWeight: 400, color: "#6B7280", marginLeft: 8 }}>
                  {arbolesAlerta.length} árbol(es)
                </span>
              </p>

              {arbolesAlerta.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#9CA3AF", fontSize: 13 }}>
                  No hay árboles con alertas activas
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(235px,1fr))",
                    gap: 10,
                  }}
                >
                  {arbolesAlerta.map((arbol) => {
                    const est = getEstilo(arbol.NOMBRE_ESTADO);

                    return (
                      <div
                        key={arbol.ID_ARBOL}
                        onClick={() => {
                          setArbolSeleccionado(arbol);
                          setVista(VISTA.MAPA);
                        }}
                        style={{
                          background: est.bg,
                          border: `1px solid ${est.color}30`,
                          borderLeft: `4px solid ${est.color}`,
                          borderRadius: 8,
                          padding: "10px 12px",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <strong style={{ fontSize: 12, color: "#111827" }}>
                            {arbol.NOMBRE_ARBOL || "Árbol"} #{arbol.ID_ARBOL}
                          </strong>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "2px 8px",
                              background: est.color,
                              color: "#fff",
                              borderRadius: 20,
                            }}
                          >
                            {est.icon} {arbol.NOMBRE_ESTADO}
                          </span>
                        </div>

                        <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>
                          📍 {arbol.NOMBRE_SECTOR} · Surco {arbol.NUMERO_SURCO || "—"}
                        </div>
                        <div style={{ fontSize: 11, color: "#9CA3AF" }}>
                          Posición {getNumeroPosicionArbol(arbol)}
                        </div>

                        {arbol.NOMBRE_TRATAMIENTO ? (
                          <div style={{ fontSize: 10, color: "#1565C0", marginTop: 5 }}>
                            💊 {arbol.NOMBRE_TRATAMIENTO}
                            {arbol.NOMBRE_FERTILIZANTE && ` + ${arbol.NOMBRE_FERTILIZANTE}`}
                            <br />
                            <span style={{ color: "#9CA3AF" }}>{formatFecha(arbol.FECHA_APLICACION)}</span>
                          </div>
                        ) : (
                          <div style={{ fontSize: 10, color: "#F57C00", marginTop: 5 }}>
                            ⚠ Sin tratamiento registrado
                          </div>
                        )}

                        {arbol.PLAGAS?.length > 0 && (
                          <div style={{ marginTop: 5 }}>
                            {arbol.PLAGAS.map((p, i) => (
                              <span
                                key={i}
                                style={{
                                  display: "inline-block",
                                  marginRight: 3,
                                  marginBottom: 3,
                                  fontSize: 10,
                                  padding: "1px 7px",
                                  borderRadius: 20,
                                  background: RIESGO_COLOR[p.NIVEL_RIESGO] || "#6B7280",
                                  color: "#fff",
                                }}
                              >
                                🦠 {p.NOMBRE_PLAGA} ({p.NIVEL_RIESGO || "—"})
                              </span>
                            ))}
                          </div>
                        )}

                        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                          <button style={{ ...s.btnSmall, background: est.color, color: "#fff" }}>
                            Actualizar estado
                          </button>
                          <button
                            style={{
                              ...s.btnSmall,
                              border: `1px solid ${est.color}`,
                              color: est.color,
                              background: "transparent",
                            }}
                          >
                            Seguimiento
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {vista === VISTA.RESIEMBRA && (
            <div style={s.card}>
              <p style={s.cardTitle}>
                🌿 Oportunidades de Resiembra
                <span style={{ fontSize: 11, fontWeight: 400, color: "#6B7280", marginLeft: 8 }}>
                  {arbolesResiembra.length} espacio(s) disponibles
                </span>
              </p>
              <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 14, lineHeight: 1.6 }}>
                Árboles con estado <strong>MUERTO</strong> — cada uno es un espacio libre para resembrar.
                La ubicación se interpreta por <strong>sector, surco y posición</strong>.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(165px,1fr))",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                {sectores.map((sec) => {
                  const muertos = arbolesResiembra.filter(
                    (a) => String(a.ID_SECTOR) === String(sec.ID_SECTOR)
                  );
                  if (!muertos.length) return null;

                  const surcos = [...new Set(muertos.map((a) => a.NUMERO_SURCO).filter(Boolean))];

                  return (
                    <div
                      key={sec.ID_SECTOR}
                      style={{
                        background: "#F3E5F5",
                        borderRadius: 10,
                        border: "1px solid #CE93D840",
                        padding: "10px 14px",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#4A148C" }}>
                        {sec.NOMBRE_SECTOR}
                      </div>
                      <div style={{ fontSize: 26, fontWeight: 700, color: "#6A1B9A", margin: "2px 0" }}>
                        {muertos.length}
                      </div>
                      <div style={{ fontSize: 11, color: "#7B1FA2" }}>espacios</div>
                      <div style={{ fontSize: 10, color: "#9C27B0", marginTop: 4 }}>
                        {sec.TIPO_CULTIVO}
                        {surcos.length > 0 && ` · Surcos: ${surcos.join(", ")}`}
                      </div>
                    </div>
                  );
                })}

                {arbolesResiembra.length === 0 && (
                  <div
                    style={{
                      gridColumn: "1/-1",
                      textAlign: "center",
                      padding: "40px 0",
                      color: "#9CA3AF",
                      fontSize: 13,
                    }}
                  >
                    No hay árboles muertos registrados
                  </div>
                )}
              </div>

              {arbolesResiembra.length > 0 && (
                <div style={{ overflowX: "auto" }}>
                  <table style={s.table}>
                    <thead>
                      <tr style={{ background: "#EDE7F6" }}>
                        {[
                          "ID",
                          "Sector",
                          "Surco",
                          "Posición",
                          "Variedad anterior",
                          "Último tratamiento",
                          "Acción",
                        ].map((h) => (
                          <th key={h} style={{ ...s.th, color: "#4A148C" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {arbolesResiembra.map((a) => (
                        <tr
                          key={a.ID_ARBOL}
                          onClick={() => {
                            setArbolSeleccionado(a);
                            setVista(VISTA.MAPA);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <td style={s.td}>{a.ID_ARBOL}</td>
                          <td style={s.td}>{a.NOMBRE_SECTOR}</td>
                          <td style={s.td}>{a.NUMERO_SURCO || "—"}</td>
                          <td style={{ ...s.td, fontFamily: "monospace", fontSize: 11, color: "#6B7280" }}>
                            Pos {getNumeroPosicionArbol(a)}
                          </td>
                          <td style={s.td}>{a.NOMBRE_ARBOL || "—"}</td>
                          <td style={{ ...s.td, fontSize: 11 }}>
                            {a.NOMBRE_TRATAMIENTO ? (
                              <>
                                {a.NOMBRE_TRATAMIENTO}
                                <br />
                                <span style={{ color: "#9CA3AF" }}>{formatFecha(a.FECHA_APLICACION)}</span>
                              </>
                            ) : (
                              <span style={{ color: "#E65100" }}>Sin registro</span>
                            )}
                          </td>
                          <td style={s.td}>
                            <button style={{ ...s.btnSmall, background: "#6A1B9A", color: "#fff" }}>
                              🌿 Resembrar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <div style={{ ...s.card, marginTop: 12 }}>
            <p style={{ ...s.cardTitle, marginBottom: 10 }}>
              Listado de Árboles
              <span style={{ fontSize: 11, fontWeight: 400, color: "#6B7280", marginLeft: 8 }}>
                ({arbolesFiltrados.length} de {arboles.length})
              </span>
            </p>

            <div style={{ overflowX: "auto" }}>
              <table style={s.table}>
                <thead>
                  <tr style={{ background: "#E8F5E9" }}>
                    {[
                      "ID",
                      "Sector · Surco",
                      "Estado",
                      "Variedad",
                      "Posición en surco",
                      "Último tratamiento",
                      "Plagas activas",
                    ].map((h) => (
                      <th key={h} style={s.th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {arbolesFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: 24, color: "#9CA3AF", fontSize: 13 }}>
                        No hay árboles con los filtros seleccionados
                      </td>
                    </tr>
                  ) : (
                    arbolesFiltrados.map((a) => {
                      const est = getEstilo(a.NOMBRE_ESTADO);
                      const activo = arbolSeleccionado?.ID_ARBOL === a.ID_ARBOL;

                      return (
                        <tr
                          key={a.ID_ARBOL}
                          onClick={() => setArbolSeleccionado(a)}
                          style={{ cursor: "pointer", background: activo ? "#F0FDF4" : "white" }}
                        >
                          <td style={s.td}>
                            <strong style={{ color: "#374151" }}>{a.ID_ARBOL}</strong>
                          </td>
                          <td style={s.td}>
                            <span style={{ fontSize: 12 }}>{a.NOMBRE_SECTOR}</span>
                            {a.NUMERO_SURCO && (
                              <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                                {" "}
                                · Surco {a.NUMERO_SURCO}
                              </span>
                            )}
                          </td>
                          <td style={s.td}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "3px 10px",
                                borderRadius: 20,
                                fontSize: 11,
                                fontWeight: 700,
                                background: est.bg,
                                color: est.color,
                                border: `1px solid ${est.color}30`,
                              }}
                            >
                              {est.icon} {a.NOMBRE_ESTADO || "—"}
                            </span>
                          </td>
                          <td style={s.td}>{a.NOMBRE_ARBOL || "—"}</td>
                          <td style={{ ...s.td, fontFamily: "monospace", fontSize: 11, color: "#6B7280" }}>
                            Surco {a.NUMERO_SURCO || "—"} · Pos {getNumeroPosicionArbol(a)}
                          </td>
                          <td style={{ ...s.td, fontSize: 11 }}>
                            {a.NOMBRE_TRATAMIENTO ? (
                              <>
                                {a.NOMBRE_TRATAMIENTO}
                                {a.NOMBRE_FERTILIZANTE && (
                                  <span style={{ color: "#1565C0" }}>
                                    {" "}
                                    + {a.NOMBRE_FERTILIZANTE}
                                  </span>
                                )}
                                <br />
                                <span style={{ color: "#9CA3AF" }}>{formatFecha(a.FECHA_APLICACION)}</span>
                              </>
                            ) : (
                              <span style={{ color: "#D1D5DB" }}>—</span>
                            )}
                          </td>
                          <td style={s.td}>
                            {a.PLAGAS?.length > 0 ? (
                              a.PLAGAS.map((p, i) => (
                                <span
                                  key={i}
                                  style={{
                                    display: "inline-block",
                                    fontSize: 10,
                                    marginRight: 3,
                                    padding: "1px 6px",
                                    borderRadius: 20,
                                    background: RIESGO_COLOR[p.NIVEL_RIESGO] || "#6B7280",
                                    color: "#fff",
                                  }}
                                >
                                  {p.NOMBRE_PLAGA}
                                </span>
                              ))
                            ) : (
                              <span style={{ color: "#D1D5DB", fontSize: 11 }}>Sin plagas</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <aside style={{ ...s.aside, maxWidth: 225 }}>
          <div style={s.card}>
            <p style={s.cardTitle}>Detalle del Árbol</p>

            {!arbolSeleccionado ? (
              <p style={{ color: "#9CA3AF", fontSize: 12, lineHeight: 1.7 }}>
                Haz clic en un árbol del mapa o de la tabla para ver su información completa.
              </p>
            ) : (
              (() => {
                const est = getEstilo(arbolSeleccionado.NOMBRE_ESTADO);

                return (
                  <>
                    <div
                      style={{
                        background: est.bg,
                        borderRadius: 8,
                        padding: "8px 12px",
                        border: `1px solid ${est.color}30`,
                        marginBottom: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{est.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: est.color }}>
                          {arbolSeleccionado.NOMBRE_ESTADO}
                        </div>
                        <div style={{ fontSize: 11, color: "#6B7280" }}>{est.desc}</div>
                      </div>
                    </div>

                    {[
                      { l: "ID", v: arbolSeleccionado.ID_ARBOL },
                      { l: "Variedad", v: arbolSeleccionado.NOMBRE_ARBOL || "—" },
                      { l: "Sector", v: arbolSeleccionado.NOMBRE_SECTOR || "—" },
                      { l: "Surco", v: arbolSeleccionado.NUMERO_SURCO || "—" },
                      { l: "Posición", v: getNumeroPosicionArbol(arbolSeleccionado) },
                    ].map(({ l, v }) => (
                      <div key={l} style={s.summaryRow}>
                        <span style={{ color: "#6B7280", fontSize: 11 }}>{l}</span>
                        <strong style={{ fontSize: 12, color: "#111827" }}>{v}</strong>
                      </div>
                    ))}

                    {arbolSeleccionado.NOMBRE_TRATAMIENTO && (
                      <div
                        style={{
                          marginTop: 10,
                          background: "#E3F2FD",
                          borderRadius: 8,
                          padding: "8px 10px",
                          fontSize: 11,
                        }}
                      >
                        <div style={{ fontWeight: 700, color: "#1565C0", marginBottom: 3 }}>
                          💊 Último tratamiento
                        </div>
                        <div style={{ color: "#1976D2" }}>{arbolSeleccionado.NOMBRE_TRATAMIENTO}</div>
                        {arbolSeleccionado.NOMBRE_FERTILIZANTE && (
                          <div style={{ color: "#1976D2" }}>
                            + {arbolSeleccionado.NOMBRE_FERTILIZANTE}
                          </div>
                        )}
                        <div style={{ color: "#90CAF9", marginTop: 2 }}>
                          {formatFecha(arbolSeleccionado.FECHA_APLICACION)}
                        </div>
                        {arbolSeleccionado.OBS_TRATAMIENTO && (
                          <div style={{ color: "#9CA3AF", marginTop: 3, fontStyle: "italic", fontSize: 10 }}>
                            {arbolSeleccionado.OBS_TRATAMIENTO}
                          </div>
                        )}
                      </div>
                    )}

                    {arbolSeleccionado.PLAGAS?.length > 0 && (
                      <div
                        style={{
                          marginTop: 8,
                          background: "#FFF8E1",
                          borderRadius: 8,
                          padding: "8px 10px",
                        }}
                      >
                        <div style={{ fontWeight: 700, color: "#F57F17", fontSize: 11, marginBottom: 4 }}>
                          🦠 Plagas activas ({arbolSeleccionado.PLAGAS.length})
                        </div>
                        {arbolSeleccionado.PLAGAS.map((p, i) => (
                          <div key={i} style={{ fontSize: 10, color: "#795548", marginBottom: 3 }}>
                            <span
                              style={{
                                background: RIESGO_COLOR[p.NIVEL_RIESGO] || "#6B7280",
                                color: "#fff",
                                fontSize: 9,
                                padding: "1px 6px",
                                borderRadius: 20,
                                marginRight: 4,
                              }}
                            >
                              {p.NIVEL_RIESGO || "?"}
                            </span>
                            {p.NOMBRE_PLAGA}
                            {p.TIPO_PLAGA && <span style={{ color: "#9CA3AF" }}> · {p.TIPO_PLAGA}</span>}
                            {p.OBSERVACIONES && (
                              <div style={{ color: "#9CA3AF", fontStyle: "italic", marginTop: 1 }}>
                                {p.OBSERVACIONES}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {arbolSeleccionado.DESCRIPCION && (
                      <p
                        style={{
                          marginTop: 8,
                          fontSize: 11,
                          color: "#6B7280",
                          lineHeight: 1.6,
                          borderTop: "1px solid #F3F4F6",
                          paddingTop: 8,
                        }}
                      >
                        {arbolSeleccionado.DESCRIPCION}
                      </p>
                    )}

                    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                      <button style={{ ...s.btnPrimary, justifyContent: "center" }}>
                        Actualizar estado
                      </button>

                      {["ENFERMO", "MUERTO"].includes(
                        String(arbolSeleccionado.NOMBRE_ESTADO || "").toUpperCase().trim()
                      ) && (
                        <button style={{ ...s.btnSecondary, borderColor: "#E65100", color: "#E65100" }}>
                          ⚠️ Registrar alerta
                        </button>
                      )}

                      {String(arbolSeleccionado.NOMBRE_ESTADO || "").toUpperCase().trim() ===
                        "MUERTO" && (
                        <button style={{ ...s.btnSecondary, borderColor: "#6A1B9A", color: "#6A1B9A" }}>
                          🌿 Marcar para resiembra
                        </button>
                      )}

                      {String(arbolSeleccionado.NOMBRE_ESTADO || "").toUpperCase().trim() ===
                        "ENFERMO" && (
                        <button style={{ ...s.btnSecondary, borderColor: "#1565C0", color: "#1565C0" }}>
                          📋 Ver seguimiento
                        </button>
                      )}
                    </div>
                  </>
                );
              })()
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

const s = {
  root: {
    background: "#F0F4F1",
    height: "100%",
    overflowY: "auto",
    fontFamily: "'Segoe UI',system-ui,sans-serif",
    color: "#111827",
    boxSizing: "border-box",
  },
  topBar: {
    background: "#fff",
    borderBottom: "1px solid #E5E7EB",
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 30,
  },
  logo: {
    width: 36,
    height: 36,
    background: "#1B4D2A",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
  },
  tabs: { display: "flex", gap: 4 },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid transparent",
    background: "transparent",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    color: "#6B7280",
  },
  tabActivo: { background: "#E8F5E9", color: "#1B4D2A", border: "1px solid #A5D6A7" },
  selectFinca: {
    height: 34,
    border: "1px solid #D1D5DB",
    borderRadius: 8,
    padding: "0 8px",
    fontSize: 12,
    background: "#F9FAFB",
    color: "#111827",
    outline: "none",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "200px 1fr 225px",
    gap: 12,
    padding: 16,
    alignItems: "start",
  },
  aside: { display: "flex", flexDirection: "column", gap: 12 },
  center: { display: "flex", flexDirection: "column", minWidth: 0 },
  card: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    padding: 14,
    boxShadow: "0 1px 4px rgba(0,0,0,.04)",
  },
  cardTitle: { margin: "0 0 10px", color: "#1B4D2A", fontSize: 13, fontWeight: 700 },
  diagItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 8,
    marginBottom: 5,
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "5px 0",
    borderBottom: "1px solid #F3F4F6",
    gap: 8,
  },
  label: {
    display: "block",
    fontWeight: 600,
    fontSize: 11,
    color: "#374151",
    marginBottom: 3,
    marginTop: 8,
  },
  select: {
    width: "100%",
    height: 34,
    border: "1px solid #D1D5DB",
    borderRadius: 8,
    padding: "0 8px",
    fontSize: 12,
    background: "#F9FAFB",
    color: "#111827",
    outline: "none",
  },
  btnLimpiar: {
    marginTop: 10,
    width: "100%",
    padding: "5px 0",
    fontSize: 11,
    color: "#6B7280",
    background: "transparent",
    border: "1px solid #D1D5DB",
    borderRadius: 8,
    cursor: "pointer",
  },
  mapHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    flexWrap: "wrap",
    gap: 8,
  },
  btnPrimary: {
    background: "#1B4D2A",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  btnSecondary: {
    background: "#fff",
    color: "#374151",
    border: "1px solid #D1D5DB",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  btnZoom: {
    width: 28,
    height: 28,
    borderRadius: 6,
    border: "1px solid #D1D5DB",
    background: "#F9FAFB",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  btnSmall: {
    padding: "4px 10px",
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 20,
    cursor: "pointer",
    border: "none",
    background: "transparent",
  },
  legend: { display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap", alignItems: "center" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: {
    padding: "9px 10px",
    textAlign: "left",
    fontWeight: 700,
    color: "#1B4D2A",
    fontSize: 11,
    borderBottom: "1px solid #E5E7EB",
  },
  td: {
    padding: "9px 10px",
    borderBottom: "1px solid #F3F4F6",
    verticalAlign: "middle",
  },
  mapBg: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(rgba(20,20,20,.04),rgba(20,20,20,.04)),repeating-linear-gradient(90deg,#6f8d4f 0px,#6f8d4f 6px,#688248 6px,#688248 12px,#7d9759 12px,#7d9759 18px),repeating-linear-gradient(0deg,rgba(130,100,65,.1) 0px,rgba(130,100,65,.1) 3px,transparent 3px,transparent 34px)",
  },
  sectorBox: {
    position: "absolute",
    borderRadius: 10,
    border: "2px dashed",
    backdropFilter: "blur(1px)",
    zIndex: 2,
  },
  sectorLabel: {
    position: "absolute",
    top: 6,
    left: 8,
    maxWidth: "calc(100% - 16px)",
    background: "rgba(255,255,255,.96)",
    padding: "4px 8px",
    borderRadius: 6,
    display: "flex",
    flexDirection: "column",
    gap: 1,
    boxShadow: "0 1px 4px rgba(0,0,0,.1)",
    overflow: "hidden",
  },
  mapCenter: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    color: "#6B7280",
    fontSize: 13,
    fontWeight: 600,
  },
};