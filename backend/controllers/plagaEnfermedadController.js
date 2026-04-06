// ============================================================
// controllers/plagaEnfermedadController.js
// ============================================================
const oracledb = require('oracledb');
const { getConnection, closeConnection } = require('../config/db');

// ----------------------------------------------------------
// INSERTAR
// ----------------------------------------------------------
const insertar = async (req, res) => {
  const { nombre_plaga, tipo_plaga, nivel_riesgo, descripcion } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_PLAGA_ENFERMEDAD.INSERTAR(:nombre_plaga, :tipo_plaga, :nivel_riesgo, :descripcion); END;`,
      {
        nombre_plaga: nombre_plaga,
        tipo_plaga:   tipo_plaga   || null,
        nivel_riesgo: nivel_riesgo || null,
        descripcion:  descripcion  || null,
      },
      { autoCommit: true }
    );
    res.status(201).json({ success: true, message: 'Plaga/Enfermedad insertada correctamente.' });
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
  const { id_plaga } = req.params;
  const { nombre_plaga, tipo_plaga, nivel_riesgo, descripcion } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_PLAGA_ENFERMEDAD.ACTUALIZAR(:id_plaga, :nombre_plaga, :tipo_plaga, :nivel_riesgo, :descripcion); END;`,
      {
        id_plaga:     Number(id_plaga),
        nombre_plaga: nombre_plaga,
        tipo_plaga:   tipo_plaga   || null,
        nivel_riesgo: nivel_riesgo || null,
        descripcion:  descripcion  || null,
      },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Plaga/Enfermedad actualizada correctamente.' });
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
  const { id_plaga } = req.params;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_PLAGA_ENFERMEDAD.ELIMINAR(:id_plaga); END;`,
      { id_plaga: Number(id_plaga) },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Plaga/Enfermedad eliminada correctamente.' });
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
      `BEGIN PKG_PLAGA_ENFERMEDAD.LISTAR(:cursor); END;`,
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
  const { id_plaga } = req.params;
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `BEGIN PKG_PLAGA_ENFERMEDAD.OBTENER_POR_ID(:id_plaga, :cursor); END;`,
      {
        id_plaga: Number(id_plaga),
        cursor:   { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );
    const cursor = result.outBinds.cursor;
    const rows = await cursor.getRows();
    await cursor.close();
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Plaga/Enfermedad no encontrada.' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await closeConnection(conn);
  }
};

module.exports = { insertar, actualizar, eliminar, listar, obtenerPorId };
