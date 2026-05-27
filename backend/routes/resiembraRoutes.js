// ============================================================
// routes/resiembraRoutes.js
// ============================================================
const express = require('express');
const router  = express.Router();

const {
  verificarToken,
  requiereRol
} = require('../middleware/auth');

const {
  insertar,
  actualizar,
  eliminar,
  listar,
  obtenerPorId,
} = require('../controllers/resiembraController');

// GET    /api/resiembras           -> Listar todas
// GET    /api/resiembras/:id       -> Obtener por ID
// POST   /api/resiembras           -> Insertar
// PUT    /api/resiembras/:id       -> Actualizar
// DELETE /api/resiembras/:id       -> Eliminar (físico)
router.use(verificarToken);
router.get('/',               listar);
router.get('/:id_resiembra',   obtenerPorId);
router.post('/',               insertar);
router.put('/:id_resiembra',   actualizar);
router.delete('/:id_resiembra', eliminar);

module.exports = router;
