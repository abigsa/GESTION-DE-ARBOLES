// ============================================================
// routes/registroPlagaRoutes.js
// ============================================================
const express = require('express');
const router  = express.Router();
const {
  insertar,
  actualizar,
  eliminar,
  listar,
  obtenerPorId,
} = require('../controllers/registroPlagaController');

// GET    /api/registros-plaga           -> Listar todos
// GET    /api/registros-plaga/:id       -> Obtener por ID
// POST   /api/registros-plaga           -> Insertar
// PUT    /api/registros-plaga/:id       -> Actualizar
// DELETE /api/registros-plaga/:id       -> Eliminar (lógico)

router.get('/',               listar);
router.get('/:id_registro',   obtenerPorId);
router.post('/',              insertar);
router.put('/:id_registro',   actualizar);
router.delete('/:id_registro', eliminar);

module.exports = router;
