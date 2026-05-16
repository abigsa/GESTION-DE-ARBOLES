// ============================================================
// controllers/usuarioController.js
// ============================================================
const oracledb = require('oracledb');
const { registrar: registrarAuditoria } = require('./auditoriaController');
const bcrypt   = require('bcrypt');
const crypto   = require('crypto');
const { generarToken } = require('../middleware/auth');
const { getConnection, closeConnection } = require('../config/db');

const SALT_ROUNDS = 10;

// ----------------------------------------------------------
// LOGIN — devuelve JWT en la respuesta
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
      { p_username: username, cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );
    const cursor = result.outBinds.cursor;
    const rows   = await cursor.getRows();
    await cursor.close();

    if (rows.length === 0) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas.' });
    }

    const usuario = rows[0];
    const hashBD  = usuario.PASSWORD_HASH || usuario.password_hash;

    // Soporte bcrypt moderno + MD5 legacy con migración automática
    let valida = false;
    if (hashBD && hashBD.startsWith('$2')) {
      valida = await bcrypt.compare(password, hashBD);
    } else {
      const md5 = crypto.createHash('md5').update(password).digest('hex');
      valida = md5 === hashBD;
      if (valida) {
        try {
          const nuevoHash = await bcrypt.hash(password, SALT_ROUNDS);
          await conn.execute(
            `BEGIN PKG_USUARIO.CAMBIAR_PASSWORD(:p_id_usuario, :p_password_hash); END;`,
            { p_id_usuario: usuario.ID_USUARIO || usuario.id_usuario, p_password_hash: nuevoHash },
            { autoCommit: true }
          );
        } catch (_) {}
      }
    }

    if (!valida) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas.' });
    }

    await conn.execute(
      `BEGIN PKG_USUARIO.ACTUALIZAR_ULTIMO_ACCESO(:p_id_usuario); END;`,
      { p_id_usuario: usuario.ID_USUARIO || usuario.id_usuario },
      { autoCommit: true }
    );

    delete usuario.PASSWORD_HASH;
    delete usuario.password_hash;

    // ── Generar y devolver JWT ──────────────────────
    const token = generarToken(usuario);

    res.status(200).json({ ok: true, data: usuario, token });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: err.message });
  } finally {
    await closeConnection(conn);
  }
};

// ----------------------------------------------------------
// INSERTAR
// ----------------------------------------------------------
const insertar = async (req, res) => {
  const { username, password_hash, email, nombres, apellidos, telefono, rol_id, estado } = req.body;
  if (!username || !password_hash) {
    return res.status(400).json({ ok: false, mensaje: 'Username y contraseña requeridos.' });
  }
  let conn;
  try {
    const hash = await bcrypt.hash(password_hash, SALT_ROUNDS);
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_USUARIO.INSERTAR(
         :p_rol_id, :p_username, :p_password_hash,
         :p_nombres, :p_apellidos, :p_email,
         :p_telefono, :p_estado
       ); END;`,
      {
        p_rol_id: rol_id || 3, p_username: username, p_password_hash: hash,
        p_nombres: nombres || null, p_apellidos: apellidos || null,
        p_email: email || null, p_telefono: telefono || null, p_estado: estado || 'ACTIVO',
      },
      { autoCommit: true }
    );
    res.status(201).json({ ok: true, mensaje: 'Usuario creado correctamente.' });
    await registrarAuditoria(conn, { tabla:'USUARIO', operacion:'INSERT', idRegistro:null, descripcion:'Nuevo usuario creado', usuarioId: req.body?.usuario_id||null, usuarioNombre: req.body?.usuario_nombre||'Sistema' });
  } catch (err) {
    if (err.message?.includes('20001')) return res.status(409).json({ ok: false, mensaje: 'El username o email ya existe.' });
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
         :p_nombres, :p_apellidos, :p_email, :p_telefono, :p_estado
       ); END;`,
      {
        p_id_usuario: Number(id_usuario), p_rol_id: rol_id || 3, p_username: username,
        p_nombres: nombres || null, p_apellidos: apellidos || null,
        p_email: email || null, p_telefono: telefono || null, p_estado: estado || 'ACTIVO',
      },
      { autoCommit: true }
    );
    res.status(200).json({ ok: true, mensaje: 'Usuario actualizado correctamente.' });
    await registrarAuditoria(conn, { tabla:'USUARIO', operacion:'UPDATE', idRegistro:id_usuario, descripcion:`Usuario ${id_usuario} actualizado`, usuarioId: req.body?.usuario_id||null, usuarioNombre: req.body?.usuario_nombre||'Sistema' });
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
  if (!password_nueva) return res.status(400).json({ ok: false, mensaje: 'La nueva contraseña es requerida.' });
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
    await registrarAuditoria(conn, { tabla:'USUARIO', operacion:'UPDATE', idRegistro:id_usuario, descripcion:`Contraseña cambiada para usuario ID ${id_usuario}`, usuarioId: req.body?.usuario_id||null, usuarioNombre: req.body?.usuario_nombre||'Sistema' });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: err.message });
  } finally {
    await closeConnection(conn);
  }
};

