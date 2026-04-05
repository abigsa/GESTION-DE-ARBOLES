import React, { useMemo, useState } from "react";
import "./App.css";
import GenericCrudModule from "./components/GenericCrudModule";
import MovimientoInventarioModule from "./components/MovimientoInventarioModule";
import MapaPlanoModule from "./components/MapaPlanoModule";

const MENU_ITEMS = [
  { key: "tipos-variedad", label: "Tipos de Variedad de Árbol" },
  { key: "tipos-fertilizante", label: "Tipos de Fertilizante" },
  { key: "tipos-tratamiento", label: "Tipos de Tratamiento" },
  { key: "estados-arbol", label: "Estados del Árbol" },
  { key: "fincas", label: "Fincas" },
  { key: "sectores", label: "Sectores" },
  { key: "plagas-enfermedades", label: "Plagas y Enfermedades" },
  { key: "arboles", label: "Árboles" },
  { key: "historial-estados", label: "Historial de Estados" },
  { key: "registros-plaga", label: "Registros de Plaga" },
  { key: "registros-tratamiento", label: "Registros de Tratamiento" },
  { key: "resiembras", label: "Resiembras" },
  { key: "movimiento-inventario", label: "Movimiento Inventario" },
  { key: "mapa-plano", label: "Mapa Agrícola" }
];

