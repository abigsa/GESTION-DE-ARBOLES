// ============================================================
// routes/plagaEnfermedadRoutes.js
// ============================================================
const express = require('express');
const router  = express.Router();
const {
  insertar,
  actualizar,
  eliminar,
  listar,
  obtenerPorId,
} = require('../controllers/plagaEnfermedadController');

// GET    /api/plagas-enfermedades           -> Listar todas
// GET    /api/plagas-enfermedades/:id       -> Obtener por ID
// POST   /api/plagas-enfermedades           -> Insertar
// PUT    /api/plagas-enfermedades/:id       -> Actualizar
// DELETE /api/plagas-enfermedades/:id       -> Eliminar (lógico)

router.get('/',           listar);
router.get('/:id_plaga',   obtenerPorId);
router.post('/',           insertar);
router.put('/:id_plaga',   actualizar);
router.delete('/:id_plaga', eliminar);

module.exports = router;
