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


const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,30}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s]{8,20}$/;
const ESTADOS_VALIDOS = ['ACTIVO', 'INACTIVO'];

function normalizarTexto(valor) {
  return typeof valor === 'string' ? valor.trim() : valor;
}

function validarIdNumerico(id, nombre = 'ID') {
  const numero = Number(id);
  if (!Number.isInteger(numero) || numero <= 0) {
    return `${nombre} inválido.`;
  }
  return null;
}

function validarPassword(password) {
  if (!password || typeof password !== 'string') return 'La contraseña es requerida.';
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (!/[A-Z]/.test(password)) return 'La contraseña debe incluir al menos una letra mayúscula.';
  if (!/[a-z]/.test(password)) return 'La contraseña debe incluir al menos una letra minúscula.';
  if (!/[0-9]/.test(password)) return 'La contraseña debe incluir al menos un número.';
  return null;
}

function validarDatosUsuario({ username, password, email, nombres, apellidos, telefono, rol_id, estado }, { requierePassword = false, permitirRolEstado = false } = {}) {
  const errores = [];

  if (!username || typeof username !== 'string') {
    errores.push('El username es requerido.');
  } else if (!USERNAME_REGEX.test(username.trim())) {
    errores.push('El username debe tener entre 3 y 30 caracteres y solo puede usar letras, números, punto, guion o guion bajo.');
  }

  if (requierePassword) {
    const errorPassword = validarPassword(password);
    if (errorPassword) errores.push(errorPassword);
  }

  if (email && !EMAIL_REGEX.test(email.trim())) {
    errores.push('El correo electrónico no tiene un formato válido.');
  }

  if (nombres && String(nombres).trim().length > 80) errores.push('Los nombres no pueden superar 80 caracteres.');
  if (apellidos && String(apellidos).trim().length > 80) errores.push('Los apellidos no pueden superar 80 caracteres.');

  if (telefono && !PHONE_REGEX.test(String(telefono).trim())) {
    errores.push('El teléfono debe tener entre 8 y 20 caracteres y solo puede contener números, espacios, + o -.');
  }

  if (permitirRolEstado) {
    if (rol_id !== undefined && (!Number.isInteger(Number(rol_id)) || Number(rol_id) <= 0)) {
      errores.push('El rol_id debe ser un número válido.');
    }

    if (estado && !ESTADOS_VALIDOS.includes(String(estado).trim().toUpperCase())) {
      errores.push('El estado debe ser ACTIVO o INACTIVO.');
    }
  }

  return errores;
}

