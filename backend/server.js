const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
require('dotenv').config();

const { initDB }         = require('./config/db');
const { verificarToken } = require('./middleware/auth');
const errorHandler       = require('./middleware/errorHandler');

// ── Rutas ────────────────────────────────────────────────
const arbolRoutes                     = require('./routes/arbolRoutes');
const estadoArbolRoutes               = require('./routes/estadoArbolRoutes');
const fincaRoutes                     = require('./routes/fincaRoutes');
const historialEstadoRoutes           = require('./routes/historialEstadoRoutes');
const plagaEnfermedadRoutes           = require('./routes/plagaEnfermedadRoutes');
const registroPlagaRoutes             = require('./routes/registroPlagaRoutes');
const registroTratamientoRoutes       = require('./routes/registroTratamientoRoutes');
const resiembraRoutes                 = require('./routes/resiembraRoutes');
const sectorRoutes                    = require('./routes/sectorRoutes');
const tipoFertilizanteRoutes          = require('./routes/tipoFertilizanteRoutes');
const tipoTratamientoRoutes           = require('./routes/tipoTratamientoRoutes');
const tipoVariedadArbolRoutes         = require('./routes/tipoVariedadArbolRoutes');
const movimientoInventarioArbolRoutes = require('./routes/movimientoInventarioArbolRoutes');
const tipoMovimientoInventarioRoutes  = require('./routes/tipoMovimientoInventarioRoutes');
const mapaplanoRoutes                 = require('./routes/mapaPlanoRoutes');
const usuarioRoutes                   = require('./routes/usuarioRoutes');
const auditoriaRoutes                 = require('./routes/auditoriaRoutes');
const reporteRoutes = require('./routes/reporteRoutes');

const app = express();

// ── Seguridad HTTP ────────────────────────────────────────
app.use(helmet());

// ── Logs de peticiones ────────────────────────────────────
app.use(morgan('dev'));

// ── CORS ──────────────────────────────────────────────────
const originesPermitidos = (process.env.CORS_ORIGINS || 'http://localhost:3001,http://localhost:3000')
  .split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || originesPermitidos.includes(origin)) return callback(null, true);
    callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));

// ── Health check ──────────────────────────────────────────
app.get('/', (req, res) => res.json({ ok: true, message: 'API Gestion de Arboles activa' }));

// ── Rutas de usuarios (login es publico) ──────────────────
app.use('/api/usuarios', usuarioRoutes);

app.use('/api/reportes', reporteRoutes);

// ── JWT — protege todo lo de abajo ────────────────────────
app.use(verificarToken);

// ── Rutas protegidas ─────────────────────────────────────
app.use('/api/arbol',                arbolRoutes);
app.use('/api/estado-arbol',         estadoArbolRoutes);
app.use('/api/finca',                fincaRoutes);
app.use('/api/historial-estado',     historialEstadoRoutes);
app.use('/api/plaga-enfermedad',     plagaEnfermedadRoutes);
app.use('/api/registro-plaga',       registroPlagaRoutes);
app.use('/api/registro-tratamiento', registroTratamientoRoutes);
app.use('/api/resiembra',            resiembraRoutes);
app.use('/api/sector',               sectorRoutes);
app.use('/api/tipo-fertilizante',    tipoFertilizanteRoutes);
app.use('/api/tipo-tratamiento',     tipoTratamientoRoutes);
app.use('/api/tipos-variedad',       tipoVariedadArbolRoutes);
app.use('/api/movimiento-inventario',movimientoInventarioArbolRoutes);
app.use('/api/tipo-movimiento',      tipoMovimientoInventarioRoutes);
app.use('/api/mapa-plano',           mapaplanoRoutes);
app.use('/api/auditoria',            auditoriaRoutes);

// ── Error handler global (siempre al final) ───────────────
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await initDB();
    console.log('Pool de Oracle creado correctamente');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
      console.log('Logs de peticiones activos (morgan)');
      console.log('Headers de seguridad activos (helmet)');
      console.log('Validaciones de entrada activas (express-validator)');
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
}

startServer();
