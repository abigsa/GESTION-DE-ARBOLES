// Mapeo de etiquetas legibles para columnas de BD
const Map<String, String> _colLabels = {
  // Generales
  'id':                         'ID',
  'descripcion':                'Descripción',
  'estado':                     'Estado',
  'fecha_creacion':             'Fecha creación',
  'fecha_actualizacion':        'Actualizado',

  // Tipos variedad
  'nombre_arbol':               'Nombre árbol',
  'tipo_uso':                   'Tipo de uso',

  // Fertilizantes
  'nombre_fertilizante':        'Nombre',
  'tipo_fertilizante':          'Tipo',
  'nutrientes_principales':     'Nutrientes',
  'metodo_aplicacion':          'Método aplicación',
  'frecuencia':                 'Frecuencia',

  // Tratamientos
  'nombre_tratamiento':         'Nombre',
  'categoria':                  'Categoría',

  // Estados árbol
  'nombre_estado':              'Nombre estado',
  'orden_ciclo':                'Orden ciclo',
  'es_productivo':              'Productivo',

  // Plagas
  'nombre_plaga':               'Nombre',
  'tipo_plaga':                 'Tipo',
  'nivel_riesgo':               'Nivel riesgo',

  // Fincas
  'nombre_finca':               'Nombre finca',
  'ubicacion':                  'Ubicación',
  'area_hectareas':             'Área (ha)',
  'propietario':                'Propietario',
  'telefono_contacto':          'Teléfono',

  // Sectores
  'id_finca':                   'ID Finca',
  'nombre_sector':              'Nombre sector',
  'numero_surcos':              'Surcos',
  'posiciones_por_surco':       'Pos. por surco',

  // Árboles
  'id_sector':                  'ID Sector',
  'id_tipo_variedad_arbol':     'Variedad',
  'id_estado':                  'Estado',
  'numero_surco':               'Surco',

  // Historial estados
  'id_arbol':                   'ID Árbol',
  'id_estado_nuevo':            'Estado nuevo',
  'observaciones':              'Observaciones',
  'fecha_cambio':               'Fecha cambio',

  // Registros plaga
  'id_plaga':                   'ID Plaga',
  'fecha_deteccion':            'Detección',
  'fecha_resolucion':           'Resolución',

  // Registros tratamiento
  'id_tipo_tratamiento':        'Tratamiento',
  'id_fertilizante':            'Fertilizante',
  'fecha_aplicacion':           'Fecha aplic.',

  // Resiembra
  'id_arbol_nuevo':             'Árbol',
  'fecha_resiembra':            'Fecha',
  'motivo':                     'Motivo',

  // Movimiento inventario
  'tipo_movimiento':            'Tipo movimiento',
  'fecha_movimiento':           'Fecha movimiento',
};

// Etiqueta legible para una clave de BD
String colLabel(String key) =>
    _colLabels[key.toLowerCase()] ?? key.replaceAll('_', ' ').toLowerCase();

