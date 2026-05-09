const express = require('express');
const router  = express.Router();
const mapaPlanoController = require('../controllers/mapaPlanoController');

router.get('/test',       (req, res) => res.json({ ok: true, mensaje: 'Ruta mapa-plano funcionando' }));
router.get('/:id',        mapaPlanoController.obtenerPlanoFinca);
router.put('/finca/:id',  mapaPlanoController.actualizarTamanoFinca);
router.put('/arbol/:id',  mapaPlanoController.actualizarPosicionArbol);

module.exports = router;
