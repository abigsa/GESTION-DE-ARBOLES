// ============================================================
// routes/historialEstadoRoutes.js
// ============================================================
const express = require('express');
const router  = express.Router();
const {
  insertar,
  actualizar,
  eliminar,
  listar,
  obtenerPorId,
} = require('../controllers/historialEstadoController');

// GET    /api/historial-estado           -> Listar todos
// GET    /api/historial-estado/:id       -> Obtener por ID
// POST   /api/historial-estado           -> Insertar
// PUT    /api/historial-estado/:id       -> Actualizar
// DELETE /api/historial-estado/:id       -> Eliminar (físico)

router.get('/',                listar);
router.get('/:id_historial',   obtenerPorId);
router.post('/',               insertar);
router.put('/:id_historial',   actualizar);
router.delete('/:id_historial', eliminar);

module.exports = router;
