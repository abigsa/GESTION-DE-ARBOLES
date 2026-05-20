import { useEffect, useState, useRef } from 'react';
import s from './NotificacionesPanel.module.css';
import { API, apiFetch } from '../context/AuthContext';

const DIAS_ALERTA = 7;
const DIAS_CRITICO = 21;

function get(obj, ...keys) {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k];
  }
  return null;
}

function diasDesde(val) {
  if (!val) return null;
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
}

function fechaValida(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function normalizarRows(json) {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  if (json.ok || json.success) return Array.isArray(json.data) ? json.data : [];
  return [];
}

export default function NotificacionesPanel({ onSelect }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [leidas, setLeidas] = useState(() => {
    try {
      return new Set(JSON.parse(sessionStorage.getItem('notifs_leidas') || '[]'));
    } catch {
      return new Set();
    }
  });

  const ref = useRef(null);

  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);

      try {
        const [rPlagas, rTrat, rArboles, rSectores, rFincas] = await Promise.all([
          apiFetch(`${API}/registro-plaga`).then(r => r.json()),
          apiFetch(`${API}/registro-tratamiento`).then(r => r.json()),
          apiFetch(`${API}/arbol`).then(r => r.json()),
          apiFetch(`${API}/sector`).then(r => r.json()),
          apiFetch(`${API}/finca`).then(r => r.json()),
        ]);

        if (!mounted) return;

        const plagas = normalizarRows(rPlagas);
        const tratamientos = normalizarRows(rTrat);
        const arboles = normalizarRows(rArboles);
        const sectores = normalizarRows(rSectores);
        const fincas = normalizarRows(rFincas);

        const lista = [];

        plagas.forEach(p => {
          const fechaResolucion = get(p, 'FECHA_RESOLUCION', 'fecha_resolucion');
          if (fechaResolucion) return;

          const idRegistro = get(p, 'ID_REGISTRO', 'id_registro');
          const idArbol = get(p, 'ID_ARBOL', 'id_arbol');
          const fechaDeteccion = get(p, 'FECHA_DETECCION', 'fecha_deteccion');
          const dias = diasDesde(fechaDeteccion);

          const arbol = arboles.find(a =>
            String(get(a, 'ID_ARBOL', 'id_arbol')) === String(idArbol)
          );

          const idSector =
            get(p, 'ID_SECTOR', 'id_sector') ||
            get(arbol, 'ID_SECTOR', 'id_sector');

          const sectorEncontrado = sectores.find(sec =>
            String(get(sec, 'ID_SECTOR', 'id_sector')) === String(idSector)
          );

          const idFinca =
            get(p, 'ID_FINCA', 'id_finca') ||
            get(arbol, 'ID_FINCA', 'id_finca') ||
            get(sectorEncontrado, 'ID_FINCA', 'id_finca');

          const fincaEncontrada = fincas.find(fin =>
            String(get(fin, 'ID_FINCA', 'id_finca')) === String(idFinca)
          );

          const nomFinca =
            get(p, 'NOMBRE_FINCA', 'nombre_finca') ||
            get(arbol, 'NOMBRE_FINCA', 'nombre_finca') ||
            get(fincaEncontrada, 'NOMBRE_FINCA', 'nombre_finca') ||
            null;

          const nomSector =
            get(p, 'NOMBRE_SECTOR', 'nombre_sector') ||
            get(arbol, 'NOMBRE_SECTOR', 'nombre_sector') ||
            get(sectorEncontrado, 'NOMBRE_SECTOR', 'nombre_sector') ||
            null;

          const numeroSurco =
            get(p, 'NUMERO_SURCO', 'numero_surco') ||
            get(arbol, 'NUMERO_SURCO', 'numero_surco') ||
            null;

          const ubicacion = [
            nomFinca,
            nomSector,
            numeroSurco ? `Surco ${numeroSurco}` : null,
          ].filter(Boolean).join(' · ') || 'Ubicación no identificada';

          const tratamientosDelArbol = tratamientos.filter(t =>
            String(get(t, 'ID_ARBOL', 'id_arbol')) === String(idArbol)
          );

          const deteccionDate = fechaValida(fechaDeteccion);

          const tieneTratamientoPosterior = tratamientosDelArbol.some(t => {
            const fechaTratamiento = fechaValida(
              get(t, 'FECHA_APLICACION', 'fecha_aplicacion')
            );

            if (!fechaTratamiento) return tratamientosDelArbol.length > 0;
            if (!deteccionDate) return true;

            return fechaTratamiento >= deteccionDate;
          });

          const nomArbol =
            get(p, 'NOMBRE_ARBOL', 'nombre_arbol') ||
            get(arbol, 'NOMBRE_ARBOL', 'nombre_arbol') ||
            `Árbol #${idArbol}`;

          const nomPlaga =
            get(p, 'NOMBRE_PLAGA', 'nombre_plaga') ||
            'Plaga detectada';

          const diasTexto =
            dias === null
              ? 'Fecha no registrada'
              : dias === 0
                ? 'Detectada hoy'
                : `${dias} día(s) activa`;

          let tipo = 'seguimiento';
          let icon = 'pest_control';

          if (dias !== null && dias >= DIAS_CRITICO) {
            tipo = 'critico';
            icon = 'crisis_alert';
          } else if (dias !== null && dias >= DIAS_ALERTA) {
            tipo = 'alerta';
            icon = 'warning';
          }

          lista.push({
            id: `plaga-${idRegistro || idArbol}-${fechaDeteccion || 'sin-fecha'}-${nomPlaga}`,
            tipo,
            icon,
            titulo: nomArbol,
            mensaje: `${nomPlaga} · ${diasTexto}`,
            detalle: tieneTratamientoPosterior
              ? 'Tiene tratamiento posterior registrado'
              : 'Pendiente de tratamiento o seguimiento',
            tratado: tieneTratamientoPosterior,
            sector: ubicacion,
          });
        });

        lista.sort((a, b) => {
          const peso = { critico: 3, alerta: 2, seguimiento: 1 };
          return peso[b.tipo] - peso[a.tipo];
        });

        setNotifs(lista);
      } catch (err) {
        console.error('Error cargando notificaciones:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    const timer = setInterval(load, 60000);

const actualizarNotificaciones = () => {
  load();
};

window.addEventListener('plagas-actualizadas', actualizarNotificaciones);

return () => {
  mounted = false;
  clearInterval(timer);
  window.removeEventListener('plagas-actualizadas', actualizarNotificaciones);
};
  }, []);

  const noLeidas = notifs.filter(n => !leidas.has(n.id)).length;

  const marcarLeida = id => {
    setLeidas(prev => {
      const next = new Set(prev);
      next.add(id);

      try {
        sessionStorage.setItem('notifs_leidas', JSON.stringify([...next]));
      } catch {}

      return next;
    });
  };

  const marcarTodas = () => {
    const ids = notifs.map(n => n.id);

    setLeidas(prev => {
      const next = new Set([...prev, ...ids]);

      try {
        sessionStorage.setItem('notifs_leidas', JSON.stringify([...next]));
      } catch {}

      return next;
    });
  };

  const irSeguimiento = id => {
    marcarLeida(id);
    setOpen(false);

    if (typeof onSelect === 'function') {
      onSelect('registros-plaga');
    }
  };

  return (
    <div className={s.wrap} ref={ref}>
      <button
        className={`${s.bell} ${open ? s.bellOpen : ''}`}
        onClick={() => setOpen(o => !o)}
        type="button"
        title="Notificaciones"
      >
        <span className="material-icons">notifications</span>

        {noLeidas > 0 && (
          <span className={s.badge}>
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {open && (
        <div className={s.panel}>
          <div className={s.panelHeader}>
            <div>
              <h3 className={s.panelTitle}>Seguimiento de plagas</h3>
              <p className={s.panelSub}>
                {notifs.length === 0
                  ? 'Todo en orden'
                  : `${notifs.length} plaga(s) activa(s)`}
              </p>
            </div>

            {noLeidas > 0 && (
              <button className={s.markAll} onClick={marcarTodas} type="button">
                <span className={s.iconCircle}>
                  <span className="material-icons">done_all</span>
                </span>
                Marcar todas
              </button>
            )}
          </div>

          <div className={s.list}>
            {loading ? (
              <div className={s.center}>
                <div className={s.spinner} />
                <p>Verificando plagas activas...</p>
              </div>
            ) : notifs.length === 0 ? (
              <div className={s.empty}>
                <span className="material-icons">check_circle</span>
                <p>Sin plagas activas</p>
                <span>Todos los árboles están bajo control</span>
              </div>
            ) : (
              notifs.map(n => (
                <div
                  key={n.id}
                  className={`${s.item} ${
                    n.tipo === 'critico'
                      ? s.itemCritico
                      : n.tipo === 'alerta'
                        ? s.itemAlerta
                        : s.itemSeguimiento
                  } ${leidas.has(n.id) ? s.itemLeida : ''}`}
                  onClick={() => marcarLeida(n.id)}
                >
                  <div className={`${s.itemIcon} ${
                    n.tipo === 'critico'
                      ? s.iconCritico
                      : n.tipo === 'alerta'
                        ? s.iconAlerta
                        : s.iconSeguimiento
                  }`}>
                    <span className="material-icons">{n.icon}</span>
                  </div>

                  <div className={s.itemContent}>
                    <div className={s.itemTop}>
                      <span className={s.itemTitle}>{n.titulo}</span>

                      <span className={`${s.itemTipo} ${
                        n.tipo === 'critico'
                          ? s.tipoCritico
                          : n.tipo === 'alerta'
                            ? s.tipoAlerta
                            : s.tipoSeguimiento
                      }`}>
                        {n.tipo === 'critico'
                          ? 'Crítico'
                          : n.tipo === 'alerta'
                            ? 'Alerta'
                            : 'Seguimiento'}
                      </span>
                    </div>

                    <p className={s.itemMsg}>{n.mensaje}</p>
                    <p className={s.itemSector}>{n.sector}</p>

                    <p className={`${s.itemDetalle} ${n.tratado ? s.detalleOk : s.detalleWarn}`}>
                      {n.tratado ? '✓' : '✗'} {n.detalle}
                    </p>

                    <button
                      type="button"
                      className={s.followBtn}
                      onClick={e => {
                        e.stopPropagation();
                        irSeguimiento(n.id);
                      }}
                    >
                      <span className={s.iconCircle}>
                        <span className="material-icons">visibility</span>
                      </span>
                      Ver seguimiento
                    </button>
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