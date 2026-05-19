// ── Etiquetas legibles para columnas de BD ────────
export const COL_LABELS = {
  id:'ID', descripcion:'Descripción', estado:'Estado',
  nombre_arbol:'Árbol', tipo_uso:'Tipo de uso',
  nombre_fertilizante:'Nombre fertilizante', tipo_fertilizante:'Tipo',
  nutrientes_principales:'Nutrientes', metodo_aplicacion:'Método',
  frecuencia:'Frecuencia', nombre_tratamiento:'Nombre tratamiento',
  categoria:'Categoría', nombre_estado:'Estado',
  orden_ciclo:'Orden ciclo', es_productivo:'Productivo',
  nombre_plaga:'Nombre', tipo_plaga:'Tipo', nivel_riesgo:'Riesgo',
  ubicacion:'Ubicación', nombre_finca:'Finca',
  area_hectareas:'Área (ha)', propietario:'Propietario',
  telefono_contacto:'Teléfono', id_finca:'ID Finca',
  nombre_sector:'Sector', numero_surcos:'Surcos',
  posiciones_por_surco:'Pos/surco',

  numero_surco:'Surco',
  id_estado_nuevo:'Nuevo estado', observaciones:'Observaciones',
  fecha_cambio:'Fecha cambio', id_plaga:'ID Plaga',
  fecha_deteccion:'Detección', fecha_resolucion:'Resolución',
  id_fertilizante:'Fertilizante',
  fecha_aplicacion:'Fecha aplic.',
  fecha_resiembra:'Fecha', motivo:'Motivo',
  id_tipo_movimiento:'Tipo movimiento', fecha_movimiento:'Fecha movimiento',
  posicion_x:'Posición X (surco)', posicion_y:'Posición Y (lugar en surco)',
  tipo_cultivo:'Tipo de cultivo',
};

export const colLabel = (key) =>
  COL_LABELS[key?.toLowerCase()] ?? key?.replace(/_/g,' ') ?? key;

export const HIDDEN_COLS = new Set([
  'fecha_creacion','fecha_actualizacion','created_at','updated_at',
  'FECHA_CREACION','FECHA_ACTUALIZACION','CREATED_AT','UPDATED_AT','ACTIVO',

  'id_arbol_nuevo','ID_ARBOL_NUEVO',
  'id_resiembra','ID_RESIEMBRA',
  'id_registro','ID_REGISTRO',
  'id_estado_nuevo','ID_ESTADO_NUEVO',
  'id_estado_anterior','ID_ESTADO_ANTERIOR',
  'id_historial','ID_HISTORIAL',
  'id_finca','ID_FINCA',
  'id_plaga','ID_PLAGA',
  'id_tipo_tratamiento','ID_TIPO_TRATAMIENTO',
  'id_arbol','ID_ARBOL',
  'id_sector','ID_SECTOR',
  'id_estado','ID_ESTADO',
  'id_tipo_variedad_arbol','ID_TIPO_VARIEDAD_ARBOL',
  'id_tipo_arbol','ID_TIPO_ARBOL',
  'id_fertilizante','ID_FERTILIZANTE',
  'id_tratamiento','ID_TRATAMIENTO',
  'posicion_x','POSICION_X',
]);

export const DASHBOARD_QUICK_ACCESS = [
  'arboles',
  'fincas',
  'plagas-enfermedades',
  'tipos-tratamiento',
  'mapa-plano',
];

export const SECTOR_NAME_OPTIONS = [
  { value:'Sector Norte', label:'Sector Norte' },
  { value:'Sector Sur', label:'Sector Sur' },
  { value:'Sector Este', label:'Sector Este' },
  { value:'Sector Oeste', label:'Sector Oeste' },
  { value:'Sector Centro', label:'Sector Centro' },
  { value:'Sector Occidente', label:'Sector Occidente' },
];

