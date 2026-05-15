const { getConnection, closeConnection, oracledb } = require('../config/db');
const { registrar: registrarAuditoria } = require('./auditoriaController');

// ----------------------------------------------------------
// LISTAR
// ----------------------------------------------------------
const listar = async (req, res) => {
  let conn;

  try {
    conn = await getConnection();

    const result = await conn.execute(
      `
      SELECT
        MI.ID_MOVIMIENTO,
        MI.ID_ARBOL,

        F.ID_FINCA,
        F.NOMBRE_FINCA AS nombre_finca,

        S.ID_SECTOR,
        S.NOMBRE_SECTOR AS nombre_sector,

        TA.NOMBRE_ARBOL AS nombre_arbol,

        MI.ID_TIPO_MOVIMIENTO,
        TMI.NOMBRE AS tipo_movimiento,

        MI.FECHA_MOVIMIENTO,
        MI.OBSERVACION AS observaciones

      FROM MOVIMIENTO_INVENTARIO_ARBOL MI

      LEFT JOIN ARBOL A
        ON A.ID_ARBOL = MI.ID_ARBOL

      LEFT JOIN SECTOR S
        ON S.ID_SECTOR = A.ID_SECTOR

      LEFT JOIN FINCA F
        ON F.ID_FINCA = S.ID_FINCA

      LEFT JOIN TIPO_VARIEDAD_ARBOL TA
        ON TA.ID_TIPO_ARBOL = A.ID_TIPO_VARIEDAD_ARBOL

      LEFT JOIN TIPO_MOVIMIENTO_INVENTARIO TMI
        ON TMI.ID_TIPO_MOVIMIENTO = MI.ID_TIPO_MOVIMIENTO

      WHERE NVL(A.ACTIVO, 'S') = 'S'

      ORDER BY MI.ID_MOVIMIENTO DESC
      `,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json({
      success: true,
      data: result.rows || [],
    });
  } catch (error) {
    console.error('ERROR LISTAR MOVIMIENTO:', error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    await closeConnection(conn);
  }
};

// ----------------------------------------------------------
// OBTENER POR ID
// ----------------------------------------------------------
const obtenerPorId = async (req, res) => {
  let conn;

  try {
    const { id } = req.params;
    conn = await getConnection();

    const result = await conn.execute(
      `
      SELECT
        MI.ID_MOVIMIENTO,
        MI.ID_ARBOL,

        F.ID_FINCA,
        F.NOMBRE_FINCA AS nombre_finca,

        S.ID_SECTOR,
        S.NOMBRE_SECTOR AS nombre_sector,

        TA.NOMBRE_ARBOL AS nombre_arbol,

        MI.ID_TIPO_MOVIMIENTO,
        TMI.NOMBRE AS tipo_movimiento,

        MI.FECHA_MOVIMIENTO,
        MI.OBSERVACION AS observaciones
      FROM MOVIMIENTO_INVENTARIO_ARBOL MI
      LEFT JOIN ARBOL A
        ON A.ID_ARBOL = MI.ID_ARBOL
      LEFT JOIN SECTOR S
        ON S.ID_SECTOR = A.ID_SECTOR
      LEFT JOIN FINCA F
        ON F.ID_FINCA = S.ID_FINCA
      LEFT JOIN TIPO_VARIEDAD_ARBOL TA
        ON TA.ID_TIPO_ARBOL = A.ID_TIPO_VARIEDAD_ARBOL
      LEFT JOIN TIPO_MOVIMIENTO_INVENTARIO TMI
        ON TMI.ID_TIPO_MOVIMIENTO = MI.ID_TIPO_MOVIMIENTO
      WHERE MI.ID_MOVIMIENTO = :id
      `,
      { id: Number(id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const rows = result.rows || [];

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Movimiento no encontrado.',
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error('ERROR OBTENER MOVIMIENTO:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    await closeConnection(conn);
  }
};

// ----------------------------------------------------------
// INSERTAR
// ----------------------------------------------------------
const insertar = async (req, res) => {
  let conn;

  try {
    const {
      id_arbol,
      id_tipo_movimiento,
      fecha_movimiento,
      observaciones,
      usuario_registro,
    } = req.body;

    conn = await getConnection();

    await conn.execute(
      `
      INSERT INTO MOVIMIENTO_INVENTARIO_ARBOL (
        ID_ARBOL,
        ID_TIPO_MOVIMIENTO,
        FECHA_MOVIMIENTO,
        OBSERVACION,
        USUARIO_REGISTRO
      )
      VALUES (
        :id_arbol,
        :id_tipo_movimiento,
        TO_DATE(:fecha_movimiento, 'YYYY-MM-DD'),
        :observaciones,
        :usuario_registro
      )
      `,
      {
        id_arbol: Number(id_arbol),
        id_tipo_movimiento: Number(id_tipo_movimiento),
        fecha_movimiento: fecha_movimiento || null,
        observaciones: observaciones || null,
        usuario_registro: usuario_registro || 'Sistema',
      },
      { autoCommit: false }
    );

    await registrarAuditoria(conn, {
      tabla: 'MOVIMIENTO_INVENTARIO',
      operacion: 'INSERT',
      idRegistro: null,
      descripcion: `Nuevo movimiento de inventario registrado por ${usuario_registro || 'Sistema'}`,
      usuarioId: null,
      usuarioNombre: usuario_registro || 'Sistema',
    });

    await conn.commit();

    res.json({
      success: true,
      message: 'Movimiento registrado correctamente',
    });
  } catch (error) {
    if (conn) {
      try {
        await conn.rollback();
      } catch (_) {}
    }

    console.error('ERROR INSERTAR MOVIMIENTO:', error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    await closeConnection(conn);
  }
};

// ----------------------------------------------------------
// ACTUALIZAR
// ----------------------------------------------------------
const actualizar = async (req, res) => {
  let conn;

  try {
    const { id } = req.params;

    const {
      id_arbol,
      id_tipo_movimiento,
      fecha_movimiento,
      observaciones,
      usuario_registro,
    } = req.body;

    conn = await getConnection();

    await conn.execute(
      `
      UPDATE MOVIMIENTO_INVENTARIO_ARBOL
         SET ID_ARBOL = :id_arbol,
             ID_TIPO_MOVIMIENTO = :id_tipo_movimiento,
             FECHA_MOVIMIENTO = TO_DATE(:fecha_movimiento, 'YYYY-MM-DD'),
             OBSERVACION = :observaciones,
             USUARIO_REGISTRO = :usuario_registro
       WHERE ID_MOVIMIENTO = :id
      `,
      {
        id: Number(id),
        id_arbol: Number(id_arbol),
        id_tipo_movimiento: Number(id_tipo_movimiento),
        fecha_movimiento: fecha_movimiento || null,
        observaciones: observaciones || null,
        usuario_registro: usuario_registro || 'Sistema',
      },
      { autoCommit: false }
    );

    await registrarAuditoria(conn, {
      tabla: 'MOVIMIENTO_INVENTARIO',
      operacion: 'UPDATE',
      idRegistro: id,
      descripcion: `Movimiento #${id} actualizado por ${usuario_registro || 'Sistema'}`,
      usuarioId: null,
      usuarioNombre: usuario_registro || 'Sistema',
    });

    await conn.commit();

    res.json({
      success: true,
      message: 'Movimiento actualizado correctamente',
    });
  } catch (error) {
    if (conn) {
      try {
        await conn.rollback();
      } catch (_) {}
    }

    console.error('ERROR ACTUALIZAR MOVIMIENTO:', error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    await closeConnection(conn);
  }
};

// ----------------------------------------------------------
// ELIMINAR
// ----------------------------------------------------------
const eliminar = async (req, res) => {
  let conn;

  try {
    const { id } = req.params;
    conn = await getConnection();

    await conn.execute(
      `
      DELETE FROM MOVIMIENTO_INVENTARIO_ARBOL
      WHERE ID_MOVIMIENTO = :id
      `,
      { id: Number(id) },
      { autoCommit: true }
    );

    res.json({
      success: true,
      message: 'Movimiento eliminado correctamente',
    });
  } catch (error) {
    console.error('ERROR ELIMINAR MOVIMIENTO:', error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    await closeConnection(conn);
  }
};

module.exports = {
  listar,
  obtenerPorId,
  insertar,
  actualizar,
  eliminar,
};

