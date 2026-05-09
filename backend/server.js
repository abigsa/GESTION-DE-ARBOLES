const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const { initDB }        = require('./config/db');
const { verificarToken } = require('./middleware/auth');

// ── Rutas ────────────────────────────────────────────────
const arbolRoutes                  = require('./routes/arbolRoutes');
const estadoArbolRoutes            = require('./routes/estadoArbolRoutes');
const fincaRoutes                  = require('./routes/fincaRoutes');
const historialEstadoRoutes        = require('./routes/historialEstadoRoutes');
const plagaEnfermedadRoutes        = require('./routes/plagaEnfermedadRoutes');
const registroPlagaRoutes          = require('./routes/registroPlagaRoutes');
const registroTratamientoRoutes    = require('./routes/registroTratamientoRoutes');
const resiembraRoutes              = require('./routes/resiembraRoutes');
const sectorRoutes                 = require('./routes/sectorRoutes');
const tipoFertilizanteRoutes       = require('./routes/tipoFertilizanteRoutes');
const tipoTratamientoRoutes        = require('./routes/tipoTratamientoRoutes');
const tipoVariedadArbolRoutes      = require('./routes/tipoVariedadArbolRoutes');
const movimientoInventarioArbolRoutes = require('./routes/movimientoInventarioArbolRoutes');
const tipoMovimientoInventarioRoutes  = require('./routes/tipoMovimientoInventarioRoutes');
const mapaplanoRoutes              = require('./routes/mapaPlanoRoutes');
const usuarioRoutes                = require('./routes/usuarioRoutes');
const auditoriaRoutes              = require('./routes/auditoriaRoutes');

const app = express();

// ── CORS — solo permitir origen del frontend ─────────────
const originesPermitidos = (process.env.CORS_ORIGINS || 'http://localhost:3001,http://localhost:3000')
  .split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, server-to-server)
    if (!origin || originesPermitidos.includes(origin)) return callback(null, true);
    callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));

// ── Ruta pública de health check ─────────────────────────
app.get('/', (req, res) => res.json({ ok: true, message: 'API Gestión de Árboles activa' }));

// ── Rutas públicas (sin JWT) ─────────────────────────────
app.use('/api/usuarios', usuarioRoutes);   // login está aquí

// ── Middleware JWT — protege todo lo de abajo ────────────
app.use(verificarToken);

// ── Rutas protegidas ─────────────────────────────────────
app.use('/api/arbol',               arbolRoutes);
app.use('/api/estado-arbol',        estadoArbolRoutes);
app.use('/api/finca',               fincaRoutes);
app.use('/api/historial-estado',    historialEstadoRoutes);
app.use('/api/plaga-enfermedad',    plagaEnfermedadRoutes);
app.use('/api/registro-plaga',      registroPlagaRoutes);
app.use('/api/registro-tratamiento',registroTratamientoRoutes);
app.use('/api/resiembra',           resiembraRoutes);
app.use('/api/sector',              sectorRoutes);
app.use('/api/tipo-fertilizante',   tipoFertilizanteRoutes);
app.use('/api/tipo-tratamiento',    tipoTratamientoRoutes);
app.use('/api/tipos-variedad',      tipoVariedadArbolRoutes);
app.use('/api/movimiento-inventario', movimientoInventarioArbolRoutes);
app.use('/api/tipo-movimiento',     tipoMovimientoInventarioRoutes);
app.use('/api/mapa-plano',          mapaplanoRoutes);
app.use('/api/auditoria',           auditoriaRoutes);

// ── Error handler global ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await initDB();
    app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
}

startServer();
