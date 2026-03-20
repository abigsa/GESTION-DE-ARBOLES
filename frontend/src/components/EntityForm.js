import React from 'react';

export default function EntityForm({ resource, formData, onChange, onSubmit, onCancel, editing, loading }) {
  return (
    <form className="card form-card" onSubmit={onSubmit}>
      <div className="card-header">
        <div>
          <h2>{editing ? 'Editar registro' : 'Nuevo registro'}</h2>
          <p>{resource.title}</p>
        </div>
      </div>
      <div className="form-grid">
        {resource.fields.map((field) => (
          <label key={field.name} className="field">
            <span>{field.label}</span>
            <input
              type={field.type === 'date' ? 'date' : field.type}
              required={field.required}
              value={formData[field.name] ?? ''}
              onChange={(e) => onChange(field.name, e.target.value)}
            />
          </label>
        ))}
      </div>
      <div className="actions">
        <button className="btn primary" type="submit" disabled={loading}>
          {editing ? 'Actualizar' : 'Guardar'}
        </button>
        {editing && (
          <button className="btn ghost" type="button" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