// ─────────────────────────────────────────────────
//  MÓDULOS
// ─────────────────────────────────────────────────
final Map<String, Map<String, dynamic>> modulesConfig = {

  'tipos-variedad': {
    'title':    'Tipos de Variedad',
    'endpoint': '/tipos-variedad',
    'fields': [
      {'name': 'nombre_arbol', 'label': 'Nombre del árbol', 'type': 'text'},
      {'name': 'tipo_uso',     'label': 'Tipo de uso',      'type': 'text'},
      {'name': 'descripcion',  'label': 'Descripción',      'type': 'text'},
    ],
  },

  'tipos-fertilizante': {
    'title':    'Fertilizantes',
    'endpoint': '/tipo-fertilizante',
    'fields': [
      {'name': 'nombre_fertilizante',   'label': 'Nombre',            'type': 'text'},
      {'name': 'tipo_fertilizante',     'label': 'Tipo',              'type': 'text'},
      {'name': 'nutrientes_principales','label': 'Nutrientes',        'type': 'text'},
      {'name': 'metodo_aplicacion',     'label': 'Método aplicación', 'type': 'text'},
      {'name': 'frecuencia',            'label': 'Frecuencia',        'type': 'text'},
      {'name': 'descripcion',           'label': 'Descripción',       'type': 'text'},
    ],
  },

  'tipos-tratamiento': {
    'title':    'Tratamientos',
    'endpoint': '/tipo-tratamiento',
    'fields': [
      {'name': 'nombre_tratamiento', 'label': 'Nombre',            'type': 'text'},
      {'name': 'categoria',          'label': 'Categoría',         'type': 'text'},
      {'name': 'metodo_aplicacion',  'label': 'Método aplicación', 'type': 'text'},
      {'name': 'frecuencia',         'label': 'Frecuencia',        'type': 'text'},
      {'name': 'descripcion',        'label': 'Descripción',       'type': 'text'},
    ],
  },

  'estados-arbol': {
    'title':    'Estados de Árbol',
    'endpoint': '/estado-arbol',
    'fields': [
      {'name': 'nombre_estado', 'label': 'Nombre estado', 'type': 'text'},
      {'name': 'orden_ciclo',   'label': 'Orden ciclo',   'type': 'number'},
      {
        'name': 'es_productivo', 'label': 'Productivo', 'type': 'select',
        'options': ['S', 'N'],
      },
      {'name': 'descripcion', 'label': 'Descripción', 'type': 'text'},
    ],
  },

  'plagas-enfermedades': {
    'title':    'Plagas y Enfermedades',
    'endpoint': '/plaga-enfermedad',
    'fields': [
      {'name': 'nombre_plaga', 'label': 'Nombre', 'type': 'text'},
      {
        'name': 'tipo_plaga', 'label': 'Tipo', 'type': 'select',
        'options': ['PLAGA', 'ENFERMEDAD'],
      },
      {
        'name': 'nivel_riesgo', 'label': 'Nivel de riesgo', 'type': 'select',
        'options': ['BAJO', 'MEDIO', 'ALTO'],
      },
      {'name': 'descripcion', 'label': 'Descripción', 'type': 'text'},
    ],
  },

  'fincas': {
    'title':    'Fincas',
    'endpoint': '/finca',
    'fields': [
      {'name': 'nombre_finca',      'label': 'Nombre finca',  'type': 'text'},
      {'name': 'ubicacion',         'label': 'Ubicación',     'type': 'text'},
      {'name': 'area_hectareas',    'label': 'Área (ha)',      'type': 'number'},
      {'name': 'propietario',       'label': 'Propietario',   'type': 'text'},
      {'name': 'telefono_contacto', 'label': 'Teléfono',      'type': 'text'},
      {'name': 'descripcion',       'label': 'Descripción',   'type': 'text'},
    ],
  },

  'sectores': {
    'title':    'Sectores',
    'endpoint': '/sector',
    'fields': [
      {'name': 'id_finca',              'label': 'ID Finca',      'type': 'number'},
      {'name': 'nombre_sector',         'label': 'Nombre sector', 'type': 'text'},
      {'name': 'area_hectareas',        'label': 'Área (ha)',      'type': 'number'},
      {'name': 'numero_surcos',         'label': 'Surcos',         'type': 'number'},
      {'name': 'posiciones_por_surco',  'label': 'Pos. por surco', 'type': 'number'},
    ],
  },

  'arboles': {
    'title':    'Árboles',
    'endpoint': '/arbol',
    'fields': [
      {'name': 'id_sector',            'label': 'ID Sector',  'type': 'number'},
      {'name': 'id_tipo_variedad_arbol','label': 'Variedad',  'type': 'number'},
      {'name': 'id_estado',            'label': 'Estado',     'type': 'number'},
      {'name': 'numero_surco',         'label': 'Surco',      'type': 'number'},
      {'name': 'descripcion',          'label': 'Descripción','type': 'text'},
    ],
  },

  'historial-estados': {
    'title':    'Historial de Estados',
    'endpoint': '/historial-estado',
    'fields': [
      {'name': 'id_arbol',       'label': 'ID Árbol',       'type': 'number'},
      {'name': 'id_estado_nuevo','label': 'Nuevo estado',   'type': 'number'},
      {'name': 'observaciones',  'label': 'Observaciones',  'type': 'text'},
    ],
  },

  'registros-plaga': {
    'title':    'Registros de Plaga',
    'endpoint': '/registro-plaga',
    'fields': [
      {'name': 'id_arbol',          'label': 'ID Árbol',    'type': 'number'},
      {'name': 'id_plaga',          'label': 'ID Plaga',    'type': 'number'},
      {'name': 'fecha_deteccion',   'label': 'Detección',   'type': 'text'},
      {'name': 'fecha_resolucion',  'label': 'Resolución',  'type': 'text'},
      {'name': 'observaciones',     'label': 'Observaciones','type': 'text'},
    ],
  },

  'registros-tratamiento': {
    'title':    'Registros de Tratamiento',
    'endpoint': '/registro-tratamiento',
    'fields': [
      {'name': 'id_arbol',           'label': 'ID Árbol',     'type': 'number'},
      {'name': 'id_tipo_tratamiento','label': 'Tratamiento',  'type': 'number'},
      {'name': 'id_fertilizante',    'label': 'Fertilizante', 'type': 'number'},
      {'name': 'fecha_aplicacion',   'label': 'Fecha aplic.', 'type': 'text'},
      {'name': 'observaciones',      'label': 'Observaciones','type': 'text'},
    ],
  },

  'resiembras': {
    'title':    'Resiembras',
    'endpoint': '/resiembra',
    'fields': [
      {'name': 'id_arbol_nuevo',  'label': 'ID Árbol', 'type': 'number'},
      {'name': 'fecha_resiembra', 'label': 'Fecha',    'type': 'text'},
      {'name': 'motivo',          'label': 'Motivo',   'type': 'text'},
    ],
  },

  'movimiento-inventario': {
    'title':    'Movimiento de Inventario',
    'endpoint': '/movimiento-inventario',
    'fields': [
      {'name': 'id_arbol',         'label': 'ID Árbol',        'type': 'number'},
      {'name': 'tipo_movimiento',  'label': 'Tipo movimiento',  'type': 'text'},
      {'name': 'fecha_movimiento', 'label': 'Fecha movimiento', 'type': 'text'},
      {'name': 'observaciones',    'label': 'Observaciones',    'type': 'text'},
    ],
  },
};
