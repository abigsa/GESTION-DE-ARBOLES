import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000/api";

export default function MovimientoInventarioModule() {
  const [movimientos, setMovimientos] = useState([]);
  const [arboles, setArboles] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [tiposMovimiento, setTiposMovimiento] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [alerta, setAlerta] = useState({
    tipo: "",
    mensaje: "",
  });

  const [errores, setErrores] = useState({});

  const [form, setForm] = useState({
    id_movimiento_inventario_arbol: null,
    id_arbol: "",
    id_tipo_movimiento: "",
    id_sector_origen: "",
    id_sector_destino: "",
    fecha_movimiento: "",
    observaciones: "",
  });

  const [editando, setEditando] = useState(false);

  useEffect(() => {
  cargarTodo();
}, []);

  const mostrarAlerta = (tipo, mensaje) => {
    setAlerta({ tipo, mensaje });
    setTimeout(() => {
      setAlerta({ tipo: "", mensaje: "" });
    }, 3000);
  };

  const obtenerListaRespuesta = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const cargarTodo = async () => {
    setLoading(true);
    try {
      await Promise.all([
        cargarMovimientos(),
        cargarArboles(),
        cargarSectores(),
        cargarTiposMovimiento(),
      ]);
    } catch (error) {
      mostrarAlerta("error", "Error al cargar la información inicial");
      console.error("Error carga inicial:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarMovimientos = async () => {
    const res = await fetch(`${API_BASE}/movimiento-inventario`);
    if (!res.ok) throw new Error("Error al listar movimientos");
    const data = await res.json();
    setMovimientos(obtenerListaRespuesta(data));
  };

  const cargarArboles = async () => {
    const res = await fetch(`${API_BASE}/arbol`);
    if (!res.ok) throw new Error("Error al listar árboles");
    const data = await res.json();
    setArboles(obtenerListaRespuesta(data));
  };

  const cargarSectores = async () => {
    const res = await fetch(`${API_BASE}/sector`);
    if (!res.ok) throw new Error("Error al listar sectores");
    const data = await res.json();
    setSectores(obtenerListaRespuesta(data));
  };

  const cargarTiposMovimiento = async () => {
    const res = await fetch(`${API_BASE}/tipo-movimiento`);
    if (!res.ok) throw new Error("Error al listar tipos de movimiento");
    const data = await res.json();
    setTiposMovimiento(obtenerListaRespuesta(data));
  };

  const limpiarFormulario = () => {
    setForm({
      id_movimiento_inventario_arbol: null,
      id_arbol: "",
      id_tipo_movimiento: "",
      id_sector_origen: "",
      id_sector_destino: "",
      fecha_movimiento: "",
      observaciones: "",
    });
    setErrores({});
    setEditando(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrores((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!form.id_arbol) {
      nuevosErrores.id_arbol = "Debe seleccionar un árbol";
    }

    if (!form.id_tipo_movimiento) {
      nuevosErrores.id_tipo_movimiento = "Debe seleccionar un tipo de movimiento";
    }

    if (!form.id_sector_origen) {
      nuevosErrores.id_sector_origen = "Debe seleccionar un sector origen";
    }

    if (!form.id_sector_destino) {
      nuevosErrores.id_sector_destino = "Debe seleccionar un sector destino";
    }

    if (
      form.id_sector_origen &&
      form.id_sector_destino &&
      String(form.id_sector_origen) === String(form.id_sector_destino)
    ) {
      nuevosErrores.id_sector_destino =
        "El sector destino debe ser diferente al sector origen";
    }

    if (!form.fecha_movimiento) {
      nuevosErrores.fecha_movimiento = "Debe ingresar una fecha";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const prepararPayload = () => {
    return {
      id_arbol: Number(form.id_arbol),
      id_tipo_movimiento: Number(form.id_tipo_movimiento),
      id_sector_origen: Number(form.id_sector_origen),
      id_sector_destino: Number(form.id_sector_destino),
      fecha_movimiento: form.fecha_movimiento || null,
      observacion: form.observaciones || null,
      usuario_registro: "ADMIN",
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      mostrarAlerta("error", "Por favor corrige los campos marcados");
      return;
    }

    setSaving(true);

    try {
      const payload = prepararPayload();

      const url = editando
        ? `${API_BASE}/movimiento-inventario/${form.id_movimiento_inventario_arbol}`
        : `${API_BASE}/movimiento-inventario`;

      const method = editando ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || data?.mensaje || "Error al guardar");
      }

      mostrarAlerta(
        "success",
        editando
          ? "Movimiento actualizado correctamente"
          : "Movimiento creado correctamente"
      );

      limpiarFormulario();
      await cargarMovimientos();
    } catch (error) {
      mostrarAlerta("error", error.message || "Error al guardar el movimiento");
    } finally {
      setSaving(false);
    }
  };

  const formatearFechaInput = (fecha) => {
    if (!fecha) return "";

    if (typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return fecha;
    }

    if (typeof fecha === "string" && /^\d{2}\/\d{2}\/\d{4}/.test(fecha)) {
      const partes = fecha.split("/");
      const dia = partes[0];
      const mes = partes[1];
      const anio = partes[2].substring(0, 4);
      return `${anio}-${mes}-${dia}`;
    }

    return "";
  };

  const handleEditar = (item) => {
    setForm({
      id_movimiento_inventario_arbol:
        item.ID_MOVIMIENTO_INVENTARIO_ARBOL ||
        item.id_movimiento_inventario_arbol ||
        item.ID_MOVIMIENTO ||
        item.id_movimiento,
      id_arbol: String(item.ID_ARBOL || item.id_arbol || ""),
      id_tipo_movimiento: String(
        item.ID_TIPO_MOVIMIENTO || item.id_tipo_movimiento || ""
      ),
      id_sector_origen: String(
        item.ID_SECTOR_ORIGEN || item.id_sector_origen || ""
      ),
      id_sector_destino: String(
        item.ID_SECTOR_DESTINO || item.id_sector_destino || ""
      ),
      fecha_movimiento: formatearFechaInput(
        item.FECHA_MOVIMIENTO || item.fecha_movimiento || ""
      ),
      observaciones:
        item.OBSERVACION ||
        item.observacion ||
        item.OBSERVACIONES ||
        item.observaciones ||
        "",
    });

    setErrores({});
    setEditando(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEliminar = async (id) => {
    const confirmado = window.confirm(
      "¿Seguro que deseas eliminar este movimiento?"
    );

    if (!confirmado) return;

    try {
      const res = await fetch(`${API_BASE}/movimiento-inventario/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || data?.mensaje || "Error al eliminar");
      }

      mostrarAlerta("success", "Movimiento eliminado correctamente");
      await cargarMovimientos();
    } catch (error) {
      mostrarAlerta("error", error.message || "Error al eliminar el movimiento");
    }
  };

  const obtenerTexto = (obj, posiblesCampos) => {
    for (const campo of posiblesCampos) {
      if (obj?.[campo] !== undefined && obj?.[campo] !== null) {
        return obj[campo];
      }
    }
    return "";
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Movimiento de Inventario de Árbol</h2>
        <p style={styles.subtitle}>
          Administra traslados de árboles entre sectores
        </p>
      </div>

      {alerta.mensaje && (
        <div
          style={{
            ...styles.alert,
            ...(alerta.tipo === "success"
              ? styles.alertSuccess
              : styles.alertError),
          }}
        >
          {alerta.mensaje}
        </div>
      )}

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          {editando ? "Editar movimiento" : "Nuevo movimiento"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={styles.grid}>
            <div style={styles.field}>
              <label style={styles.label}>Árbol *</label>
              <select
                name="id_arbol"
                value={form.id_arbol}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errores.id_arbol ? styles.inputError : {}),
                }}
              >
                <option value="">Seleccione un árbol</option>
                {arboles.map((a) => (
                  <option
                    key={a.ID_ARBOL || a.id_arbol}
                    value={a.ID_ARBOL || a.id_arbol}
                  >
                    {obtenerTexto(a, [
                      "NOMBRE_ARBOL",
                      "nombre_arbol",
                      "CODIGO_ARBOL",
                      "codigo_arbol",
                      "ID_ARBOL",
                      "id_arbol",
                    ])}
                  </option>
                ))}
              </select>
              {errores.id_arbol && (
                <span style={styles.errorText}>{errores.id_arbol}</span>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Tipo movimiento *</label>
              <select
                name="id_tipo_movimiento"
                value={form.id_tipo_movimiento}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errores.id_tipo_movimiento ? styles.inputError : {}),
                }}
              >
                <option value="">Seleccione un tipo</option>
                {tiposMovimiento.map((t) => (
                  <option
                    key={t.ID_TIPO_MOVIMIENTO || t.id_tipo_movimiento}
                    value={t.ID_TIPO_MOVIMIENTO || t.id_tipo_movimiento}
                  >
                    {obtenerTexto(t, [
                      "NOMBRE_TIPO_MOVIMIENTO",
                      "nombre_tipo_movimiento",
                      "DESCRIPCION",
                      "descripcion",
                      "ID_TIPO_MOVIMIENTO",
                      "id_tipo_movimiento",
                    ])}
                  </option>
                ))}
              </select>
              {errores.id_tipo_movimiento && (
                <span style={styles.errorText}>
                  {errores.id_tipo_movimiento}
                </span>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Sector origen *</label>
              <select
                name="id_sector_origen"
                value={form.id_sector_origen}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errores.id_sector_origen ? styles.inputError : {}),
                }}
              >
                <option value="">Seleccione sector origen</option>
                {sectores.map((s) => (
                  <option
                    key={s.ID_SECTOR || s.id_sector}
                    value={s.ID_SECTOR || s.id_sector}
                  >
                    {obtenerTexto(s, [
                      "NOMBRE_SECTOR",
                      "nombre_sector",
                      "ID_SECTOR",
                      "id_sector",
                    ])}
                  </option>
                ))}
              </select>
              {errores.id_sector_origen && (
                <span style={styles.errorText}>{errores.id_sector_origen}</span>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Sector destino *</label>
              <select
                name="id_sector_destino"
                value={form.id_sector_destino}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errores.id_sector_destino ? styles.inputError : {}),
                }}
              >
                <option value="">Seleccione sector destino</option>
                {sectores.map((s) => (
                  <option
                    key={s.ID_SECTOR || s.id_sector}
                    value={s.ID_SECTOR || s.id_sector}
                  >
                    {obtenerTexto(s, [
                      "NOMBRE_SECTOR",
                      "nombre_sector",
                      "ID_SECTOR",
                      "id_sector",
                    ])}
                  </option>
                ))}
              </select>
              {errores.id_sector_destino && (
                <span style={styles.errorText}>{errores.id_sector_destino}</span>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Fecha movimiento *</label>
              <input
                type="date"
                name="fecha_movimiento"
                value={form.fecha_movimiento}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errores.fecha_movimiento ? styles.inputError : {}),
                }}
              />
              {errores.fecha_movimiento && (
                <span style={styles.errorText}>{errores.fecha_movimiento}</span>
              )}
            </div>

            <div style={styles.fieldFull}>
              <label style={styles.label}>Observaciones</label>
              <textarea
                name="observaciones"
                value={form.observaciones}
                onChange={handleChange}
                rows="4"
                style={styles.textarea}
                placeholder="Escribe una observación del movimiento..."
              />
            </div>
          </div>

          <div style={styles.actions}>
            <button type="submit" style={styles.primaryButton} disabled={saving}>
              {saving
                ? "Guardando..."
                : editando
                ? "Actualizar movimiento"
                : "Crear movimiento"}
            </button>

            <button
              type="button"
              style={styles.secondaryButton}
              onClick={limpiarFormulario}
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Listado de movimientos</h3>

        {loading ? (
          <p style={styles.emptyText}>Cargando movimientos...</p>
        ) : movimientos.length === 0 ? (
          <p style={styles.emptyText}>No hay movimientos registrados.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Árbol</th>
                  <th style={styles.th}>Tipo</th>
                  <th style={styles.th}>Origen</th>
                  <th style={styles.th}>Destino</th>
                  <th style={styles.th}>Fecha</th>
                  <th style={styles.th}>Observación</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((m) => {
                  const id =
                    m.ID_MOVIMIENTO_INVENTARIO_ARBOL ||
                    m.id_movimiento_inventario_arbol ||
                    m.ID_MOVIMIENTO ||
                    m.id_movimiento;

                  return (
                    <tr key={id}>
                      <td style={styles.td}>{id}</td>
                      <td style={styles.td}>
                        {obtenerTexto(m, [
                          "ARBOL",
                          "arbol",
                          "NOMBRE_ARBOL",
                          "nombre_arbol",
                          "ID_ARBOL",
                          "id_arbol",
                        ])}
                      </td>
                      <td style={styles.td}>
                        {obtenerTexto(m, [
                          "TIPO_MOVIMIENTO",
                          "tipo_movimiento",
                          "NOMBRE_TIPO_MOVIMIENTO",
                          "nombre_tipo_movimiento",
                        ])}
                      </td>
                      <td style={styles.td}>
                        {obtenerTexto(m, [
                          "SECTOR_ORIGEN",
                          "sector_origen",
                          "NOMBRE_SECTOR_ORIGEN",
                          "nombre_sector_origen",
                        ])}
                      </td>
                      <td style={styles.td}>
                        {obtenerTexto(m, [
                          "SECTOR_DESTINO",
                          "sector_destino",
                          "NOMBRE_SECTOR_DESTINO",
                          "nombre_sector_destino",
                        ])}
                      </td>
                      <td style={styles.td}>
                        {m.FECHA_MOVIMIENTO || m.fecha_movimiento || "-"}
                      </td>
                      <td style={styles.td}>
                        {m.OBSERVACION ||
                          m.observacion ||
                          m.OBSERVACIONES ||
                          m.observaciones ||
                          "-"}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.rowActions}>
                          <button
                            style={styles.editButton}
                            onClick={() => handleEditar(m)}
                          >
                            Editar
                          </button>
                          <button
                            style={styles.deleteButton}
                            onClick={() => handleEliminar(id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    backgroundColor: "#f4f8f4",
    minHeight: "100vh",
  },
  header: {
    marginBottom: "20px",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    color: "#1f4d2e",
    fontWeight: "700",
  },
  subtitle: {
    marginTop: "6px",
    color: "#5f6f65",
    fontSize: "14px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
    marginBottom: "20px",
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: "16px",
    color: "#1f4d2e",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
  },
  fieldFull: {
    gridColumn: "1 / -1",
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "6px",
    fontWeight: "600",
    color: "#2d4739",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #cfd8d3",
    outline: "none",
    fontSize: "14px",
  },
  textarea: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #cfd8d3",
    outline: "none",
    fontSize: "14px",
    resize: "vertical",
  },
  inputError: {
    border: "1px solid #d9534f",
    backgroundColor: "#fff5f5",
  },
  errorText: {
    marginTop: "6px",
    fontSize: "12px",
    color: "#d9534f",
  },
  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
    flexWrap: "wrap",
  },
  primaryButton: {
    backgroundColor: "#2e7d32",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "10px 18px",
    cursor: "pointer",
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#e9efea",
    color: "#23412e",
    border: "none",
    borderRadius: "10px",
    padding: "10px 18px",
    cursor: "pointer",
    fontWeight: "600",
  },
  editButton: {
    backgroundColor: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer",
  },
  deleteButton: {
    backgroundColor: "#c62828",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer",
  },
  rowActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  alert: {
    padding: "12px 16px",
    borderRadius: "10px",
    marginBottom: "16px",
    fontWeight: "600",
  },
  alertSuccess: {
    backgroundColor: "#e8f5e9",
    color: "#256029",
    border: "1px solid #b7dfb9",
  },
  alertError: {
    backgroundColor: "#fdecea",
    color: "#b42318",
    border: "1px solid #f5c2c0",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1000px",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    backgroundColor: "#eaf4ec",
    color: "#23412e",
    borderBottom: "1px solid #d8e5db",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #edf2ee",
    verticalAlign: "top",
  },
  emptyText: {
    color: "#68776d",
  },
};