const oracledb = require("oracledb");
const { getConnection, closeConnection } = require("../config/db");

const listar = async (req, res) => {
  let conn;

  try {
    conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        PKG_TIPO_MOVIMIENTO_INVENTARIO.LISTAR(:cursor);
      END;
      `,
      {
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );

    const cursor = result.outBinds.cursor;
    const rows = await cursor.getRows(1000);
    await cursor.close();

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error al listar tipos de movimiento inventario:", error);
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
};