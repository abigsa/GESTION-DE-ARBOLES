const oracledb = require('oracledb');
const { registrar: registrarAuditoria } = require('./auditoriaController');
const { getConnection, closeConnection } = require('../config/db');

// ----------------------------------------------------------
// INSERTAR
// ----------------------------------------------------------
const insertar = async (req, res) => {
  const { id_arbol_nuevo, fecha_resiembra, motivo } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_RESIEMBRA.INSERTAR(:id_arbol_nuevo, :fecha_resiembra, :motivo); END;`,
      {
        id_arbol_nuevo: Number(id_arbol_nuevo),
        fecha_resiembra: fecha_resiembra || null,
        motivo: motivo || null,
      },
      { autoCommit: true }
    );
    res.status(201).json({ success: true, message: 'Resiembra insertada correctamente.' });
    await registrarAuditoria(conn, { tabla:'RESIEMBRA', operacion:'INSERT', idRegistro:null, descripcion:`Nuevo registro en RESIEMBRA`, usuarioId: req.body?.usuario_id||null, usuarioNombre: req.body?.usuario_nombre||'Sistema' });
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
  const { id_resiembra } = req.params;
  const { id_arbol_nuevo, fecha_resiembra, motivo } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_RESIEMBRA.ACTUALIZAR(:id_resiembra, :id_arbol_nuevo, :fecha_resiembra, :motivo); END;`,
      {
        id_resiembra: Number(id_resiembra),
        id_arbol_nuevo: Number(id_arbol_nuevo),
        fecha_resiembra: fecha_resiembra || null,
        motivo: motivo || null,
      },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Resiembra actualizada correctamente.' });
    await registrarAuditoria(conn, { tabla:'RESIEMBRA', operacion:'UPDATE', idRegistro:null, descripcion:`Registro actualizado en RESIEMBRA`, usuarioId: req.body?.usuario_id||null, usuarioNombre: req.body?.usuario_nombre||'Sistema' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await closeConnection(conn);
  }
};

// ----------------------------------------------------------
// ELIMINAR
// ----------------------------------------------------------
const eliminar = async (req, res) => {
  const { id_resiembra } = req.params;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_RESIEMBRA.ELIMINAR(:id_resiembra); END;`,
      { id_resiembra: Number(id_resiembra) },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Resiembra eliminada correctamente.' });
    await registrarAuditoria(conn, { tabla:'RESIEMBRA', operacion:'DELETE', idRegistro:null, descripcion:`Registro eliminado en RESIEMBRA`, usuarioId: null, usuarioNombre: 'Sistema' });
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
      `BEGIN PKG_RESIEMBRA.LISTAR(:cursor); END;`,
      { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );
    const cursor = result.outBinds.cursor;
    const rows = await cursor.getRows(1000);
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
  const { id_resiembra } = req.params;
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `BEGIN PKG_RESIEMBRA.OBTENER_POR_ID(:id_resiembra, :cursor); END;`,
      {
        id_resiembra: Number(id_resiembra),
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );
    const cursor = result.outBinds.cursor;
    const rows = await cursor.getRows(1000);
    await cursor.close();

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Resiembra no encontrada.' });
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await closeConnection(conn);
  }
};

module.exports = { insertar, actualizar, eliminar, listar, obtenerPorId };