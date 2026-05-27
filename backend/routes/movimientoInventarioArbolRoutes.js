const express = require('express');
const router  = express.Router();

const {
  verificarToken,
  requiereRol
} = require('../middleware/auth');

const {
  listar,
  obtenerPorId,
  insertar,
  actualizar,
  eliminar
} = require("../controllers/movimientoInventarioArbolController");


router.use(verificarToken);
router.get("/", listar);
router.get("/:id", obtenerPorId);
router.post("/", insertar);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

module.exports = router;