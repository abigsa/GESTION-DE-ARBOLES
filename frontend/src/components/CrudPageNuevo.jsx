import { useEffect, useState, useCallback } from 'react';
import { MODULES, colLabel, HIDDEN_COLS } from '../config/modulesNuevo';
import CrudFormNuevo from './CrudFormNuevo';
import s from './CrudPageNuevo.module.css';

const API = 'http://localhost:3000/api';

export default function CrudPageNuevo({ moduleKey, onBack }) {
  const cfg = MODULES[moduleKey];
  const { title, endpoint, icon = 'dataset' } = cfg;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}${endpoint}`, {
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
      setError(
        'No se pudo conectar con el servidor. Verifica que el backend esté activo en localhost:3000'
      );
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const cols =
    data.length > 0
      ? Object.keys(data[0]).filter(k => !HIDDEN_COLS.has(k))
      : [];

  const pkVal = row => {
    for (const k of Object.keys(row)) {
      if (k.toLowerCase() === 'id') return row[k];
    }
    for (const k of Object.keys(row)) {
      if (k.toLowerCase().startsWith('id_') || k.toLowerCase().endsWith('_id')) {
        return row[k];
      }
    }
    return null;
  };

  const filtered = search.trim()
    ? data.filter(r =>
        Object.values(r).some(v =>
          String(v ?? '').toLowerCase().includes(search.toLowerCase())
        )
      )
    : data;

  const handleDelete = async row => {
    const id = pkVal(row);

    if (!id) {
      alert('No se puede identificar el registro');
      return;
    }

    if (!window.confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const res = await fetch(`${API}${endpoint}/${id}`, { method: 'DELETE' });
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

  const renderCell = (col, val) => {
    const v = String(val ?? '—');
    const k = col.toLowerCase();
    const isBadge = k.includes('riesgo') || k === 'tipo_plaga' || k === 'es_productivo';

    if (!isBadge) {
      return (
        <span title={v.length > 42 ? v : ''} className={s.cellText}>
          {v.length > 42 ? `${v.slice(0, 42)}…` : v}
        </span>
      );
    }

    let cls = s.badgeN;
    if (['ALTO', 'PLAGA', 'S'].includes(v)) cls = s.badgeD;
    if (['BAJO', 'N'].includes(v)) cls = s.badgeS;
    if (v === 'MEDIO') cls = s.badgeW;

    return <span className={cls}>{v}</span>;
  };

  return (
    <div className={s.root}>
      <div className={s.pageShell}>
        <header className={s.headerCard}>
          <div className={s.breadcrumb}>
            <button className={s.backBtn} onClick={onBack} type="button">
              <span className="material-icons">arrow_back_ios</span>
              Inicio
            </button>
            <span className={s.bcSep}>/</span>
            <span className={s.bcCur}>{title}</span>
          </div>

          <div className={s.titleRow}>
            <div className={s.titleBlock}>
              <div className={s.titleIcon}>
                <span className="material-icons">{icon}</span>
              </div>
              <div>
                <p className={s.panelLabel}>PANEL ADMINISTRATIVO</p>
                <h1 className={s.pageTitle}>{title}</h1>
                <p className={s.pageSubtitle}>
                  Consulta, filtra y administra los registros del módulo seleccionado.
                </p>
              </div>
            </div>

            <div className={s.titleActions}>
              <button className={s.refreshBtn} onClick={fetchData} title="Actualizar" type="button">
                <span className="material-icons">refresh</span>
                <span>Actualizar</span>
              </button>

              <button className={s.btnAdd} onClick={() => setModal('new')} type="button">
                <span className="material-icons">add</span>
                Agregar registro
              </button>
            </div>
          </div>

          <div className={s.toolbar}>
            <div className={s.searchWrap}>
              <span className="material-icons">search</span>
              <input
                placeholder={`Buscar en ${title.toLowerCase()}...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')} type="button">
                  <span className="material-icons">close</span>
                </button>
              )}
            </div>

            <div className={s.statsWrap}>
              <div className={s.counterCard}>
                <span className={s.counterLabel}>Registros visibles</span>
                <strong className={s.counterValue}>{filtered.length}</strong>
              </div>

              <div className={s.counterCard}>
                <span className={s.counterLabel}>Total</span>
                <strong className={s.counterValue}>{data.length}</strong>
              </div>
            </div>
          </div>
        </header>

        <section className={s.contentCard}>
          {loading ? (
            <div className={s.center}>
              <div className={s.spinner} />
              <p className={s.centerTitle}>Cargando {title.toLowerCase()}...</p>
              <span className={s.centerText}>Espera un momento mientras se consultan los datos.</span>
            </div>
          ) : error ? (
            <div className={s.errBox}>
              <div className={s.errIcon}>
                <span className="material-icons">wifi_off</span>
              </div>

              <div className={s.errContent}>
                <p className={s.errTitle}>Error de conexión</p>
                <p className={s.errMsg}>{error}</p>
              </div>

              <button className={s.btnRetry} onClick={fetchData} type="button">
                <span className="material-icons">refresh</span>
                Reintentar
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className={s.emptyState}>
              <div className={s.emptyIcon}>
                <span className="material-icons">inbox</span>
              </div>

              <p className={s.emptyTitle}>
                {search ? `Sin resultados para "${search}"` : 'Sin registros disponibles'}
              </p>

              <p className={s.emptyText}>
                {search
                  ? 'Prueba con otro término o limpia el filtro de búsqueda.'
                  : 'Aún no hay datos en este módulo. Puedes crear el primer registro desde el botón superior.'}
              </p>

              {!search && (
                <button className={s.emptyBtn} onClick={() => setModal('new')} type="button">
                  <span className="material-icons">add</span>
                  Crear primer registro
                </button>
              )}
            </div>
          ) : (
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    {cols.map(c => (
                      <th key={c}>{colLabel(c)}</th>
                    ))}
                    <th className={s.actionsCol}>Acciones</th>
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
                            tip="Editar"
                            variant="edit"
                            onClick={() => setModal(row)}
                          />
                          <ABtn
                            icon="delete_outline"
                            tip="Eliminar"
                            variant="delete"
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
        </section>
      </div>

      {modal !== null && (
        <CrudFormNuevo
          config={cfg}
          editItem={modal === 'new' ? null : modal}
          editId={modal === 'new' ? null : pkVal(modal)}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function ABtn({ icon, tip, onClick, variant = 'edit' }) {
  const variantClass = variant === 'delete' ? s.actionDelete : s.actionEdit;

  return (
    <button
      title={tip}
      onClick={onClick}
      type="button"
      className={`${s.actionBtn} ${variantClass}`}
    >
      <span className="material-icons">{icon}</span>
    </button>
  );
}