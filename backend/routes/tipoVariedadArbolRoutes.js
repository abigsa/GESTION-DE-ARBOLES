// ============================================================
// routes/tipoVariedadArbolRoutes.js
// ============================================================
const express = require('express');
const router  = express.Router();
const {
  insertar,
  actualizar,
  eliminar,
  listar,
  obtenerPorId,
} = require('../controllers/tipoVariedadArbolController');

// GET    /api/tipos-variedad-arbol           -> Listar todos
// GET    /api/tipos-variedad-arbol/:id       -> Obtener por ID
// POST   /api/tipos-variedad-arbol           -> Insertar
// PUT    /api/tipos-variedad-arbol/:id       -> Actualizar
// DELETE /api/tipos-variedad-arbol/:id       -> Eliminar (lógico)

router.get('/',                  listar);
router.get('/:id_tipo_arbol',    obtenerPorId);
router.post('/',                 insertar);
router.put('/:id_tipo_arbol',    actualizar);
router.delete('/:id_tipo_arbol', eliminar);

module.exports = router;
