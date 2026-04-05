const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { initDB } = require("./config/db");

const arbolRoutes = require("./routes/arbolRoutes");
const estadoArbolRoutes = require("./routes/estadoArbolRoutes");
const fincaRoutes = require("./routes/fincaRoutes");
const historialEstadoRoutes = require("./routes/historialEstadoRoutes");
const plagaEnfermedadRoutes = require("./routes/plagaEnfermedadRoutes");
const registroPlagaRoutes = require("./routes/registroPlagaRoutes");
const registroTratamientoRoutes = require("./routes/registroTratamientoRoutes");
const resiembraRoutes = require("./routes/resiembraRoutes");
const sectorRoutes = require("./routes/sectorRoutes");
const tipoFertilizanteRoutes = require("./routes/tipoFertilizanteRoutes");
const tipoTratamientoRoutes = require("./routes/tipoTratamientoRoutes");
const tipoVariedadArbolRoutes = require("./routes/tipoVariedadArbolRoutes");
const movimientoInventarioArbolRoutes = require("./routes/movimientoInventarioArbolRoutes");
const tipoMovimientoInventarioRoutes = require("./routes/tipoMovimientoInventarioRoutes");
const mapaplanoRoutes = require("./routes/mapaplanoRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ success: true, message: "Backend funcionando correctamente" });
});

app.use("/api/arbol", arbolRoutes);
app.use("/api/estado-arbol", estadoArbolRoutes);
app.use("/api/finca", fincaRoutes);
app.use("/api/historial-estado", historialEstadoRoutes);
app.use("/api/plaga-enfermedad", plagaEnfermedadRoutes);
app.use("/api/registro-plaga", registroPlagaRoutes);
app.use("/api/registro-tratamiento", registroTratamientoRoutes);
app.use("/api/resiembra", resiembraRoutes);
app.use("/api/sector", sectorRoutes);
app.use("/api/tipo-fertilizante", tipoFertilizanteRoutes);
app.use("/api/tipo-tratamiento", tipoTratamientoRoutes);
app.use("/api/tipos-variedad", tipoVariedadArbolRoutes);
app.use("/api/movimiento-inventario", movimientoInventarioArbolRoutes);
app.use("/api/tipo-movimiento", tipoMovimientoInventarioRoutes);
app.use("/api/mapa-plano", mapaplanoRoutes);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("No se pudo iniciar el servidor:", error.message);
    process.exit(1);
  }
}

startServer();