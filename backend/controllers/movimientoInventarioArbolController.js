const { getConnection, closeConnection, oracledb } = require("../config/db");

const listar = async (req, res) => {
  let conn;

  try {
    conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        PKG_MOVIMIENTO_INVENTARIO_ARBOL.LISTAR(:cursor);
      END;
      `,
      {
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const resultSet = result.outBinds.cursor;
    const rows = await resultSet.getRows(1000);
    await resultSet.close();

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error("Error al listar movimientos de inventario:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
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
      `
      BEGIN
        PKG_MOVIMIENTO_INVENTARIO_ARBOL.OBTENER_POR_ID(:id_movimiento, :cursor);
      END;
      `,
      {
        id_movimiento: Number(id),
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const resultSet = result.outBinds.cursor;
    const rows = await resultSet.getRows(1);
    await resultSet.close();

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error("Error al obtener movimiento por ID:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
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
      observacion,
      usuario_registro
    } = req.body;

    conn = await getConnection();

    await conn.execute(
      `
      BEGIN
        PKG_MOVIMIENTO_INVENTARIO_ARBOL.INSERTAR(
          :id_arbol,
          :id_tipo_movimiento,
          :id_sector_origen,
          :id_sector_destino,
          :fecha_movimiento,
          :observacion,
          :usuario_registro
        );
      END;
      `,
      {
        id_arbol: Number(id_arbol),
        id_tipo_movimiento: Number(id_tipo_movimiento),
        id_sector_origen: id_sector_origen ? Number(id_sector_origen) : null,
        id_sector_destino: id_sector_destino ? Number(id_sector_destino) : null,
        fecha_movimiento: fecha_movimiento || null,
        observacion: observacion || null,
        usuario_registro: usuario_registro || "ADMIN"
      },
      { autoCommit: true }
    );

    res.json({
      success: true,
      message: "Movimiento de inventario registrado correctamente"
    });
  } catch (error) {
    console.error("Error al insertar movimiento de inventario:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  } finally {
    await closeConnection(conn);
  }
};

const actualizar = async (req, res) => {
  let conn;

  try {
    const { id } = req.params;
    const {
      id_arbol,
      id_tipo_movimiento,
      id_sector_origen,
      id_sector_destino,
      fecha_movimiento,
      observacion,
      usuario_registro
    } = req.body;

    conn = await getConnection();

    await conn.execute(
      `
      BEGIN
        PKG_MOVIMIENTO_INVENTARIO_ARBOL.ACTUALIZAR(
          :id_movimiento,
          :id_arbol,
          :id_tipo_movimiento,
          :id_sector_origen,
          :id_sector_destino,
          :fecha_movimiento,
          :observacion,
          :usuario_registro
        );
      END;
      `,
      {
        id_movimiento: Number(id),
        id_arbol: Number(id_arbol),
        id_tipo_movimiento: Number(id_tipo_movimiento),
        id_sector_origen: id_sector_origen ? Number(id_sector_origen) : null,
        id_sector_destino: id_sector_destino ? Number(id_sector_destino) : null,
        fecha_movimiento: fecha_movimiento || null,
        observacion: observacion || null,
        usuario_registro: usuario_registro || "ADMIN"
      },
      { autoCommit: true }
    );

    res.json({
      success: true,
      message: "Movimiento de inventario actualizado correctamente"
    });
  } catch (error) {
    console.error("Error al actualizar movimiento de inventario:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
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
      `
      BEGIN
        PKG_MOVIMIENTO_INVENTARIO_ARBOL.ELIMINAR(:id_movimiento);
      END;
      `,
      {
        id_movimiento: Number(id)
      },
      { autoCommit: true }
    );

    res.json({
      success: true,
      message: "Movimiento de inventario eliminado correctamente"
    });
  } catch (error) {
    console.error("Error al eliminar movimiento de inventario:", error);
    res.status(500).json({
      success: false,
      message: error.message
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
  eliminar
};