export const TIPO_USO_OPTIONS = [
  { value:'Frutal', label:'Frutal (consumo de fruto)' },
  { value:'Maderable', label:'Maderable (madera para construcción)' },
  { value:'Ornamental', label:'Ornamental (paisajismo y decoración)' },
  { value:'Sombra', label:'Sombra (protección de otros cultivos)' },
  { value:'Medicinal', label:'Medicinal (usos terapéuticos)' },
  { value:'Forrajero', label:'Forrajero (alimentación animal)' },
  { value:'Industrial', label:'Industrial (aceites, resinas, látex)' },
  { value:'Agroforestal', label:'Agroforestal (combinado con cultivos)' },
  { value:'Barrera viva', label:'Barrera viva (cortavientos, linderos)' },
  { value:'Fijador nitrógeno', label:'Fijador de nitrógeno (mejora suelo)' },
  { value:'Leña', label:'Leña y carbón vegetal' },
  { value:'Multipropósito', label:'Multipropósito' },
];

export const TIPO_FERTILIZANTE_OPTIONS = [
  { value:'NPK', label:'NPK — Nitrógeno-Fósforo-Potasio' },
  { value:'Nitrogenado', label:'Nitrogenado (urea, sulfato de amonio)' },
  { value:'Fosfatado', label:'Fosfatado (superfosfato, fosfato diamónico)' },
  { value:'Potásico', label:'Potásico (cloruro, sulfato de potasio)' },
  { value:'Orgánico compost', label:'Orgánico — Compost' },
  { value:'Orgánico bokashi', label:'Orgánico — Bokashi' },
  { value:'Orgánico humus', label:'Orgánico — Humus de lombriz' },
  { value:'Orgánico estiércol', label:'Orgánico — Estiércol' },
  { value:'Foliar', label:'Foliar (aplicación en hoja)' },
  { value:'Micronutrientes', label:'Micronutrientes (zinc, boro, hierro…)' },
  { value:'Enmienda calcárea', label:'Enmienda calcárea (cal, yeso)' },
  { value:'Biofertilizante', label:'Biofertilizante (microorganismos)' },
  { value:'Lento liberación', label:'De lento liberación (controlado)' },
  { value:'Fertirrigación', label:'Fertirrigación (vía riego)' },
  { value:'Otro', label:'Otro' },
];

export const TIPO_CULTIVO_OPTIONS = [
  { value:'Aguacate', label:'Aguacate' },
  { value:'Café', label:'Café' },
  { value:'Cacao', label:'Cacao' },
  { value:'Cítricos', label:'Cítricos (naranja, limón, mandarina)' },
  { value:'Mango', label:'Mango' },
  { value:'Banano', label:'Banano / Plátano' },
  { value:'Macadamia', label:'Macadamia' },
  { value:'Cardamomo', label:'Cardamomo' },
  { value:'Palma africana', label:'Palma africana' },
  { value:'Hule', label:'Hule / Caucho' },
  { value:'Maíz', label:'Maíz' },
  { value:'Frijol', label:'Frijol' },
  { value:'Caña de azúcar', label:'Caña de azúcar' },
  { value:'Forestal', label:'Forestal (pino, ciprés, eucalipto)' },
  { value:'Agroforestal', label:'Agroforestal mixto' },
  { value:'Otro', label:'Otro' },
];

export const FRECUENCIA_OPTIONS = [
  { value:'Diaria', label:'Diaria' },
  { value:'Semanal', label:'Semanal' },
  { value:'Quincenal', label:'Quincenal' },
  { value:'Mensual', label:'Mensual' },
  { value:'Bimestral', label:'Bimestral' },
  { value:'Trimestral', label:'Trimestral' },
  { value:'Semestral', label:'Semestral' },
  { value:'Anual', label:'Anual' },
  { value:'Personalizada', label:'Personalizada' },
];

export const METODO_APLICACION_OPTIONS = [
  { value:'Foliar', label:'Foliar' },
  { value:'Riego', label:'Riego' },
  { value:'Suelo', label:'Suelo' },
  { value:'Inyección', label:'Inyección' },
  { value:'Manual', label:'Manual' },
  { value:'Goteo', label:'Goteo' },
  { value:'Aspersión', label:'Aspersión' },
  { value:'Drench', label:'Drench (aplicación al suelo)' },
  { value:'Fertirrigación', label:'Fertirrigación' },
  { value:'Otro', label:'Otro' },
];

export const CATEGORIA_TRATAMIENTO_OPTIONS = [
  { value:'Fitosanitario', label:'Fitosanitario' },
  { value:'Cultural', label:'Cultural' },
  { value:'Biológico', label:'Biológico' },
  { value:'Monitoreo', label:'Monitoreo' },
  { value:'Químico', label:'Químico' },
  { value:'Mantenimiento', label:'Mantenimiento' },
];


