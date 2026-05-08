import { useEffect, useState, useCallback, useMemo } from 'react';
import { MODULES, MODULE_PK, colLabel, HIDDEN_COLS } from '../config/modulesNuevo';
import CrudFormNuevo from './CrudFormNuevo';
import s from './CrudPageNuevo.module.css';
import ExportarBtn from './ExportarBtn';

import { API, apiFetch } from '../context/AuthContext';
const PAGE_SIZE_OPTIONS = [10, 25, 50];

export default function CrudPageNuevo({ moduleKey, onBack }) {
  const cfg = MODULES[moduleKey];
  const { title, endpoint, icon = 'dataset' } = cfg;

  const [data,      setData]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [search,    setSearch]    = useState('');
  const [modal,     setModal]     = useState(null);
  const [confirmRow,setConfirmRow]= useState(null);

  // Paginación
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res  = await apiFetch(`${API}${endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      if (json.ok === true || json.success === true) {
        setData(Array.isArray(json.data) ? json.data : []);
        setPage(1);
      } else {
        setError(json.mensaje ?? json.message ?? 'Error al cargar los datos');
      }
    } catch {
      setError('No se pudo conectar con el servidor. Verifica que el backend esté activo.');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset página al buscar
  useEffect(() => { setPage(1); }, [search]);

  const cols = data.length > 0
    ? Object.keys(data[0]).filter(k => !HIDDEN_COLS.has(k))
    : [];

  const pkVal = row => {
    const pkField = MODULE_PK[moduleKey];
    if (pkField && row[pkField] !== undefined) return row[pkField];
    for (const k of Object.keys(row)) if (k.toLowerCase() === 'id') return row[k];
    for (const k of Object.keys(row)) {
      if (k.toLowerCase().startsWith('id_') || k.toLowerCase().endsWith('_id')) return row[k];
    }
    return null;
  };

  const filtered = useMemo(() =>
    search.trim()
      ? data.filter(r => Object.values(r).some(v =>
          String(v ?? '').toLowerCase().includes(search.toLowerCase())
        ))
      : data,
  [data, search]);

  // Paginación calculada
  const totalPages  = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated   = filtered.slice((page - 1) * pageSize, page * pageSize);
  const pageStart   = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd     = Math.min(page * pageSize, filtered.length);

  const goPage = (p) => setPage(Math.max(1, Math.min(p, totalPages)));

  // Generar rango de páginas para mostrar
  const pageRange = useMemo(() => {
    const range = [];
    const delta = 1; // páginas a cada lado de la actual
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      range.push(i);
    }
    return range;
  }, [page, totalPages]);

  const handleDelete = async row => {
    const id = pkVal(row);
    if (!id) { alert('No se puede identificar el registro'); return; }
    try {
      const res  = await apiFetch(`${API}${endpoint}/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.ok === true || json.success === true) {
  setConfirmRow(null);
  fetchData();

  // 🔥 NOTIFICAR AL MAPA
  window.dispatchEvent(new Event('arbol_actualizado'));
}
      else {
        alert(json.mensaje ?? json.message ?? 'Error al eliminar');
      }
    } catch { alert('Error de conexión al eliminar'); }
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
    if (['BAJO', 'N'].includes(v))          cls = s.badgeS;
    if (v === 'MEDIO')                       cls = s.badgeW;
    return <span className={cls}>{v}</span>;
  };

  return (
    <div className={s.root}>
      <div className={s.pageShell}>

        {/* ── Header ── */}
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
                <span className={s.btnLabel}>Actualizar</span>
              </button>
              <ExportarBtn data={filtered} cols={cols} title={title} />
              <button className={s.btnAdd} onClick={() => setModal('new')} type="button">
                <span className="material-icons">add</span>
                <span className={s.btnLabel}>Agregar registro</span>
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
                <span className={s.counterLabel}>Visibles</span>
                <strong className={s.counterValue}>{filtered.length}</strong>
              </div>
              <div className={s.counterCard}>
                <span className={s.counterLabel}>Total</span>
                <strong className={s.counterValue}>{data.length}</strong>
              </div>
            </div>
          </div>
        </header>

        {/* ── Contenido ── */}
        <section className={s.contentCard}>
          {loading ? (
            <div className={s.center}>
              <div className={s.spinner} />
              <p className={s.centerTitle}>Cargando {title.toLowerCase()}...</p>
              <span className={s.centerText}>Espera un momento mientras se consultan los datos.</span>
            </div>

          ) : error ? (
            <div className={s.errBox}>
              <div className={s.errIcon}><span className="material-icons">wifi_off</span></div>
              <div className={s.errContent}>
                <p className={s.errTitle}>Error de conexión</p>
                <p className={s.errMsg}>{error}</p>
              </div>
              <button className={s.btnRetry} onClick={fetchData} type="button">
                <span className="material-icons">refresh</span> Reintentar
              </button>
            </div>

          ) : filtered.length === 0 ? (
            <div className={s.emptyState}>
              <div className={s.emptyIcon}><span className="material-icons">inbox</span></div>
              <p className={s.emptyTitle}>
                {search ? `Sin resultados para "${search}"` : 'Sin registros disponibles'}
              </p>
              <p className={s.emptyText}>
                {search
                  ? 'Prueba con otro término o limpia el filtro.'
                  : 'Aún no hay datos. Puedes crear el primer registro.'}
              </p>
              {!search && (
                <button className={s.emptyBtn} onClick={() => setModal('new')} type="button">
                  <span className="material-icons">add</span> Crear primer registro
                </button>
              )}
            </div>

          ) : (
            <>
              {/* Tabla con scroll horizontal en móvil */}
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead>
                    <tr>
                      {cols.map(c => <th key={c}>{colLabel(c)}</th>)}
                      <th className={s.actionsCol}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? s.rowE : s.rowO}>
                        {cols.map(c => <td key={c}>{renderCell(c, row[c])}</td>)}
                        <td>
                          <div className={s.actions}>
                            <ABtn icon="edit"         tip="Editar"    variant="edit"   onClick={() => setModal(row)} />
                            <ABtn icon="delete_outline" tip="Eliminar" variant="delete" onClick={() => setConfirmRow(row)} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Paginación ── */}
              <div className={s.pagination}>
                <div className={s.pageInfo}>
                  Mostrando <strong>{pageStart}–{pageEnd}</strong> de <strong>{filtered.length}</strong> registros
                </div>

                <div className={s.pageControls}>
                  {/* Registros por página */}
                  <div className={s.pageSizeWrap}>
                    <span className={s.pageSizeLabel}>Por página:</span>
                    <select
                      value={pageSize}
                      onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                      className={s.pageSizeSelect}
                    >
                      {PAGE_SIZE_OPTIONS.map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                  {/* Botones de página */}
                  <div className={s.pageBtns}>
                    <button
                      className={s.pageBtn}
                      onClick={() => goPage(1)}
                      disabled={page === 1}
                      title="Primera página"
                      type="button"
                    >
                      <span className="material-icons">first_page</span>
                    </button>
                    <button
                      className={s.pageBtn}
                      onClick={() => goPage(page - 1)}
                      disabled={page === 1}
                      title="Página anterior"
                      type="button"
                    >
                      <span className="material-icons">chevron_left</span>
                    </button>

                    {pageRange[0] > 1 && (
                      <>
                        <button className={s.pageBtn} onClick={() => goPage(1)} type="button">1</button>
                        {pageRange[0] > 2 && <span className={s.pageDots}>…</span>}
                      </>
                    )}

                    {pageRange.map(p => (
                      <button
                        key={p}
                        className={`${s.pageBtn} ${p === page ? s.pageBtnActive : ''}`}
                        onClick={() => goPage(p)}
                        type="button"
                      >
                        {p}
                      </button>
                    ))}

                    {pageRange[pageRange.length - 1] < totalPages && (
                      <>
                        {pageRange[pageRange.length - 1] < totalPages - 1 && <span className={s.pageDots}>…</span>}
                        <button className={s.pageBtn} onClick={() => goPage(totalPages)} type="button">
                          {totalPages}
                        </button>
                      </>
                    )}

                    <button
                      className={s.pageBtn}
                      onClick={() => goPage(page + 1)}
                      disabled={page === totalPages}
                      title="Página siguiente"
                      type="button"
                    >
                      <span className="material-icons">chevron_right</span>
                    </button>
                    <button
                      className={s.pageBtn}
                      onClick={() => goPage(totalPages)}
                      disabled={page === totalPages}
                      title="Última página"
                      type="button"
                    >
                      <span className="material-icons">last_page</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Modal formulario */}
      {modal !== null && (
        <CrudFormNuevo
          config={cfg}
          editItem={modal === 'new' ? null : modal}
          editId={modal === 'new' ? null : pkVal(modal)}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchData(); }}
        />
      )}

      {/* Modal confirmar eliminar */}
      {confirmRow !== null && (
        <div className={s.overlay} onClick={() => setConfirmRow(null)}>
          <div className={s.confirmModal} onClick={e => e.stopPropagation()}>
            <div className={s.confirmIcon}>
              <span className="material-icons">delete_forever</span>
            </div>
            <h3 className={s.confirmTitle}>¿Eliminar registro?</h3>
            <p className={s.confirmMsg}>Esta acción no se puede deshacer.</p>
            <div className={s.confirmBtns}>
              <button className={s.confirmCancel} onClick={() => setConfirmRow(null)} type="button">
                Cancelar
              </button>
              <button className={s.confirmDelete} onClick={() => handleDelete(confirmRow)} type="button">
                <span className="material-icons">delete</span> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ABtn({ icon, tip, onClick, variant = 'edit' }) {
  return (
    <button
      title={tip} onClick={onClick} type="button"
      className={`${s.actionBtn} ${variant === 'delete' ? s.actionDelete : s.actionEdit}`}
    >
      <span className="material-icons">{icon}</span>
    </button>
  );
}
