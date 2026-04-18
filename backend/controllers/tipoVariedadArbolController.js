// ============================================================
// controllers/tipoVariedadArbolController.js
// ============================================================
const oracledb = require('oracledb');
const { registrar: registrarAuditoria } = require('./auditoriaController');
const { getConnection, closeConnection } = require('../config/db');

// ----------------------------------------------------------
// INSERTAR
// ----------------------------------------------------------
const insertar = async (req, res) => {
  const { nombre_arbol, tipo_uso, descripcion } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_TIPO_VARIEDAD_ARBOL.INSERTAR(:nombre_arbol, :tipo_uso, :descripcion); END;`,
      {
        nombre_arbol: nombre_arbol,
        tipo_uso:     tipo_uso    || null,
        descripcion:  descripcion || null,
      },
      { autoCommit: true }
    );
    res.status(201).json({ success: true, message: 'Tipo de variedad de árbol insertado correctamente.' });
    await registrarAuditoria(conn, { tabla:'TIPO_VARIEDAD_ARBOL', operacion:'INSERT', idRegistro:null, descripcion:`Nuevo registro en TIPO_VARIEDAD_ARBOL`, usuarioId: req.body?.usuario_id||null, usuarioNombre: req.body?.usuario_nombre||'Sistema' });
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
  const { id_tipo_arbol } = req.params;
  const { nombre_arbol, tipo_uso, descripcion } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_TIPO_VARIEDAD_ARBOL.ACTUALIZAR(:id_tipo_arbol, :nombre_arbol, :tipo_uso, :descripcion); END;`,
      {
        id_tipo_arbol: Number(id_tipo_arbol),
        nombre_arbol:  nombre_arbol,
        tipo_uso:      tipo_uso    || null,
        descripcion:   descripcion || null,
      },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Tipo de variedad de árbol actualizado correctamente.' });
    await registrarAuditoria(conn, { tabla:'TIPO_VARIEDAD_ARBOL', operacion:'UPDATE', idRegistro:null, descripcion:`Registro actualizado en TIPO_VARIEDAD_ARBOL`, usuarioId: req.body?.usuario_id||null, usuarioNombre: req.body?.usuario_nombre||'Sistema' });
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
  const { id_tipo_arbol } = req.params;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_TIPO_VARIEDAD_ARBOL.ELIMINAR(:id_tipo_arbol); END;`,
      { id_tipo_arbol: Number(id_tipo_arbol) },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Tipo de variedad de árbol eliminado correctamente.' });
    await registrarAuditoria(conn, { tabla:'TIPO_VARIEDAD_ARBOL', operacion:'DELETE', idRegistro:null, descripcion:`Registro eliminado en TIPO_VARIEDAD_ARBOL`, usuarioId: null, usuarioNombre: 'Sistema' });
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
      `
      BEGIN
        PKG_TIPO_VARIEDAD_ARBOL.LISTAR(:cursor);
      END;
      `,
      {
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const resultSet = result.outBinds.cursor;
    const rows = await resultSet.getRows(1000);
    await resultSet.close();

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error("Error en listar:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  } finally {
    if (conn) await conn.close();
  }
};

// ----------------------------------------------------------
// OBTENER POR ID
// ----------------------------------------------------------
const obtenerPorId = async (req, res) => {
  const { id_tipo_arbol } = req.params;
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `BEGIN PKG_TIPO_VARIEDAD_ARBOL.OBTENER_POR_ID(:id_tipo_arbol, :cursor); END;`,
      {
        id_tipo_arbol: Number(id_tipo_arbol),
        cursor:        { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );
    const cursor = result.outBinds.cursor;
    const rows = await cursor.getRows();
    await cursor.close();
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tipo de variedad de árbol no encontrado.' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await closeConnection(conn);
  }
};

module.exports = { insertar, actualizar, eliminar, listar, obtenerPorId };
