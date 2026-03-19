// ============================================================
// controllers/tipoFertilizanteController.js
// ============================================================
const oracledb = require('oracledb');
const { getConnection, closeConnection } = require('../config/db');

// ----------------------------------------------------------
// INSERTAR
// ----------------------------------------------------------
const insertar = async (req, res) => {
  const { nombre_fertilizante, tipo_fertilizante, nutrientes_principales, metodo_aplicacion, frecuencia, descripcion } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_TIPO_FERTILIZANTE.INSERTAR(:nombre_fertilizante, :tipo_fertilizante, :nutrientes_principales, :metodo_aplicacion, :frecuencia, :descripcion); END;`,
      {
        nombre_fertilizante:    nombre_fertilizante,
        tipo_fertilizante:      tipo_fertilizante      || null,
        nutrientes_principales: nutrientes_principales || null,
        metodo_aplicacion:      metodo_aplicacion      || null,
        frecuencia:             frecuencia             || null,
        descripcion:            descripcion            || null,
      },
      { autoCommit: true }
    );
    res.status(201).json({ success: true, message: 'Tipo de fertilizante insertado correctamente.' });
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
  const { id_fertilizante } = req.params;
  const { nombre_fertilizante, tipo_fertilizante, nutrientes_principales, metodo_aplicacion, frecuencia, descripcion } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_TIPO_FERTILIZANTE.ACTUALIZAR(:id_fertilizante, :nombre_fertilizante, :tipo_fertilizante, :nutrientes_principales, :metodo_aplicacion, :frecuencia, :descripcion); END;`,
      {
        id_fertilizante:        Number(id_fertilizante),
        nombre_fertilizante:    nombre_fertilizante,
        tipo_fertilizante:      tipo_fertilizante      || null,
        nutrientes_principales: nutrientes_principales || null,
        metodo_aplicacion:      metodo_aplicacion      || null,
        frecuencia:             frecuencia             || null,
        descripcion:            descripcion            || null,
      },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Tipo de fertilizante actualizado correctamente.' });
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
  const { id_fertilizante } = req.params;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_TIPO_FERTILIZANTE.ELIMINAR(:id_fertilizante); END;`,
      { id_fertilizante: Number(id_fertilizante) },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Tipo de fertilizante eliminado correctamente.' });
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
      `BEGIN PKG_TIPO_FERTILIZANTE.LISTAR(:cursor); END;`,
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
  const { id_fertilizante } = req.params;
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `BEGIN PKG_TIPO_FERTILIZANTE.OBTENER_POR_ID(:id_fertilizante, :cursor); END;`,
      {
        id_fertilizante: Number(id_fertilizante),
        cursor:          { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );
    const cursor = result.outBinds.cursor;
    const rows = await cursor.getRows();
    await cursor.close();
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tipo de fertilizante no encontrado.' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await closeConnection(conn);
  }
};

module.exports = { insertar, actualizar, eliminar, listar, obtenerPorId };
