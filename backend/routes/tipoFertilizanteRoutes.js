// ============================================================
// routes/tipoFertilizanteRoutes.js
// ============================================================
const express = require('express');
const router  = express.Router();
const {
  insertar,
  actualizar,
  eliminar,
  listar,
  obtenerPorId,
} = require('../controllers/tipoFertilizanteController');

// GET    /api/tipos-fertilizante           -> Listar todos
// GET    /api/tipos-fertilizante/:id       -> Obtener por ID
// POST   /api/tipos-fertilizante           -> Insertar
// PUT    /api/tipos-fertilizante/:id       -> Actualizar
// DELETE /api/tipos-fertilizante/:id       -> Eliminar (lógico)

router.get('/',                  listar);
router.get('/:id_fertilizante',   obtenerPorId);
router.post('/',                  insertar);
router.put('/:id_fertilizante',   actualizar);
router.delete('/:id_fertilizante', eliminar);

module.exports = router;
