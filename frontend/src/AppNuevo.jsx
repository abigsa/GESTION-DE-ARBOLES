import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login           from './pages/Login';
import Registro        from './pages/Registro';
import SidebarNuevo    from './components/SidebarNuevo';
import DashboardNuevo  from './components/DashboardNuevo';
import CrudPageNuevo   from './components/CrudPageNuevo';
// ── MapaPlanoModule se importa directamente desde tu carpeta existente ──
import MapaPlanoModule from './components/MapaPlanoModule';

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
  const [page, setPage] = useState('login'); // 'login' | 'registro'

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

  const handleSelect = (key) => {
    setActiveKey(key);
    if (isMobile) setDrawerOpen(false);
  };

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>

      {/* Sidebar desktop */}
      {isDesktop && (
        <SidebarNuevo activeKey={activeKey} onSelect={handleSelect} mode="full" />
      )}

      {/* Rail tablet */}
      {isTablet && (
        <SidebarNuevo activeKey={activeKey} onSelect={handleSelect} mode="rail" />
      )}

      {/* Drawer móvil — overlay */}
      {isMobile && drawerOpen && (
        <>
          <div
            onClick={() => setDrawerOpen(false)}
            style={{
              position:'fixed', inset:0, zIndex:50,
              background:'rgba(0,0,0,.4)',
            }}
          />
          <div style={{
            position:'fixed', left:0, top:0, bottom:0,
            zIndex:51, width:260,
          }}>
            <SidebarNuevo activeKey={activeKey} onSelect={handleSelect} mode="full" />
          </div>
        </>
      )}

      {/* Contenido principal */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* TopBar solo en móvil */}
        {isMobile && (
          <div style={{
            height:58, background:'var(--verde-profundo)',
            display:'flex', alignItems:'center', gap:12,
            padding:'0 16px', flexShrink:0,
          }}>
            <button
              onClick={() => setDrawerOpen(d => !d)}
              style={{ color:'#fff', display:'flex', alignItems:'center' }}>
              <span className="material-icons">menu</span>
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{
                width:32, height:32, background:'var(--oro-forestal)',
                borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <span className="material-icons"
                  style={{ color:'var(--verde-profundo)', fontSize:18 }}>park</span>
              </div>
              <span style={{ color:'#fff', fontSize:14, fontWeight:700 }}>
                Gestión Árboles
              </span>
            </div>
          </div>
        )}

        {/* Página activa */}
        <div style={{ flex:1, overflow:'auto' }}>
          <ActivePage activeKey={activeKey} onSelect={setActiveKey} />
        </div>
      </div>
    </div>
  );
}

// ── Página activa según key ───────────────────────
function ActivePage({ activeKey, onSelect }) {
  // Dashboard
  if (!activeKey) {
    return <DashboardNuevo onSelect={onSelect} />;
  }

  // Mapa plano — usa tu componente existente
  if (activeKey === 'mapa-plano') {
    return (
      <div style={{ height:'100%', overflow:'auto' }}>
        {/* Botón volver */}
        <div style={{
          padding:'12px 24px', background:'#fff',
          borderBottom:'1px solid var(--pergamino-verde)',
          display:'flex', alignItems:'center', gap:6,
        }}>
          <button
            onClick={() => onSelect('')}
            style={{
              display:'flex', alignItems:'center', gap:4,
              color:'var(--tierra-calida)', fontSize:12,
              padding:'2px 8px', borderRadius:'var(--radius-sm)',
            }}>
            <span className="material-icons" style={{fontSize:13}}>arrow_back_ios</span>
            Inicio
          </button>
          <span style={{color:'var(--tierra-calida)',fontSize:12}}>/</span>
          <span style={{color:'var(--verde-medio)',fontWeight:600,fontSize:12}}>
            Mapa de árboles
          </span>
        </div>
        <MapaPlanoModule />
      </div>
    );
  }

  // Módulos CRUD
  return (
    <CrudPageNuevo moduleKey={activeKey} onBack={() => onSelect('')} />
  );
}

// ── Splash de carga ───────────────────────────────
function Splash() {
  return (
    <div style={{
      height:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:12,
      background:'var(--fondo-claro)',
    }}>
      <div style={{
        width:40, height:40,
        border:'3px solid var(--pergamino-verde)',
        borderTopColor:'var(--verde-medio)',
        borderRadius:'50%',
        animation:'spin .7s linear infinite',
      }} />
      <p style={{ color:'var(--tierra-calida)', fontSize:13 }}>Cargando...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