export const MODULES = {
  'tipos-variedad': {
    title:'Tipos de Variedad',
    endpoint:'/tipos-variedad',
    icon:'category',
    fields:[
      { name:'nombre_arbol', label:'Nombre del árbol', type:'text', required:true, onlyLetters:true, minLength:3 },
      { name:'tipo_uso', label:'Tipo de uso', type:'select', required:true, options: TIPO_USO_OPTIONS },
      { name:'descripcion', label:'Descripción', type:'textarea', maxLength:500 },
    ],
  },

  'tipos-fertilizante': {
  title:'Fertilizantes',
  endpoint:'/tipo-fertilizante',
  icon:'science',
  fields:[
    {
      name:'nombre_fertilizante',
      label:'Nombre',
      type:'text',
      required:true,
      onlyLetters:true,
      minLength:3
    },
    {
      name:'tipo_fertilizante',
      label:'Tipo',
      type:'select',
      required:true,
      options: TIPO_FERTILIZANTE_OPTIONS,
    },
    {
      name:'nutrientes_principales',
      label:'Nutrientes',
      type:'textarea',
      required:true,
      minLength:3,
      maxLength:500
    },
    {
  name:'metodo_aplicacion',
  label:'Método aplicación',
  type:'select',
  required:true,
  options: METODO_APLICACION_OPTIONS,
},
    {
  name:'frecuencia',
  label:'Frecuencia',
  type:'select',
  required:true,
  options: FRECUENCIA_OPTIONS,
},
    {
      name:'descripcion',
      label:'Descripción',
      type:'textarea',
      maxLength:500
    },
  ],
},

  'tipos-tratamiento': {
    title:'Tratamientos',
    endpoint:'/tipo-tratamiento',
    icon:'medical_services',
    fields:[
      { name:'nombre_tratamiento', label:'Nombre', type:'text', required:true, minLength:3 },
      {
  name:'categoria',
  label:'Categoría',
  type:'select',
  required:true,
  options: CATEGORIA_TRATAMIENTO_OPTIONS,
},
      {
  name:'metodo_aplicacion',
  label:'Método aplicación',
  type:'select',
  required:true,
  options: METODO_APLICACION_OPTIONS,
},
      {
  name:'frecuencia',
  label:'Frecuencia',
  type:'select',
  required:true,
  options: FRECUENCIA_OPTIONS,
},
      { name:'descripcion', label:'Descripción', type:'textarea', maxLength:500 },
    ],
  },

  'estados-arbol': {
    title:'Estados de Árbol',
    endpoint:'/estado-arbol',
    icon:'device_hub',
    fields:[
      { name:'nombre_estado', label:'Nombre estado', type:'text', required:true, onlyLetters:true, minLength:3 },
      { name:'orden_ciclo', label:'Orden ciclo', type:'number', min:1 },
      {
        name:'es_productivo',
        label:'Productivo',
        type:'select',
        options:[
          { value:'S', label:'Sí' },
          { value:'N', label:'No' }
        ]
      },
      { name:'descripcion', label:'Descripción', type:'textarea', maxLength:500 },
    ],
  },

  'plagas-enfermedades': {
    title:'Plagas y Enfermedades',
    endpoint:'/plaga-enfermedad',
    icon:'bug_report',
    fields:[
      {
  name:'nombre_plaga',
  label:'Nombre',
  type:'text',
  required:true,
  onlyLetters:true,
  minLength:3
},
      {
        name:'tipo_plaga',
        label:'Tipo',
        type:'select',
        required:true,
        options:[
          { value:'PLAGA', label:'Plaga' },
          { value:'ENFERMEDAD', label:'Enfermedad' }
        ]
      },
      {
        name:'nivel_riesgo',
        label:'Nivel de riesgo',
        type:'select',
        required:true,
        options:[
          { value:'BAJO', label:'Bajo' },
          { value:'MEDIO', label:'Medio' },
          { value:'ALTO', label:'Alto' }
        ]
      },
      { name:'descripcion', label:'Descripción', type:'textarea', maxLength:500 },
    ],
  },

  fincas: {
    title:'Fincas',
    endpoint:'/finca',
    icon:'landscape',
    fields:[
  {
    name:'nombre_finca',
    label:'Nombre finca',
    type:'text',
    required:true,
    minLength:3,
    maxLength:100
  },

  {
    name:'ubicacion',
    label:'Ubicación',
    type:'text',
    minLength:3,
    maxLength:150
  },

  {
    name:'area_hectareas',
    label:'Área (ha)',
    type:'number',
    min:0.01
  },

  {
    name:'propietario',
    label:'Propietario',
    type:'text',
    onlyLetters:true,
    minLength:3,
    maxLength:100
  },

  {
    name:'telefono_contacto',
    label:'Teléfono',
    type:'text',
    onlyNumbers:true,
    minLength:8,
    maxLength:8
  },

  {
    name:'descripcion',
    label:'Descripción',
    type:'textarea',
    maxLength:500
  },
],
  },

  sectores: {
    title:'Sectores',
    endpoint:'/sector',
    icon:'map',
    fields:[
      {
        name:'id_finca',
        label:'Finca',
        type:'remote-select',
        required:true,
        optionSource:'/finca',
        optionValue:'id_finca',
        optionLabel:'nombre_finca'
      },
      {
        name:'nombre_sector',
        label:'Nombre sector',
        type:'select',
        required:true,
        options: SECTOR_NAME_OPTIONS
      },
      {
        name:'tipo_cultivo',
        label:'Tipo de cultivo',
        type:'select',
        required:true,
        options: TIPO_CULTIVO_OPTIONS,
      },
      { name:'area_hectareas', label:'Área (ha)', type:'number', min:0.01 },
      { name:'numero_surcos', label:'Surcos', type:'number', required:true, min:1 },
      { name:'posiciones_por_surco', label:'Pos. por surco', type:'number', required:true, min:1 },
    ],
  },

  arboles: {
    title:'Árboles',
    endpoint:'/arbol',
    icon:'park',
    fields:[
      {
        name:'id_finca',
        label:'Finca',
        type:'remote-select',
        required:true,
        optionSource:'/finca',
        optionValue:'id_finca',
        optionLabel:'nombre_finca',
        omitOnSubmit:true,
      },
      {
        name:'id_sector',
        label:'Sector',
        type:'remote-select',
        required:true,
        optionSource:'/sector',
        optionValue:'id_sector',
        optionLabel:'nombre_sector',
        dependsOn:{
          field:'id_finca',
          queryParam:'id_finca',
        },
      },
      {
        name:'id_tipo_variedad_arbol',
        label:'Variedad',
        type:'remote-select',
        required:true,
        optionSource:'/tipos-variedad',
        optionValue:'id_tipo_arbol',
        optionLabel:'nombre_arbol',
      },
      {
        name:'id_estado',
        label:'Estado',
        type:'remote-select',
        required:true,
        optionSource:'/estado-arbol',
        optionValue:'id_estado',
        optionLabel:'nombre_estado',
      },
      { name:'numero_surco', label:'Surco', type:'number', required:true, min:1 },
      { name:'posicion_y', label:'Posición Y (lugar en surco)', type:'number', required:true, min:1 },
      { name:'descripcion', label:'Descripción', type:'textarea', maxLength:500 },
    ],
  },

  'historial-estados': {
    title:'Historial de Estados',
    endpoint:'/historial-estado',
    icon:'history',
    fields:[
      {
        name:'id_finca',
        label:'Finca',
        type:'remote-select',
        required:true,
        optionSource:'/finca',
        optionValue:'id_finca',
        optionLabel:'nombre_finca',
        omitOnSubmit:true,
      },
      {
        name:'id_sector',
        label:'Sector',
        type:'remote-select',
        required:true,
        optionSource:'/sector',
        optionValue:'id_sector',
        optionLabel:'nombre_sector',
        omitOnSubmit:true,
        dependsOn:{
          field:'id_finca',
          queryParam:'id_finca',
        },
      },
      {
        name:'id_arbol',
        label:'Árbol',
        type:'remote-select',
        required:true,
        optionSource:'/arbol',
        optionValue:'ID_ARBOL',
        optionLabel:'LABEL',
        dependsOn:{
          field:'id_sector',
          queryParam:'id_sector',
        },
      },
      {
        name:'id_estado_nuevo',
        label:'Nuevo estado',
        type:'remote-select',
        required:true,
        optionSource:'/estado-arbol',
        optionValue:'id_estado',
        optionLabel:'nombre_estado',
      },
      { name:'fecha_cambio', label:'Fecha de cambio', type:'date', required:true, noFutureDate:true },
      { name:'observaciones', label:'Observaciones', type:'textarea', maxLength:500 },
    ],
  },

  'registros-plaga': {
    title:'Registros de Plaga',
    endpoint:'/registro-plaga',
    icon:'pest_control',
    fields:[
      {
        name:'id_finca',
        label:'Finca',
        type:'remote-select',
        required:true,
        optionSource:'/finca',
        optionValue:'id_finca',
        optionLabel:'nombre_finca',
        omitOnSubmit:true,
      },
      {
        name:'id_sector',
        label:'Sector',
        type:'remote-select',
        required:true,
        optionSource:'/sector',
        optionValue:'id_sector',
        optionLabel:'nombre_sector',
        omitOnSubmit:true,
        dependsOn:{
          field:'id_finca',
          queryParam:'id_finca',
        },
      },
      {
        name:'id_arbol',
        label:'Árbol',
        type:'remote-select',
        required:true,
        optionSource:'/arbol',
        optionValue:'ID_ARBOL',
        optionLabel:'LABEL',
        dependsOn:{
          field:'id_sector',
          queryParam:'id_sector',
        },
      },
      {
        name:'id_plaga',
        label:'Plaga o enfermedad',
        type:'remote-select',
        required:true,
        optionSource:'/plaga-enfermedad',
        optionValue:'ID_PLAGA',
        optionLabel:'NOMBRE_PLAGA',
      },
      { name:'fecha_deteccion', label:'Detección', type:'date', required:true, noFutureDate:true },
      { name:'fecha_resolucion', label:'Resolución', type:'date', noFutureDate:true, minDateField:'fecha_deteccion' },
      { name:'observaciones', label:'Observaciones', type:'textarea', maxLength:500 },
    ],
  },

  'registros-tratamiento': {
    title:'Registros de Tratamiento',
    endpoint:'/registro-tratamiento',
    icon:'assignment',
    fields:[
      {
        name:'id_finca',
        label:'Finca',
        type:'remote-select',
        required:true,
        optionSource:'/finca',
        optionValue:'id_finca',
        optionLabel:'nombre_finca',
        omitOnSubmit:true,
      },
      {
        name:'id_sector',
        label:'Sector',
        type:'remote-select',
        required:true,
        optionSource:'/sector',
        optionValue:'id_sector',
        optionLabel:'nombre_sector',
        omitOnSubmit:true,
        dependsOn:{
          field:'id_finca',
          queryParam:'id_finca',
        },
      },
      {
        name:'id_arbol',
        label:'Árbol',
        type:'remote-select',
        required:true,
        optionSource:'/arbol',
        optionValue:'ID_ARBOL',
        optionLabel:'LABEL',
        dependsOn:{
          field:'id_sector',
          queryParam:'id_sector',
        },
      },
      {
        name:'id_tipo_tratamiento',
        label:'Tratamiento',
        type:'remote-select',
        required:true,
        optionSource:'/tipo-tratamiento',
        optionValue:'id_tipo_tratamiento',
        optionLabel:'nombre_tratamiento',
      },
      {
        name:'id_fertilizante',
        label:'Fertilizante',
        type:'remote-select',
        optionSource:'/tipo-fertilizante',
        optionValue:'id_fertilizante',
        optionLabel:'nombre_fertilizante',
      },
      { name:'fecha_aplicacion', label:'Fecha aplic.', type:'date', required:true, noFutureDate:true },
      { name:'observaciones', label:'Observaciones', type:'textarea', maxLength:500 },
    ],
  },

  resiembras: {
    title:'Resiembras',
    endpoint:'/resiembra',
    icon:'restart_alt',
    fields:[
      {
        name:'id_finca',
        label:'Finca',
        type:'remote-select',
        required:true,
        optionSource:'/finca',
        optionValue:'id_finca',
        optionLabel:'nombre_finca',
        omitOnSubmit:true,
      },
      {
        name:'id_sector',
        label:'Sector',
        type:'remote-select',
        required:true,
        optionSource:'/sector',
        optionValue:'id_sector',
        optionLabel:'nombre_sector',
        omitOnSubmit:true,
        dependsOn:{
          field:'id_finca',
          queryParam:'id_finca',
        },
      },
      {
        name:'id_arbol_nuevo',
        label:'Árbol',
        type:'remote-select',
        required:true,
        optionSource:'/arbol',
        optionValue:'ID_ARBOL',
        optionLabel:'LABEL',
        dependsOn:{
          field:'id_sector',
          queryParam:'id_sector',
        },
      },
      { name:'fecha_resiembra', label:'Fecha', type:'date', required:true, noFutureDate:true },
      { name:'motivo', label:'Motivo', type:'textarea', required:true, minLength:5, maxLength:500 },
    ],
  },

  'movimiento-inventario': {
    title:'Movimiento de Inventario',
    endpoint:'/movimiento-inventario',
    icon:'swap_horiz',
    fields:[
      {
        name:'id_finca',
        label:'Finca',
        type:'remote-select',
        required:true,
        optionSource:'/finca',
        optionValue:'id_finca',
        optionLabel:'nombre_finca',
        omitOnSubmit:true,
      },
      {
        name:'id_sector',
        label:'Sector',
        type:'remote-select',
        required:true,
        optionSource:'/sector',
        optionValue:'id_sector',
        optionLabel:'nombre_sector',
        omitOnSubmit:true,
        dependsOn:{
          field:'id_finca',
          queryParam:'id_finca',
        },
      },
      {
        name:'id_arbol',
        label:'Árbol',
        type:'remote-select',
        required:true,
        optionSource:'/arbol',
        optionValue:'ID_ARBOL',
        optionLabel:'LABEL',
        dependsOn:{
          field:'id_sector',
          queryParam:'id_sector',
        },
      },
      {
        name:'id_tipo_movimiento',
        label:'Tipo movimiento',
        type:'remote-select',
        required:true,
        optionSource:'/tipo-movimiento',
        optionValue:'ID_TIPO_MOVIMIENTO',
        optionLabel:'NOMBRE',
      },
      { name:'fecha_movimiento', label:'Fecha movimiento', type:'date', required:true, noFutureDate:true },
      { name:'observaciones', label:'Observaciones', type:'textarea', maxLength:500 },
    ],
  },
};

