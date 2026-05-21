// ============================================================
// routes/usuarioRoutes.js
// ============================================================
const express   = require('express');
const router    = express.Router();
const rateLimit = require('express-rate-limit');

const { verificarToken, verificarTokenOpcional, requiereRol } = require('../middleware/auth');
const { validar, reglasLogin, reglasUsuario, reglasPassword } = require('../middleware/validacion');
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

// ── Rate Limiter para el login ────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos de inicio de sesion. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rutas publicas
router.post('/login',  loginLimiter, reglasLogin,   validar, login);
router.post('/',       verificarTokenOpcional, reglasUsuario, validar, insertar);

// Rutas protegidas
router.use(verificarToken);

router.get('/',             listar);
router.get('/:id_usuario',  obtenerPorId);
router.put('/:id_usuario',  reglasUsuario, validar, actualizar);
router.put('/:id_usuario/password', reglasPassword, validar, cambiarPassword);

// Acciones administrativas
router.post('/:id_usuario/resetear-password', requiereRol(1), resetearPassword);
router.delete('/:id_usuario', requiereRol(1), eliminar);

module.exports = router;
