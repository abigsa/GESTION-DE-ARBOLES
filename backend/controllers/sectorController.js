// ============================================================
// controllers/sectorController.js
// ============================================================
const oracledb = require('oracledb');
const { getConnection, closeConnection } = require('../config/db');

// ----------------------------------------------------------
// INSERTAR
// ----------------------------------------------------------
const insertar = async (req, res) => {
  const { id_finca, nombre_sector, area_hectareas, numero_surcos, posiciones_por_surco, tipo_cultivo } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_SECTOR.INSERTAR(:id_finca, :nombre_sector, :area_hectareas, :numero_surcos, :posiciones_por_surco, :tipo_cultivo); END;`,
      {
        id_finca:             Number(id_finca),
        nombre_sector:        nombre_sector,
        area_hectareas:       area_hectareas       || null,
        numero_surcos:        numero_surcos        || null,
        posiciones_por_surco: posiciones_por_surco || null,
        tipo_cultivo:         tipo_cultivo         || null,
      },
      { autoCommit: true }
    );
    res.status(201).json({ success: true, message: 'Sector insertado correctamente.' });
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
  const { id_sector } = req.params;
  const { id_finca, nombre_sector, area_hectareas, numero_surcos, posiciones_por_surco, tipo_cultivo } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_SECTOR.ACTUALIZAR(:id_sector, :id_finca, :nombre_sector, :area_hectareas, :numero_surcos, :posiciones_por_surco, :tipo_cultivo); END;`,
      {
        id_sector:            Number(id_sector),
        id_finca:             Number(id_finca),
        nombre_sector:        nombre_sector,
        area_hectareas:       area_hectareas       || null,
        numero_surcos:        numero_surcos        || null,
        posiciones_por_surco: posiciones_por_surco || null,
        tipo_cultivo:         tipo_cultivo         || null,
      },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Sector actualizado correctamente.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
      { id_sector: Number(id_sector) },
      { autoCommit: true }
    );
    res.status(200).json({ success: true, message: 'Sector eliminado correctamente.' });
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
      `BEGIN PKG_SECTOR.LISTAR(:cursor); END;`,
      { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );
    const cursor = result.outBinds.cursor;
    const rows = await cursor.getRows();
    await cursor.close();
    res.status(200).json({ success: true, data: rows });
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
  const { id_sector } = req.params;
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `BEGIN PKG_SECTOR.OBTENER_POR_ID(:id_sector, :cursor); END;`,
      {
        id_sector: Number(id_sector),
        cursor:    { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );
    const cursor = result.outBinds.cursor;
    const rows = await cursor.getRows();
    await cursor.close();
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sector no encontrado.' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await closeConnection(conn);
  }
};

module.exports = { insertar, actualizar, eliminar, listar, obtenerPorId };
