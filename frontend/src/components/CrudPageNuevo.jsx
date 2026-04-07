import { useEffect, useState, useCallback } from 'react';
import { MODULES, colLabel, HIDDEN_COLS } from '../config/modulesNuevo';
import CrudFormNuevo from './CrudFormNuevo';
import s from './CrudPageNuevo.module.css';

// URL del backend — cambia si tu servidor está en otra dirección
const API = 'http://localhost:3000/api';

export default function CrudPageNuevo({ moduleKey, onBack }) {
  const cfg = MODULES[moduleKey];
  const { title, endpoint } = cfg;

  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`${API}${endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      if (json.ok || json.success) {
        setData(json.data ?? []);
      } else {
        setError(json.mensaje || 'Error al cargar los datos');
      }
    } catch (e) {
      setError('No se pudo conectar con el servidor. Verifica que el backend esté activo en localhost:3000');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Columnas visibles (excluye las ocultas)
  const cols = data.length > 0
    ? Object.keys(data[0]).filter(k => !HIDDEN_COLS.has(k))
    : [];

  // Detectar clave primaria
  const pkVal = (row) => {
    for (const k of Object.keys(row)) {
      if (k.toLowerCase() === 'id') return row[k];
    }
    for (const k of Object.keys(row)) {
      if (k.toLowerCase().startsWith('id_') || k.toLowerCase().endsWith('_id')) return row[k];
    }
    return null;
  };

  // Filtro de búsqueda
  const filtered = search.trim()
    ? data.filter(r =>
        Object.values(r).some(v =>
          String(v ?? '').toLowerCase().includes(search.toLowerCase())
        )
      )
    : data;

  // Eliminar registro
  const handleDelete = async (row) => {
    const id = pkVal(row);
    if (!id) { alert('No se puede identificar el registro'); return; }
    if (!window.confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) return;
    try {
      const res  = await fetch(`${API}${endpoint}/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.ok || json.success) {
        fetchData();
      } else {
        alert(json.mensaje || 'Error al eliminar');
      }
    } catch {
      alert('Error de conexión al eliminar');
    }
  };

  // Render de celda con badges para campos especiales
  const renderCell = (col, val) => {
    const v = String(val ?? '—');
    const k = col.toLowerCase();
    const isBadge = k.includes('riesgo') || k === 'tipo_plaga' || k === 'es_productivo';

    if (!isBadge) {
      return (
        <span title={v.length > 28 ? v : ''} className={s.cellText}>
          {v.length > 28 ? v.slice(0, 28) + '…' : v}
        </span>
      );
    }

    let cls = s.badgeN;
    if (['ALTO', 'PLAGA', 'S'].includes(v))  cls = s.badgeD;
    if (['BAJO', 'N'].includes(v))            cls = s.badgeS;
    if (v === 'MEDIO')                         cls = s.badgeW;
    return <span className={cls}>{v}</span>;
  };

  return (
    <div className={s.root}>

      {/* ── Header ───────────────────────────────── */}
      <div className={s.header}>

        {/* Breadcrumb */}
        <div className={s.breadcrumb}>
          <button className={s.backBtn} onClick={onBack}>
            <span className="material-icons">arrow_back_ios</span>
            Inicio
          </button>
          <span>/</span>
          <span className={s.bcCur}>{title}</span>
        </div>

        {/* Título + botón agregar */}
        <div className={s.titleRow}>
          <div className={s.titleIcon}>
            <span className="material-icons">dataset</span>
          </div>
          <div>
            <p className={s.panelLabel}>PANEL ADMINISTRATIVO</p>
            <h1 className={s.pageTitle}>{title}</h1>
          </div>
          <button className={s.btnAdd} onClick={() => setModal('new')}>
            <span className="material-icons">add</span>
            Agregar
          </button>
        </div>

        {/* Búsqueda */}
        <div className={s.searchWrap}>
          <span className="material-icons">search</span>
          <input
            placeholder={`Buscar en ${title.toLowerCase()}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <span className="material-icons">close</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Sub-header ───────────────────────────── */}
      <div className={s.subHeader}>
        <span className={s.counter}>
          {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
          {search && ` de ${data.length}`}
        </span>
        <button className={s.refreshBtn} onClick={fetchData} title="Actualizar">
          <span className="material-icons">refresh</span>
        </button>
      </div>

      {/* ── Contenido ────────────────────────────── */}
      {loading ? (
        <div className={s.center}>
          <div className={s.spinner} />
          <p>Cargando {title.toLowerCase()}...</p>
        </div>

      ) : error ? (
        <div className={s.errBox}>
          <span className="material-icons">wifi_off</span>
          <div>
            <p className={s.errTitle}>Error de conexión</p>
            <p className={s.errMsg}>{error}</p>
          </div>
          <button className={s.btnRetry} onClick={fetchData}>
            <span className="material-icons">refresh</span> Reintentar
          </button>
        </div>

      ) : filtered.length === 0 ? (
        <div className={s.center}>
          <span className="material-icons"
            style={{ fontSize: 64, color: 'var(--pergamino-verde)' }}>
            inbox
          </span>
          <p style={{ fontWeight: 700, color: 'var(--verde-profundo)', marginTop: 12 }}>
            {search ? `Sin resultados para "${search}"` : 'Sin registros'}
          </p>
          <p style={{ color: 'var(--tierra-calida)', fontSize: 13 }}>
            {search
              ? 'Intenta con otro término de búsqueda'
              : 'Presiona "Agregar" para crear el primer registro'}
          </p>
        </div>

      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                {cols.map(c => <th key={c}>{colLabel(c)}</th>)}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? s.rowE : s.rowO}>
                  {cols.map(c => (
                    <td key={c}>{renderCell(c, row[c])}</td>
                  ))}
                  <td>
                    <div className={s.actions}>
                      <ABtn
                        icon="edit"
                        color="var(--verde-medio)"
                        tip="Editar"
                        onClick={() => setModal(row)}
                      />
                      <ABtn
                        icon="delete_outline"
                        color="var(--rojo-alerta)"
                        tip="Eliminar"
                        onClick={() => handleDelete(row)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal formulario ─────────────────────── */}
      {modal !== null && (
        <CrudFormNuevo
          config={cfg}
          editItem={modal === 'new' ? null : modal}
          editId={modal === 'new' ? null : pkVal(modal)}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchData(); }}
        />
      )}
    </div>
  );
}

// ── Botón de acción en tabla ──────────────────────
function ABtn({ icon, color, tip, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      title={tip}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 32, height: 32,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: hov ? `${color}20` : 'transparent',
        border: hov ? `1px solid ${color}50` : '1px solid transparent',
        transition: '150ms ease',
        color,
        cursor: 'pointer',
      }}>
      <span className="material-icons" style={{ fontSize: 17 }}>{icon}</span>
    </button>
  );
}
