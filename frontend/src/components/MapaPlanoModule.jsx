import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import '../App.css';

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

  useEffect(() => {
    if (fincaSeleccionada) cargarPlano(fincaSeleccionada);
  }, [fincaSeleccionada]);

  const cargarFincas = async () => {
    try {
      const res   = await axios.get(`${API}/finca`);
      const lista = Array.isArray(res.data)
        ? res.data
        : res.data.data || res.data.rows || [];
      setFincas(lista);
      if (lista.length > 0) setFincaSeleccionada(lista[0].ID_FINCA);
    } catch (error) {
      console.error("❌ Error cargando fincas:", error);
      setFincas([]);
    }
  };

  const cargarPlano = async (idFinca) => {
    try {
      setCargando(true);
      const res = await axios.get(`${API}/mapa-plano/${idFinca}`);
      setDatosPlano(res.data);
    } catch (error) {
      console.error("❌ Error cargando plano:", error);
      setDatosPlano(null);
    } finally {
      setCargando(false);
    }
  };

  const sectores = datosPlano?.sectores || [];
  const arboles  = datosPlano?.arboles  || [];
  const finca    = datosPlano?.finca    || null;

  const arbolesFiltrados = useMemo(() => {
    return arboles.filter((a) => {
      const cumpleSector = sectorFiltro ? String(a.ID_SECTOR) === String(sectorFiltro) : true;
      const cumpleEstado = estadoFiltro ? String(a.ID_ESTADO) === String(estadoFiltro) : true;
      return cumpleSector && cumpleEstado;
    });
  }, [arboles, sectorFiltro, estadoFiltro]);

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
    <div className="enca-page">

      {/* HEADER */}
      <div className="enca-topbar">
        <div className="enca-logo">
          🌳 <span>Sistema de Gestión de Árboles</span>
        </div>
        <div className="enca-user">Bienvenido, Ingeniero</div>
      </div>

      {/* MENÚ HORIZONTAL */}
      <div className="enca-subnav">
        <button className="enca-subnav-item active">Inicio</button>
        <button className="enca-subnav-item">Registrar Árbol</button>
        <button className="enca-subnav-item">Consultar Árbol</button>
        <button className="enca-subnav-item">Reportes</button>
      </div>

      {/* CONTENIDO */}
      <div className="enca-layout">

        {/* SIDEBAR IZQUIERDA */}
        <aside className="enca-sidebar">
          <div className="enca-card">
            <h3>Diagnóstico General</h3>
            <div className="diag-item">
              <span>Árboles Totales</span>
              <strong>{arboles.length}</strong>
            </div>
            <div className="diag-item success">
              <span>🌱 En Crecimiento</span>
              <strong>{totalCreciendo}</strong>
            </div>
            <div className="diag-item warning">
              <span>🍊 En Producción</span>
              <strong>{totalProduccion}</strong>
            </div>
            <div className="diag-item danger">
              <span>✚ Enfermos</span>
              <strong>{totalEnfermos}</strong>
            </div>
            <div className="diag-item dark">
              <span>☠ Muertos</span>
              <strong>{totalMuertos}</strong>
            </div>
          </div>

          <div className="enca-card">
            <h3>Filtros de Búsqueda</h3>
            <div className="enca-field">
              <label>Finca:</label>
              <select
                value={fincaSeleccionada}
                onChange={(e) => {
                  setFincaSeleccionada(e.target.value);
                  setSectorFiltro("");
                  setEstadoFiltro("");
                  setArbolSeleccionado(null);
                }}
              >
                {Array.isArray(fincas) &&
                  fincas.map((f) => (
                    <option key={f.ID_FINCA} value={f.ID_FINCA}>
                      {f.NOMBRE_FINCA}
                    </option>
                  ))}
              </select>
            </div>

            <div className="enca-field">
              <label>Sección:</label>
              <select value={sectorFiltro} onChange={(e) => setSectorFiltro(e.target.value)}>
                <option value="">Todos</option>
                {sectores.map((s) => (
                  <option key={s.ID_SECTOR} value={s.ID_SECTOR}>
                    {s.NOMBRE_SECTOR}
                  </option>
                ))}
              </select>
            </div>

            <div className="enca-field">
              <label>Estado:</label>
              <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
                <option value="">Todos</option>
                <option value="1">Creciendo</option>
                <option value="2">Producción</option>
                <option value="3">Enfermo</option>
                <option value="4">Muerto</option>
              </select>
            </div>

            <button className="enca-btn-primary">Filtrar</button>
          </div>
        </aside>

        {/* CENTRO */}
        <section className="enca-main">
          <div className="enca-map-card">
            <div className="enca-map-header">
              <h2>Mapa de Árboles</h2>
              <div className="enca-actions">
                <button className="enca-btn-green">＋ Nuevo Árbol</button>
                <button className="enca-btn-blue">🔍 Buscar Árbol</button>
              </div>
            </div>

            <div className="enca-map-body">
              {cargando ? (
                <div className="enca-loading">Cargando mapa agrícola...</div>
              ) : !datosPlano?.success ? (
                <div className="enca-loading">No se pudo cargar el mapa.</div>
              ) : (
                <>
                  <div className="enca-map-title">
                    <strong>{finca?.NOMBRE_FINCA}</strong>
                    <span>{finca?.ANCHO || 100}m x {finca?.LARGO || 200}m</span>
                  </div>

                  <div className="enca-map-real">
                    <div className="enca-map-bg"></div>

                    {/* SECTORES */}
                    <div className="enca-sectores-grid">
                      {sectores.map((sector, index) => (
                        <div
                          key={sector.ID_SECTOR}
                          className={`enca-sector-box ${
                            String(sectorFiltro) === String(sector.ID_SECTOR) ? "selected" : ""
                          }`}
                          style={{
                            left: `${8 + index * 44}%`,
                            top:  `${12 + (index % 2) * 28}%`,
                          }}
                        >
                          <div className="enca-sector-label">
                            <strong>{sector.NOMBRE_SECTOR}</strong>
                            <span>{sector.TIPO_CULTIVO || "Cultivo"}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ÁRBOLES */}
                    {arbolesFiltrados.map((arbol) => {
                      const estado = obtenerInfoEstado(arbol.ID_ESTADO);
                      const left   = getPosicionPorcentaje(arbol.POSICION_X || 10, finca?.ANCHO || 100);
                      const top    = getPosicionPorcentaje(arbol.POSICION_Y || 10, finca?.LARGO || 200);
                      return (
                        <button
                          key={arbol.ID_ARBOL}
                          className={`enca-tree-marker ${
                            arbolSeleccionado?.ID_ARBOL === arbol.ID_ARBOL ? "active" : ""
                          }`}
                          style={{
                            left: `${left}%`,
                            top:  `${top}%`,
                            borderColor: estado.color,
                            boxShadow:   `0 0 0 3px ${estado.color}25`,
                          }}
                          onClick={() => setArbolSeleccionado(arbol)}
                          title={`${arbol.NOMBRE_ARBOL} - ${estado.label}`}
                        >
                          <span className="tree-dot" style={{ backgroundColor: estado.color }}></span>
                        </button>
                      );
                    })}
                  </div>

                  {/* LEYENDA */}
                  <div className="enca-legend">
                    <span><i className="legend-dot green"></i> En Crecimiento</span>
                    <span><i className="legend-dot yellow"></i> En Producción</span>
                    <span><i className="legend-dot red"></i> Enfermo</span>
                    <span><i className="legend-dot gray"></i> Muerto</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* TABLA */}
          <div className="enca-table-card">
            <h2>Listado de Árboles</h2>
            <div className="enca-table-wrapper">
              <table className="enca-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Ubicación</th>
                    <th>Estado</th>
                    <th>Tipo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {arbolesFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center" }}>
                        No hay árboles registrados
                      </td>
                    </tr>
                  ) : (
                    arbolesFiltrados.map((a) => {
                      const estado = obtenerInfoEstado(a.ID_ESTADO);
                      return (
                        <tr
                          key={a.ID_ARBOL}
                          onClick={() => setArbolSeleccionado(a)}
                          style={{ cursor: "pointer" }}
                        >
                          <td>A-{a.ID_ARBOL}</td>
                          <td>
                            {finca?.NOMBRE_FINCA},{" "}
                            {obtenerNombreSector(a.ID_SECTOR)}, Surco{" "}
                            {a.NUMERO_SURCO || "-"}
                          </td>
                          <td>
                            <span
                              className="estado-pill"
                              style={{
                                backgroundColor: `${estado.color}15`,
                                color:            estado.color,
                                border:           `1px solid ${estado.color}40`,
                              }}
                            >
                              {estado.icon} {estado.label}
                            </span>
                          </td>
                          <td>{a.NOMBRE_ARBOL || "Árbol"}</td>
                          <td>
                            <span className="table-action">Actualizar</span>
                            {" | "}
                            <span className="table-action alert">Alerta</span>
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

        {/* PANEL DERECHO */}
        <aside className="enca-detail">
          <div className="enca-card">
            <h3>Resumen</h3>
            <div className="summary-row">
              <span>Finca:</span>
              <strong>{finca?.NOMBRE_FINCA || "-"}</strong>
            </div>
            <div className="summary-row">
              <span>Dimensiones:</span>
              <strong>{finca?.ANCHO || 0}m x {finca?.LARGO || 0}m</strong>
            </div>
            <div className="summary-row">
              <span>Sectores:</span>
              <strong>{sectores.length}</strong>
            </div>
            <div className="summary-row">
              <span>Árboles:</span>
              <strong>{arboles.length}</strong>
            </div>
            <div className="summary-row">
              <span>Alertas:</span>
              <strong>{totalAlertas}</strong>
            </div>
          </div>

          <div className="enca-card">
            <h3>Detalle del Árbol</h3>
            {!arbolSeleccionado ? (
              <p className="empty-detail">
                Haz clic en un árbol del mapa para ver su información.
              </p>
            ) : (
              <div className="tree-detail">
                <div className="detail-row">
                  <span>ID:</span>
                  <strong>A-{arbolSeleccionado.ID_ARBOL}</strong>
                </div>
                <div className="detail-row">
                  <span>Nombre:</span>
                  <strong>{arbolSeleccionado.NOMBRE_ARBOL || "Árbol"}</strong>
                </div>
                <div className="detail-row">
                  <span>Sector:</span>
                  <strong>{arbolSeleccionado.NOMBRE_SECTOR}</strong>
                </div>
                <div className="detail-row">
                  <span>Surco:</span>
                  <strong>{arbolSeleccionado.NUMERO_SURCO || "-"}</strong>
                </div>
                <div className="detail-row">
                  <span>Estado:</span>
                  <strong>{obtenerInfoEstado(arbolSeleccionado.ID_ESTADO).label}</strong>
                </div>
                <div className="detail-row">
                  <span>Posición X:</span>
                  <strong>{arbolSeleccionado.POSICION_X ?? "-"}</strong>
                </div>
                <div className="detail-row">
                  <span>Posición Y:</span>
                  <strong>{arbolSeleccionado.POSICION_Y ?? "-"}</strong>
                </div>
                <div className="detail-row detail-block">
                  <span>Descripción:</span>
                  <p>{arbolSeleccionado.DESCRIPCION || "Sin descripción"}</p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default MapaPlanoModule;
