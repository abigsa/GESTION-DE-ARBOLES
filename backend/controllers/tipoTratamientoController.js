// ============================================================
// controllers/tipoTratamientoController.js
// ============================================================
const oracledb = require('oracledb');
const { getConnection, closeConnection } = require('../config/db');

// ----------------------------------------------------------
// INSERTAR
// ----------------------------------------------------------
const insertar = async (req, res) => {
  const { nombre_tratamiento, categoria, metodo_aplicacion, frecuencia, descripcion } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_TIPO_TRATAMIENTO.INSERTAR(:nombre_tratamiento, :categoria, :metodo_aplicacion, :frecuencia, :descripcion); END;`,
      {
        nombre_tratamiento: nombre_tratamiento,
        categoria:          categoria         || null,
        metodo_aplicacion:  metodo_aplicacion || null,
        frecuencia:         frecuencia        || null,
        descripcion:        descripcion       || null,
      },
      { autoCommit: true }
    );
    res.status(201).json({ success: true, message: 'Tipo de tratamiento insertado correctamente.' });
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
  const { id_tipo_tratamiento } = req.params;
  const { nombre_tratamiento, categoria, metodo_aplicacion, frecuencia, descripcion } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_TIPO_TRATAMIENTO.ACTUALIZAR(:id_tipo_tratamiento, :nombre_tratamiento, :categoria, :metodo_aplicacion, :frecuencia, :descripcion); END;`,
      {
        id_tipo_tratamiento: Number(id_tipo_tratamiento),
        nombre_tratamiento:  nombre_tratamiento,
        categoria:           categoria         || null,
        metodo_aplicacion:   metodo_aplicacion || null,
        frecuencia:          frecuencia        || null,
        descripcion:         descripcion       || null,
      },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Tipo de tratamiento actualizado correctamente.' });
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
  const { id_tipo_tratamiento } = req.params;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_TIPO_TRATAMIENTO.ELIMINAR(:id_tipo_tratamiento); END;`,
      { id_tipo_tratamiento: Number(id_tipo_tratamiento) },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Tipo de tratamiento eliminado correctamente.' });
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
      `BEGIN PKG_TIPO_TRATAMIENTO.LISTAR(:cursor); END;`,
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
  const { id_tipo_tratamiento } = req.params;
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `BEGIN PKG_TIPO_TRATAMIENTO.OBTENER_POR_ID(:id_tipo_tratamiento, :cursor); END;`,
      {
        id_tipo_tratamiento: Number(id_tipo_tratamiento),
        cursor:              { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );
    const cursor = result.outBinds.cursor;
    const rows = await cursor.getRows();
    await cursor.close();
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tipo de tratamiento no encontrado.' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await closeConnection(conn);
  }
};

module.exports = { insertar, actualizar, eliminar, listar, obtenerPorId };
