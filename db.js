const oracledb = require('oracledb');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true; // Para que guarde los cambios automáticamente

const dbConfig = {
  user          : "TU_USUARIO",
  password      : "TU_CONTRASEÑA",
  connectString : "localhost:1521/xe" 
};

async function query(sql, binds = []) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(sql, binds);
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
}

module.exports = { query }; 