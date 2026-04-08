import { useEffect, useState } from 'react';
import { API, useAuth } from '../context/AuthContext';
import s from './DashboardNuevo.module.css';

const KPIS = [
  { label:'Total árboles',   icon:'park',             color:'#2D7A3E', ep:'/arbol' },
  { label:'Fincas activas',  icon:'landscape',        color:'#1B4D2A', ep:'/finca' },
  { label:'Plagas activas',  icon:'bug_report',       color:'#8B2E2E', ep:'/plaga-enfermedad', down:true },
  { label:'Tratamientos',    icon:'medical_services', color:'#D4A853', ep:'/tipo-tratamiento' },
];

const QUICK = [
  { key:'tipos-variedad',      label:'Variedades',    icon:'category' },
  { key:'tipos-fertilizante',  label:'Fertilizantes', icon:'science' },
  { key:'tipos-tratamiento',   label:'Tratamientos',  icon:'medical_services' },
  { key:'estados-arbol',       label:'Estados',       icon:'device_hub' },
  { key:'plagas-enfermedades', label:'Plagas',        icon:'bug_report' },
  { key:'fincas',              label:'Fincas',        icon:'landscape' },
  { key:'sectores',            label:'Sectores',      icon:'map' },
  { key:'arboles',             label:'Árboles',       icon:'park' },
  { key:'historial-estados',   label:'Historial',     icon:'history' },
  { key:'registros-plaga',     label:'Reg. plagas',   icon:'pest_control' },
  { key:'registros-tratamiento',label:'Reg. trat.',   icon:'assignment' },
  { key:'resiembras',          label:'Resiembras',    icon:'restart_alt' },
  { key:'movimiento-inventario',label:'Inventario',   icon:'swap_horiz' },
  { key:'mapa-plano',          label:'Mapa',          icon:'map' },
];

export default function DashboardNuevo({ onSelect }) {
  const { displayName, rolLabel } = useAuth();
  const [kpis, setKpis] = useState({});

  useEffect(() => {
    KPIS.forEach(async ({ ep, label }) => {
      try {
        const res  = await fetch(`${API}${ep}`);
        const data = await res.json();
        if (data.ok) setKpis(v => ({ ...v, [label]: data.data?.length ?? 0 }));
      } catch (_) {}
    });
  }, []);

  return (
    <div className={s.root}>
      {/* Header */}
      <div className={s.pageHeader}>
        <div>
          <p className={s.pageLabel}>PANEL DE CONTROL</p>
          <h1 className={s.pageTitle}>Resumen del sistema</h1>
        </div>
        <div className={s.userBadge}>
          <div className={s.badgeAvatar}>{displayName[0]?.toUpperCase()}</div>
          <div>
            <p>{displayName}</p>
            <span>{rolLabel}</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className={s.kpiGrid}>
        {KPIS.map(kpi => (
          <div key={kpi.label} className={s.kpiCard}>
            <div className={s.kpiIcon} style={{background:`${kpi.color}18`}}>
              <span className="material-icons" style={{color:kpi.color}}>{kpi.icon}</span>
            </div>
            <div className={s.kpiInfo}>
              <p className={s.kpiVal}>{kpis[kpi.label] ?? '—'}</p>
              <p className={s.kpiLabel}>{kpi.label}</p>
            </div>
            <div className={s.kpiArrow} style={{background:kpi.down?'#fceaea':'#ddf3e0'}}>
              <span className="material-icons" style={{color:kpi.down?'#8B2E2E':'#2E7D32',fontSize:11}}>
                {kpi.down ? 'arrow_downward' : 'arrow_upward'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Acceso rápido */}
      <div className={s.secLabel}>
        <div className={s.secBar} /><span>Acceso rápido</span>
      </div>
      <div className={s.moduleGrid}>
        {QUICK.map(m => <ModCard key={m.key} {...m} onClick={() => onSelect(m.key)} />)}
      </div>
    </div>
  );
}

function ModCard({ label, icon, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      className={`${s.modCard} ${hov ? s.modHov : ''}`}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={onClick}>
      {hov && <div className={s.modTopLine} />}
      <div className={`${s.modIcon} ${hov ? s.modIconHov : ''}`}>
        <span className="material-icons">{icon}</span>
      </div>
      <p className={`${s.modLabel} ${hov ? s.modLabelHov : ''}`}>{label}</p>
    </button>
  );
}
