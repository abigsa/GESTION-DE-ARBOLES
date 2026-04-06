const express = require("express");
const router = express.Router();

const mapaPlanoController = require("../controllers/mapaPlanoController");

console.log("CONTROLADOR MAPA PLANO:", mapaPlanoController);

// Ruta de prueba
router.get("/test", (req, res) => {
  res.json({ ok: true, mensaje: "Ruta mapa-plano funcionando" });
});

// Obtener plano de finca
router.get("/:id", mapaPlanoController.obtenerPlanoFinca);

// Actualizar tamaño de finca
router.put("/finca/:id", mapaPlanoController.actualizarTamanoFinca);

// Actualizar posición de árbol
router.put("/arbol/:id", mapaPlanoController.actualizarPosicionArbol);

module.exports = router;