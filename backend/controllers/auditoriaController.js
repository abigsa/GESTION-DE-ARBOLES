// ============================================================
// controllers/auditoriaController.js
// ============================================================
const oracledb = require('oracledb');
const { getConnection, closeConnection } = require('../config/db');

// ── Registrar un evento (uso interno desde otros controllers) ──
const registrar = async (conn, { tabla, operacion, idRegistro, descripcion, usuarioId, usuarioNombre }) => {
  try {
    await conn.execute(
      `BEGIN PKG_AUDITORIA.REGISTRAR(:tabla, :operacion, :id_registro, :descripcion, :usuario_id, :usuario_nombre); END;`,
      {
        tabla:          tabla,
        operacion:      operacion,
        id_registro:    idRegistro   || null,
        descripcion:    descripcion  || null,
        usuario_id:     usuarioId    || null,
        usuario_nombre: usuarioNombre || 'Sistema',
      }
    );
  } catch (err) {
    console.error('[Auditoría] Error al registrar:', err.message);
    // No lanzar error — no interrumpir operación principal
  }
};

// ── GET /api/auditoria — Listar todos ──────────────
const listar = async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `BEGIN PKG_AUDITORIA.LISTAR(:cursor); END;`,
      { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );
    const cursor = result.outBinds.cursor;
    const rows   = await cursor.getRows();
    await cursor.close();
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await closeConnection(conn);
  }
};

// ── GET /api/auditoria/recientes?limite=50 ─────────
const listarRecientes = async (req, res) => {
  const limite = Math.min(parseInt(req.query.limite) || 50, 200);
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `BEGIN PKG_AUDITORIA.LISTAR_RECIENTES(:limite, :cursor); END;`,
      {
        limite: limite,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );
    const cursor = result.outBinds.cursor;
    const rows   = await cursor.getRows();
    await cursor.close();
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await closeConnection(conn);
  }
};

// ── GET /api/auditoria/tabla/:tabla ────────────────
const listarPorTabla = async (req, res) => {
  const { tabla } = req.params;
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `BEGIN PKG_AUDITORIA.LISTAR_POR_TABLA(:tabla, :cursor); END;`,
      {
        tabla:  tabla.toUpperCase(),
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );
    const cursor = result.outBinds.cursor;
    const rows   = await cursor.getRows();
    await cursor.close();
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await closeConnection(conn);
  }
};

const resumenUsuariosActivos = async (req, res) => {
  let conn;

  try {
    conn = await getConnection();

    const result = await conn.execute(
      `
      SELECT
        USUARIO_ID,
        USUARIO_NOMBRE,

        COUNT(*) AS TOTAL_ACCIONES,

        SUM(CASE WHEN TABLA = 'ARBOL' THEN 1 ELSE 0 END) AS TOTAL_ARBOLES,
        SUM(CASE WHEN TABLA = 'FINCA' THEN 1 ELSE 0 END) AS TOTAL_FINCAS,
        SUM(CASE WHEN TABLA = 'SECTOR' THEN 1 ELSE 0 END) AS TOTAL_SECTORES,
        SUM(CASE WHEN TABLA = 'REGISTRO_PLAGA' THEN 1 ELSE 0 END) AS TOTAL_PLAGAS,
        SUM(CASE WHEN TABLA = 'REGISTRO_TRATAMIENTO' THEN 1 ELSE 0 END) AS TOTAL_TRATAMIENTOS,
        SUM(CASE WHEN TABLA = 'RESIEMBRA' THEN 1 ELSE 0 END) AS TOTAL_RESIEMBRAS,
        SUM(CASE WHEN TABLA = 'MOVIMIENTO_INVENTARIO' THEN 1 ELSE 0 END) AS TOTAL_MOVIMIENTOS,
        SUM(CASE WHEN OPERACION = 'LOGIN' THEN 1 ELSE 0 END) AS TOTAL_LOGINS,

        MAX(FECHA_ACCION) AS ULTIMA_ACTIVIDAD

      FROM AUDITORIA_ACCIONES
      WHERE USUARIO_ID IS NOT NULL
      GROUP BY USUARIO_ID, USUARIO_NOMBRE
      ORDER BY TOTAL_ACCIONES DESC
      `,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  } finally {
    await closeConnection(conn);
  }
};

module.exports = {
  registrar,
  listar,
  listarRecientes,
  listarPorTabla,
  resumenUsuariosActivos
};
