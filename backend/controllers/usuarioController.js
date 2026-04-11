// ============================================================
// controllers/usuarioController.js
// ============================================================
const oracledb = require('oracledb');
const bcrypt   = require('bcrypt');
const { getConnection, closeConnection } = require('../config/db');

const SALT_ROUNDS = 10;

// ----------------------------------------------------------
// LOGIN
// ----------------------------------------------------------
const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ ok: false, mensaje: 'Usuario y contraseña requeridos.' });
  }
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `BEGIN PKG_USUARIO.LOGIN(:p_username, :cursor); END;`,
      {
        p_username: username,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );
    const cursor = result.outBinds.cursor;
    const rows   = await cursor.getRows();
    await cursor.close();

    if (rows.length === 0) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas.' });
    }

    const usuario = rows[0];
    const hashBD  = usuario.PASSWORD_HASH || usuario.password_hash;

    // Comparar contraseña con bcrypt
    const valida  = await bcrypt.compare(password, hashBD);
    if (!valida) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas.' });
    }

    // Actualizar último acceso
    await conn.execute(
      `BEGIN PKG_USUARIO.ACTUALIZAR_ULTIMO_ACCESO(:p_id_usuario); END;`,
      { p_id_usuario: usuario.ID_USUARIO || usuario.id_usuario },
      { autoCommit: true }
    );

    // No devolver el hash
    delete usuario.PASSWORD_HASH;
    delete usuario.password_hash;

    res.status(200).json({ ok: true, data: usuario });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: err.message });
  } finally {
    await closeConnection(conn);
  }
};

// ----------------------------------------------------------
// REGISTRAR / INSERTAR
// ----------------------------------------------------------
const insertar = async (req, res) => {
  const {
    username, password_hash, email,
    nombres, apellidos, telefono,
    rol_id, estado,
  } = req.body;

  if (!username || !password_hash) {
    return res.status(400).json({ ok: false, mensaje: 'Username y contraseña requeridos.' });
  }

  let conn;
  try {
    // Encriptar contraseña
    const hash = await bcrypt.hash(password_hash, SALT_ROUNDS);

    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_USUARIO.INSERTAR(
         :p_rol_id, :p_username, :p_password_hash,
         :p_nombres, :p_apellidos, :p_email,
         :p_telefono, :p_estado
       ); END;`,
      {
        p_rol_id:        rol_id    || 3,
        p_username:      username,
        p_password_hash: hash,
        p_nombres:       nombres   || null,
        p_apellidos:     apellidos || null,
        p_email:         email     || null,
        p_telefono:      telefono  || null,
        p_estado:        estado    || 'ACTIVO',
      },
      { autoCommit: true }
    );
    res.status(201).json({ ok: true, mensaje: 'Usuario creado correctamente.' });
  } catch (err) {
    // Error de duplicado (username o email ya existe)
    if (err.message && err.message.includes('20001')) {
      return res.status(409).json({ ok: false, mensaje: 'El username o email ya existe.' });
    }
    res.status(500).json({ ok: false, mensaje: err.message });
  } finally {
    await closeConnection(conn);
  }
};

// ----------------------------------------------------------
// ACTUALIZAR
// ----------------------------------------------------------
const actualizar = async (req, res) => {
  const { id_usuario } = req.params;
  const { rol_id, username, nombres, apellidos, email, telefono, estado } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_USUARIO.ACTUALIZAR(
         :p_id_usuario, :p_rol_id, :p_username,
         :p_nombres, :p_apellidos, :p_email,
         :p_telefono, :p_estado
       ); END;`,
      {
        p_id_usuario: Number(id_usuario),
        p_rol_id:     rol_id    || 3,
        p_username:   username,
        p_nombres:    nombres   || null,
        p_apellidos:  apellidos || null,
        p_email:      email     || null,
        p_telefono:   telefono  || null,
        p_estado:     estado    || 'ACTIVO',
      },
      { autoCommit: true }
    );
    res.status(200).json({ ok: true, mensaje: 'Usuario actualizado correctamente.' });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: err.message });
  } finally {
    await closeConnection(conn);
  }
};

// ----------------------------------------------------------
// CAMBIAR PASSWORD
// ----------------------------------------------------------
const cambiarPassword = async (req, res) => {
  const { id_usuario } = req.params;
  const { password_nueva } = req.body;
  if (!password_nueva) {
    return res.status(400).json({ ok: false, mensaje: 'La nueva contraseña es requerida.' });
  }
  let conn;
  try {
    const hash = await bcrypt.hash(password_nueva, SALT_ROUNDS);
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_USUARIO.CAMBIAR_PASSWORD(:p_id_usuario, :p_password_hash); END;`,
      { p_id_usuario: Number(id_usuario), p_password_hash: hash },
      { autoCommit: true }
    );
    res.status(200).json({ ok: true, mensaje: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: err.message });
  } finally {
    await closeConnection(conn);
  }
};

// ----------------------------------------------------------
// ELIMINAR (lógico)
// ----------------------------------------------------------
const eliminar = async (req, res) => {
  const { id_usuario } = req.params;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_USUARIO.ELIMINAR(:p_id_usuario); END;`,
      { p_id_usuario: Number(id_usuario) },
      { autoCommit: true }
    );
    res.status(200).json({ ok: true, mensaje: 'Usuario eliminado correctamente.' });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: err.message });
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
      `BEGIN PKG_USUARIO.LISTAR(:cursor); END;`,
      { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );
    const cursor = result.outBinds.cursor;
    const rows   = await cursor.getRows();
    await cursor.close();
    res.status(200).json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: err.message });
  } finally {
    await closeConnection(conn);
  }
};

// ----------------------------------------------------------
// OBTENER POR ID
// ----------------------------------------------------------
const obtenerPorId = async (req, res) => {
  const { id_usuario } = req.params;
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `BEGIN PKG_USUARIO.OBTENER_POR_ID(:p_id_usuario, :cursor); END;`,
      {
        p_id_usuario: Number(id_usuario),
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );
    const cursor = result.outBinds.cursor;
    const rows   = await cursor.getRows();
    await cursor.close();
    if (rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });
    }
    res.status(200).json({ ok: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: err.message });
  } finally {
    await closeConnection(conn);
  }
};

module.exports = { login, insertar, actualizar, cambiarPassword, eliminar, listar, obtenerPorId };