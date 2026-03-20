const oracledb = require("oracledb");
require("dotenv").config();

async function initDB() {
  try {
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
    await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMin: 1,
      poolMax: 10,
      poolIncrement: 1,
      poolAlias: "default"
    });

    
    console.log("Pool de Oracle creado correctamente");
  } catch (error) {
    console.error("Error creando pool de Oracle:", error);
    throw error;
  }
}

async function getConnection() {
  return await oracledb.getConnection("default");
}

async function closeConnection(conn) {
  if (conn) {
    try {
      await conn.close();
    } catch (error) {
      console.error("Error cerrando conexión:", error);
    }
  }
}

async function closePool() {
  try {
    await oracledb.getPool("default").close(10);
    console.log("Pool de Oracle cerrado");
  } catch (error) {
    console.error("Error cerrando pool:", error);
  }
}

module.exports = {
  initDB,
  getConnection,
  closeConnection,
  closePool,
  oracledb
};