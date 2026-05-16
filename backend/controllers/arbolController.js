const oracledb = require('oracledb');
const { getConnection, closeConnection } = require('../config/db');
const { registrar: auditoria } = require('./auditoriaController');

const toNullableNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const validarPosicionOcupada = async (conn, {
  id_arbol = null,
  id_sector,
  numero_surco,
  posicion_y,
}) => {
  const result = await conn.execute(
    `
    SELECT COUNT(*) AS TOTAL
    FROM ARBOL
    WHERE ID_SECTOR = :id_sector
      AND NUMERO_SURCO = :numero_surco
      AND POSICION_Y = :posicion_y
      AND NVL(ACTIVO, 'S') = 'S'
      ${id_arbol ? 'AND ID_ARBOL <> :id_arbol' : ''}
    `,
    {
      id_sector: Number(id_sector),
      numero_surco: Number(numero_surco),
      posicion_y: Number(posicion_y),
      ...(id_arbol ? { id_arbol: Number(id_arbol) } : {}),
    },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  return Number(result.rows?.[0]?.TOTAL || 0) > 0;
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
    posicion_y,
    descripcion,
  } = req.body;

  let conn;

  try {
    conn = await getConnection();

    if (!id_sector || !id_tipo_variedad_arbol || !id_estado || !numero_surco || !posicion_y) {
      return res.status(400).json({
        success: false,
        message: 'Sector, variedad, estado, surco y posición son obligatorios.',
      });
    }

    const ocupado = await validarPosicionOcupada(conn, {
      id_sector,
      numero_surco,
      posicion_y,
    });

    if (ocupado) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un árbol activo en ese sector, surco y posición.',
      });
    }

    await conn.execute(
      `
      BEGIN
        PKG_ARBOL.INSERTAR(
          :id_sector,
          :id_tipo_variedad_arbol,
          :id_estado,
          :numero_surco,
          :posicion_x,
          :posicion_y,
          :descripcion
        );
      END;
      `,
      {
        id_sector: toNullableNumber(id_sector),
        id_tipo_variedad_arbol: toNullableNumber(id_tipo_variedad_arbol),
        id_estado: toNullableNumber(id_estado),
        numero_surco: toNullableNumber(numero_surco),
        posicion_x: toNullableNumber(numero_surco),
        posicion_y: toNullableNumber(posicion_y),
        descripcion: descripcion ?? null,
      }
    );

    await auditoria(conn, {
      tabla: 'ARBOL',
      operacion: 'INSERT',
      descripcion: 'Árbol registrado',
    });

    await conn.commit();

    res.status(201).json({
      success: true,
      message: 'Árbol insertado correctamente.',
    });
  } catch (err) {
    if (conn) {
      try { await conn.rollback(); } catch (_) {}
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
  const { id_arbol } = req.params;
  const {
    id_sector,
    id_tipo_variedad_arbol,
    id_estado,
    numero_surco,
    posicion_y,
    descripcion,
  } = req.body;

  let conn;

  try {
    conn = await getConnection();

    if (!id_sector || !id_tipo_variedad_arbol || !id_estado || !numero_surco || !posicion_y) {
      return res.status(400).json({
        success: false,
        message: 'Sector, variedad, estado, surco y posición son obligatorios.',
      });
    }

    const ocupado = await validarPosicionOcupada(conn, {
      id_arbol,
      id_sector,
      numero_surco,
      posicion_y,
    });

    if (ocupado) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe otro árbol activo en ese sector, surco y posición.',
      });
    }

    await conn.execute(
      `
      BEGIN
        PKG_ARBOL.ACTUALIZAR(
          :id_arbol,
          :id_sector,
          :id_tipo_variedad_arbol,
          :id_estado,
          :numero_surco,
          :posicion_x,
          :posicion_y,
          :descripcion
        );
      END;
      `,
      {
        id_arbol: toNullableNumber(id_arbol),
        id_sector: toNullableNumber(id_sector),
        id_tipo_variedad_arbol: toNullableNumber(id_tipo_variedad_arbol),
        id_estado: toNullableNumber(id_estado),
        numero_surco: toNullableNumber(numero_surco),
        posicion_x: toNullableNumber(numero_surco),
        posicion_y: toNullableNumber(posicion_y),
        descripcion: descripcion ?? null,
      }
    );

    await auditoria(conn, {
      tabla: 'ARBOL',
      operacion: 'UPDATE',
      descripcion: 'Árbol actualizado',
    });

    await conn.commit();

    res.status(200).json({
      success: true,
      message: 'Árbol actualizado correctamente.',
    });
  } catch (err) {
    if (conn) {
      try { await conn.rollback(); } catch (_) {}
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
  const { id_arbol } = req.params;
  let conn;

  try {
    conn = await getConnection();

    await conn.execute(
      `BEGIN PKG_ARBOL.ELIMINAR(:id_arbol); END;`,
      { id_arbol: toNullableNumber(id_arbol) }
    );

    await auditoria(conn, {
      tabla: 'ARBOL',
      operacion: 'DELETE',
      descripcion: 'Árbol eliminado',
    });

    await conn.commit();

    res.status(200).json({
      success: true,
      message: 'Árbol eliminado correctamente.',
    });
  } catch (err) {
    if (conn) {
      try { await conn.rollback(); } catch (_) {}
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
// LISTAR
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
          S.ID_FINCA,
          A.ID_ESTADO,
          A.NUMERO_SURCO,
          A.POSICION_X,
          A.POSICION_Y,
          A.DESCRIPCION,
          TA.NOMBRE_ARBOL,
          EA.NOMBRE_ESTADO,
          (
            NVL(TA.NOMBRE_ARBOL, 'Sin variedad') ||
            ' — Árbol #' || A.ID_ARBOL ||
            CASE
              WHEN A.NUMERO_SURCO IS NOT NULL
              THEN ' — Surco ' || A.NUMERO_SURCO
              ELSE ''
            END ||
            CASE
              WHEN A.POSICION_Y IS NOT NULL
              THEN ' — Posición ' || A.POSICION_Y
              ELSE ''
            END
          ) AS LABEL
        FROM ARBOL A
        INNER JOIN SECTOR S
          ON S.ID_SECTOR = A.ID_SECTOR
        LEFT JOIN TIPO_VARIEDAD_ARBOL TA
          ON TA.ID_TIPO_ARBOL = A.ID_TIPO_VARIEDAD_ARBOL
        LEFT JOIN ESTADO_ARBOL EA
          ON EA.ID_ESTADO = A.ID_ESTADO
        WHERE A.ID_SECTOR = :id_sector
          AND NVL(A.ACTIVO, 'S') = 'S'
          AND NVL(S.ACTIVO, 'S') = 'S'
          AND UPPER(NVL(EA.NOMBRE_ESTADO, 'SIN ESTADO')) NOT IN ('MUERTO', 'RESIEMBRA')
        ORDER BY A.NUMERO_SURCO, A.POSICION_Y, A.ID_ARBOL
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
      `
      SELECT
        A.ID_ARBOL,
        A.ID_SECTOR,
        S.ID_FINCA,
        S.NOMBRE_SECTOR AS nombre_sector,
        F.NOMBRE_FINCA AS nombre_finca,
        A.ID_TIPO_VARIEDAD_ARBOL,
        TA.NOMBRE_ARBOL,
        A.ID_ESTADO,
        EA.NOMBRE_ESTADO,
        A.NUMERO_SURCO,
        A.POSICION_X,
        A.POSICION_Y,
        A.DESCRIPCION,
        A.ACTIVO
      FROM ARBOL A
      INNER JOIN SECTOR S
        ON S.ID_SECTOR = A.ID_SECTOR
      INNER JOIN FINCA F
        ON F.ID_FINCA = S.ID_FINCA
      LEFT JOIN TIPO_VARIEDAD_ARBOL TA
        ON TA.ID_TIPO_ARBOL = A.ID_TIPO_VARIEDAD_ARBOL
      LEFT JOIN ESTADO_ARBOL EA
        ON EA.ID_ESTADO = A.ID_ESTADO
      WHERE NVL(A.ACTIVO, 'S') = 'S'
        AND NVL(S.ACTIVO, 'S') = 'S'
        AND NVL(F.ACTIVO, 'S') = 'S'
      ORDER BY A.ID_ARBOL
      `,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({
      success: true,
      data: result.rows,
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
      `
      SELECT
        A.ID_ARBOL,
        A.ID_SECTOR,
        S.ID_FINCA,
        S.NOMBRE_SECTOR,
        F.NOMBRE_FINCA,
        A.ID_TIPO_VARIEDAD_ARBOL,
        TA.NOMBRE_ARBOL,
        A.ID_ESTADO,
        EA.NOMBRE_ESTADO,
        A.NUMERO_SURCO,
        A.POSICION_X,
        A.POSICION_Y,
        A.DESCRIPCION,
        A.ACTIVO
      FROM ARBOL A
      INNER JOIN SECTOR S
        ON S.ID_SECTOR = A.ID_SECTOR
      INNER JOIN FINCA F
        ON F.ID_FINCA = S.ID_FINCA
      LEFT JOIN TIPO_VARIEDAD_ARBOL TA
        ON TA.ID_TIPO_ARBOL = A.ID_TIPO_VARIEDAD_ARBOL
      LEFT JOIN ESTADO_ARBOL EA
        ON EA.ID_ESTADO = A.ID_ESTADO
      WHERE A.ID_ARBOL = :id_arbol
        AND NVL(A.ACTIVO, 'S') = 'S'
      `,
      { id_arbol: toNullableNumber(id_arbol) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Árbol no encontrado.',
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