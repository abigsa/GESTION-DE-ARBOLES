// ============================================================
// routes/tipoTratamientoRoutes.js
// ============================================================
const express = require('express');
const router  = express.Router();
const {
  insertar,
  actualizar,
  eliminar,
  listar,
  obtenerPorId,
} = require('../controllers/tipoTratamientoController');

// GET    /api/tipos-tratamiento           -> Listar todos
// GET    /api/tipos-tratamiento/:id       -> Obtener por ID
// POST   /api/tipos-tratamiento           -> Insertar
// PUT    /api/tipos-tratamiento/:id       -> Actualizar
// DELETE /api/tipos-tratamiento/:id       -> Eliminar (lógico)

router.get('/',                       listar);
router.get('/:id_tipo_tratamiento',   obtenerPorId);
router.post('/',                      insertar);
router.put('/:id_tipo_tratamiento',   actualizar);
router.delete('/:id_tipo_tratamiento', eliminar);

module.exports = router;
