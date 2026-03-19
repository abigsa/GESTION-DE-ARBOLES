// ============================================================
// routes/arbolRoutes.js
// ============================================================
const express = require('express');
const router  = express.Router();
const {
  insertar,
  actualizar,
  eliminar,
  listar,
  obtenerPorId,
} = require('../controllers/arbolController');

// GET    /api/arboles          -> Listar todos
// GET    /api/arboles/:id      -> Obtener por ID
// POST   /api/arboles          -> Insertar
// PUT    /api/arboles/:id      -> Actualizar
// DELETE /api/arboles/:id      -> Eliminar (lógico)

router.get('/',            listar);
router.get('/:id_arbol',   obtenerPorId);
router.post('/',           insertar);
router.put('/:id_arbol',   actualizar);
router.delete('/:id_arbol', eliminar);

module.exports = router;
