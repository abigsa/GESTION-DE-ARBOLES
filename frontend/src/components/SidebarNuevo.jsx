import { useAuth } from '../context/AuthContext';
import { NAV_SECTIONS } from '../config/modulesNuevo';
import s from './SidebarNuevo.module.css';

export default function SidebarNuevo({ activeKey, onSelect, mode = 'full' }) {
  const { logout, displayName, rolLabel } = useAuth();

  // ── Rail compacto (tablet) ─────────────────────
  if (mode === 'rail') return (
    <nav className={s.rail}>
      <div className={s.railLogo}>
        <span className="material-icons">park</span>
      </div>
      <div className={s.railDiv} />
      {NAV_SECTIONS.flatMap(sec => sec.entries).map(e => (
        <button key={e.key} title={e.label}
          className={`${s.railBtn} ${activeKey === e.key ? s.railActive : ''}`}
          onClick={() => onSelect(e.key)}>
          <span className="material-icons">{e.icon}</span>
        </button>
      ))}
      <div style={{flex:1}} />
      <div className={s.railDiv} />
      <button className={s.railBtn} title="Cerrar sesión"
        style={{color:'var(--rojo-alerta)'}} onClick={logout}>
        <span className="material-icons">logout</span>
      </button>
    </nav>
  );

  // ── Sidebar completo (desktop) ─────────────────
  return (
    <nav className={s.sidebar}>
      {/* Logo */}
      <div className={s.logo}>
        <div className={s.logoIcon}>
          <span className="material-icons">park</span>
        </div>
        <div>
          <p className={s.logoTitle}>Gestión Árboles</p>
          <p className={s.logoSub}>Panel de control</p>
        </div>
      </div>

      {/* Navegación */}
      <div className={s.nav}>
        <button
          className={`${s.navItem} ${activeKey === '' ? s.navActive : ''}`}
          onClick={() => onSelect('')}>
          <span className="material-icons">dashboard</span>
          <span>Inicio</span>
        </button>

        {NAV_SECTIONS.map(sec => (
          <div key={sec.title}>
            <p className={s.secLabel}>{sec.title}</p>
            {sec.entries.map(e => (
              <button key={e.key}
                className={`${s.navItem} ${activeKey === e.key ? s.navActive : ''}`}
                onClick={() => onSelect(e.key)}>
                <span className="material-icons">{e.icon}</span>
                <span>{e.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={s.footer}>
        <div className={s.userInfo}>
          <div className={s.avatar}>{displayName[0]?.toUpperCase()}</div>
          <div>
            <p className={s.userName}>{displayName}</p>
            <p className={s.userRole}>{rolLabel}</p>
          </div>
        </div>
        <button className={s.logoutBtn} onClick={logout}>
          <span className="material-icons">logout</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </nav>
  );
}
