// ============================================================
// controllers/historialEstadoController.js
// ============================================================
const oracledb = require('oracledb');
const { getConnection, closeConnection } = require('../config/db');

// ----------------------------------------------------------
// INSERTAR
// ----------------------------------------------------------
const insertar = async (req, res) => {
  const { id_arbol, id_estado_anterior, id_estado_nuevo, fecha_cambio, observaciones } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_HISTORIAL_ESTADO.INSERTAR(:id_arbol, :id_estado_anterior, :id_estado_nuevo, :fecha_cambio, :observaciones); END;`,
      {
        id_arbol:           Number(id_arbol),
        id_estado_anterior: id_estado_anterior ? Number(id_estado_anterior) : null,
        id_estado_nuevo:    id_estado_nuevo    ? Number(id_estado_nuevo)    : null,
        fecha_cambio:       new Date(fecha_cambio),
        observaciones:      observaciones || null,
      },
      { autoCommit: true }
    );
    res.status(201).json({ success: true, message: 'Historial de estado insertado correctamente.' });
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
  const { id_historial } = req.params;
  const { id_arbol, id_estado_anterior, id_estado_nuevo, fecha_cambio, observaciones } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_HISTORIAL_ESTADO.ACTUALIZAR(:id_historial, :id_arbol, :id_estado_anterior, :id_estado_nuevo, :fecha_cambio, :observaciones); END;`,
      {
        id_historial:       Number(id_historial),
        id_arbol:           Number(id_arbol),
        id_estado_anterior: id_estado_anterior ? Number(id_estado_anterior) : null,
        id_estado_nuevo:    id_estado_nuevo    ? Number(id_estado_nuevo)    : null,
        fecha_cambio:       new Date(fecha_cambio),
        observaciones:      observaciones || null,
      },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Historial de estado actualizado correctamente.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await closeConnection(conn);
  }
};

// ----------------------------------------------------------
// ELIMINAR (DELETE FÍSICO)
// ----------------------------------------------------------
const eliminar = async (req, res) => {
  const { id_historial } = req.params;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_HISTORIAL_ESTADO.ELIMINAR(:id_historial); END;`,
      { id_historial: Number(id_historial) },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Historial de estado eliminado correctamente.' });
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
      `BEGIN PKG_HISTORIAL_ESTADO.LISTAR(:cursor); END;`,
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
  const { id_historial } = req.params;
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `BEGIN PKG_HISTORIAL_ESTADO.OBTENER_POR_ID(:id_historial, :cursor); END;`,
      {
        id_historial: Number(id_historial),
        cursor:       { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );
    const cursor = result.outBinds.cursor;
    const rows = await cursor.getRows();
    await cursor.close();
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Historial de estado no encontrado.' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await closeConnection(conn);
  }
};

module.exports = { insertar, actualizar, eliminar, listar, obtenerPorId };
