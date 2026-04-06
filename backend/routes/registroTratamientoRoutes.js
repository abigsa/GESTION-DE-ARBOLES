// ============================================================
// routes/registroTratamientoRoutes.js
// ============================================================
const express = require('express');
const router  = express.Router();
const {
  insertar,
  actualizar,
  eliminar,
  listar,
  obtenerPorId,
} = require('../controllers/registroTratamientoController');

// GET    /api/registros-tratamiento           -> Listar todos
// GET    /api/registros-tratamiento/:id       -> Obtener por ID
// POST   /api/registros-tratamiento           -> Insertar
// PUT    /api/registros-tratamiento/:id       -> Actualizar
// DELETE /api/registros-tratamiento/:id       -> Eliminar (físico)

router.get('/',               listar);
router.get('/:id_registro',   obtenerPorId);
router.post('/',              insertar);
router.put('/:id_registro',   actualizar);
router.delete('/:id_registro', eliminar);

module.exports = router;
