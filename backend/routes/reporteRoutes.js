const express = require('express');
const router = express.Router();

const {
  verificarToken,
  requiereRol
} = require('../middleware/auth');

const {
  usuariosMasActivos
} = require('../controllers/reporteController');

router.use(verificarToken);

// Solo admin y supervisor
router.get(
  '/usuarios-activos',
  requiereRol(2),
  usuariosMasActivos
);

module.exports = router;