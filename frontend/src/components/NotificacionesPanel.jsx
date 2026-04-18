import { useEffect, useState, useRef } from 'react';
import s from './NotificacionesPanel.module.css';

const API = 'http://localhost:3000/api';
const DIAS_ALERTA  = 7;   // días sin tratar = alerta
const DIAS_CRITICO = 21;  // días sin tratar = crítico

function get(obj, ...keys) {
  for (const k of keys) if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k];
  return null;
}

function diasDesde(val) {
  if (!val) return null;
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
}

export default function NotificacionesPanel() {
  const [open,     setOpen]     = useState(false);
  const [notifs,   setNotifs]   = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [leidas,   setLeidas]   = useState(() => {
    try { return new Set(JSON.parse(sessionStorage.getItem('notifs_leidas') || '[]')); }
    catch { return new Set(); }
  });
  const ref = useRef(null);

  // Cerrar al click fuera
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Cargar notificaciones
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [rPlagas, rTrat, rArboles] = await Promise.all([
          fetch(`${API}/registro-plaga`).then(r => r.json()),
          fetch(`${API}/registro-tratamiento`).then(r => r.json()),
          fetch(`${API}/arbol`).then(r => r.json()),
        ]);
        if (!mounted) return;

        const rows  = j => (j.ok || j.success) ? (Array.isArray(j.data) ? j.data : []) : [];
        const plagas   = rows(rPlagas);
        const tratos   = rows(rTrat);
        const arboles  = rows(rArboles);

        const idsTratados = new Set(tratos.map(t => String(get(t,'ID_ARBOL','id_arbol'))));

        const lista = [];

        plagas.forEach(p => {
          const resolucion = get(p,'FECHA_RESOLUCION','fecha_resolucion');
          if (resolucion) return; // ya resuelta

          const idArbol  = get(p,'ID_ARBOL','id_arbol');
          const dias     = diasDesde(get(p,'FECHA_DETECCION','fecha_deteccion'));
          if (dias === null || dias < DIAS_ALERTA) return;

          const tratado  = idsTratados.has(String(idArbol));
          const arbol    = arboles.find(a => String(get(a,'ID_ARBOL','id_arbol')) === String(idArbol));
          const nomArbol = get(p,'NOMBRE_ARBOL','nombre_arbol')
                        || get(arbol,'NOMBRE_ARBOL','nombre_arbol')
                        || `Árbol #${idArbol}`;
          const nomPlaga = get(p,'NOMBRE_PLAGA','nombre_plaga') || 'Plaga detectada';

          lista.push({
            id:       `plaga-${get(p,'ID_REGISTRO','id_registro')}`,
            tipo:     dias >= DIAS_CRITICO ? 'critico' : 'alerta',
            titulo:   nomArbol,
            mensaje:  `${nomPlaga} · ${dias} días sin resolución`,
            detalle:  tratado ? 'Tiene tratamiento aplicado' : 'Sin tratamiento aplicado',
            tratado,
            icon:     dias >= DIAS_CRITICO ? 'crisis_alert' : 'warning',
          });
        });

        // Ordenar: críticos primero, luego alertas
        lista.sort((a,b) => (b.tipo === 'critico') - (a.tipo === 'critico'));
        if (mounted) setNotifs(lista);
      } catch { /* sin conexión */ }
      finally { if (mounted) setLoading(false); }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const noLeidas = notifs.filter(n => !leidas.has(n.id)).length;

  const marcarLeida = (id) => {
    setLeidas(prev => {
      const next = new Set(prev); next.add(id);
      try { sessionStorage.setItem('notifs_leidas', JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const marcarTodas = () => {
    const ids = notifs.map(n => n.id);
    setLeidas(prev => {
      const next = new Set([...prev, ...ids]);
      try { sessionStorage.setItem('notifs_leidas', JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  return (
    <div className={s.wrap} ref={ref}>
      {/* Botón campana */}
      <button
        className={`${s.bell} ${open ? s.bellOpen : ''}`}
        onClick={() => setOpen(o => !o)}
        type="button"
        title="Notificaciones"
      >
        <span className="material-icons">notifications</span>
        {noLeidas > 0 && (
          <span className={s.badge}>{noLeidas > 9 ? '9+' : noLeidas}</span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className={s.panel}>
          <div className={s.panelHeader}>
            <div>
              <h3 className={s.panelTitle}>Notificaciones</h3>
              <p className={s.panelSub}>
                {notifs.length === 0 ? 'Todo en orden' : `${notifs.length} alertas activas`}
              </p>
            </div>
            {noLeidas > 0 && (
              <button className={s.markAll} onClick={marcarTodas} type="button">
                Marcar todas
              </button>
            )}
          </div>

          <div className={s.list}>
            {loading ? (
              <div className={s.center}>
                <div className={s.spinner} />
                <p>Verificando alertas...</p>
              </div>
            ) : notifs.length === 0 ? (
              <div className={s.empty}>
                <span className="material-icons">check_circle</span>
                <p>Sin alertas activas</p>
                <span>Todos los árboles están bajo control</span>
              </div>
            ) : (
              notifs.map(n => (
                <div
                  key={n.id}
                  className={`${s.item} ${n.tipo === 'critico' ? s.itemCritico : s.itemAlerta} ${leidas.has(n.id) ? s.itemLeida : ''}`}
                  onClick={() => marcarLeida(n.id)}
                >
                  <div className={`${s.itemIcon} ${n.tipo === 'critico' ? s.iconCritico : s.iconAlerta}`}>
                    <span className="material-icons">{n.icon}</span>
                  </div>
                  <div className={s.itemContent}>
                    <div className={s.itemTop}>
                      <span className={s.itemTitle}>{n.titulo}</span>
                      <span className={`${s.itemTipo} ${n.tipo === 'critico' ? s.tipoCritico : s.tipoAlerta}`}>
                        {n.tipo === 'critico' ? 'Crítico' : 'Alerta'}
                      </span>
                    </div>
                    <p className={s.itemMsg}>{n.mensaje}</p>
                    <p className={`${s.itemDetalle} ${n.tratado ? s.detalleOk : s.detalleWarn}`}>
                      {n.tratado ? '✓' : '✗'} {n.detalle}
                    </p>
                  </div>
                  {!leidas.has(n.id) && <div className={s.dot} />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
