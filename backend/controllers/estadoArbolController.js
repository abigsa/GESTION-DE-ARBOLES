// ============================================================
// controllers/estadoArbolController.js
// ============================================================
const oracledb = require('oracledb');
const { getConnection, closeConnection } = require('../config/db');

// ----------------------------------------------------------
// INSERTAR
// ----------------------------------------------------------
const insertar = async (req, res) => {
  const { nombre_estado, orden_ciclo, es_productivo, descripcion } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_ESTADO_ARBOL.INSERTAR(:nombre_estado, :orden_ciclo, :es_productivo, :descripcion); END;`,
      {
        nombre_estado: nombre_estado,
        orden_ciclo:   orden_ciclo   || null,
        es_productivo: es_productivo || 'N',
        descripcion:   descripcion   || null,
      },
      { autoCommit: true }
    );
    res.status(201).json({ success: true, message: 'Estado de árbol insertado correctamente.' });
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
  const { id_estado } = req.params;
  const { nombre_estado, orden_ciclo, es_productivo, descripcion } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_ESTADO_ARBOL.ACTUALIZAR(:id_estado, :nombre_estado, :orden_ciclo, :es_productivo, :descripcion); END;`,
      {
        id_estado:     Number(id_estado),
        nombre_estado: nombre_estado,
        orden_ciclo:   orden_ciclo   || null,
        es_productivo: es_productivo || 'N',
        descripcion:   descripcion   || null,
      },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Estado de árbol actualizado correctamente.' });
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
  const { id_estado } = req.params;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_ESTADO_ARBOL.ELIMINAR(:id_estado); END;`,
      { id_estado: Number(id_estado) },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Estado de árbol eliminado correctamente.' });
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
      `BEGIN PKG_ESTADO_ARBOL.LISTAR(:cursor); END;`,
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
  const { id_estado } = req.params;
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `BEGIN PKG_ESTADO_ARBOL.OBTENER_POR_ID(:id_estado, :cursor); END;`,
      {
        id_estado: Number(id_estado),
        cursor:    { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );
    const cursor = result.outBinds.cursor;
    const rows = await cursor.getRows();
    await cursor.close();
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Estado de árbol no encontrado.' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await closeConnection(conn);
  }
};

module.exports = { insertar, actualizar, eliminar, listar, obtenerPorId };
