// ============================================================
// routes/usuarioRoutes.js
// ============================================================
const express = require('express');
const router  = express.Router();
const {
  login,
  insertar,
  actualizar,
  cambiarPassword,
  resetearPassword,
  eliminar,
  listar,
  obtenerPorId,
} = require('../controllers/usuarioController');

// GET    /api/usuarios                         -> Listar todos
// GET    /api/usuarios/:id                     -> Obtener por ID
// POST   /api/usuarios                         -> Registrar nuevo usuario
// POST   /api/usuarios/login                   -> Login
// PUT    /api/usuarios/:id                     -> Actualizar datos
// PUT    /api/usuarios/:id/password            -> Cambiar contraseña (usuario)
// POST   /api/usuarios/:id/resetear-password   -> Resetear contraseña (admin — devuelve pass en claro)
// DELETE /api/usuarios/:id                     -> Eliminar (lógico)

router.post('/login',                         login);
router.get('/',                               listar);
router.get('/:id_usuario',                    obtenerPorId);
router.post('/',                              insertar);
router.put('/:id_usuario',                    actualizar);
router.put('/:id_usuario/password',           cambiarPassword);
router.post('/:id_usuario/resetear-password', resetearPassword);
router.delete('/:id_usuario',                 eliminar);

module.exports = router;
