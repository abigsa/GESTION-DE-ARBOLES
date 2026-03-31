import React, { useState } from "react";
import "./App.css";
import GenericCrudModule from "./components/GenericCrudModule";
import MovimientoInventarioModule from "./components/MovimientoInventarioModule";

function App() {
  const [activeModule, setActiveModule] = useState("tipos-variedad");

  const menuItems = [
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
    { key: "movimiento-inventario", label: "Movimiento Inventario" }
  ];

  const modulesConfig = {
    "tipos-variedad": {
      title: "Tipos de Variedad de Árbol",
      endpoint: "/tipos-variedad",
      fields: [
        { name: "nombre_arbol", label: "Nombre del árbol", type: "text" },
        { name: "tipo_uso", label: "Tipo de uso", type: "text" },
        { name: "descripcion", label: "Descripción", type: "text" }
      ]
    },
    "tipos-fertilizante": {
      title: "Tipos de Fertilizante",
      endpoint: "/tipo-fertilizante",
      fields: [
        { name: "nombre", label: "Nombre", type: "text" },
        { name: "descripcion", label: "Descripción", type: "text" }
      ]
    },
    "tipos-tratamiento": {
      title: "Tipos de Tratamiento",
      endpoint: "/tipo-tratamiento",
      fields: [
        { name: "nombre", label: "Nombre", type: "text" },
        { name: "descripcion", label: "Descripción", type: "text" }
      ]
    },
    "estados-arbol": {
      title: "Estados del Árbol",
      endpoint: "/estado-arbol",
      fields: [
        { name: "nombre", label: "Nombre", type: "text" },
        { name: "descripcion", label: "Descripción", type: "text" }
      ]
    },
    fincas: {
      title: "Fincas",
      endpoint: "/finca",
      fields: [
        { name: "nombre", label: "Nombre", type: "text" },
        { name: "ubicacion", label: "Ubicación", type: "text" },
        { name: "descripcion", label: "Descripción", type: "text" }
      ]
    },
    sectores: {
      title: "Sectores",
      endpoint: "/sector",
      fields: [
        { name: "id_finca", label: "ID Finca", type: "number" },
        { name: "nombre_sector", label: "Nombre del sector", type: "text" },
        { name: "area_hectareas", label: "Área hectáreas", type: "number" },
        { name: "numero_surcos", label: "Número de surcos", type: "number" },
        {
          name: "posiciones_por_surco",
          label: "Posiciones por surco",
          type: "number"
        },
        { name: "tipo_cultivo", label: "Tipo de cultivo", type: "text" }
      ]
    },
    "plagas-enfermedades": {
      title: "Plagas y Enfermedades",
      endpoint: "/plaga-enfermedad",
      fields: [
        { name: "nombre", label: "Nombre", type: "text" },
        { name: "descripcion", label: "Descripción", type: "text" }
      ]
    },
    arboles: {
      title: "Árboles",
      endpoint: "/arbol",
      fields: [
        { name: "id_sector", label: "ID Sector", type: "number" },
        {
          name: "id_tipo_variedad_arbol",
          label: "ID Tipo Variedad",
          type: "number"
        },
        { name: "id_estado", label: "ID Estado", type: "number" },
        { name: "numero_surco", label: "Número de surco", type: "number" },
        { name: "descripcion", label: "Descripción", type: "text" }
      ]
    },
    "historial-estados": {
      title: "Historial de Estados",
      endpoint: "/historial-estado",
      fields: [
        { name: "id_arbol", label: "ID Árbol", type: "number" },
        { name: "id_estado", label: "ID Estado", type: "number" },
        { name: "observacion", label: "Observación", type: "text" }
      ]
    },
    "registros-plaga": {
      title: "Registros de Plaga",
      endpoint: "/registro-plaga",
      fields: [
        { name: "id_arbol", label: "ID Árbol", type: "number" },
        {
          name: "id_plaga_enfermedad",
          label: "ID Plaga/Enfermedad",
          type: "number"
        },
        { name: "observacion", label: "Observación", type: "text" }
      ]
    },
    "registros-tratamiento": {
      title: "Registros de Tratamiento",
      endpoint: "/registro-tratamiento",
      fields: [
        { name: "id_arbol", label: "ID Árbol", type: "number" },
        {
          name: "id_tipo_tratamiento",
          label: "ID Tipo Tratamiento",
          type: "number"
        },
        {
          name: "id_tipo_fertilizante",
          label: "ID Tipo Fertilizante",
          type: "number"
        },
        { name: "observacion", label: "Observación", type: "text" }
      ]
    },
    resiembras: {
      title: "Resiembras",
      endpoint: "/resiembra",
      fields: [
        { name: "id_arbol", label: "ID Árbol", type: "number" },
        { name: "observacion", label: "Observación", type: "text" }
      ]
    }
  };

  const renderModule = () => {
    if (activeModule === "movimiento-inventario") {
      return <MovimientoInventarioModule />;
    }

    const config = modulesConfig[activeModule];

    return (
      <GenericCrudModule
        title={config.title}
        endpoint={config.endpoint}
        fields={config.fields}
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
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`menu-item ${activeModule === item.key ? "active" : ""}`}
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