// ============================================================
// controllers/registroPlagaController.js
// ============================================================
const oracledb = require('oracledb');
const { getConnection, closeConnection } = require('../config/db');

// ----------------------------------------------------------
// INSERTAR
// ----------------------------------------------------------
const insertar = async (req, res) => {
  const { id_arbol, id_plaga, fecha_deteccion, fecha_resolucion, observaciones } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_REGISTRO_PLAGA.INSERTAR(:id_arbol, :id_plaga, :fecha_deteccion, :fecha_resolucion, :observaciones); END;`,
      {
        id_arbol:         id_arbol         ? Number(id_arbol)         : null,
        id_plaga:         id_plaga         ? Number(id_plaga)         : null,
        fecha_deteccion:  fecha_deteccion ? fecha_deteccion : null,
        fecha_resolucion: fecha_deteccion ? fecha_deteccion : null,
        observaciones:    observaciones    || null,
      },
      { autoCommit: true }
    );
    res.status(201).json({ success: true, message: 'Registro de plaga insertado correctamente.' });
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
  const { id_registro } = req.params;
  const { id_arbol, id_plaga, fecha_deteccion, fecha_resolucion, observaciones } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_REGISTRO_PLAGA.ACTUALIZAR(:id_registro, :id_arbol, :id_plaga, :fecha_deteccion, :fecha_resolucion, :observaciones); END;`,
      {
        id_registro:      Number(id_registro),
        id_arbol:         id_arbol         ? Number(id_arbol)          : null,
        id_plaga:         id_plaga         ? Number(id_plaga)          : null,
        fecha_deteccion:  fecha_deteccion ? fecha_deteccion : null,
        fecha_resolucion: fecha_resolucion && fecha_resolucion !== ''
        ? fecha_resolucion
        : null,
        observaciones:    observaciones    || null,
      },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Registro de plaga actualizado correctamente.' });
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
  const { id_registro } = req.params;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_REGISTRO_PLAGA.ELIMINAR(:id_registro); END;`,
      { id_registro: Number(id_registro) },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Registro de plaga eliminado correctamente.' });
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
      `BEGIN PKG_REGISTRO_PLAGA.LISTAR(:cursor); END;`,
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
  const { id_registro } = req.params;
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `BEGIN PKG_REGISTRO_PLAGA.OBTENER_POR_ID(:id_registro, :cursor); END;`,
      {
        id_registro: Number(id_registro),
        cursor:      { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );
    const cursor = result.outBinds.cursor;
    const rows = await cursor.getRows();
    await cursor.close();
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Registro de plaga no encontrado.' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await closeConnection(conn);
  }
};

module.exports = { insertar, actualizar, eliminar, listar, obtenerPorId };
