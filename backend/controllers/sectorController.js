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

// Catálogo fijo de nombres permitidos
const SECTOR_NAMES = [
  'Sector Norte',
  'Sector Sur',
  'Sector Este',
  'Sector Oeste',
  'Sector Centro',
  'Sector Occidente',
];

const isValidSectorName = (value) => {
  if (!value || typeof value !== 'string') return false;
  return SECTOR_NAMES.includes(value.trim());
};

const existeSectorEnFinca = async (conn, { id_finca, nombre_sector, excluir_id_sector = null }) => {
  const sql = `
    SELECT COUNT(*) AS TOTAL
    FROM SECTOR
    WHERE ID_FINCA = :id_finca
      AND UPPER(NOMBRE_SECTOR) = UPPER(:nombre_sector)
      AND NVL(ACTIVO, 'S') = 'S'
      ${excluir_id_sector ? 'AND ID_SECTOR <> :excluir_id_sector' : ''}
  `;

  const binds = {
    id_finca: Number(id_finca),
    nombre_sector: nombre_sector?.trim(),
  };

  if (excluir_id_sector) {
    binds.excluir_id_sector = Number(excluir_id_sector);
  }

  const result = await conn.execute(
    sql,
    binds,
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  return Number(result.rows?.[0]?.TOTAL ?? 0) > 0;
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

    if (!id_finca) {
      return res.status(400).json({
        success: false,
        message: 'La finca es obligatoria.',
      });
    }

    if (!isValidSectorName(nombre_sector)) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del sector no es válido. Debe seleccionarse del catálogo permitido.',
      });
    }

    const yaExiste = await existeSectorEnFinca(conn, {
      id_finca,
      nombre_sector,
    });

    if (yaExiste) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un sector con ese nombre en la finca seleccionada.',
      });
    }

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
        nombre_sector:        nombre_sector?.trim() ?? null,
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

    if (!id_finca) {
      return res.status(400).json({
        success: false,
        message: 'La finca es obligatoria.',
      });
    }

    if (!isValidSectorName(nombre_sector)) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del sector no es válido. Debe seleccionarse del catálogo permitido.',
      });
    }

    const yaExiste = await existeSectorEnFinca(conn, {
      id_finca,
      nombre_sector,
      excluir_id_sector: id_sector,
    });

    if (yaExiste) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un sector con ese nombre en la finca seleccionada.',
      });
    }

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
        nombre_sector:        nombre_sector?.trim() ?? null,
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
//   GET /api/sector
//   GET /api/sector?id_finca=1
// Solo devuelve sectores activos
// ----------------------------------------------------------
const listar = async (req, res) => {
  const { id_finca } = req.query;
  let conn;

  try {
    conn = await getConnection();

    // Si viene filtro por finca
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
            TIPO_CULTIVO,
            ACTIVO
          FROM SECTOR
          WHERE ID_FINCA = :id_finca
            AND NVL(ACTIVO, 'S') = 'S'
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

    // Listado general de sectores activos
    const result = await conn.execute(
      `
        SELECT
          ID_SECTOR,
          ID_FINCA,
          NOMBRE_SECTOR,
          AREA_HECTAREAS,
          NUMERO_SURCOS,
          POSICIONES_POR_SURCO,
          TIPO_CULTIVO,
          ACTIVO
        FROM SECTOR
        WHERE NVL(ACTIVO, 'S') = 'S'
        ORDER BY ID_FINCA, NOMBRE_SECTOR
      `,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({
      success: true,
      data: result.rows,
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
// Solo devuelve si está activo
// ----------------------------------------------------------
const obtenerPorId = async (req, res) => {
  const { id_sector } = req.params;
  let conn;

  try {
    conn = await getConnection();

    const result = await conn.execute(
      `
        SELECT
          ID_SECTOR,
          ID_FINCA,
          NOMBRE_SECTOR,
          AREA_HECTAREAS,
          NUMERO_SURCOS,
          POSICIONES_POR_SURCO,
          TIPO_CULTIVO,
          ACTIVO
        FROM SECTOR
        WHERE ID_SECTOR = :id_sector
          AND NVL(ACTIVO, 'S') = 'S'
      `,
      { id_sector: toNullableNumber(id_sector) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sector no encontrado.',
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
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