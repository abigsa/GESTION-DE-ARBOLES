// ============================================================
// routes/fincaRoutes.js
// ============================================================
const express = require('express');
const router  = express.Router();
const {
  insertar,
  actualizar,
  eliminar,
  listar,
  obtenerPorId,
} = require('../controllers/fincaController');

// GET    /api/fincas          -> Listar todas
// GET    /api/fincas/:id      -> Obtener por ID
// POST   /api/fincas          -> Insertar
// PUT    /api/fincas/:id      -> Actualizar
// DELETE /api/fincas/:id      -> Eliminar (lógico)

router.get('/',     listar);
router.get('/:id_finca',  obtenerPorId);
router.post('/',    insertar);
router.put('/:id_finca',  actualizar);
router.delete('/:id_finca', eliminar);

module.exports = router;
