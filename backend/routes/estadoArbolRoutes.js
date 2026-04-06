// ============================================================
// routes/estadoArbolRoutes.js
// ============================================================
const express = require('express');
const router  = express.Router();
const {
  insertar,
  actualizar,
  eliminar,
  listar,
  obtenerPorId,
} = require('../controllers/estadoArbolController');

// GET    /api/estados-arbol           -> Listar todos
// GET    /api/estados-arbol/:id       -> Obtener por ID
// POST   /api/estados-arbol           -> Insertar
// PUT    /api/estados-arbol/:id       -> Actualizar
// DELETE /api/estados-arbol/:id       -> Eliminar (lógico)

router.get('/',              listar);
router.get('/:id_estado',    obtenerPorId);
router.post('/',             insertar);
router.put('/:id_estado',    actualizar);
router.delete('/:id_estado', eliminar);

module.exports = router;
