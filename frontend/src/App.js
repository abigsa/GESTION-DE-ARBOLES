import React, { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState([]);
  const [nombre, setNombre] = useState("");
  const [tipoUso, setTipoUso] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [editId, setEditId] = useState(null);

  const API = "http://localhost:3000/api/tipos-variedad";

  const fetchData = async () => {
    try {
      const res = await fetch(API);
      const json = await res.json();
      setData(json.data || []);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await fetch(`${API}/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre_arbol: nombre,
            tipo_uso: tipoUso,
            descripcion: descripcion,
          }),
        });
      } else {
        await fetch(API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre_arbol: nombre,
            tipo_uso: tipoUso,
            descripcion: descripcion,
          }),
        });
      }

      setNombre("");
      setTipoUso("");
      setDescripcion("");
      setEditId(null);

      fetchData();
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/${id}`, {
        method: "DELETE",
      });
      fetchData();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const handleEdit = (item) => {
    setEditId(item.ID_TIPO_ARBOL);
    setNombre(item.NOMBRE_ARBOL);
    setTipoUso(item.TIPO_USO);
    setDescripcion(item.DESCRIPCION);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Tipos de Variedad de Árbol</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={{ marginRight: "10px" }}
        />

        <input
          type="text"
          placeholder="Tipo de uso"
          value={tipoUso}
          onChange={(e) => setTipoUso(e.target.value)}
          style={{ marginRight: "10px" }}
        />

        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          style={{ marginRight: "10px" }}
        />

        <button type="submit">
          {editId ? "Actualizar" : "Guardar"}
        </button>
      </form>

      <table border="1" cellPadding="10" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Tipo de uso</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={item.ID_TIPO_ARBOL}>
                <td>{item.ID_TIPO_ARBOL}</td>
                <td>{item.NOMBRE_ARBOL}</td>
                <td>{item.TIPO_USO}</td>
                <td>{item.DESCRIPCION}</td>
                <td>
                  <button onClick={() => handleEdit(item)}>Editar</button>
                  <button
                    onClick={() => handleDelete(item.ID_TIPO_ARBOL)}
                    style={{ marginLeft: "10px" }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No hay registros</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;