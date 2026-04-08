import { useState } from 'react';
import { API } from '../context/AuthContext';
import s from './CrudFormNuevo.module.css';

export default function CrudFormNuevo({ config, editItem, editId, onClose, onSaved }) {
  const { fields, endpoint } = config;
  const isEdit = editId !== null && editId !== undefined;

  const initForm = () => {
    const f = {};
    fields.forEach(field => {
      const val = editItem?.[field.name] ?? editItem?.[field.name?.toUpperCase()] ?? '';
      f[field.name] = val;
    });
    return f;
  };

  const [form,   setForm]   = useState(initForm);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const field of fields) {
      if (field.required && !form[field.name] && form[field.name] !== 0) {
        setError(`El campo "${field.label}" es obligatorio`); return;
      }
    }
    setError(''); setSaving(true);
    const body = {};
    fields.forEach(f => {
      const v = form[f.name];
      body[f.name] = f.type === 'number'
        ? (v === '' || v === null ? null : Number(v))
        : v || null;
    });
    try {
      const url    = isEdit ? `${API}${endpoint}/${editId}` : `${API}${endpoint}`;
      const method = isEdit ? 'PUT' : 'POST';
      const res    = await fetch(url, {
        method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(body),
      });
      const json = await res.json();
      if (json.ok || json.success) onSaved();
      else setError(json.mensaje || 'Error al guardar');
    } catch { setError('Error de conexión'); }
    finally { setSaving(false); }
  };

  return (
    <div className={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={s.modal}>

        {/* Header */}
        <div className={s.header}>
          <div className={s.hIcon}>
            <span className="material-icons">{isEdit ? 'edit' : 'add'}</span>
          </div>
          <div>
            <h3>{isEdit ? 'Editar registro' : 'Nuevo registro'}</h3>
            <p>{isEdit ? 'Modifica los campos necesarios' : 'Completa los campos para agregar'}</p>
          </div>
          <button className={s.closeBtn} onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Campos */}
        <div className={s.body}>
          <form id="crudForm" onSubmit={handleSubmit} noValidate>
            {fields.map(field => (
              <div key={field.name} className={s.fieldWrap}>
                <label className={s.label}>
                  {field.label}
                  {field.required && <span className={s.req}>*</span>}
                </label>
                {field.type === 'select' ? (
                  <select value={form[field.name]} onChange={e => set(field.name, e.target.value)} className={s.input}>
                    <option value="">Selecciona...</option>
                    {field.options?.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea value={form[field.name]} onChange={e => set(field.name, e.target.value)}
                    className={`${s.input} ${s.textarea}`} rows={3} placeholder={field.label} />
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                    value={form[field.name]} onChange={e => set(field.name, e.target.value)}
                    className={s.input} placeholder={field.label} />
                )}
              </div>
            ))}
          </form>
        </div>

        {/* Footer */}
        <div className={s.footer}>
          {error && <p className={s.error}>{error}</p>}
          <div className={s.ftBtns}>
            <button type="button" className={s.btnCancel} onClick={onClose}>Cancelar</button>
            <button type="submit" form="crudForm" className={s.btnSave} disabled={saving}>
              {saving ? <span className={s.spinner}/> : isEdit ? 'Guardar cambios' : 'Agregar registro'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
