// ============================================================
// controllers/sectorController.js
// ============================================================
const oracledb = require('oracledb');
const { getConnection, closeConnection } = require('../config/db');

// ----------------------------------------------------------
// Helpers
// ----------------------------------------------------------
const toNullableNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

// ----------------------------------------------------------
// INSERTAR
// ----------------------------------------------------------
const insertar = async (req, res) => {
  const {
    id_finca,
    nombre_sector,
    area_hectareas,
    numero_surcos,
    posiciones_por_surco,
    tipo_cultivo,
  } = req.body;

  let conn;

  try {
    conn = await getConnection();

    await conn.execute(
      `BEGIN
         PKG_SECTOR.INSERTAR(
           :id_finca,
           :nombre_sector,
           :area_hectareas,
           :numero_surcos,
           :posiciones_por_surco,
           :tipo_cultivo
         );
       END;`,
      {
        id_finca:             toNullableNumber(id_finca),
        nombre_sector:        nombre_sector ?? null,
        area_hectareas:       toNullableNumber(area_hectareas),
        numero_surcos:        toNullableNumber(numero_surcos),
        posiciones_por_surco: toNullableNumber(posiciones_por_surco),
        tipo_cultivo:         tipo_cultivo ?? null,
      },
      { autoCommit: true }
    );

    res.status(201).json({
      success: true,
      message: 'Sector insertado correctamente.',
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
// ACTUALIZAR
// ----------------------------------------------------------
const actualizar = async (req, res) => {
  const { id_sector } = req.params;
  const {
    id_finca,
    nombre_sector,
    area_hectareas,
    numero_surcos,
    posiciones_por_surco,
    tipo_cultivo,
  } = req.body;

  let conn;

  try {
    conn = await getConnection();

    await conn.execute(
      `BEGIN
         PKG_SECTOR.ACTUALIZAR(
           :id_sector,
           :id_finca,
           :nombre_sector,
           :area_hectareas,
           :numero_surcos,
           :posiciones_por_surco,
           :tipo_cultivo
         );
       END;`,
      {
        id_sector:            toNullableNumber(id_sector),
        id_finca:             toNullableNumber(id_finca),
        nombre_sector:        nombre_sector ?? null,
        area_hectareas:       toNullableNumber(area_hectareas),
        numero_surcos:        toNullableNumber(numero_surcos),
        posiciones_por_surco: toNullableNumber(posiciones_por_surco),
        tipo_cultivo:         tipo_cultivo ?? null,
      },
      { autoCommit: true }
    );

    res.status(200).json({
      success: true,
      message: 'Sector actualizado correctamente.',
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
// ELIMINAR (DELETE LÓGICO)
// ----------------------------------------------------------
const eliminar = async (req, res) => {
  const { id_sector } = req.params;
  let conn;

  try {
    conn = await getConnection();

    await conn.execute(
      `BEGIN PKG_SECTOR.ELIMINAR(:id_sector); END;`,
      { id_sector: toNullableNumber(id_sector) },
      { autoCommit: true }
    );

    res.status(200).json({
      success: true,
      message: 'Sector eliminado correctamente.',
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
// LISTAR
// Soporta:
//   GET /api/sectores
//   GET /api/sectores?id_finca=1
// ----------------------------------------------------------
const listar = async (req, res) => {
  const { id_finca } = req.query;
  let conn;

  try {
    conn = await getConnection();

    // Si viene filtro por finca, consultamos directo en SQL
    if (id_finca !== undefined && id_finca !== null && id_finca !== '') {
      const result = await conn.execute(
        `
          SELECT
            ID_SECTOR,
            ID_FINCA,
            NOMBRE_SECTOR,
            AREA_HECTAREAS,
            NUMERO_SURCOS,
            POSICIONES_POR_SURCO,
            TIPO_CULTIVO
          FROM SECTOR
          WHERE ID_FINCA = :id_finca
          ORDER BY NOMBRE_SECTOR
        `,
        { id_finca: Number(id_finca) },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return res.status(200).json({
        success: true,
        data: result.rows,
      });
    }

    // Si no viene id_finca, mantenemos el package actual
    const result = await conn.execute(
      `BEGIN PKG_SECTOR.LISTAR(:cursor); END;`,
      { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );

    const cursor = result.outBinds.cursor;
    const rows = await cursor.getRows(1000);
    await cursor.close();

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error('Error al listar sectores:', err);

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
  const { id_sector } = req.params;
  let conn;

  try {
    conn = await getConnection();

    const result = await conn.execute(
      `BEGIN PKG_SECTOR.OBTENER_POR_ID(:id_sector, :cursor); END;`,
      {
        id_sector: toNullableNumber(id_sector),
        cursor:    { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );

    const cursor = result.outBinds.cursor;
    const rows = await cursor.getRows(100);
    await cursor.close();

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sector no encontrado.',
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