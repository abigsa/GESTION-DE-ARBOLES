import React, { useEffect, useState } from "react";

const API_BASE =
  process.env.REACT_APP_API_BASE || "http://localhost:3000/api";

function GenericCrudModule({ title, endpoint, fields }) {
  const initialForm = fields.reduce((acc, field) => {
    acc[field.name] = "";
    return acc;
  }, {});

  const [form, setForm] = useState(initialForm);
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fullEndpoint = `${API_BASE}${endpoint}`;

  const fetchData = async () => {
    try {
      setError("");
      const res = await fetch(fullEndpoint);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Error al obtener datos");
      }

      setData(json.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, [fullEndpoint]);

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

  const normalizePayload = () => {
    const payload = {};
    fields.forEach((field) => {
      payload[field.name] =
        field.type === "number"
          ? form[field.name] === ""
            ? null
            : Number(form[field.name])
          : form[field.name];
    });
    return payload;
  };

  const getIdKey = (item) => {
    return Object.keys(item).find((key) => key.startsWith("ID_"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      const payload = normalizePayload();

      const res = await fetch(editId ? `${fullEndpoint}/${editId}` : fullEndpoint, {
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

      setMessage(editId ? "Registro actualizado correctamente." : "Registro creado correctamente.");
      clearForm();
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (item) => {
    const updatedForm = {};
    fields.forEach((field) => {
      const upperKey = field.name.toUpperCase();
      updatedForm[field.name] = item[upperKey] ?? "";
    });

    const idKey = getIdKey(item);
    setEditId(idKey ? item[idKey] : null);
    setForm(updatedForm);
    setError("");
    setMessage("");
  };

  const handleDelete = async (item) => {
    const idKey = getIdKey(item);
    if (!idKey) return;

    const confirmDelete = window.confirm("¿Deseas eliminar este registro?");
    if (!confirmDelete) return;

    try {
      setError("");
      setMessage("");

      const res = await fetch(`${fullEndpoint}/${item[idKey]}`, {
        method: "DELETE"
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Error al eliminar");
      }

      setMessage("Registro eliminado correctamente.");
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="module-page">
      <div className="module-hero">
        <div>
          <p className="module-kicker">PANEL ADMINISTRATIVO</p>
          <h1>{title}</h1>
          <p>Gestiona registros de forma simple y comparte cambios con tu equipo usando un backend centralizado.</p>
        </div>
        <div className="hero-badge">🌱 Gestión de árboles</div>
      </div>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      <div className="module-grid">
        <div className="card form-card">
          <h2>{editId ? "Editar registro" : "Nuevo registro"}</h2>
          <p>{title}</p>

          <form onSubmit={handleSubmit}>
            {fields.map((field) => (
              <React.Fragment key={field.name}>
                <label>{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                />
              </React.Fragment>
            ))}

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
            <div className="empty-state">No hay registros todavía.</div>
          ) : (
            <div className="table-wrapper">
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
                  {data.map((item, index) => (
                    <tr key={index}>
                      {columns.map((col) => (
                        <td key={col}>{item[col] ?? "-"}</td>
                      ))}
                      <td className="actions-cell">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(item)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(item)}
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

export default GenericCrudModule;