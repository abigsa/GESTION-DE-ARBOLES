// ============================================================
// routes/usuarioRoutes.js
// ============================================================
const express = require('express');
const router  = express.Router();
const { verificarToken, verificarTokenOpcional, requiereRol } = require('../middleware/auth');
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

// GET    /api/usuarios                         -> Listar todos (protegido)
// GET    /api/usuarios/:id                     -> Obtener por ID (protegido)
// POST   /api/usuarios                         -> Registrar nuevo usuario (publico)
// POST   /api/usuarios/login                   -> Login (publico)
// PUT    /api/usuarios/:id                     -> Actualizar datos (protegido)
// PUT    /api/usuarios/:id/password            -> Cambiar contraseña (protegido)
// POST   /api/usuarios/:id/resetear-password   -> Resetear contraseña (admin)
// DELETE /api/usuarios/:id                     -> Eliminar logico (admin)

// Rutas publicas
router.post('/login', login);
router.post('/', verificarTokenOpcional, insertar);

// Rutas protegidas
router.use(verificarToken);

router.get('/', listar);
router.get('/:id_usuario', obtenerPorId);
router.put('/:id_usuario', actualizar);
router.put('/:id_usuario/password', cambiarPassword);

// Acciones administrativas: rol_id menor = mas privilegios
router.post('/:id_usuario/resetear-password', requiereRol(1), resetearPassword);
router.delete('/:id_usuario', requiereRol(1), eliminar);

module.exports = router;
