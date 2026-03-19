// ============================================================
// routes/sectorRoutes.js
// ============================================================
const express = require('express');
const router  = express.Router();
const {
  insertar,
  actualizar,
  eliminar,
  listar,
  obtenerPorId,
} = require('../controllers/sectorController');

// GET    /api/sectores            -> Listar todos
// GET    /api/sectores/:id        -> Obtener por ID
// POST   /api/sectores            -> Insertar
// PUT    /api/sectores/:id        -> Actualizar
// DELETE /api/sectores/:id        -> Eliminar (lógico)

router.get('/',              listar);
router.get('/:id_sector',    obtenerPorId);
router.post('/',             insertar);
router.put('/:id_sector',    actualizar);
router.delete('/:id_sector', eliminar);

module.exports = router;
