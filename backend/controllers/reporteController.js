const oracledb = require('oracledb');
const { getConnection, closeConnection } = require('../config/db');

const usuariosMasActivos = async (req, res) => {

  let conn;

  try {

    conn = await getConnection();

    const result = await conn.execute(
      `
      SELECT
        A.USUARIO_ID,
        A.USUARIO_NOMBRE,

        COUNT(*) AS TOTAL_ACCIONES,

        SUM(CASE WHEN A.TABLA = 'ARBOL' THEN 1 ELSE 0 END) AS TOTAL_ARBOLES,

        SUM(CASE WHEN A.TABLA = 'FINCA' THEN 1 ELSE 0 END) AS TOTAL_FINCAS,

        SUM(CASE WHEN A.TABLA = 'REGISTRO_PLAGA' THEN 1 ELSE 0 END) AS TOTAL_PLAGAS,

        SUM(CASE WHEN A.TABLA = 'REGISTRO_TRATAMIENTO' THEN 1 ELSE 0 END) AS TOTAL_TRATAMIENTOS,

        MAX(A.FECHA_ACCION) AS ULTIMA_ACCION

      FROM AUDITORIA_ACCIONES A

      WHERE A.USUARIO_ID IS NOT NULL

      GROUP BY
        A.USUARIO_ID,
        A.USUARIO_NOMBRE

      ORDER BY TOTAL_ACCIONES DESC
      `,
      {},
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT
      }
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

module.exports = {
  usuariosMasActivos,
};