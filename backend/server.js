const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// 🔹 Middlewares
app.use(cors());
app.use(express.json());

// 🔹 Importar rutas
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

// 🔹 Ruta de prueba
app.get("/", (req, res) => {
  res.json({ mensaje: "Backend funcionando correctamente 🚀" });
});

// 🔹 Usar rutas
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

// 🔹 Puerto
const PORT = process.env.PORT || 3000;

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_CONNECT_STRING:", process.env.DB_CONNECT_STRING);

// 🔹 Levantar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});