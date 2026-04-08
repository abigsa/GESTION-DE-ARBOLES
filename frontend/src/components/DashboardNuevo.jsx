import { useEffect, useMemo, useState } from 'react';
import { API, useAuth } from '../context/AuthContext';
import { NAV_SECTIONS } from '../config/modulesNuevo';
import s from './DashboardNuevo.module.css';

const KPIS = [
  { label: 'Total árboles', icon: 'park', color: '#2D7A3E', ep: '/arbol' },
  { label: 'Fincas activas', icon: 'landscape', color: '#1B4D2A', ep: '/finca' },
  { label: 'Plagas activas', icon: 'bug_report', color: '#8B2E2E', ep: '/plaga-enfermedad', down: true },
  { label: 'Tratamientos', icon: 'medical_services', color: '#D4A853', ep: '/tipo-tratamiento' },
];

const QUICK_KEYS = ['arboles', 'fincas', 'plagas-enfermedades', 'tipos-tratamiento', 'mapa-plano'];

const SECTION_META = {
  Catálogos: {
    title: 'Catálogos',
    description: 'Administra configuraciones base del sistema agrícola.',
  },
  Operativo: {
    title: 'Operación de campo',
    description: 'Gestiona fincas, sectores y árboles registrados.',
  },
  Registros: {
    title: 'Registros y seguimiento',
    description: 'Consulta trazabilidad, eventos y movimientos operativos.',
  },
  Mapa: {
    title: 'Visualización',
    description: 'Accede al mapa general y distribución de árboles.',
  },
};

export default function DashboardNuevo({ onSelect }) {
  const { displayName, rolLabel } = useAuth();
  const [kpis, setKpis] = useState({});

  useEffect(() => {
    let mounted = true;

    const loadKpis = async () => {
      const results = await Promise.all(
        KPIS.map(async ({ ep, label }) => {
          try {
            const res = await fetch(`${API}${ep}`);
            const data = await res.json();
            return [label, data.ok ? data.data?.length ?? 0 : 0];
          } catch {
            return [label, 0];
          }
        })
      );

      if (!mounted) return;
      setKpis(Object.fromEntries(results));
    };

    loadKpis();
    return () => {
      mounted = false;
    };
  }, []);

  const quickModules = useMemo(() => {
    return NAV_SECTIONS.flatMap(section => section.entries).filter(entry =>
      QUICK_KEYS.includes(entry.key)
    );
  }, []);

  const groupedSections = useMemo(() => {
    return NAV_SECTIONS.map(section => ({
      ...section,
      entries: section.entries.filter(entry => !QUICK_KEYS.includes(entry.key)),
    })).filter(section => section.entries.length > 0);
  }, []);

  return (
    <div className={s.root}>
      <div className={s.hero}>
        <div className={s.heroContent}>
          <p className={s.pageLabel}>PANEL DE CONTROL</p>
          <h1 className={s.pageTitle}>Resumen del sistema</h1>
          <p className={s.pageSubtitle}>
            Supervisa los módulos principales de gestión agrícola y accede rápidamente
            a las operaciones más frecuentes.
          </p>
        </div>

        <div className={s.userBadge}>
          <div className={s.badgeAvatar}>{displayName?.[0]?.toUpperCase() || 'U'}</div>
          <div>
            <p>{displayName}</p>
            <span>{rolLabel}</span>
          </div>
        </div>
      </div>

      <div className={s.kpiGrid}>
        {KPIS.map(kpi => (
          <div key={kpi.label} className={s.kpiCard}>
            <div className={s.kpiTop}>
              <div className={s.kpiIcon} style={{ background: `${kpi.color}16` }}>
                <span className="material-icons" style={{ color: kpi.color }}>
                  {kpi.icon}
                </span>
              </div>

              <div
                className={`${s.kpiTrend} ${kpi.down ? s.kpiTrendDown : s.kpiTrendUp}`}
              >
                <span className="material-icons">
                  {kpi.down ? 'south' : 'north'}
                </span>
              </div>
            </div>

            <div className={s.kpiInfo}>
              <p className={s.kpiLabel}>{kpi.label}</p>
              <p className={s.kpiVal}>{kpis[kpi.label] ?? 0}</p>
            </div>
          </div>
        ))}
      </div>

      <section className={s.sectionBlock}>
        <div className={s.sectionHeader}>
          <div>
            <p className={s.sectionEyebrow}>ATAJOS</p>
            <h2 className={s.sectionTitle}>Acciones rápidas</h2>
          </div>
          <p className={s.sectionDescription}>
            Accesos directos a los módulos con mayor uso diario.
          </p>
        </div>

        <div className={s.quickGrid}>
          {quickModules.map(module => (
            <ModCard
              key={module.key}
              label={module.label}
              icon={module.icon}
              compact={false}
              onClick={() => onSelect(module.key)}
            />
          ))}
        </div>
      </section>

      <div className={s.sectionsGrid}>
        {groupedSections.map(section => {
          const meta = SECTION_META[section.title] || {
            title: section.title,
            description: '',
          };

          return (
            <section key={section.title} className={s.groupCard}>
              <div className={s.groupHeader}>
                <div>
                  <p className={s.groupEyebrow}>MÓDULOS</p>
                  <h3 className={s.groupTitle}>{meta.title}</h3>
                </div>
                {meta.description ? (
                  <p className={s.groupDescription}>{meta.description}</p>
                ) : null}
              </div>

              <div className={s.moduleGrid}>
                {section.entries.map(module => (
                  <ModCard
                    key={module.key}
                    label={module.label}
                    icon={module.icon}
                    compact
                    onClick={() => onSelect(module.key)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function ModCard({ label, icon, onClick, compact = false }) {
  return (
    <button
      type="button"
      className={`${s.modCard} ${compact ? s.modCardCompact : ''}`}
      onClick={onClick}
    >
      <div className={s.modIcon}>
        <span className="material-icons">{icon}</span>
      </div>
      <div className={s.modText}>
        <p className={s.modLabel}>{label}</p>
        {!compact && <span className={s.modHint}>Abrir módulo</span>}
      </div>
      <span className={`material-icons ${s.modArrow}`}>arrow_forward</span>
    </button>
  );
}