function usuarioAuditoria(req) {
  return {
    usuarioId: req.usuario?.id || null,
    usuarioNombre: req.usuario?.username || 'Sistema',
  };
}

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

    await registrarAuditoria(conn, {
  tabla: 'USUARIO',
  operacion: 'LOGIN',
  idRegistro: usuario.ID_USUARIO || usuario.id_usuario,
  descripcion: `Inicio de sesión: ${usuario.USERNAME || usuario.username}`,
  usuarioId: usuario.ID_USUARIO || usuario.id_usuario,
  usuarioNombre: usuario.USERNAME || usuario.username,
});

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
  const username = normalizarTexto(req.body.username);
  const password = req.body.password_hash;
  const email = normalizarTexto(req.body.email);
  const nombres = normalizarTexto(req.body.nombres);
  const apellidos = normalizarTexto(req.body.apellidos);
  const telefono = normalizarTexto(req.body.telefono);

  const esAdmin = Number(req.usuario?.rol_id) === 1;
  const rol_id = esAdmin ? req.body.rol_id : 3;
  const estado = esAdmin ? normalizarTexto(req.body.estado)?.toUpperCase() : 'ACTIVO';

  const errores = validarDatosUsuario(
    { username, password, email, nombres, apellidos, telefono, rol_id, estado },
    { requierePassword: true, permitirRolEstado: esAdmin }
  );

  if (errores.length) {
    return res.status(400).json({ ok: false, mensaje: errores[0], errores });
  }

  let conn;
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    conn = await getConnection();

    await conn.execute(
      `BEGIN PKG_USUARIO.INSERTAR(
         :p_rol_id, :p_username, :p_password_hash,
         :p_nombres, :p_apellidos, :p_email,
         :p_telefono, :p_estado
       ); END;`,
      {
        // Si no hay sesion admin, forzamos rol tecnico y estado ACTIVO.
        p_rol_id: Number(rol_id || 3),
        p_username: username,
        p_password_hash: hash,
        p_nombres: nombres || null,
        p_apellidos: apellidos || null,
        p_email: email || null,
        p_telefono: telefono || null,
        p_estado: estado || 'ACTIVO',
      }
    );

    await registrarAuditoria(conn, {
      tabla: 'USUARIO',
      operacion: 'INSERT',
      idRegistro: null,
      descripcion: `Nuevo usuario creado: ${username}`,
      ...usuarioAuditoria(req),
    });

    await conn.commit();
    res.status(201).json({ ok: true, mensaje: 'Usuario creado correctamente.' });
  } catch (err) {
    if (conn) await conn.rollback().catch(() => {});
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
  const errorId = validarIdNumerico(id_usuario, 'ID de usuario');
  if (errorId) return res.status(400).json({ ok: false, mensaje: errorId });

  const username = normalizarTexto(req.body.username);
  const nombres = normalizarTexto(req.body.nombres);
  const apellidos = normalizarTexto(req.body.apellidos);
  const email = normalizarTexto(req.body.email);
  const telefono = normalizarTexto(req.body.telefono);
  const rol_id = req.body.rol_id;
  const estado = normalizarTexto(req.body.estado)?.toUpperCase();

  const errores = validarDatosUsuario(
    { username, email, nombres, apellidos, telefono, rol_id, estado },
    { requierePassword: false, permitirRolEstado: true }
  );

  if (errores.length) {
    return res.status(400).json({ ok: false, mensaje: errores[0], errores });
  }

  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_USUARIO.ACTUALIZAR(
         :p_id_usuario, :p_rol_id, :p_username,
         :p_nombres, :p_apellidos, :p_email, :p_telefono, :p_estado
       ); END;`,
      {
        p_id_usuario: Number(id_usuario),
        p_rol_id: Number(rol_id || 3),
        p_username: username,
        p_nombres: nombres || null,
        p_apellidos: apellidos || null,
        p_email: email || null,
        p_telefono: telefono || null,
        p_estado: estado || 'ACTIVO',
      }
    );

    await registrarAuditoria(conn, {
      tabla: 'USUARIO',
      operacion: 'UPDATE',
      idRegistro: id_usuario,
      descripcion: `Usuario ${id_usuario} actualizado`,
      ...usuarioAuditoria(req),
    });

    await conn.commit();
    res.status(200).json({ ok: true, mensaje: 'Usuario actualizado correctamente.' });
  } catch (err) {
    if (conn) await conn.rollback().catch(() => {});
    if (err.message?.includes('20001')) return res.status(409).json({ ok: false, mensaje: 'El username o email ya existe.' });
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

  const errorId = validarIdNumerico(id_usuario, 'ID de usuario');
  if (errorId) return res.status(400).json({ ok: false, mensaje: errorId });

  const errorPassword = validarPassword(password_nueva);
  if (errorPassword) return res.status(400).json({ ok: false, mensaje: errorPassword });

  const usuarioTokenId = Number(req.usuario?.id);
  const rolToken = Number(req.usuario?.rol_id ?? 3);
  if (rolToken !== 1 && usuarioTokenId !== Number(id_usuario)) {
    return res.status(403).json({ ok: false, mensaje: 'Solo puedes cambiar tu propia contraseña.' });
  }

  let conn;
  try {
    const hash = await bcrypt.hash(password_nueva, SALT_ROUNDS);
    conn = await getConnection();
    await conn.execute(
      `BEGIN PKG_USUARIO.CAMBIAR_PASSWORD(:p_id_usuario, :p_password_hash); END;`,
      { p_id_usuario: Number(id_usuario), p_password_hash: hash }
    );

    await registrarAuditoria(conn, {
      tabla: 'USUARIO',
      operacion: 'UPDATE',
      idRegistro: id_usuario,
      descripcion: `Contraseña cambiada para usuario ID ${id_usuario}`,
      ...usuarioAuditoria(req),
    });

    await conn.commit();
    res.status(200).json({ ok: true, mensaje: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    if (conn) await conn.rollback().catch(() => {});
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
  const { password_nueva } = req.body;

  const errorId = validarIdNumerico(id_usuario, 'ID de usuario');
  if (errorId) return res.status(400).json({ ok: false, mensaje: errorId });

  if (password_nueva) {
    const errorPassword = validarPassword(password_nueva);
    if (errorPassword) return res.status(400).json({ ok: false, mensaje: errorPassword });
  }

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

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });
    }

    const usrAfectado = rows[0] || {};
    await conn.execute(
      `BEGIN PKG_USUARIO.CAMBIAR_PASSWORD(:p_id_usuario, :p_password_hash); END;`,
      { p_id_usuario: Number(id_usuario), p_password_hash: hash }
    );

    await registrarAuditoria(conn, {
      tabla: 'USUARIO',
      operacion: 'UPDATE',
      idRegistro: id_usuario,
      descripcion: `Contraseña reseteada por administrador para "${usrAfectado.USERNAME || id_usuario}"`,
      ...usuarioAuditoria(req),
    });

    await conn.commit();
    res.status(200).json({ ok: true, mensaje: 'Contraseña reseteada correctamente.', password_temporal: nuevaPass, usuario: usrAfectado.USERNAME || `ID-${id_usuario}` });
  } catch (err) {
    if (conn) await conn.rollback().catch(() => {});
    res.status(500).json({ ok: false, mensaje: err.message });
  } finally {
    await closeConnection(conn);
  }
};

function generarPasswordTemporal() {
  const mayusculas = 'ABCDEFGHJKMNPQRSTUVWXYZ';
  const minusculas = 'abcdefghjkmnpqrstuvwxyz';
  const numeros = '23456789';
  const todos = mayusculas + minusculas + numeros;
  let pass =
    mayusculas.charAt(Math.floor(Math.random() * mayusculas.length)) +
    minusculas.charAt(Math.floor(Math.random() * minusculas.length)) +
    numeros.charAt(Math.floor(Math.random() * numeros.length));

  for (let i = pass.length; i < 10; i++) {
    pass += todos.charAt(Math.floor(Math.random() * todos.length));
  }

  return pass.split('').sort(() => Math.random() - 0.5).join('');
}

// ----------------------------------------------------------
// ELIMINAR
// ----------------------------------------------------------
const eliminar = async (req, res) => {
  const { id_usuario } = req.params;
  const errorId = validarIdNumerico(id_usuario, 'ID de usuario');
  if (errorId) return res.status(400).json({ ok: false, mensaje: errorId });

  if (Number(req.usuario?.id) === Number(id_usuario)) {
    return res.status(400).json({ ok: false, mensaje: 'No puedes eliminar tu propio usuario.' });
  }

  let conn;
  try {
    conn = await getConnection();
    await conn.execute(`BEGIN PKG_USUARIO.ELIMINAR(:p_id_usuario); END;`, { p_id_usuario: Number(id_usuario) });

    await registrarAuditoria(conn, {
      tabla: 'USUARIO',
      operacion: 'DELETE',
      idRegistro: id_usuario,
      descripcion: `Usuario ${id_usuario} eliminado`,
      ...usuarioAuditoria(req),
    });

    await conn.commit();
    res.status(200).json({ ok: true, mensaje: 'Usuario eliminado correctamente.' });
  } catch (err) {
    if (conn) await conn.rollback().catch(() => {});
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
