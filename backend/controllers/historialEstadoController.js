// ============================================================
// controllers/historialEstadoController.js
// ============================================================
const oracledb = require('oracledb');
const { registrar: registrarAuditoria } = require('./auditoriaController');
const { getConnection, closeConnection } = require('../config/db');

// ----------------------------------------------------------
// Helpers
// ----------------------------------------------------------
const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

const toDateOrNow = (value) => {
  if (!value) return new Date();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date() : d;
};

const obtenerEstadoActualArbol = async (conn, idArbol) => {
  const result = await conn.execute(
    `
      SELECT ID_ESTADO
      FROM ARBOL
      WHERE ID_ARBOL = :id_arbol
    `,
    { id_arbol: Number(idArbol) },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  if (!result.rows || result.rows.length === 0) {
    throw new Error('Árbol no encontrado.');
  }

  return result.rows[0].ID_ESTADO ?? null;
};

const actualizarEstadoActualArbol = async (conn, idArbol, idEstadoNuevo) => {
  await conn.execute(
    `
      UPDATE ARBOL
      SET ID_ESTADO = :id_estado
      WHERE ID_ARBOL = :id_arbol
    `,
    {
      id_estado: Number(idEstadoNuevo),
      id_arbol: Number(idArbol),
    }
  );
};

// ----------------------------------------------------------
// INSERTAR
// ----------------------------------------------------------
const insertar = async (req, res) => {
  const { id_arbol, id_estado_nuevo, fecha_cambio, observaciones } = req.body;
  let conn;

  try {
    const idArbol = toNumberOrNull(id_arbol);
    const idEstadoNuevo = toNumberOrNull(id_estado_nuevo);

    if (!idArbol || !idEstadoNuevo) {
      return res.status(400).json({
        success: false,
        message: 'id_arbol e id_estado_nuevo son obligatorios.',
      });
    }

    conn = await getConnection();

    const idEstadoAnterior = await obtenerEstadoActualArbol(conn, idArbol);

    await conn.execute(
      `
        INSERT INTO HISTORIAL_ESTADO (
          ID_HISTORIAL,
          ID_ARBOL,
          ID_ESTADO_ANTERIOR,
          ID_ESTADO_NUEVO,
          FECHA_CAMBIO,
          OBSERVACIONES
        ) VALUES (
          SEQ_HISTORIAL_ESTADO.NEXTVAL,
          :id_arbol,
          :id_estado_anterior,
          :id_estado_nuevo,
          :fecha_cambio,
          :observaciones
        )
      `,
      {
        id_arbol: idArbol,
        id_estado_anterior: idEstadoAnterior,
        id_estado_nuevo: idEstadoNuevo,
        fecha_cambio: toDateOrNow(fecha_cambio),
        observaciones: observaciones || null,
      },
      { autoCommit: false }
    );

    await actualizarEstadoActualArbol(conn, idArbol, idEstadoNuevo);

    await conn.commit();

    res.status(201).json({
      success: true,
      message: 'Historial de estado insertado correctamente y árbol actualizado.',
    });
    await registrarAuditoria(conn, { tabla:'HISTORIAL_ESTADO', operacion:'INSERT', idRegistro:null, descripcion:`Nuevo registro en HISTORIAL_ESTADO`, usuarioId: req.body?.usuario_id||null, usuarioNombre: req.body?.usuario_nombre||'Sistema' });
  } catch (err) {
    if (conn) {
      try {
        await conn.rollback();
      } catch (_) {}
    }

    res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    await closeConnection(conn);
  }
};

// ----------------------------------------------------------
// ACTUALIZAR
// ----------------------------------------------------------
const actualizar = async (req, res) => {
  const { id_historial } = req.params;
  const { id_arbol, id_estado_nuevo, fecha_cambio, observaciones } = req.body;
  let conn;

  try {
    const idHistorial = toNumberOrNull(id_historial);
    const idArbol = toNumberOrNull(id_arbol);
    const idEstadoNuevo = toNumberOrNull(id_estado_nuevo);

    if (!idHistorial || !idArbol || !idEstadoNuevo) {
      return res.status(400).json({
        success: false,
        message: 'id_historial, id_arbol e id_estado_nuevo son obligatorios.',
      });
    }

    conn = await getConnection();

    const idEstadoAnterior = await obtenerEstadoActualArbol(conn, idArbol);

    await conn.execute(
      `
        UPDATE HISTORIAL_ESTADO
        SET ID_ARBOL = :id_arbol,
            ID_ESTADO_ANTERIOR = :id_estado_anterior,
            ID_ESTADO_NUEVO = :id_estado_nuevo,
            FECHA_CAMBIO = :fecha_cambio,
            OBSERVACIONES = :observaciones
        WHERE ID_HISTORIAL = :id_historial
      `,
      {
        id_historial: idHistorial,
        id_arbol: idArbol,
        id_estado_anterior: idEstadoAnterior,
        id_estado_nuevo: idEstadoNuevo,
        fecha_cambio: toDateOrNow(fecha_cambio),
        observaciones: observaciones || null,
      },
      { autoCommit: false }
    );

    await actualizarEstadoActualArbol(conn, idArbol, idEstadoNuevo);

    await conn.commit();

    res.status(200).json({
      success: true,
      message: 'Historial de estado actualizado correctamente y árbol sincronizado.',
    });
    await registrarAuditoria(conn, { tabla:'HISTORIAL_ESTADO', operacion:'UPDATE', idRegistro:null, descripcion:`Registro actualizado en HISTORIAL_ESTADO`, usuarioId: req.body?.usuario_id||null, usuarioNombre: req.body?.usuario_nombre||'Sistema' });
  } catch (err) {
    if (conn) {
      try {
        await conn.rollback();
      } catch (_) {}
    }

    res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    await closeConnection(conn);
  }
};

// ----------------------------------------------------------
// ELIMINAR
// ----------------------------------------------------------
const eliminar = async (req, res) => {
  const { id_historial } = req.params;
  let conn;

  try {
    conn = await getConnection();

    await conn.execute(
      `
        DELETE FROM HISTORIAL_ESTADO
        WHERE ID_HISTORIAL = :id_historial
      `,
      { id_historial: Number(id_historial) },
      { autoCommit: true }
    );

    res.status(200).json({
      success: true,
      message: 'Historial de estado eliminado correctamente.',
    });
    await registrarAuditoria(conn, { tabla:'HISTORIAL_ESTADO', operacion:'DELETE', idRegistro:null, descripcion:`Registro eliminado en HISTORIAL_ESTADO`, usuarioId: null, usuarioNombre: 'Sistema' });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
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
      `BEGIN
         PKG_HISTORIAL_ESTADO.LISTAR(:cursor);
       END;`,
      {
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );

    const cursor = result.outBinds.cursor;
    const rows = await cursor.getRows();
    await cursor.close();

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
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
      `BEGIN
         PKG_HISTORIAL_ESTADO.OBTENER_POR_ID(:id_historial, :cursor);
       END;`,
      {
        id_historial: Number(id_historial),
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );

    const cursor = result.outBinds.cursor;
    const rows = await cursor.getRows();
    await cursor.close();

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Historial de estado no encontrado.',
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    await closeConnection(conn);
  }
};

module.exports = {
  insertar,
  actualizar,
  eliminar,
  listar,
  obtenerPorId,
};