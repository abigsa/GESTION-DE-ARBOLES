// ============================================================
// controllers/registroPlagaController.js
// ============================================================
const oracledb = require('oracledb');
const { registrar: registrarAuditoria } = require('./auditoriaController');
const { getConnection, closeConnection } = require('../config/db');

// ----------------------------------------------------------
// INSERTAR
// ----------------------------------------------------------
const insertar = async (req, res) => {
  const { id_arbol, id_plaga, fecha_deteccion, fecha_resolucion, observaciones } = req.body;
  let conn;

  try {
    conn = await getConnection();

    await conn.execute(
      `
      BEGIN
        PKG_REGISTRO_PLAGA.INSERTAR(
          :id_arbol,
          :id_plaga,
          :fecha_deteccion,
          :fecha_resolucion,
          :observaciones
        );
      END;
      `,
      {
        id_arbol: id_arbol ? Number(id_arbol) : null,
        id_plaga: id_plaga ? Number(id_plaga) : null,
        fecha_deteccion: fecha_deteccion || null,
        fecha_resolucion: fecha_resolucion || null,
        observaciones: observaciones || null,
      },
      { autoCommit: true }
    );

    await registrarAuditoria(conn, {
      tabla: 'REGISTRO_PLAGA',
      operacion: 'INSERT',
      idRegistro: null,
      descripcion: 'Nuevo registro en REGISTRO_PLAGA',
      usuarioId: req.usuario?.id || null,
      usuarioNombre: req.usuario?.username || 'Sistema',
    });

    res.status(201).json({
      success: true,
      message: 'Registro de plaga insertado correctamente.',
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
  const { id_registro } = req.params;
  const { id_arbol, id_plaga, fecha_deteccion, fecha_resolucion, observaciones } = req.body;
  let conn;

  try {
    conn = await getConnection();

    await conn.execute(
      `
      BEGIN
        PKG_REGISTRO_PLAGA.ACTUALIZAR(
          :id_registro,
          :id_arbol,
          :id_plaga,
          :fecha_deteccion,
          :fecha_resolucion,
          :observaciones
        );
      END;
      `,
      {
        id_registro: Number(id_registro),
        id_arbol: id_arbol ? Number(id_arbol) : null,
        id_plaga: id_plaga ? Number(id_plaga) : null,
        fecha_deteccion: fecha_deteccion || null,
        fecha_resolucion: fecha_resolucion || null,
        observaciones: observaciones || null,
      },
      { autoCommit: true }
    );

    await registrarAuditoria(conn, {
      tabla: 'REGISTRO_PLAGA',
      operacion: 'UPDATE',
      idRegistro: null,
      descripcion: 'Registro actualizado en REGISTRO_PLAGA',
      usuarioId: req.usuario?.id || null,
      usuarioNombre: req.usuario?.username || 'Sistema',
    });

    res.status(200).json({
      success: true,
      message: 'Registro de plaga actualizado correctamente.',
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
  const { id_registro } = req.params;
  let conn;

  try {
    conn = await getConnection();

    await conn.execute(
      `BEGIN PKG_REGISTRO_PLAGA.ELIMINAR(:id_registro); END;`,
      { id_registro: Number(id_registro) },
      { autoCommit: true }
    );

    await registrarAuditoria(conn, {
      tabla: 'REGISTRO_PLAGA',
      operacion: 'DELETE',
      idRegistro: null,
      descripcion: 'Registro eliminado en REGISTRO_PLAGA',
      usuarioId: null,
      usuarioNombre: 'Sistema',
    });

    res.status(200).json({
      success: true,
      message: 'Registro de plaga eliminado correctamente.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await closeConnection(conn);
  }
};

// ----------------------------------------------------------
// QUERY BASE
// ----------------------------------------------------------
const baseRegistroPlagaQuery = `
  SELECT
    RP.ID_REGISTRO,
    RP.ID_ARBOL,

    F.ID_FINCA,
    F.NOMBRE_FINCA AS nombre_finca,

    A.ID_SECTOR,
    S.NOMBRE_SECTOR AS nombre_sector,

    TA.NOMBRE_ARBOL AS nombre_arbol,

    RP.ID_PLAGA,
    P.NOMBRE_PLAGA AS nombre_plaga,
    P.NIVEL_RIESGO AS nivel_riesgo,

    RP.FECHA_DETECCION,
    RP.FECHA_RESOLUCION,
    RP.OBSERVACIONES,

    A.NUMERO_SURCO AS numero_surco
  FROM REGISTRO_PLAGA RP
  INNER JOIN ARBOL A
    ON A.ID_ARBOL = RP.ID_ARBOL
  INNER JOIN SECTOR S
    ON S.ID_SECTOR = A.ID_SECTOR
  INNER JOIN FINCA F
    ON F.ID_FINCA = S.ID_FINCA
  LEFT JOIN TIPO_VARIEDAD_ARBOL TA
    ON TA.ID_TIPO_ARBOL = A.ID_TIPO_VARIEDAD_ARBOL
  LEFT JOIN PLAGA_ENFERMEDAD P
    ON P.ID_PLAGA = RP.ID_PLAGA
  WHERE NVL(RP.ACTIVO, 'S') = 'S'
    AND NVL(A.ACTIVO, 'S') = 'S'
    AND NVL(S.ACTIVO, 'S') = 'S'
    AND NVL(F.ACTIVO, 'S') = 'S'
`;

// ----------------------------------------------------------
// LISTAR
// ----------------------------------------------------------
const listar = async (req, res) => {
  let conn;

  try {
    conn = await getConnection();

    const result = await conn.execute(
      `
      ${baseRegistroPlagaQuery}
      ORDER BY RP.ID_REGISTRO
      `,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
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
      `
      ${baseRegistroPlagaQuery}
        AND RP.ID_REGISTRO = :id_registro
      ORDER BY RP.ID_REGISTRO
      `,
      { id_registro: Number(id_registro) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const rows = result.rows || [];

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registro de plaga no encontrado.',
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