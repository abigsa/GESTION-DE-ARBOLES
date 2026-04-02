const express = require("express");
const router = express.Router();

const {
  listar,
} = require("../controllers/tipoMovimientoInventarioController");

router.get("/", listar);

module.exports = router;