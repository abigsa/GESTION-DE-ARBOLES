// ============================================================
// controllers/arbolController.js
// ============================================================
const oracledb = require('oracledb');
const { getConnection, closeConnection } = require('../config/db');

// ----------------------------------------------------------
// INSERTAR
// ----------------------------------------------------------
const insertar = async (req, res) => {
  const { id_sector, id_tipo_variedad_arbol, id_estado, numero_surco, descripcion } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_ARBOL.INSERTAR(:id_sector, :id_tipo_variedad_arbol, :id_estado, :numero_surco, :descripcion); END;`,
      {
        id_sector:              Number(id_sector),
        id_tipo_variedad_arbol: Number(id_tipo_variedad_arbol),
        id_estado:              Number(id_estado),
        numero_surco:           numero_surco || null,
        descripcion:            descripcion  || null,
      },
      { autoCommit: true }
    );
    res.status(201).json({ success: true, message: 'Árbol insertado correctamente.' });
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
  const { id_arbol } = req.params;
  const { id_sector, id_tipo_variedad_arbol, id_estado, numero_surco, descripcion } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_ARBOL.ACTUALIZAR(:id_arbol, :id_sector, :id_tipo_variedad_arbol, :id_estado, :numero_surco, :descripcion); END;`,
      {
        id_arbol:               Number(id_arbol),
        id_sector:              Number(id_sector),
        id_tipo_variedad_arbol: Number(id_tipo_variedad_arbol),
        id_estado:              Number(id_estado),
        numero_surco:           numero_surco || null,
        descripcion:            descripcion  || null,
      },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Árbol actualizado correctamente.' });
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
  const { id_arbol } = req.params;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_ARBOL.ELIMINAR(:id_arbol); END;`,
      { id_arbol: Number(id_arbol) },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Árbol eliminado correctamente.' });
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
      `BEGIN PKG_ARBOL.LISTAR(:cursor); END;`,
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
  const { id_arbol } = req.params;
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `BEGIN PKG_ARBOL.OBTENER_POR_ID(:id_arbol, :cursor); END;`,
      {
        id_arbol: Number(id_arbol),
        cursor:   { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );
    const cursor = result.outBinds.cursor;
    const rows = await cursor.getRows();
    await cursor.close();
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Árbol no encontrado.' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await closeConnection(conn);
  }
};

module.exports = { insertar, actualizar, eliminar, listar, obtenerPorId };
