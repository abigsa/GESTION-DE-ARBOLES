import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login          from './pages/Login';
import Registro       from './pages/Registro';
import PerfilUsuario  from './pages/PerfilUsuario';
import SidebarNuevo   from './components/SidebarNuevo';
import DashboardNuevo from './components/DashboardNuevo';
import CrudPageNuevo  from './components/CrudPageNuevo';
import MapaPlanoModule from './components/MapaPlanoModule';
import GestionUsuarios from './components/GestionUsuarios';

export default function AppNuevo() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

// ── Router principal ──────────────────────────────
function Router() {
  const { isLoggedIn, iniciando } = useAuth();
  const [page, setPage] = useState('login');

  if (iniciando) return <Splash />;

  if (!isLoggedIn) {
    return page === 'registro'
      ? <Registro onLogin={() => setPage('login')} />
      : <Login   onRegistro={() => setPage('registro')} />;
  }

  return <MainLayout />;
}

// ── Layout autenticado ────────────────────────────
function MainLayout() {
  const [activeKey,   setActiveKey]   = useState('');
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isDesktop = windowWidth >= 900;
  const isTablet  = windowWidth >= 600 && windowWidth < 900;
  const isMobile  = windowWidth < 600;

  const handleSelect = key => {
    setActiveKey(key);
    if (isMobile) setDrawerOpen(false);
  };

  return (
    <div className="appShell">
      {isDesktop && (
        <SidebarNuevo activeKey={activeKey} onSelect={handleSelect} mode="full" />
      )}
      {isTablet && (
        <SidebarNuevo activeKey={activeKey} onSelect={handleSelect} mode="rail" />
      )}
      {isMobile && drawerOpen && (
        <>
          <div className="mobileOverlay" onClick={() => setDrawerOpen(false)} />
          <div className="mobileDrawer">
            <SidebarNuevo activeKey={activeKey} onSelect={handleSelect} mode="full" />
          </div>
        </>
      )}

      <div className="appMain">
        {isMobile && (
          <div className="mobileTopbar">
            <button
              className="mobileMenuBtn"
              onClick={() => setDrawerOpen(d => !d)}
              type="button"
            >
              <span className="material-icons">menu</span>
            </button>
            <div className="mobileBrand">
              <div className="mobileBrandIcon">
                <span className="material-icons">park</span>
              </div>
              <div className="mobileBrandText">
                <span>Gestión Árboles</span>
                <small>Panel agrícola</small>
              </div>
            </div>
          </div>
        )}

        <main className="appContent">
          <ActivePage activeKey={activeKey} onSelect={setActiveKey} />
        </main>
      </div>
    </div>
  );
}

// ── Página activa ─────────────────────────────────
function ActivePage({ activeKey, onSelect }) {

  // Dashboard
  if (!activeKey) {
    return <DashboardNuevo onSelect={onSelect} />;
  }

  // Perfil de usuario
  if (activeKey === 'perfil') {
    return <PerfilUsuario onBack={() => onSelect('')} />;
  }

  // Gestión de usuarios (solo Super Admin)
  if (activeKey === 'gestion-usuarios') {
    return <GestionUsuarios onBack={() => onSelect('')} />;
  }

  // Mapa
  if (activeKey === 'mapa-plano') {
    return (
      <div className="mapPage">
        <div className="pageToolbar">
          <button
            className="breadcrumbBtn"
            onClick={() => onSelect('')}
            type="button"
          >
            <span className="material-icons">arrow_back_ios</span>
            Inicio
          </button>
          <span className="breadcrumbSep">/</span>
          <span className="breadcrumbCurrent">Mapa de árboles</span>
        </div>
        <div className="mapWrapper">
          <MapaPlanoModule />
        </div>
      </div>
    );
  }

  // CRUD módulos
  return <CrudPageNuevo moduleKey={activeKey} onBack={() => onSelect('')} />;
}

// ── Splash de carga ───────────────────────────────
function Splash() {
  return (
    <div className="splashScreen">
      <div className="splashSpinner" />
      <p className="splashText">Cargando sistema...</p>
    </div>
  );
}