export const NAV_SECTIONS = [
  {
    title: 'Catálogos',
    entries: [
      { key:'tipos-variedad', label:'Variedades', icon:'category' },
      { key:'tipos-fertilizante', label:'Fertilizantes', icon:'science' },
      { key:'tipos-tratamiento', label:'Tratamientos', icon:'medical_services' },
      { key:'estados-arbol', label:'Estados de árbol', icon:'device_hub' },
      { key:'plagas-enfermedades', label:'Plagas y Enfermedades', icon:'bug_report' },
    ],
  },
  {
    title: 'Operativo',
    entries: [
      { key:'fincas', label:'Fincas', icon:'landscape' },
      { key:'sectores', label:'Sectores', icon:'map' },
      { key:'arboles', label:'Árboles', icon:'park' },
    ],
  },
  {
    title: 'Registros',
    entries: [
      { key:'historial-estados', label:'Historial de estados', icon:'history' },
      { key:'registros-plaga', label:'Reg. de plagas', icon:'pest_control' },
      { key:'registros-tratamiento', label:'Reg. de tratamientos', icon:'assignment' },
      { key:'resiembras', label:'Resiembras', icon:'restart_alt' },
      { key:'movimiento-inventario', label:'Mov. inventario', icon:'swap_horiz' },
    ],
  },
  {
    title: 'Mapa',
    entries: [
      { key:'mapa-plano', label:'Mapa de árboles', icon:'map' },
    ],
  },
];

export const MODULE_PK = {
  'fincas': 'ID_FINCA',
  'sectores': 'ID_SECTOR',
  'arboles': 'ID_ARBOL',
  'tipos-variedad': 'ID_TIPO_ARBOL',
  'tipos-fertilizante': 'ID_FERTILIZANTE',
  'tipos-tratamiento': 'ID_TIPO_TRATAMIENTO',
  'estados-arbol': 'ID_ESTADO',
  'plagas-enfermedades': 'ID_PLAGA',
  'historial-estados': 'ID_HISTORIAL',
  'registros-plaga': 'ID_REGISTRO',
  'registros-tratamiento': 'ID_REGISTRO',
  'resiembras': 'ID_RESIEMBRA',
  'movimiento-inventario': 'ID',
};