const MODULES_CONFIG = {
  "tipos-variedad": {
    title: "Tipos de Variedad de Árbol",
    endpoint: "/tipos-variedad",
    fields: [
      {
        name: "nombre_arbol",
        label: "Nombre del árbol",
        type: "text",
        required: true,
      },
      {
        name: "tipo_uso",
        label: "Tipo de uso",
        type: "text",
        required: true,
      },
      {
        name: "descripcion",
        label: "Descripción",
        type: "textarea",
      },
    ],
  },

  "tipos-fertilizante": {
    title: "Tipos de Fertilizante",
    endpoint: "/tipo-fertilizante",
    fields: [
      {
        name: "nombre_fertilizante",
        label: "Nombre del fertilizante",
        type: "text",
        required: true,
      },
      {
        name: "tipo_fertilizante",
        label: "Tipo de fertilizante",
        type: "text",
        required: true,
      },
      {
        name: "nutrientes_principales",
        label: "Nutrientes principales",
        type: "textarea",
        required: true,
      },
      {
        name: "metodo_aplicacion",
        label: "Método de aplicación",
        type: "text",
        required: true,
      },
      {
        name: "frecuencia",
        label: "Frecuencia",
        type: "text",
        required: true,
      },
      {
        name: "descripcion",
        label: "Descripción",
        type: "textarea",
      },
    ],
  },

  "tipos-tratamiento": {
    title: "Tipos de Tratamiento",
    endpoint: "/tipo-tratamiento",
    fields: [
      {
        name: "nombre_tratamiento",
        label: "Nombre del tratamiento",
        type: "text",
        required: true,
      },
      {
        name: "categoria",
        label: "Categoría",
        type: "text",
        required: true,
      },
      {
        name: "metodo_aplicacion",
        label: "Método de aplicación",
        type: "text",
        required: true,
      },
      {
        name: "frecuencia",
        label: "Frecuencia",
        type: "text",
        required: true,
      },
      {
        name: "descripcion",
        label: "Descripción",
        type: "textarea",
      },
    ],
  },

  "estados-arbol": {
    title: "Estados del Árbol",
    endpoint: "/estado-arbol",
    fields: [
      {
        name: "nombre_estado",
        label: "Nombre del estado",
        type: "text",
        required: true,
      },
      {
        name: "orden_ciclo",
        label: "Orden del ciclo",
        type: "number",
        required: true,
        validate: (value) => {
          if (value !== "" && Number(value) <= 0) {
            return "Debe ser mayor que 0";
          }
          return "";
        },
      },
      {
        name: "es_productivo",
        label: "¿Es productivo?",
        type: "select",
        required: true,
        options: [
          { id: "S", nombre: "Sí" },
          { id: "N", nombre: "No" },
        ],
        optionValue: "id",
        optionLabel: "nombre",
      },
      {
        name: "descripcion",
        label: "Descripción",
        type: "textarea",
      },
    ],
  },

  fincas: {
    title: "Fincas",
    endpoint: "/finca",
    fields: [
      {
        name: "nombre_finca",
        label: "Nombre de la finca",
        type: "text",
        required: true,
      },
      {
        name: "ubicacion",
        label: "Ubicación",
        type: "text",
        required: true,
      },
      {
        name: "area_hectareas",
        label: "Área (hectáreas)",
        type: "number",
        required: true,
        validate: (value) => {
          if (value !== "" && Number(value) <= 0) {
            return "Debe ser mayor que 0";
          }
          return "";
        },
      },
      {
        name: "propietario",
        label: "Propietario",
        type: "text",
        required: true,
      },
      {
        name: "telefono_contacto",
        label: "Teléfono de contacto",
        type: "text",
        required: true,
      },
      {
        name: "descripcion",
        label: "Descripción",
        type: "textarea",
      },

      /* NUEVOS CAMPOS DEL MAPA */
      {
        name: "ancho",
        label: "Ancho del terreno (metros)",
        type: "number",
        required: false,
      },
      {
        name: "largo",
        label: "Largo del terreno (metros)",
        type: "number",
        required: false,
      },
    ],
  },

  sectores: {
    title: "Sectores",
    endpoint: "/sector",
    fields: [
      {
        name: "id_finca",
        label: "Finca",
        type: "select",
        required: true,
        optionsEndpoint: "/finca",
        optionValue: "ID_FINCA",
        optionLabel: "NOMBRE_FINCA",
      },
      {
        name: "nombre_sector",
        label: "Nombre del sector",
        type: "text",
        required: true,
      },
      {
        name: "area_hectareas",
        label: "Área hectáreas",
        type: "number",
      },
      {
        name: "numero_surcos",
        label: "Número de surcos",
        type: "number",
        validate: (value) => {
          if (value !== "" && Number(value) < 0) {
            return "No puede ser negativo";
          }
          return "";
        },
      },
      {
        name: "posiciones_por_surco",
        label: "Posiciones por surco",
        type: "number",
        validate: (value) => {
          if (value !== "" && Number(value) < 0) {
            return "No puede ser negativo";
          }
          return "";
        },
      },
      {
        name: "tipo_cultivo",
        label: "Tipo de cultivo",
        type: "select",
        options: [
          { id: "CACAO", nombre: "Cacao" },
          { id: "CAFE", nombre: "Café" },
          { id: "AGUACATE", nombre: "Aguacate" },
          { id: "OTRO", nombre: "Otro" },
        ],
        optionValue: "id",
        optionLabel: "nombre",
      },
    ],
  },

  "plagas-enfermedades": {
    title: "Plagas y Enfermedades",
    endpoint: "/plaga-enfermedad",
    fields: [
      {
        name: "nombre_plaga",
        label: "Nombre de la plaga o enfermedad",
        type: "text",
        required: true,
      },
      {
        name: "tipo_plaga",
        label: "Tipo",
        type: "select",
        required: true,
        options: [
          { id: "PLAGA", nombre: "Plaga" },
          { id: "ENFERMEDAD", nombre: "Enfermedad" },
        ],
        optionValue: "id",
        optionLabel: "nombre",
      },
      {
        name: "nivel_riesgo",
        label: "Nivel de riesgo",
        type: "select",
        required: true,
        options: [
          { id: "BAJO", nombre: "Bajo" },
          { id: "MEDIO", nombre: "Medio" },
          { id: "ALTO", nombre: "Alto" },
        ],
        optionValue: "id",
        optionLabel: "nombre",
      },
      {
        name: "descripcion",
        label: "Descripción",
        type: "textarea",
      },
    ],
  },

  arboles: {
    title: "Árboles",
    endpoint: "/arbol",
    fields: [
      {
        name: "id_sector",
        label: "Sector",
        type: "select",
        required: true,
        optionsEndpoint: "/sector",
        optionValue: "ID_SECTOR",
        optionLabel: "NOMBRE_SECTOR",
      },
      {
        name: "id_tipo_variedad_arbol",
        label: "Tipo de variedad",
        type: "select",
        required: true,
        optionsEndpoint: "/tipos-variedad",
        optionValue: "ID_TIPO_VARIEDAD_ARBOL",
        optionLabel: "NOMBRE_ARBOL",
      },
      {
        name: "id_estado",
        label: "Estado",
        type: "select",
        required: true,
        optionsEndpoint: "/estado-arbol",
        optionValue: "ID_ESTADO",
        optionLabel: "NOMBRE_ESTADO",
      },
      {
        name: "numero_surco",
        label: "Número de surco",
        type: "number",
        required: true,
      },
      {
        name: "descripcion",
        label: "Descripción",
        type: "textarea",
      },
    ],
  },

  "historial-estados": {
    title: "Historial de Estados",
    endpoint: "/historial-estado",
    fields: [
      {
        name: "id_arbol",
        label: "Árbol",
        type: "select",
        required: true,
        optionsEndpoint: "/arbol",
        optionValue: "ID_ARBOL",
        optionLabel: "NOMBRE_ARBOL",
      },
      {
        name: "id_estado_nuevo",
        label: "Nuevo estado",
        type: "select",
        required: true,
        optionsEndpoint: "/estado-arbol",
        optionValue: "ID_ESTADO",
        optionLabel: "NOMBRE_ESTADO",
      },
      {
        name: "observaciones",
        label: "Observaciones",
        type: "textarea",
      },
    ],
  },

  "registros-plaga": {
    title: "Registros de Plaga",
    endpoint: "/registro-plaga",
    fields: [
      {
        name: "id_arbol",
        label: "Árbol",
        type: "select",
        required: true,
        optionsEndpoint: "/arbol",
        optionValue: "ID_ARBOL",
        optionLabel: "NOMBRE_ARBOL",
      },
      {
        name: "id_plaga",
        label: "Plaga / Enfermedad",
        type: "select",
        required: true,
        optionsEndpoint: "/plaga-enfermedad",
        optionValue: "ID_PLAGA",
        optionLabel: "NOMBRE_PLAGA",
      },
      {
        name: "fecha_deteccion",
        label: "Fecha de detección",
        type: "date",
        required: true,
      },
      {
        name: "fecha_resolucion",
        label: "Fecha de resolución",
        type: "date",
      },
      {
        name: "observaciones",
        label: "Observaciones",
        type: "textarea",
      },
    ],
  },

  "registros-tratamiento": {
    title: "Registros de Tratamiento",
    endpoint: "/registro-tratamiento",
    fields: [
      {
        name: "id_arbol",
        label: "Árbol",
        type: "select",
        required: true,
        optionsEndpoint: "/arbol",
        optionValue: "ID_ARBOL",
        optionLabel: "NOMBRE_ARBOL",
      },
      {
        name: "id_tipo_tratamiento",
        label: "Tipo de tratamiento",
        type: "select",
        required: true,
        optionsEndpoint: "/tipo-tratamiento",
        optionValue: "ID_TIPO_TRATAMIENTO",
        optionLabel: "NOMBRE_TRATAMIENTO",
      },
      {
        name: "id_fertilizante",
        label: "Tipo de fertilizante",
        type: "select",
        optionsEndpoint: "/tipo-fertilizante",
        optionValue: "ID_FERTILIZANTE",
        optionLabel: "NOMBRE_FERTILIZANTE",
      },
      {
        name: "fecha_aplicacion",
        label: "Fecha de aplicación",
        type: "date",
        required: true,
      },
      {
        name: "observaciones",
        label: "Observaciones",
        type: "textarea",
      },
    ],
  },

  resiembras: {
    title: "Resiembras",
    endpoint: "/resiembra",
    fields: [
      {
        name: "id_arbol_nuevo",
        label: "Árbol",
        type: "select",
        required: true,
        optionsEndpoint: "/arbol",
        optionValue: "ID_ARBOL",
        optionLabel: "NOMBRE_ARBOL",
      },
      {
        name: "fecha_resiembra",
        label: "Fecha de resiembra",
        type: "date",
        required: true,
      },
      {
        name: "motivo",
        label: "Motivo",
        type: "textarea",
        required: true,
      },
    ],
  },
};

function App() {
  const [activeModule, setActiveModule] = useState("tipos-variedad");

  const activeConfig = useMemo(
    () => MODULES_CONFIG[activeModule],
    [activeModule]
  );

  const renderModule = () => {
    if (activeModule === "movimiento-inventario") {
      return <MovimientoInventarioModule />;
    }

    if (activeModule === "mapa-plano") {
      return <MapaPlanoModule />;
    }

    if (!activeConfig) {
      return (
        <div className="module-page">
          <div className="card table-card">
            <h2>Módulo no encontrado</h2>
            <p>No existe configuración para el módulo seleccionado.</p>
          </div>
        </div>
      );
    }

    return (
      <GenericCrudModule
        title={activeConfig.title}
        endpoint={activeConfig.endpoint}
        fields={activeConfig.fields}
      />
    );
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand-card">
          <div className="brand-icon">🌳</div>
          <div>
            <h2>Gestión de Árboles</h2>
            <p>CRUD colaborativo</p>
          </div>
        </div>

        <nav className="menu">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`menu-item ${
                activeModule === item.key ? "active" : ""
              }`}
              onClick={() => setActiveModule(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">{renderModule()}</main>
    </div>
  );
}

export default App;