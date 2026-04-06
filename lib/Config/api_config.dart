class ApiConfig {
  static const String baseUrl = 'http://192.168.3.127:3000/api';

  // Auth
  static const String usuarios       = '/usuarios';

  // Catálogos
  static const String tiposVariedad  = '/tipos-variedad';
  static const String fertilizantes  = '/tipo-fertilizante';
  static const String tratamientos   = '/tipo-tratamiento';
  static const String estadosArbol   = '/estado-arbol';
  static const String plagasEnf      = '/plaga-enfermedad';

  // Operativos
  static const String fincas         = '/finca';
  static const String sectores       = '/sector';
  static const String arboles        = '/arbol';

  // Registros
  static const String historialEstados    = '/historial-estado';
  static const String registrosPlagas     = '/registro-plaga';
  static const String registrosTrat       = '/registro-tratamiento';
  static const String resiembras          = '/resiembra';
  static const String movimientoInv       = '/movimiento-inventario';
}
