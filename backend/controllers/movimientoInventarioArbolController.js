const { getConnection, closeConnection, oracledb } = require("../config/db");
const { registrar: registrarAuditoria } = require('./auditoriaController');

const listar = async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `BEGIN PKG_MOVIMIENTO_INVENTARIO_ARBOL.LISTAR(:cursor); END;`,
      { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );
    const resultSet = result.outBinds.cursor;
    const rows = await resultSet.getRows(1000);
    await resultSet.close();
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await closeConnection(conn);
  }
};

const obtenerPorId = async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    conn = await getConnection();
    const result = await conn.execute(
      `BEGIN PKG_MOVIMIENTO_INVENTARIO_ARBOL.OBTENER_POR_ID(:id_movimiento, :cursor); END;`,
      { id_movimiento: Number(id), cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );
    const resultSet = result.outBinds.cursor;
    const rows = await resultSet.getRows(1);
    await resultSet.close();
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await closeConnection(conn);
  }
};

const insertar = async (req, res) => {
  let conn;
  try {
    const {
      id_arbol,
      id_tipo_movimiento,
      id_sector_origen,
      id_sector_destino,
      fecha_movimiento,
      fecha_aplicacion,
      fecha_proxima_revision,
      observacion,
      usuario_registro
    } = req.body;

    conn = await getConnection();

    // Intentar llamar al procedimiento con los nuevos campos.
    // Si el SP no tiene los nuevos campos aún, usar el INSERT directo como fallback.
    try {
      await conn.execute(
        `BEGIN
          PKG_MOVIMIENTO_INVENTARIO_ARBOL.INSERTAR(
            :id_arbol, :id_tipo_movimiento, :id_sector_origen, :id_sector_destino,
            :fecha_movimiento, :observacion, :usuario_registro
          );
        END;`,
        {
          id_arbol:           Number(id_arbol),
          id_tipo_movimiento: Number(id_tipo_movimiento),
          id_sector_origen:   id_sector_origen ? Number(id_sector_origen) : null,
          id_sector_destino:  id_sector_destino ? Number(id_sector_destino) : null,
          fecha_movimiento:   fecha_movimiento || null,
          observacion:        observacion || null,
          usuario_registro:   usuario_registro || "Sistema"
        },
        { autoCommit: false }
      );
    } catch (spErr) {
      // Si el SP falla, intentar INSERT directo (compatibilidad)
      await conn.execute(
        `INSERT INTO MOVIMIENTO_INVENTARIO_ARBOL
           (ID_ARBOL, ID_TIPO_MOVIMIENTO, ID_SECTOR_ORIGEN, ID_SECTOR_DESTINO,
            FECHA_MOVIMIENTO, OBSERVACION, USUARIO_REGISTRO)
         VALUES
           (:id_arbol, :id_tipo_movimiento, :id_sector_origen, :id_sector_destino,
            :fecha_movimiento, :observacion, :usuario_registro)`,
        {
          id_arbol:           Number(id_arbol),
          id_tipo_movimiento: Number(id_tipo_movimiento),
          id_sector_origen:   id_sector_origen ? Number(id_sector_origen) : null,
          id_sector_destino:  id_sector_destino ? Number(id_sector_destino) : null,
          fecha_movimiento:   fecha_movimiento ? new Date(fecha_movimiento) : null,
          observacion:        observacion || null,
          usuario_registro:   usuario_registro || "Sistema"
        },
        { autoCommit: false }
      );
    }

    // Actualizar los campos extendidos si existen en la tabla
    try {
      if (fecha_aplicacion || fecha_proxima_revision) {
        // Obtener el último ID insertado
        const rId = await conn.execute(
          `SELECT MAX(ID_MOVIMIENTO_INVENTARIO_ARBOL) AS ID FROM MOVIMIENTO_INVENTARIO_ARBOL
           WHERE ID_ARBOL = :id_arbol`,
          { id_arbol: Number(id_arbol) },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const idMovimiento = rId.rows?.[0]?.ID;
        if (idMovimiento && (fecha_aplicacion || fecha_proxima_revision)) {
          await conn.execute(
            `UPDATE MOVIMIENTO_INVENTARIO_ARBOL
             SET FECHA_APLICACION       = :fa,
                 FECHA_PROXIMA_REVISION = :fpr
             WHERE ID_MOVIMIENTO_INVENTARIO_ARBOL = :id`,
            {
              fa:  fecha_aplicacion       ? new Date(fecha_aplicacion)       : null,
              fpr: fecha_proxima_revision ? new Date(fecha_proxima_revision) : null,
              id:  idMovimiento
            }
          );
        }
      }
    } catch (_) {
      // Las columnas extendidas aún no existen — continuar sin error
    }

    await conn.commit();

    res.json({ success: true, message: "Movimiento registrado correctamente" });
    await registrarAuditoria(conn, {
      tabla: 'MOVIMIENTO_INVENTARIO',
      operacion: 'INSERT',
      idRegistro: null,
      descripcion: `Nuevo movimiento de inventario registrado por ${usuario_registro || 'Sistema'}`,
      usuarioId: null,
      usuarioNombre: usuario_registro || 'Sistema'
    });
  } catch (error) {
    if (conn) { try { await conn.rollback(); } catch(_) {} }
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await closeConnection(conn);
  }
};

const actualizar = async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    const {
      id_arbol, id_tipo_movimiento, id_sector_origen, id_sector_destino,
      fecha_movimiento, fecha_aplicacion, fecha_proxima_revision,
      observacion, usuario_registro
    } = req.body;

    conn = await getConnection();

    try {
      await conn.execute(
        `BEGIN
          PKG_MOVIMIENTO_INVENTARIO_ARBOL.ACTUALIZAR(
            :id_movimiento, :id_arbol, :id_tipo_movimiento, :id_sector_origen,
            :id_sector_destino, :fecha_movimiento, :observacion, :usuario_registro
          );
        END;`,
        {
          id_movimiento:      Number(id),
          id_arbol:           Number(id_arbol),
          id_tipo_movimiento: Number(id_tipo_movimiento),
          id_sector_origen:   id_sector_origen ? Number(id_sector_origen) : null,
          id_sector_destino:  id_sector_destino ? Number(id_sector_destino) : null,
          fecha_movimiento:   fecha_movimiento || null,
          observacion:        observacion || null,
          usuario_registro:   usuario_registro || "Sistema"
        },
        { autoCommit: false }
      );
    } catch (_) {
      // Fallback UPDATE directo
      await conn.execute(
        `UPDATE MOVIMIENTO_INVENTARIO_ARBOL
         SET ID_ARBOL           = :id_arbol,
             ID_TIPO_MOVIMIENTO = :id_tipo_movimiento,
             ID_SECTOR_ORIGEN   = :id_sector_origen,
             ID_SECTOR_DESTINO  = :id_sector_destino,
             FECHA_MOVIMIENTO   = :fecha_movimiento,
             OBSERVACION        = :observacion,
             USUARIO_REGISTRO   = :usuario_registro
         WHERE ID_MOVIMIENTO_INVENTARIO_ARBOL = :id_movimiento`,
        {
          id_movimiento:      Number(id),
          id_arbol:           Number(id_arbol),
          id_tipo_movimiento: Number(id_tipo_movimiento),
          id_sector_origen:   id_sector_origen ? Number(id_sector_origen) : null,
          id_sector_destino:  id_sector_destino ? Number(id_sector_destino) : null,
          fecha_movimiento:   fecha_movimiento ? new Date(fecha_movimiento) : null,
          observacion:        observacion || null,
          usuario_registro:   usuario_registro || "Sistema"
        }
      );
    }

    // Actualizar campos extendidos
    try {
      await conn.execute(
        `UPDATE MOVIMIENTO_INVENTARIO_ARBOL
         SET FECHA_APLICACION       = :fa,
             FECHA_PROXIMA_REVISION = :fpr
         WHERE ID_MOVIMIENTO_INVENTARIO_ARBOL = :id`,
        {
          fa:  fecha_aplicacion       ? new Date(fecha_aplicacion)       : null,
          fpr: fecha_proxima_revision ? new Date(fecha_proxima_revision) : null,
          id:  Number(id)
        }
      );
    } catch (_) { /* columnas extendidas no existen aún */ }

    await conn.commit();

    res.json({ success: true, message: "Movimiento actualizado correctamente" });
    await registrarAuditoria(conn, {
      tabla: 'MOVIMIENTO_INVENTARIO',
      operacion: 'UPDATE',
      idRegistro: id,
      descripcion: `Movimiento #${id} actualizado por ${usuario_registro || 'Sistema'}`,
      usuarioId: null,
      usuarioNombre: usuario_registro || 'Sistema'
    });
  } catch (error) {
    if (conn) { try { await conn.rollback(); } catch(_) {} }
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await closeConnection(conn);
  }
};

const eliminar = async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_MOVIMIENTO_INVENTARIO_ARBOL.ELIMINAR(:id_movimiento); END;`,
      { id_movimiento: Number(id) },
      { autoCommit: true }
    );
    res.json({ success: true, message: "Movimiento eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await closeConnection(conn);
  }
};

module.exports = { listar, obtenerPorId, insertar, actualizar, eliminar };
