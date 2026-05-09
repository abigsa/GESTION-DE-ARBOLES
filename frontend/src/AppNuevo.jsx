import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login          from './pages/Login';
import Registro       from './pages/Registro';
import PerfilUsuario  from './pages/PerfilUsuario';
import SidebarNuevo   from './components/SidebarNuevo';
import DashboardNuevo from './components/DashboardNuevo';
import CrudPageNuevo  from './components/CrudPageNuevo';
import MapaPlanoModule from './components/MapaPlanoModule';
import GestionUsuarios      from './components/GestionUsuarios';
import NotificacionesPanel  from './components/NotificacionesPanel';
import HistorialCambios  from './components/HistorialCambios';
import ReporteHistorialEstados from './components/ReporteHistorialEstados';

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
            <div style={{marginLeft:'auto'}}>
              <NotificacionesPanel />
            </div>
          </div>
        )}
        {!isMobile && (
          <div className="desktopTopbar">
            <div style={{marginLeft:'auto'}}>
              <NotificacionesPanel />
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


// ── Permisos por rol ──────────────────────────────
// rol_id=1 Super Admin, rol_id=2 Admin, rol_id=3 Técnico de campo
const SOLO_ADMIN = new Set([
  'gestion-usuarios',          // solo rol 1
]);
const REQUIERE_ADMIN = new Set([
  'historial-cambios',
  'reporte-historial-estados',
  'tipos-variedad', 'tipos-fertilizante', 'tipos-tratamiento',
  'estados-arbol', 'plagas-enfermedades',  // catálogos
]);
// Técnico puede: fincas, sectores, arboles, registros, mapa, perfil

function canAccess(key, rolId) {
  if (!key) return true; // dashboard siempre
  if (key === 'perfil') return true;
  if (SOLO_ADMIN.has(key))       return rolId === 1;
  if (REQUIERE_ADMIN.has(key))   return rolId <= 2;
  return true; // resto accesible para todos
}

// ── Página activa ─────────────────────────────────
function ActivePage({ activeKey, onSelect }) {
  const { usuario } = useAuth();
  const rolId = usuario?.ROL_ID ?? usuario?.rol_id ?? 3;

  // Verificar acceso
  if (activeKey && !canAccess(activeKey, rolId)) {
    return <AccesoDenegado onBack={() => onSelect('')} rolId={rolId} />;
  }

  // Dashboard
  if (!activeKey) return <DashboardNuevo onSelect={onSelect} />;

  // Perfil
  if (activeKey === 'perfil') return <PerfilUsuario onBack={() => onSelect('')} />;

  // Gestión de usuarios (Super Admin)
  if (activeKey === 'gestion-usuarios') return <GestionUsuarios onBack={() => onSelect('')} />;

  // Historial de cambios (Admin+)
  if (activeKey === 'historial-cambios') return <HistorialCambios onBack={() => onSelect('')} />;

  // Reporte historial de estados
  if (activeKey === 'reporte-historial-estados') return <ReporteHistorialEstados onBack={() => onSelect('')} />;

  // Mapa
  if (activeKey === 'mapa-plano') {
    return (
      <div className="mapPage">
        <div className="pageToolbar">
          <button className="breadcrumbBtn" onClick={() => onSelect('')} type="button">
            <span className="material-icons">arrow_back_ios</span> Inicio
          </button>
          <span className="breadcrumbSep">/</span>
          <span className="breadcrumbCurrent">Mapa de árboles</span>
        </div>
        <div className="mapWrapper"><MapaPlanoModule /></div>
      </div>
    );
  }

  // CRUD módulos
  return <CrudPageNuevo moduleKey={activeKey} onBack={() => onSelect('')} />;
}

// ── Pantalla acceso denegado ──────────────────────
function AccesoDenegado({ onBack, rolId }) {
  return (
    <div style={{
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', height:'100%', gap:16, padding:32, textAlign:'center'
    }}>
      <div style={{
        width:80, height:80, borderRadius:24, background:'#FFEBEE',
        display:'flex', alignItems:'center', justifyContent:'center'
      }}>
        <span className="material-icons" style={{fontSize:40, color:'#8B2E2E'}}>lock</span>
      </div>
      <h2 style={{fontSize:22, fontWeight:800, color:'#1B4D2A'}}>Acceso restringido</h2>
      <p style={{fontSize:13, color:'#8B6F47', maxWidth:360, lineHeight:1.6}}>
        No tienes permisos para acceder a este módulo.
        {rolId === 3 && ' Los catálogos y configuraciones requieren rol de Administrador.'}
      </p>
      <button
        onClick={onBack} type="button"
        style={{
          background:'#1B4D2A', color:'#fff', padding:'12px 24px',
          borderRadius:12, fontWeight:700, fontSize:13, cursor:'pointer',
          display:'flex', alignItems:'center', gap:8
        }}
      >
        <span className="material-icons" style={{fontSize:18}}>arrow_back</span>
        Volver al inicio
      </button>
    </div>
  );
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
