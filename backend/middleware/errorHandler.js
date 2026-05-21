// ============================================================
// middleware/errorHandler.js
// Error handler global — reemplaza el inline de server.js
// ============================================================

const errorHandler = (err, req, res, next) => {

  // Error de CORS
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ ok: false, mensaje: 'Origen no permitido' });
  }

  // Token JWT invalido o expirado (por si llega aqui)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ ok: false, mensaje: 'Token invalido' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ ok: false, mensaje: 'Sesion expirada, inicia sesion nuevamente' });
  }

  // JSON mal formado en el body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, mensaje: 'El cuerpo de la solicitud no es JSON valido' });
  }

  // Payload demasiado grande (supera el limit: '2mb')
  if (err.status === 413) {
    return res.status(413).json({ ok: false, mensaje: 'El archivo o datos enviados son demasiado grandes' });
  }

  // Error de Oracle — extraer mensaje util sin exponer internos
  if (err.message && err.message.includes('ORA-')) {
    console.error('[Oracle Error]', err.message);
    // Errores de negocio definidos con RAISE_APPLICATION_ERROR(-200xx)
    if (err.message.includes('ORA-200')) {
      const match = err.message.match(/ORA-200\d+: (.+?)(\n|$)/);
      const msg   = match ? match[1].trim() : 'Error de base de datos';
      return res.status(400).json({ ok: false, mensaje: msg });
    }
    // Otros errores de Oracle (no exponer detalles al cliente)
    return res.status(500).json({ ok: false, mensaje: 'Error en la base de datos' });
  }

  // Error generico — log interno, respuesta generica al cliente
  console.error(`[Error] ${req.method} ${req.path} →`, err.message);
  res.status(err.status || 500).json({
    ok: false,
    mensaje: err.message || 'Error interno del servidor',
  });
};

module.exports = errorHandler;
