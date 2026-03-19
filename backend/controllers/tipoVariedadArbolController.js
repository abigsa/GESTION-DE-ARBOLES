// ============================================================
// controllers/tipoVariedadArbolController.js
// ============================================================
const oracledb = require('oracledb');
const { getConnection, closeConnection } = require('../config/db');

// ----------------------------------------------------------
// INSERTAR
// ----------------------------------------------------------
const insertar = async (req, res) => {
  const { nombre_arbol, tipo_uso, descripcion } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_TIPO_VARIEDAD_ARBOL.INSERTAR(:nombre_arbol, :tipo_uso, :descripcion); END;`,
      {
        nombre_arbol: nombre_arbol,
        tipo_uso:     tipo_uso    || null,
        descripcion:  descripcion || null,
      },
      { autoCommit: true }
    );
    res.status(201).json({ success: true, message: 'Tipo de variedad de árbol insertado correctamente.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await closeConnection(conn);
  }
};

// ----------------------------------------------------------
// ACTUALIZAR
// ----------------------------------------------------------
const actualizar = async (req, res) => {
  const { id_tipo_arbol } = req.params;
  const { nombre_arbol, tipo_uso, descripcion } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_TIPO_VARIEDAD_ARBOL.ACTUALIZAR(:id_tipo_arbol, :nombre_arbol, :tipo_uso, :descripcion); END;`,
      {
        id_tipo_arbol: Number(id_tipo_arbol),
        nombre_arbol:  nombre_arbol,
        tipo_uso:      tipo_uso    || null,
        descripcion:   descripcion || null,
      },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Tipo de variedad de árbol actualizado correctamente.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await closeConnection(conn);
  }
};

// ----------------------------------------------------------
// ELIMINAR (DELETE LÓGICO)
// ----------------------------------------------------------
const eliminar = async (req, res) => {
  const { id_tipo_arbol } = req.params;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_TIPO_VARIEDAD_ARBOL.ELIMINAR(:id_tipo_arbol); END;`,
      { id_tipo_arbol: Number(id_tipo_arbol) },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Tipo de variedad de árbol eliminado correctamente.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await closeConnection(conn);
  }
};

// ----------------------------------------------------------
// LISTAR
// ----------------------------------------------------------
const listar = async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `BEGIN PKG_TIPO_VARIEDAD_ARBOL.LISTAR(:cursor); END;`,
      { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );
    const cursor = result.outBinds.cursor;
    const rows = await cursor.getRows();
    await cursor.close();
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await closeConnection(conn);
  }
};

// ----------------------------------------------------------
// OBTENER POR ID
// ----------------------------------------------------------
const obtenerPorId = async (req, res) => {
  const { id_tipo_arbol } = req.params;
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `BEGIN PKG_TIPO_VARIEDAD_ARBOL.OBTENER_POR_ID(:id_tipo_arbol, :cursor); END;`,
      {
        id_tipo_arbol: Number(id_tipo_arbol),
        cursor:        { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );
    const cursor = result.outBinds.cursor;
    const rows = await cursor.getRows();
    await cursor.close();
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tipo de variedad de árbol no encontrado.' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await closeConnection(conn);
  }
};

module.exports = { insertar, actualizar, eliminar, listar, obtenerPorId };
