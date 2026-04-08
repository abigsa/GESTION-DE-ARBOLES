// ── Etiquetas legibles para columnas de BD ────────
export const COL_LABELS = {
  id:'ID', descripcion:'Descripción', estado:'Estado',
  nombre_arbol:'Nombre árbol', tipo_uso:'Tipo de uso',
  nombre_fertilizante:'Nombre', tipo_fertilizante:'Tipo',
  nutrientes_principales:'Nutrientes', metodo_aplicacion:'Método',
  frecuencia:'Frecuencia', nombre_tratamiento:'Nombre',
  categoria:'Categoría', nombre_estado:'Estado',
  orden_ciclo:'Orden ciclo', es_productivo:'Productivo',
  nombre_plaga:'Nombre', tipo_plaga:'Tipo', nivel_riesgo:'Riesgo',
  nombre_finca:'Finca', ubicacion:'Ubicación',
  area_hectareas:'Área (ha)', propietario:'Propietario',
  telefono_contacto:'Teléfono', id_finca:'ID Finca',
  nombre_sector:'Sector', numero_surcos:'Surcos',
  posiciones_por_surco:'Pos/surco', id_sector:'ID Sector',
  id_tipo_variedad_arbol:'Variedad', id_estado:'Estado',
  numero_surco:'Surco', id_arbol:'ID Árbol',
  id_estado_nuevo:'Nuevo estado', observaciones:'Observaciones',
  fecha_cambio:'Fecha cambio', id_plaga:'ID Plaga',
  fecha_deteccion:'Detección', fecha_resolucion:'Resolución',
  id_tipo_tratamiento:'Tratamiento', id_fertilizante:'Fertilizante',
  fecha_aplicacion:'Fecha aplic.', id_arbol_nuevo:'Árbol',
  fecha_resiembra:'Fecha', motivo:'Motivo',
  id_tipo_movimiento: 'Tipo movimiento', fecha_movimiento:'Fecha movimiento',
};

export const colLabel = (key) =>
  COL_LABELS[key?.toLowerCase()] ?? key?.replace(/_/g,' ') ?? key;

// Columnas a ocultar en tabla
export const HIDDEN_COLS = new Set([
  'fecha_creacion','fecha_actualizacion','created_at','updated_at',
  'FECHA_CREACION','FECHA_ACTUALIZACION','CREATED_AT','UPDATED_AT','ACTIVO',
]);

export const DASHBOARD_QUICK_ACCESS = [
  'arboles',
  'fincas',
  'plagas-enfermedades',
  'tipos-tratamiento',
  'mapa-plano',
];

