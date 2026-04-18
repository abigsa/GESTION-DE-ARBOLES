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
    id_sector,
    id_tipo_variedad_arbol,
    id_estado,
    numero_surco,
    posicion_x,
    descripcion
  } = req.body;

  let conn;

  try {
    conn = await getConnection();

    await conn.execute(
      `BEGIN
         PKG_ARBOL.INSERTAR(
           :id_sector,
           :id_tipo_variedad_arbol,
           :id_estado,
           :numero_surco,
           :posicion_x,
           :descripcion
         );
       END;`,
      {
        id_sector: toNullableNumber(id_sector),
        id_tipo_variedad_arbol: toNullableNumber(id_tipo_variedad_arbol),
        id_estado: toNullableNumber(id_estado),
        numero_surco: toNullableNumber(numero_surco),
        posicion_x: toNullableNumber(posicion_x),
        descripcion: descripcion ?? null,
      },
      { autoCommit: true }
    );

    res.status(201).json({
      success: true,
      message: 'Árbol insertado correctamente.',
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
  const { id_arbol } = req.params;
  const {
    id_sector,
    id_tipo_variedad_arbol,
    id_estado,
    numero_surco,
    posicion_x,
    descripcion
  } = req.body;

  let conn;

  try {
    conn = await getConnection();

    await conn.execute(
      `BEGIN
         PKG_ARBOL.ACTUALIZAR(
           :id_arbol,
           :id_sector,
           :id_tipo_variedad_arbol,
           :id_estado,
           :numero_surco,
           :posicion_x,
           :descripcion
         );
       END;`,
      {
        id_arbol: toNullableNumber(id_arbol),
        id_sector: toNullableNumber(id_sector),
        id_tipo_variedad_arbol: toNullableNumber(id_tipo_variedad_arbol),
        id_estado: toNullableNumber(id_estado),
        numero_surco: toNullableNumber(numero_surco),
        posicion_x: toNullableNumber(posicion_x),
        descripcion: descripcion ?? null,
      },
      { autoCommit: true }
    );

    res.status(200).json({
      success: true,
      message: 'Árbol actualizado correctamente.',
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
// ELIMINAR
// ----------------------------------------------------------
const eliminar = async (req, res) => {
  const { id_arbol } = req.params;
  let conn;

  try {
    conn = await getConnection();

    await conn.execute(
      `BEGIN PKG_ARBOL.ELIMINAR(:id_arbol); END;`,
      { id_arbol: toNullableNumber(id_arbol) },
      { autoCommit: true }
    );

    res.status(200).json({
      success: true,
      message: 'Árbol eliminado correctamente.',
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
//   GET /api/arboles
//   GET /api/arboles?id_sector=12
// ----------------------------------------------------------
const listar = async (req, res) => {
  const { id_sector } = req.query;
  let conn;

  try {
    conn = await getConnection();

    if (id_sector !== undefined && id_sector !== null && id_sector !== '') {
      const result = await conn.execute(
        `
          SELECT
            A.ID_ARBOL,
            A.ID_SECTOR,
            A.NUMERO_SURCO,
            A.POSICION_X,
            A.DESCRIPCION,
            (
              NVL(TA.NOMBRE_ARBOL, 'Sin variedad') ||
              ' — Árbol #' || A.ID_ARBOL ||
              CASE
                WHEN A.NUMERO_SURCO IS NOT NULL
                THEN ' — Surco ' || A.NUMERO_SURCO
                ELSE ''
              END ||
              CASE
                WHEN A.POSICION_X IS NOT NULL
                THEN ' — Posición ' || A.POSICION_X
                ELSE ''
              END
            ) AS LABEL
          FROM ARBOL A
          LEFT JOIN TIPO_VARIEDAD_ARBOL TA
            ON TA.ID_TIPO_ARBOL = A.ID_TIPO_VARIEDAD_ARBOL
          WHERE A.ID_SECTOR = :id_sector
          ORDER BY A.NUMERO_SURCO, A.POSICION_X, A.ID_ARBOL
        `,
        { id_sector: Number(id_sector) },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return res.status(200).json({
        success: true,
        data: result.rows,
      });
    }

    const result = await conn.execute(
      `BEGIN PKG_ARBOL.LISTAR(:cursor); END;`,
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
    console.error('Error al listar árboles:', err);
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
  const { id_arbol } = req.params;
  let conn;

  try {
    conn = await getConnection();

    const result = await conn.execute(
      `BEGIN PKG_ARBOL.OBTENER_POR_ID(:id_arbol, :cursor); END;`,
      {
        id_arbol: toNullableNumber(id_arbol),
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );

    const cursor = result.outBinds.cursor;
    const rows = await cursor.getRows(100);
    await cursor.close();

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Árbol no encontrado.',
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