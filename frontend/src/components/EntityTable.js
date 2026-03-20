import React from 'react';

export default function EntityTable({ rows, idField, onEdit, onDelete, loading }) {
  const columns = rows.length ? Object.keys(rows[0]) : [];

  return (
    <section className="card table-card">
      <div className="card-header">
        <div>
          <h2>Registros</h2>
          <p>{loading ? 'Cargando...' : `${rows.length} encontrados`}</p>
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="empty-state">No hay registros todavía.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[idField]}>
                  {columns.map((col) => (
                    <td key={`${row[idField]}-${col}`}>{String(row[col] ?? '')}</td>
                  ))}
                  <td>
                    <div className="table-actions">
                      <button className="btn small" onClick={() => onEdit(row)}>Editar</button>
                      <button className="btn danger small" onClick={() => onDelete(row[idField])}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
