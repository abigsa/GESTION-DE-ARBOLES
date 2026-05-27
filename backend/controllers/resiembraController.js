const oracledb = require('oracledb');
const { registrar: registrarAuditoria } = require('./auditoriaController');
const { getConnection, closeConnection } = require('../config/db');

// ----------------------------------------------------------
// QUERY BASE
// ----------------------------------------------------------
const baseResiembraQuery = `
  SELECT
    R.ID_RESIEMBRA,
    R.ID_ARBOL_NUEVO,

    F.ID_FINCA,
    F.NOMBRE_FINCA AS nombre_finca,

    S.ID_SECTOR,
    S.NOMBRE_SECTOR AS nombre_sector,

    TA.NOMBRE_ARBOL AS nombre_arbol,

    R.FECHA_RESIEMBRA,
    R.MOTIVO
  FROM RESIEMBRA R
  INNER JOIN ARBOL A
    ON A.ID_ARBOL = R.ID_ARBOL_NUEVO
  INNER JOIN SECTOR S
    ON S.ID_SECTOR = A.ID_SECTOR
  INNER JOIN FINCA F
    ON F.ID_FINCA = S.ID_FINCA
  LEFT JOIN TIPO_VARIEDAD_ARBOL TA
    ON TA.ID_TIPO_ARBOL = A.ID_TIPO_VARIEDAD_ARBOL
  WHERE NVL(A.ACTIVO, 'S') = 'S'
  AND NVL(S.ACTIVO, 'S') = 'S'
  AND NVL(F.ACTIVO, 'S') = 'S'
`;

// WHERE NVL(A.ACTIVO, 'S') = 'S'
//    AND NVL(S.ACTIVO, 'S') = 'S'
//    AND NVL(F.ACTIVO, 'S') = 'S'
// ----------------------------------------------------------
// INSERTAR
// ----------------------------------------------------------
const insertar = async (req, res) => {
  const { id_arbol_nuevo, fecha_resiembra, motivo } = req.body;
  let conn;

  try {
    conn = await getConnection();

    await conn.execute(
      `
      BEGIN
        PKG_RESIEMBRA.INSERTAR(
          :id_arbol_nuevo,
          :fecha_resiembra,
          :motivo
        );
      END;
      `,
      {
        id_arbol_nuevo: Number(id_arbol_nuevo),
        fecha_resiembra: fecha_resiembra || null,
        motivo: motivo || null,
      },
      { autoCommit: true }
    );

    await registrarAuditoria(conn, {
  tabla: 'RESIEMBRA',
  operacion: 'INSERT',
  idRegistro: null,
  descripcion: 'Nuevo registro en RESIEMBRA',
  usuarioId: req.usuario?.id || null,
  usuarioNombre: req.usuario?.username || 'Sistema',
});

    res.status(201).json({
      success: true,
      message: 'Resiembra insertada correctamente.',
    });
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
      `
      BEGIN
        PKG_RESIEMBRA.ACTUALIZAR(
          :id_resiembra,
          :id_arbol_nuevo,
          :fecha_resiembra,
          :motivo
        );
      END;
      `,
      {
        id_resiembra: Number(id_resiembra),
        id_arbol_nuevo: Number(id_arbol_nuevo),
        fecha_resiembra: fecha_resiembra || null,
        motivo: motivo || null,
      },
      { autoCommit: true }
    );

    await registrarAuditoria(conn, {
  tabla: 'RESIEMBRA',
  operacion: 'UPDATE',
  idRegistro: id_resiembra,
  descripcion: 'Registro actualizado en RESIEMBRA',
  usuarioId: req.usuario?.id || null,
  usuarioNombre: req.usuario?.username || 'Sistema',
});

    res.status(200).json({
      success: true,
      message: 'Resiembra actualizada correctamente.',
    });
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

    await registrarAuditoria(conn, {
  tabla: 'RESIEMBRA',
  operacion: 'DELETE',
  idRegistro: id_resiembra,
  descripcion: 'Registro eliminado en RESIEMBRA',
  usuarioId: req.usuario?.id || null,
  usuarioNombre: req.usuario?.username || 'Sistema',
});

    res.status(200).json({
      success: true,
      message: 'Resiembra eliminada correctamente.',
    });
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
      ${baseResiembraQuery}
      ORDER BY R.ID_RESIEMBRA
      `,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({
      success: true,
      data: result.rows,
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
  const { id_resiembra } = req.params;
  let conn;

  try {
    conn = await getConnection();

    const result = await conn.execute(
      `
      ${baseResiembraQuery}
        AND R.ID_RESIEMBRA = :id_resiembra
      ORDER BY R.ID_RESIEMBRA
      `,
      { id_resiembra: Number(id_resiembra) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const rows = result.rows || [];

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resiembra no encontrada.',
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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