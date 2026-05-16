// ============================================================
// controllers/fincaController.js
// ============================================================
const oracledb = require('oracledb');
const { registrar: registrarAuditoria } = require('./auditoriaController');
const { getConnection, closeConnection } = require('../config/db');

// ----------------------------------------------------------
// INSERTAR
// ----------------------------------------------------------
const insertar = async (req, res) => {
  const { nombre_finca, ubicacion, area_hectareas, propietario, telefono_contacto, descripcion } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_FINCA.INSERTAR(:nombre_finca, :ubicacion, :area_hectareas, :propietario, :telefono_contacto, :descripcion); END;`,
      {
        nombre_finca:      nombre_finca,
        ubicacion:         ubicacion         || null,
        area_hectareas:    area_hectareas     || null,
        propietario:       propietario        || null,
        telefono_contacto: telefono_contacto  || null,
        descripcion:       descripcion        || null,
      },
      { autoCommit: true }
    );
    res.status(201).json({ success: true, message: 'Finca insertada correctamente.' });
    await registrarAuditoria(conn, { tabla:'FINCA', operacion:'INSERT', idRegistro:null, descripcion:`Nuevo registro en FINCA`, usuarioId: req.body?.usuario_id||null, usuarioNombre: req.body?.usuario_nombre||'Sistema' });
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
  const { id_finca } = req.params;
  const { nombre_finca, ubicacion, area_hectareas, propietario, telefono_contacto, descripcion } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_FINCA.ACTUALIZAR(:id_finca, :nombre_finca, :ubicacion, :area_hectareas, :propietario, :telefono_contacto, :descripcion); END;`,
      {
        id_finca:          Number(id_finca),
        nombre_finca:      nombre_finca,
        ubicacion:         ubicacion         || null,
        area_hectareas:    area_hectareas     || null,
        propietario:       propietario        || null,
        telefono_contacto: telefono_contacto  || null,
        descripcion:       descripcion        || null,
      },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Finca actualizada correctamente.' });
    await registrarAuditoria(conn, { tabla:'FINCA', operacion:'UPDATE', idRegistro:null, descripcion:`Registro actualizado en FINCA`, usuarioId: req.body?.usuario_id||null, usuarioNombre: req.body?.usuario_nombre||'Sistema' });
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
  const { id_finca } = req.params;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_FINCA.ELIMINAR(:id_finca); END;`,
      { id_finca: Number(id_finca) },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Finca eliminada correctamente.' });
    await registrarAuditoria(conn, { tabla:'FINCA', operacion:'DELETE', idRegistro:null, descripcion:`Registro eliminado en FINCA`, usuarioId: null, usuarioNombre: 'Sistema' });
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
      `BEGIN PKG_FINCA.LISTAR(:cursor); END;`,
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
  const { id_finca } = req.params;
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `BEGIN PKG_FINCA.OBTENER_POR_ID(:id_finca, :cursor); END;`,
      {
        id_finca: Number(id_finca),
        cursor:   { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );
    const cursor = result.outBinds.cursor;
    const rows = await cursor.getRows();
    await cursor.close();
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Finca no encontrada.' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await closeConnection(conn);
  }
};

module.exports = { insertar, actualizar, eliminar, listar, obtenerPorId };
