// ============================================================
// routes/auditoriaRoutes.js
// ============================================================
const express = require('express');
const router  = express.Router();
const { listar, listarRecientes, listarPorTabla } = require('../controllers/auditoriaController');

// GET /api/auditoria                    → Todos los registros
// GET /api/auditoria/recientes?limite=N → Últimos N registros
// GET /api/auditoria/tabla/:tabla       → Por tabla específica

router.get('/',                listar);
router.get('/recientes',       listarRecientes);
router.get('/tabla/:tabla',    listarPorTabla);

module.exports = router;