// ── Configuración de cada módulo CRUD ─────────────
export const MODULES = {
  'tipos-variedad': {
    title:'Tipos de Variedad',
    endpoint:'/tipos-variedad',
    icon:'category',
    fields:[
      { name:'nombre_arbol', label:'Nombre del árbol', type:'text', required:true },
      { name:'tipo_uso',     label:'Tipo de uso',      type:'text', required:true },
      { name:'descripcion',  label:'Descripción',      type:'textarea' },
    ],
  },

  'tipos-fertilizante': {
    title:'Fertilizantes',
    endpoint:'/tipo-fertilizante',
    icon:'science',
    fields:[
      { name:'nombre_fertilizante',    label:'Nombre',            type:'text', required:true },
      { name:'tipo_fertilizante',      label:'Tipo',              type:'text', required:true },
      { name:'nutrientes_principales', label:'Nutrientes',        type:'textarea' },
      { name:'metodo_aplicacion',      label:'Método aplicación', type:'text' },
      { name:'frecuencia',             label:'Frecuencia',        type:'text' },
      { name:'descripcion',            label:'Descripción',       type:'textarea' },
    ],
  },

  'tipos-tratamiento': {
    title:'Tratamientos',
    endpoint:'/tipo-tratamiento',
    icon:'medical_services',
    fields:[
      { name:'nombre_tratamiento', label:'Nombre',            type:'text', required:true },
      { name:'categoria',          label:'Categoría',         type:'text' },
      { name:'metodo_aplicacion',  label:'Método aplicación', type:'text' },
      { name:'frecuencia',         label:'Frecuencia',        type:'text' },
      { name:'descripcion',        label:'Descripción',       type:'textarea' },
    ],
  },

  'estados-arbol': {
    title:'Estados de Árbol',
    endpoint:'/estado-arbol',
    icon:'device_hub',
    fields:[
      { name:'nombre_estado', label:'Nombre estado', type:'text', required:true },
      { name:'orden_ciclo',   label:'Orden ciclo',   type:'number' },
      {
        name:'es_productivo',
        label:'Productivo',
        type:'select',
        options:[
          { value:'S', label:'Sí' },
          { value:'N', label:'No' }
        ]
      },
      { name:'descripcion',   label:'Descripción',   type:'textarea' },
    ],
  },

  'plagas-enfermedades': {
    title:'Plagas y Enfermedades',
    endpoint:'/plaga-enfermedad',
    icon:'bug_report',
    fields:[
      { name:'nombre_plaga', label:'Nombre', type:'text', required:true },
      {
        name:'tipo_plaga',
        label:'Tipo',
        type:'select',
        options:[
          { value:'PLAGA', label:'Plaga' },
          { value:'ENFERMEDAD', label:'Enfermedad' }
        ]
      },
      {
        name:'nivel_riesgo',
        label:'Nivel de riesgo',
        type:'select',
        options:[
          { value:'BAJO', label:'Bajo' },
          { value:'MEDIO', label:'Medio' },
          { value:'ALTO', label:'Alto' }
        ]
      },
      { name:'descripcion',  label:'Descripción', type:'textarea' },
    ],
  },

  fincas: {
    title:'Fincas',
    endpoint:'/finca',
    icon:'landscape',
    fields:[
      { name:'nombre_finca',      label:'Nombre finca', type:'text', required:true },
      { name:'ubicacion',         label:'Ubicación',    type:'text' },
      { name:'area_hectareas',    label:'Área (ha)',    type:'number' },
      { name:'propietario',       label:'Propietario',  type:'text' },
      { name:'telefono_contacto', label:'Teléfono',     type:'text' },
      { name:'descripcion',       label:'Descripción',  type:'textarea' },
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
      { name:'nombre_sector',        label:'Nombre sector',  type:'text',   required:true },
      { name:'area_hectareas',       label:'Área (ha)',      type:'number' },
      { name:'numero_surcos',        label:'Surcos',         type:'number' },
      { name:'posiciones_por_surco', label:'Pos. por surco', type:'number' },
    ],
  },

  arboles: {
  title:'Árboles',
  endpoint:'/arbol',
  icon:'park',
  fields:[
    {
      name:'id_finca_filtro',
      label:'Finca',
      type:'remote-select',
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
        field:'id_finca_filtro',
        optionField:'id_finca',
      },
    },
    {
      name:'id_tipo_variedad_arbol',
      label:'Variedad',
      type:'remote-select',
      required:true,
      optionSource:'/tipos-variedad',
      optionValue:'id_tipo_variedad_arbol',
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
    { name:'numero_surco', label:'Surco', type:'number' },
    { name:'descripcion',  label:'Descripción', type:'textarea' },
  ],
},

  'historial-estados': {
  title:'Historial de Estados',
  endpoint:'/historial-estado',
  icon:'history',
  fields:[
    {
      name:'id_sector_filtro',
      label:'Sector',
      type:'remote-select',
      optionSource:'/sector',
      optionValue:'id_sector',
      optionLabel:'nombre_sector',
      omitOnSubmit:true,
    },
    {
      name:'id_arbol',
      label:'Árbol',
      type:'remote-select',
      required:true,
      optionSource:'/arbol',
      optionValue:'id_arbol',
      optionLabel:'descripcion',
      dependsOn:{
        field:'id_sector_filtro',
        optionField:'id_sector',
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
    { name:'observaciones', label:'Observaciones', type:'textarea' },
  ],
},

  'registros-plaga': {
  title:'Registros de Plaga',
  endpoint:'/registro-plaga',
  icon:'pest_control',
  fields:[
    {
      name:'id_sector_filtro',
      label:'Sector',
      type:'remote-select',
      optionSource:'/sector',
      optionValue:'id_sector',
      optionLabel:'nombre_sector',
      omitOnSubmit:true,
    },
    {
      name:'id_arbol',
      label:'Árbol',
      type:'remote-select',
      required:true,
      optionSource:'/arbol',
      optionValue:'id_arbol',
      optionLabel:'descripcion',
      dependsOn:{
        field:'id_sector_filtro',
        optionField:'id_sector',
      },
    },
    {
      name:'id_plaga',
      label:'Plaga o enfermedad',
      type:'remote-select',
      required:true,
      optionSource:'/plaga-enfermedad',
      optionValue:'id_plaga',
      optionLabel:'nombre_plaga',
    },
    { name:'fecha_deteccion',  label:'Detección',  type:'date', required:true },
    { name:'fecha_resolucion', label:'Resolución', type:'date' },
    { name:'observaciones',    label:'Observaciones', type:'textarea' },
  ],
},

  'registros-tratamiento': {
  title:'Registros de Tratamiento',
  endpoint:'/registro-tratamiento',
  icon:'assignment',
  fields:[
    {
      name:'id_sector_filtro',
      label:'Sector',
      type:'remote-select',
      optionSource:'/sector',
      optionValue:'id_sector',
      optionLabel:'nombre_sector',
      omitOnSubmit:true,
    },
    {
      name:'id_arbol',
      label:'Árbol',
      type:'remote-select',
      required:true,
      optionSource:'/arbol',
      optionValue:'id_arbol',
      optionLabel:'descripcion',
      dependsOn:{
        field:'id_sector_filtro',
        optionField:'id_sector',
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
    { name:'fecha_aplicacion', label:'Fecha aplic.', type:'date', required:true },
    { name:'observaciones', label:'Observaciones', type:'textarea' },
  ],
},

  resiembras: {
  title:'Resiembras',
  endpoint:'/resiembra',
  icon:'restart_alt',
  fields:[
    {
      name:'id_sector_filtro',
      label:'Sector',
      type:'remote-select',
      optionSource:'/sector',
      optionValue:'id_sector',
      optionLabel:'nombre_sector',
      omitOnSubmit:true,
    },
    {
      name:'id_arbol_nuevo',
      label:'Árbol',
      type:'remote-select',
      required:true,
      optionSource:'/arbol',
      optionValue:'id_arbol',
      optionLabel:'descripcion',
      dependsOn:{
        field:'id_sector_filtro',
        optionField:'id_sector',
      },
    },
    { name:'fecha_resiembra', label:'Fecha', type:'date', required:true },
    { name:'motivo', label:'Motivo', type:'textarea' },
  ],
},

  'movimiento-inventario': {
  title:'Movimiento de Inventario',
  endpoint:'/movimiento-inventario',
  icon:'swap_horiz',
  fields:[
    {
      name:'id_arbol',
      label:'Árbol',
      type:'remote-select',
      required:true,
      optionSource:'/arbol',
      optionValue:'id_arbol',
      optionLabel:'descripcion',
    },
    {
      name:'id_tipo_movimiento',
      label:'Tipo movimiento',
      type:'remote-select',
      required:true,
      optionSource:'/tipo-movimiento',
      optionValue:'ID_TIPO_MOVIMIENTO',
      optionLabel:'NOMBRE_TIPO_MOVIMIENTO',
    },
    { name:'fecha_movimiento', label:'Fecha movimiento', type:'date', required:true },
    { name:'observaciones', label:'Observaciones', type:'textarea' },
  ],
},
};

// ── Estructura del menú lateral ───────────────────
export const NAV_SECTIONS = [
  {
    title: 'Catálogos',
    entries: [
      { key:'tipos-variedad',      label:'Variedades',            icon:'category' },
      { key:'tipos-fertilizante',  label:'Fertilizantes',         icon:'science' },
      { key:'tipos-tratamiento',   label:'Tratamientos',          icon:'medical_services' },
      { key:'estados-arbol',       label:'Estados de árbol',      icon:'device_hub' },
      { key:'plagas-enfermedades', label:'Plagas y Enfermedades', icon:'bug_report' },
    ],
  },
  {
    title: 'Operativo',
    entries: [
      { key:'fincas',   label:'Fincas',   icon:'landscape' },
      { key:'sectores', label:'Sectores', icon:'map' },
      { key:'arboles',  label:'Árboles',  icon:'park' },
    ],
  },
  {
    title: 'Registros',
    entries: [
      { key:'historial-estados',     label:'Historial de estados', icon:'history' },
      { key:'registros-plaga',       label:'Reg. de plagas',       icon:'pest_control' },
      { key:'registros-tratamiento', label:'Reg. de tratamientos', icon:'assignment' },
      { key:'resiembras',            label:'Resiembras',           icon:'restart_alt' },
      { key:'movimiento-inventario', label:'Mov. inventario',      icon:'swap_horiz' },
    ],
  },
  {
    title: 'Mapa',
    entries: [
      { key:'mapa-plano', label:'Mapa de árboles', icon:'map' },
    ],
  },
];