// ----------------------------------------------------------
// RESETEAR PASSWORD (Admin)
// ----------------------------------------------------------
const resetearPassword = async (req, res) => {
  const { id_usuario } = req.params;
  const { password_nueva, usuario_solicitante_id, usuario_solicitante_nombre } = req.body;
  const nuevaPass = password_nueva || generarPasswordTemporal();
  let conn;
  try {
    const hash = await bcrypt.hash(nuevaPass, SALT_ROUNDS);
    conn = await getConnection();
    const rUser = await conn.execute(
      `BEGIN PKG_USUARIO.OBTENER_POR_ID(:p_id_usuario, :cursor); END;`,
      { p_id_usuario: Number(id_usuario), cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );
    const cursor = rUser.outBinds.cursor;
    const rows   = await cursor.getRows();
    await cursor.close();
    const usrAfectado = rows[0] || {};
    await conn.execute(
      `BEGIN PKG_USUARIO.CAMBIAR_PASSWORD(:p_id_usuario, :p_password_hash); END;`,
      { p_id_usuario: Number(id_usuario), p_password_hash: hash },
      { autoCommit: true }
    );
    await registrarAuditoria(conn, {
      tabla: 'USUARIO', operacion: 'UPDATE', idRegistro: id_usuario,
      descripcion: `Contraseña reseteada por administrador para "${usrAfectado.USERNAME || id_usuario}"`,
      usuarioId: usuario_solicitante_id || null, usuarioNombre: usuario_solicitante_nombre || 'Administrador',
    });
    res.status(200).json({ ok: true, mensaje: 'Contraseña reseteada correctamente.', password_temporal: nuevaPass, usuario: usrAfectado.USERNAME || `ID-${id_usuario}` });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: err.message });
  } finally {
    await closeConnection(conn);
  }
};

function generarPasswordTemporal() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pass = '';
  for (let i = 0; i < 8; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
  return pass;
}

// ----------------------------------------------------------
// ELIMINAR
// ----------------------------------------------------------
const eliminar = async (req, res) => {
  const { id_usuario } = req.params;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(`BEGIN PKG_USUARIO.ELIMINAR(:p_id_usuario); END;`, { p_id_usuario: Number(id_usuario) }, { autoCommit: true });
    res.status(200).json({ ok: true, mensaje: 'Usuario eliminado correctamente.' });
    await registrarAuditoria(conn, { tabla:'USUARIO', operacion:'DELETE', idRegistro:id_usuario, descripcion:`Usuario ${id_usuario} eliminado`, usuarioId: null, usuarioNombre: 'Sistema' });
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
    const result = await conn.execute(`BEGIN PKG_USUARIO.LISTAR(:cursor); END;`, { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } });
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
      { p_id_usuario: Number(id_usuario), cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );
    const cursor = result.outBinds.cursor;
    const rows   = await cursor.getRows();
    await cursor.close();
    if (rows.length === 0) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });
    res.status(200).json({ ok: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: err.message });
  } finally {
    await closeConnection(conn);
  }
};

module.exports = { login, insertar, actualizar, cambiarPassword, resetearPassword, eliminar, listar, obtenerPorId };
