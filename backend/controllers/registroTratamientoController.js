// ============================================================
// controllers/registroTratamientoController.js
// ============================================================
const oracledb = require('oracledb');
const { registrar: registrarAuditoria } = require('./auditoriaController');
const { getConnection, closeConnection } = require('../config/db');

// ----------------------------------------------------------
// INSERTAR
// ----------------------------------------------------------
const insertar = async (req, res) => {
  const { id_arbol, id_tipo_tratamiento, id_fertilizante, fecha_aplicacion, observaciones } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_REGISTRO_TRATAMIENTO.INSERTAR(:id_arbol, :id_tipo_tratamiento, :id_fertilizante, :fecha_aplicacion, :observaciones); END;`,
      {
        id_arbol:            Number(id_arbol),
        id_tipo_tratamiento: Number(id_tipo_tratamiento),
        id_fertilizante:     id_fertilizante ? Number(id_fertilizante) : null,
        fecha_aplicacion:    fecha_aplicacion || null,
        observaciones:       observaciones || null,
      },
      { autoCommit: true }
    );
    res.status(201).json({ success: true, message: 'Registro de tratamiento insertado correctamente.' });
    await registrarAuditoria(conn, { tabla:'REGISTRO_TRATAMIENTO', operacion:'INSERT', idRegistro:null, descripcion:`Nuevo registro en REGISTRO_TRATAMIENTO`, usuarioId: req.body?.usuario_id||null, usuarioNombre: req.body?.usuario_nombre||'Sistema' });
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
  const { id_arbol, id_tipo_tratamiento, id_fertilizante, fecha_aplicacion, observaciones } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_REGISTRO_TRATAMIENTO.ACTUALIZAR(:id_registro, :id_arbol, :id_tipo_tratamiento, :id_fertilizante, :fecha_aplicacion, :observaciones); END;`,
      {
        id_registro:         Number(id_registro),
        id_arbol:            Number(id_arbol),
        id_tipo_tratamiento: Number(id_tipo_tratamiento),
        id_fertilizante:     id_fertilizante ? Number(id_fertilizante) : null,
        fecha_aplicacion:    fecha_aplicacion || null,
        observaciones:       observaciones || null,
      },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Registro de tratamiento actualizado correctamente.' });
    await registrarAuditoria(conn, { tabla:'REGISTRO_TRATAMIENTO', operacion:'UPDATE', idRegistro:null, descripcion:`Registro actualizado en REGISTRO_TRATAMIENTO`, usuarioId: req.body?.usuario_id||null, usuarioNombre: req.body?.usuario_nombre||'Sistema' });
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
  const { id_registro } = req.params;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_REGISTRO_TRATAMIENTO.ELIMINAR(:id_registro); END;`,
      { id_registro: Number(id_registro) },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Registro de tratamiento eliminado correctamente.' });
    await registrarAuditoria(conn, { tabla:'REGISTRO_TRATAMIENTO', operacion:'DELETE', idRegistro:null, descripcion:`Registro eliminado en REGISTRO_TRATAMIENTO`, usuarioId: null, usuarioNombre: 'Sistema' });
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
      `BEGIN PKG_REGISTRO_TRATAMIENTO.LISTAR(:cursor); END;`,
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
      `BEGIN PKG_REGISTRO_TRATAMIENTO.OBTENER_POR_ID(:id_registro, :cursor); END;`,
      {
        id_registro: Number(id_registro),
        cursor:      { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );
    const cursor = result.outBinds.cursor;
    const rows = await cursor.getRows();
    await cursor.close();
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Registro de tratamiento no encontrado.' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await closeConnection(conn);
  }
};

module.exports = { insertar, actualizar, eliminar, listar, obtenerPorId };
