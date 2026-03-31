import React, { useEffect, useState } from "react";

const API_BASE =
  process.env.REACT_APP_API_BASE || "http://localhost:3000/api";

const initialForm = {
  id_arbol: "",
  id_tipo_movimiento: "",
  id_sector_origen: "",
  id_sector_destino: "",
  observacion: "",
  usuario_registro: ""
};

function MovimientoInventarioModule() {
  const [form, setForm] = useState(initialForm);
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const endpoint = `${API_BASE}/movimiento-inventario`;

  const fetchData = async () => {
    try {
      setError("");
      const res = await fetch(endpoint);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Error al obtener movimientos");
      }

      setData(json.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const clearForm = () => {
    setForm(initialForm);
    setEditId(null);
  };

  const normalizePayload = () => ({
    id_arbol: form.id_arbol ? Number(form.id_arbol) : null,
    id_tipo_movimiento: form.id_tipo_movimiento
      ? Number(form.id_tipo_movimiento)
      : null,
    id_sector_origen: form.id_sector_origen
      ? Number(form.id_sector_origen)
      : null,
    id_sector_destino: form.id_sector_destino
      ? Number(form.id_sector_destino)
      : null,
    observacion: form.observacion,
    usuario_registro: form.usuario_registro
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      const payload = normalizePayload();

      const res = await fetch(editId ? `${endpoint}/${editId}` : endpoint, {
        method: editId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Error al guardar");
      }

      setMessage(
        editId
          ? "Movimiento de inventario actualizado correctamente."
          : "Movimiento de inventario creado correctamente."
      );

      clearForm();
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (item) => {
    setEditId(item.ID_MOVIMIENTO);
    setForm({
      id_arbol: item.ID_ARBOL ?? "",
      id_tipo_movimiento: item.ID_TIPO_MOVIMIENTO ?? "",
      id_sector_origen: item.ID_SECTOR_ORIGEN ?? "",
      id_sector_destino: item.ID_SECTOR_DESTINO ?? "",
      observacion: item.OBSERVACION ?? "",
      usuario_registro: item.USUARIO_REGISTRO ?? ""
    });
    setMessage("");
    setError("");
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Deseas eliminar este movimiento de inventario?"
    );
    if (!confirmDelete) return;

    try {
      setError("");
      setMessage("");

      const res = await fetch(`${endpoint}/${id}`, {
        method: "DELETE"
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Error al eliminar");
      }

      setMessage("Movimiento de inventario eliminado correctamente.");
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="module-page">
      <div className="module-hero">
        <div>
          <p className="module-kicker">PANEL ADMINISTRATIVO</p>
          <h1>Movimiento Inventario</h1>
          <p>Gestiona altas, bajas y traslados de árboles en inventario.</p>
        </div>
        <div className="hero-badge">🌱 Gestión de árboles</div>
      </div>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      <div className="module-grid">
        <div className="card form-card">
          <h2>{editId ? "Editar movimiento" : "Nuevo movimiento"}</h2>
          <p>Registro de movimiento de inventario</p>

          <form onSubmit={handleSubmit}>
            <label>ID Árbol</label>
            <input
              type="number"
              name="id_arbol"
              value={form.id_arbol}
              onChange={handleChange}
              required
            />

            <label>ID Tipo Movimiento</label>
            <input
              type="number"
              name="id_tipo_movimiento"
              value={form.id_tipo_movimiento}
              onChange={handleChange}
              required
            />

            <label>ID Sector Origen</label>
            <input
              type="number"
              name="id_sector_origen"
              value={form.id_sector_origen}
              onChange={handleChange}
            />

            <label>ID Sector Destino</label>
            <input
              type="number"
              name="id_sector_destino"
              value={form.id_sector_destino}
              onChange={handleChange}
            />

            <label>Observación</label>
            <input
              type="text"
              name="observacion"
              value={form.observacion}
              onChange={handleChange}
            />

            <label>Usuario Registro</label>
            <input
              type="text"
              name="usuario_registro"
              value={form.usuario_registro}
              onChange={handleChange}
              required
            />

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editId ? "Actualizar" : "Guardar"}
              </button>

              {editId && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={clearForm}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card table-card">
          <h2>Registros</h2>
          <p>{data.length} encontrados</p>

          {data.length === 0 ? (
            <div className="empty-state">
              No hay movimientos de inventario todavía.
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>ID Árbol</th>
                    <th>Tipo Movimiento</th>
                    <th>Sector Origen</th>
                    <th>Sector Destino</th>
                    <th>Fecha</th>
                    <th>Observación</th>
                    <th>Usuario</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.ID_MOVIMIENTO}>
                      <td>{item.ID_MOVIMIENTO}</td>
                      <td>{item.ID_ARBOL}</td>
                      <td>{item.TIPO_MOVIMIENTO}</td>
                      <td>{item.SECTOR_ORIGEN || "-"}</td>
                      <td>{item.SECTOR_DESTINO || "-"}</td>
                      <td>{item.FECHA_MOVIMIENTO || "-"}</td>
                      <td>{item.OBSERVACION || "-"}</td>
                      <td>{item.USUARIO_REGISTRO || "-"}</td>
                      <td className="actions-cell">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(item)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(item.ID_MOVIMIENTO)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovimientoInventarioModule;