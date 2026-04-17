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

module.exports = { registrar, listar, listarRecientes, listarPorTabla };
