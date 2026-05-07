import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import s from './GestionUsuarios.module.css';

const API = 'http://localhost:3000/api';

const ROLES = [
  { id: 1, label: 'Super Administrador', color: '#8B2E2E', bg: '#FFEBEE' },
  { id: 2, label: 'Administrador',       color: '#1B4D2A', bg: '#E8F5E9' },
  { id: 3, label: 'Técnico de campo',    color: '#8B6F47', bg: '#FFF8E1' },
];

function getRol(id) {
  return ROLES.find(r => r.id === Number(id)) || ROLES[2];
}

function get(obj, ...keys) {
  for (const k of keys) if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k];
  return null;
}

export default function GestionUsuarios({ onBack }) {
  const { usuario } = useAuth();
  const [usuarios,    setUsuarios]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [search,      setSearch]      = useState('');
  const [modal,       setModal]       = useState(null);
  const [confirmId,   setConfirmId]   = useState(null);
  const [resetModal,  setResetModal]  = useState(null);  // { id, username }
  const [resetResult, setResetResult] = useState(null);  // { password_temporal, usuario }

  const fetchUsuarios = async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API}/usuarios`);
      const data = await res.json();
      if (data.ok || data.success) setUsuarios(Array.isArray(data.data) ? data.data : []);
      else setError(data.mensaje || 'Error al cargar usuarios');
    } catch { setError('No se pudo conectar con el servidor'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsuarios(); }, []);

  const handleEliminar = async (id) => {
    try {
      const res  = await fetch(`${API}/usuarios/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok || data.success) { setConfirmId(null); fetchUsuarios(); }
      else alert(data.mensaje || 'Error al eliminar');
    } catch { alert('Error de conexión'); }
  };

  const handleResetPassword = async () => {
    if (!resetModal) return;
    try {
      const adminNombre = get(usuario, 'NOMBRES', 'nombres', 'USERNAME', 'username') || 'Admin';
      const adminId     = get(usuario, 'ID_USUARIO', 'id_usuario');
      const res  = await fetch(`${API}/usuarios/${resetModal.id}/resetear-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_solicitante_id:     adminId,
          usuario_solicitante_nombre: adminNombre,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setResetModal(null);
        setResetResult({ password_temporal: data.password_temporal, usuario: data.usuario });
      } else {
        alert(data.mensaje || 'Error al resetear contraseña');
      }
    } catch { alert('Error de conexión'); }
  };

  const filtered = search.trim()
    ? usuarios.filter(u =>
        [get(u,'NOMBRES','nombres'), get(u,'USERNAME','username'), get(u,'EMAIL','email')]
          .some(v => String(v||'').toLowerCase().includes(search.toLowerCase()))
      )
    : usuarios;

  const myId = get(usuario, 'ID_USUARIO', 'id_usuario');

  return (
    <div className={s.root}>

      {/* Header */}
      <div className={s.header}>
        <div className={s.breadcrumb}>
          <button className={s.backBtn} onClick={onBack} type="button">
            <span className="material-icons">arrow_back_ios</span> Inicio
          </button>
          <span>/</span>
          <span className={s.bcCur}>Gestión de usuarios</span>
        </div>

        <div className={s.titleRow}>
          <div className={s.titleBlock}>
            <div className={s.titleIcon}>
              <span className="material-icons">admin_panel_settings</span>
            </div>
            <div>
              <p className={s.panelLabel}>SUPER ADMINISTRADOR</p>
              <h1 className={s.pageTitle}>Gestión de usuarios</h1>
              <p className={s.pageSubtitle}>Crea, edita y administra los accesos del sistema.</p>
            </div>
          </div>
          <div className={s.titleActions}>
            <button className={s.refreshBtn} onClick={fetchUsuarios} type="button" title="Actualizar">
              <span className="material-icons">refresh</span>
              <span>Actualizar</span>
            </button>
            <button className={s.btnAdd} onClick={() => setModal('new')} type="button">
              <span className="material-icons">person_add</span>
              Nuevo usuario
            </button>
          </div>
        </div>

        <div className={s.toolbar}>
          <div className={s.searchWrap}>
            <span className="material-icons">search</span>
            <input
              placeholder="Buscar por nombre, usuario o correo..."
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
            {ROLES.map(r => (
              <div key={r.id} className={s.rolBadge} style={{ background: r.bg, color: r.color }}>
                <span>{usuarios.filter(u => {
                  const rolVal = u?.ROL_ID ?? u?.rol_id ?? u?.ID_ROL ?? u?.id_rol;
                  return Number(rolVal) === r.id;
                }).length}</span>
                {r.label.split(' ')[0]}
              </div>
            ))}
            <div className={s.rolBadge} style={{ background:'#E8F5E9', color:'#1B4D2A' }}>
              <span>{usuarios.filter(u => (u?.ESTADO ?? u?.estado) === 'ACTIVO').length}</span>
              Activos
            </div>
            <div className={s.rolBadge} style={{ background:'#FFEBEE', color:'#8B2E2E' }}>
              <span>{usuarios.filter(u => (u?.ESTADO ?? u?.estado) === 'INACTIVO').length}</span>
              Inactivos
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <section className={s.contentCard}>
        {loading ? (
          <div className={s.center}>
            <div className={s.spinner} />
            <p>Cargando usuarios...</p>
          </div>
        ) : error ? (
          <div className={s.errBox}>
            <span className="material-icons">wifi_off</span>
            <div>
              <p className={s.errTitle}>Error de conexión</p>
              <p className={s.errMsg}>{error}</p>
            </div>
            <button className={s.btnRetry} onClick={fetchUsuarios} type="button">
              <span className="material-icons">refresh</span> Reintentar
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className={s.emptyState}>
            <span className="material-icons">group_off</span>
            <p>{search ? `Sin resultados para "${search}"` : 'Sin usuarios registrados'}</p>
          </div>
        ) : (
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const id     = get(u,'ID_USUARIO','id_usuario');
                  const rolId  = u?.ROL_ID ?? u?.rol_id ?? u?.ID_ROL ?? u?.id_rol;
                  const rol    = getRol(rolId);
                  const estado = get(u,'ESTADO','estado') || 'ACTIVO';
                  const esYo   = String(id) === String(myId);
                  return (
                    <tr key={id} className={`${i%2===0?s.rowE:s.rowO} ${esYo?s.rowMe:''}`}>
                      <td>
                        <div className={s.userCell}>
                          <div className={s.avatar} style={{ background: rol.bg, color: rol.color }}>
                            {String(get(u,'NOMBRES','nombres')||get(u,'USERNAME','username')||'?')[0].toUpperCase()}
                          </div>
                          <span className={s.username}>
                            {get(u,'USERNAME','username')}
                            {esYo && <span className={s.meTag}>Tú</span>}
                          </span>
                        </div>
                      </td>
                      <td>
                        {[get(u,'NOMBRES','nombres'), get(u,'APELLIDOS','apellidos')].filter(Boolean).join(' ') || '—'}
                      </td>
                      <td>{get(u,'EMAIL','email') || '—'}</td>
                      <td>{get(u,'TELEFONO','telefono') || '—'}</td>
                      <td>
                        <span className={s.rolPill} style={{ background: rol.bg, color: rol.color }}>
                          {rol.label}
                        </span>
                      </td>
                      <td>
                        <span className={estado === 'ACTIVO' ? s.estadoActivo : s.estadoInactivo}>
                          {estado}
                        </span>
                      </td>
                      <td>
                        <div className={s.actions}>
                          <button className={s.actionEdit} onClick={() => setModal(u)} title="Editar" type="button">
                            <span className="material-icons">edit</span>
                          </button>
                          {!esYo && (
                            <button
                              className={s.actionEdit}
                              onClick={() => setResetModal({ id, username: get(u,'USERNAME','username') || `#${id}` })}
                              title="Resetear contraseña"
                              type="button"
                              style={{ background:'#FFF8E1', color:'#D4A853', border:'1px solid #FFE082' }}
                            >
                              <span className="material-icons">lock_reset</span>
                            </button>
                          )}
                          {!esYo && (
                            <button className={s.actionDelete} onClick={() => setConfirmId(id)} title="Eliminar" type="button">
                              <span className="material-icons">delete_outline</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal usuario */}
      {modal !== null && (
        <ModalUsuario
          editItem={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchUsuarios(); }}
        />
      )}

      {/* Modal confirmar eliminar */}
      {confirmId !== null && (
        <div className={s.overlay} onClick={() => setConfirmId(null)}>
          <div className={s.confirmModal} onClick={e => e.stopPropagation()}>
            <div className={s.confirmIcon}>
              <span className="material-icons">delete_forever</span>
            </div>
            <h3>¿Eliminar usuario?</h3>
            <p>Esta acción desactivará el acceso del usuario al sistema.</p>
            <div className={s.confirmBtns}>
              <button className={s.confirmCancel} onClick={() => setConfirmId(null)} type="button">Cancelar</button>
              <button className={s.confirmDelete} onClick={() => handleEliminar(confirmId)} type="button">
                <span className="material-icons">delete</span> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar reset contraseña */}
      {resetModal !== null && (
        <div className={s.overlay} onClick={() => setResetModal(null)}>
          <div className={s.confirmModal} onClick={e => e.stopPropagation()}>
            <div className={s.confirmIcon} style={{ background:'#FFF8E1' }}>
              <span className="material-icons" style={{ color:'#D4A853' }}>lock_reset</span>
            </div>
            <h3>Resetear contraseña</h3>
            <p>Se generará una contraseña temporal para <strong>{resetModal.username}</strong>. La contraseña actual quedará invalidada.</p>
            <div className={s.confirmBtns}>
              <button className={s.confirmCancel} onClick={() => setResetModal(null)} type="button">Cancelar</button>
              <button
                onClick={handleResetPassword}
                type="button"
                style={{ background:'#D4A853', color:'#fff', border:'none', borderRadius:10, padding:'9px 16px', cursor:'pointer', fontWeight:700, display:'flex', alignItems:'center', gap:6 }}
              >
                <span className="material-icons" style={{ fontSize:16 }}>lock_reset</span>
                Generar contraseña
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal mostrar contraseña generada */}
      {resetResult !== null && (
        <div className={s.overlay} onClick={() => setResetResult(null)}>
          <div className={s.confirmModal} onClick={e => e.stopPropagation()}>
            <div className={s.confirmIcon} style={{ background:'#E8F5E9' }}>
              <span className="material-icons" style={{ color:'#2D7A3E' }}>check_circle</span>
            </div>
            <h3>¡Contraseña generada!</h3>
            <p>Usuario: <strong>{resetResult.usuario}</strong></p>
            <div style={{ background:'#F2F7F3', border:'2px solid #DCEDDF', borderRadius:10, padding:'14px 18px', margin:'12px 0 8px', textAlign:'center' }}>
              <p style={{ fontSize:9, color:'#8B6F47', marginBottom:6, textTransform:'uppercase', letterSpacing:'.6px', fontWeight:700 }}>Contraseña temporal</p>
              <p style={{ fontSize:24, fontWeight:800, color:'#1B4D2A', letterSpacing:4, fontFamily:'monospace' }}>{resetResult.password_temporal}</p>
            </div>
            <p style={{ fontSize:11, color:'#8B2E2E', marginBottom:16 }}>Copia esta contraseña ahora, no se volverá a mostrar.</p>
            <div className={s.confirmBtns}>
              <button
                type="button"
                style={{ background:'#E8F5E9', color:'#1B4D2A', border:'1px solid #DCEDDF', borderRadius:10, padding:'9px 14px', cursor:'pointer', fontWeight:700, display:'flex', alignItems:'center', gap:6 }}
                onClick={() => { try { navigator.clipboard.writeText(resetResult.password_temporal); } catch(_) {} }}
              >
                <span className="material-icons" style={{ fontSize:16 }}>content_copy</span> Copiar
              </button>
              <button
                type="button"
                style={{ background:'#2D7A3E', color:'#fff', border:'none', borderRadius:10, padding:'9px 16px', cursor:'pointer', fontWeight:700 }}
                onClick={() => setResetResult(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ── Modal formulario usuario ──────────────────────
function ModalUsuario({ editItem, onClose, onSaved }) {
  const isEdit = !!editItem;
  const get2   = (k1, k2) => editItem?.[k1] ?? editItem?.[k2] ?? '';

  const [form, setForm] = useState({
    username:  get2('USERNAME','username'),
    password:  '',
    nombres:   get2('NOMBRES','nombres'),
    apellidos: get2('APELLIDOS','apellidos'),
    email:     get2('EMAIL','email'),
    telefono:  get2('TELEFONO','telefono'),
    rol_id:    get2('ROL_ID','rol_id') || 3,
    estado:    get2('ESTADO','estado') || 'ACTIVO',
  });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [verPass, setVerPass] = useState(false);

  const set = (k, v) => { setForm(f => ({...f,[k]:v})); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username) { setError('El nombre de usuario es obligatorio'); return; }
    if (!isEdit && !form.password) { setError('La contraseña es obligatoria'); return; }
    if (!isEdit && form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }

    setSaving(true); setError('');
    try {
      const body = { ...form };
      if (!isEdit) body.password_hash = form.password;
      delete body.password;

      const id  = isEdit ? (editItem?.ID_USUARIO ?? editItem?.id_usuario) : null;
      const url = isEdit ? `${API}/usuarios/${id}` : `${API}/usuarios`;
      const res = await fetch(url, {
        method:  isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok || data.success) onSaved();
      else setError(data.mensaje || data.message || 'Error al guardar');
    } catch { setError('Error de conexión'); }
    finally { setSaving(false); }
  };

  return (
    <div className={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={s.modal}>
        <div className={s.modalHeader}>
          <div className={s.modalHeaderMain}>
            <div className={s.modalIcon}>
              <span className="material-icons">{isEdit ? 'manage_accounts' : 'person_add'}</span>
            </div>
            <div>
              <p className={s.modalEyebrow}>{isEdit ? 'EDITAR USUARIO' : 'NUEVO USUARIO'}</p>
              <h3>{isEdit ? 'Editar información' : 'Crear usuario'}</h3>
              <p className={s.modalDesc}>
                {isEdit ? 'Modifica los datos y rol del usuario.' : 'Completa los datos para crear el acceso.'}
              </p>
            </div>
          </div>
          <button className={s.closeBtn} onClick={onClose} type="button">
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className={s.modalBody}>
          <form id="userForm" onSubmit={handleSubmit} noValidate>

            <div className={s.rolSelector}>
              <p className={s.fieldLabel}>Rol de acceso <span className={s.req}>*</span></p>
              <div className={s.rolOptions}>
                {ROLES.map(r => (
                  <label
                    key={r.id}
                    className={`${s.rolOption} ${Number(form.rol_id) === r.id ? s.rolOptionActive : ''}`}
                    style={Number(form.rol_id) === r.id ? { borderColor: r.color, background: r.bg } : {}}
                  >
                    <input
                      type="radio" name="rol_id" value={r.id}
                      checked={Number(form.rol_id) === r.id}
                      onChange={() => set('rol_id', r.id)}
                    />
                    <span className="material-icons" style={{ color: Number(form.rol_id) === r.id ? r.color : 'var(--tierra-calida)', fontSize:18 }}>
                      {r.id === 1 ? 'security' : r.id === 2 ? 'admin_panel_settings' : 'engineering'}
                    </span>
                    <div>
                      <p style={{ fontSize:12, fontWeight:700, color: Number(form.rol_id) === r.id ? r.color : 'var(--verde-profundo)' }}>{r.label}</p>
                      <p style={{ fontSize:10, color:'var(--tierra-calida)' }}>
                        {r.id===1 ? 'Acceso total + gestión de usuarios' : r.id===2 ? 'Acceso a todos los módulos' : 'Acceso operativo'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className={s.formGrid}>
              <div className={s.fieldWrap}>
                <label className={s.fieldLabel}>
                  Usuario <span className={s.req}>*</span>
                  {isEdit && <span className={s.noEditBadge}>No editable</span>}
                </label>
                <div className={`${s.field} ${isEdit ? s.fieldDisabled : ''}`}>
                  <span className="material-icons">alternate_email</span>
                  <input type="text" value={form.username} onChange={e => set('username', e.target.value)} disabled={isEdit} placeholder="nombre_usuario" />
                </div>
              </div>

              {!isEdit && (
                <div className={s.fieldWrap}>
                  <label className={s.fieldLabel}>Contraseña <span className={s.req}>*</span></label>
                  <div className={s.field}>
                    <span className="material-icons">lock_outline</span>
                    <input type={verPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Mínimo 6 caracteres" />
                    <button type="button" onClick={() => setVerPass(v => !v)}>
                      <span className="material-icons">{verPass ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
              )}

              <div className={s.fieldWrap}>
                <label className={s.fieldLabel}>Nombres</label>
                <div className={s.field}>
                  <span className="material-icons">person_outline</span>
                  <input type="text" value={form.nombres} onChange={e => set('nombres', e.target.value)} placeholder="Nombres" />
                </div>
              </div>

              <div className={s.fieldWrap}>
                <label className={s.fieldLabel}>Apellidos</label>
                <div className={s.field}>
                  <span className="material-icons">person_outline</span>
                  <input type="text" value={form.apellidos} onChange={e => set('apellidos', e.target.value)} placeholder="Apellidos" />
                </div>
              </div>

              <div className={s.fieldWrap}>
                <label className={s.fieldLabel}>Correo electrónico</label>
                <div className={s.field}>
                  <span className="material-icons">email</span>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="correo@ejemplo.com" />
                </div>
              </div>

              <div className={s.fieldWrap}>
                <label className={s.fieldLabel}>Teléfono</label>
                <div className={s.field}>
                  <span className="material-icons">phone</span>
                  <input type="tel" value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="Número de teléfono" />
                </div>
              </div>

              <div className={s.fieldWrap}>
                <label className={s.fieldLabel}>Estado</label>
                <div className={s.field}>
                  <span className="material-icons">toggle_on</span>
                  <select value={form.estado} onChange={e => set('estado', e.target.value)}>
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className={s.modalFooter}>
          {error ? (
            <p className={s.errorMsg}>
              <span className="material-icons">error_outline</span>
              {error}
            </p>
          ) : (
            <p className={s.helperText}>Los campos con <span>*</span> son obligatorios.</p>
          )}
          <div className={s.modalBtns}>
            <button type="button" className={s.btnCancel} onClick={onClose}>Cancelar</button>
            <button type="submit" form="userForm" className={s.btnSave} disabled={saving}>
              {saving ? <span className={s.spinner} /> : isEdit ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
