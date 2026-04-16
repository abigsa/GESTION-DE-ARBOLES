import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { NAV_SECTIONS } from '../config/modulesNuevo';
import s from './DashboardNuevo.module.css';

const API = 'http://localhost:3000/api';

const QUICK_KEYS = ['arboles', 'fincas', 'plagas-enfermedades', 'tipos-tratamiento', 'mapa-plano'];

const SECTION_META = {
  Catálogos: { title: 'Catálogos',            description: 'Administra configuraciones base del sistema agrícola.' },
  Operativo: { title: 'Operación de campo',    description: 'Gestiona fincas, sectores y árboles registrados.' },
  Registros: { title: 'Registros y seguimiento', description: 'Consulta trazabilidad, eventos y movimientos operativos.' },
  Mapa:      { title: 'Visualización',         description: 'Accede al mapa general y distribución de árboles.' },
};

// Días transcurridos desde una fecha
function diasDesde(fechaStr) {
  if (!fechaStr) return null;
  // Oracle puede devolver Date object o string ISO
  const d = fechaStr instanceof Date ? fechaStr : new Date(fechaStr);
  if (isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

function get(obj, ...keys) {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k];
  }
  return null;
}

export default function DashboardNuevo({ onSelect }) {
  const { displayName, rolLabel } = useAuth();

  const [arboles,    setArboles]    = useState([]);
  const [sectores,   setSectores]   = useState([]);
  const [fincas,     setFincas]     = useState([]);
  const [plagas,     setPlagas]     = useState([]);
  const [registrosTrat, setRegistrosTrat] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      try {
        const [rArb, rSec, rFin, rPla, rRegTrat] = await Promise.all([
          fetch(`${API}/arbol`).then(r => r.json()),
          fetch(`${API}/sector`).then(r => r.json()),
          fetch(`${API}/finca`).then(r => r.json()),
          fetch(`${API}/registro-plaga`).then(r => r.json()),
          fetch(`${API}/registro-tratamiento`).then(r => r.json()),
        ]);
        if (!mounted) return;
        const rows = j => (j.ok || j.success) ? (Array.isArray(j.data) ? j.data : []) : [];
        setArboles(rows(rArb));
        setSectores(rows(rSec));
        setFincas(rows(rFin));
        setPlagas(rows(rPla));
        setRegistrosTrat(rows(rRegTrat));
      } catch { /* sin conexión */ }
      finally { if (mounted) setLoading(false); }
    };
    fetchAll();
    return () => { mounted = false; };
  }, []);

  // ── Árbol: agrupar por sector ────────────────────
  const arbolesPorSector = useMemo(() => {
    const map = {};
    arboles.forEach(a => {
      const idSec = get(a, 'ID_SECTOR', 'id_sector');
      if (!idSec) return;
      map[idSec] = (map[idSec] || 0) + 1;
    });
    return Object.entries(map)
      .map(([idSec, cnt]) => {
        const sec = sectores.find(s => String(get(s,'ID_SECTOR','id_sector')) === String(idSec));
        return { nombre: get(sec,'NOMBRE_SECTOR','nombre_sector') || `Sector #${idSec}`, cnt };
      })
      .sort((a,b) => b.cnt - a.cnt)
      .slice(0, 4);
  }, [arboles, sectores]);

  const maxArb = arbolesPorSector[0]?.cnt || 1;

  // ── Plagas activas (sin fecha_resolucion) ────────
  const plagasActivas = useMemo(() =>
    plagas.filter(p => {
      const resolucion = get(p,'FECHA_RESOLUCION','fecha_resolucion');
      // Considerar activa si no tiene fecha resolución o es null/undefined
      return !resolucion || resolucion === null;
    })
    .slice(0, 3),
  [plagas]);

  // ── Tratamientos recientes ───────────────────────
  const tratRecientes = useMemo(() =>
    [...registrosTrat]
      .sort((a,b) => {
        const da = new Date(get(a,'FECHA_APLICACION','fecha_aplicacion') || 0);
        const db = new Date(get(b,'FECHA_APLICACION','fecha_aplicacion') || 0);
        return db - da;
      })
      .slice(0, 3),
  [registrosTrat]);

  // ── Fincas: sectores por finca ───────────────────
  const sectoresPorFinca = useMemo(() => {
    const map = {};
    sectores.forEach(s => {
      const idF = get(s,'ID_FINCA','id_finca');
      if (!idF) return;
      map[idF] = (map[idF] || 0) + 1;
    });
    return Object.entries(map)
      .map(([idF, cnt]) => {
        const f = fincas.find(f => String(get(f,'ID_FINCA','id_finca')) === String(idF));
        return { nombre: get(f,'NOMBRE_FINCA','nombre_finca') || `Finca #${idF}`, cnt };
      })
      .sort((a,b) => b.cnt - a.cnt)
      .slice(0, 4);
  }, [sectores, fincas]);

  const maxSec = sectoresPorFinca[0]?.cnt || 1;

  // ── Verificar si un árbol tiene tratamiento ──────
  const arbolTratado = (idArbol) =>
    registrosTrat.some(r => String(get(r,'ID_ARBOL','id_arbol')) === String(idArbol));

  const quickModules = useMemo(() =>
    NAV_SECTIONS.flatMap(s => s.entries).filter(e => QUICK_KEYS.includes(e.key)),
  []);

  const groupedSections = useMemo(() =>
    NAV_SECTIONS
      .map(s => ({ ...s, entries: s.entries.filter(e => !QUICK_KEYS.includes(e.key)) }))
      .filter(s => s.entries.length > 0),
  []);

  return (
    <div className={s.root}>

      {/* Hero */}
      <div className={s.hero}>
        <div className={s.heroContent}>
          <p className={s.pageLabel}>PANEL DE CONTROL</p>
          <h1 className={s.pageTitle}>Resumen del sistema</h1>
          <p className={s.pageSubtitle}>
            Supervisa los módulos principales de gestión agrícola y accede rápidamente a las operaciones más frecuentes.
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

      {/* ── KPI Grid ── */}
      <div className={s.kpiGrid}>

        {/* CARD 1 — Total árboles */}
        <div className={`${s.kpiCard} ${s.kpiCard1}`}>
          <div className={s.kpiTop}>
            <div className={s.kpiIcon} style={{ background: 'rgba(45,122,62,.10)' }}>
              <span className="material-icons" style={{ color: '#2D7A3E' }}>park</span>
            </div>
            <div className={s.kpiTrend + ' ' + s.kpiTrendUp}>
              <span className="material-icons">north</span>
            </div>
          </div>
          <div className={s.kpiInfo}>
            <p className={s.kpiLabel}>Total árboles</p>
            <p className={s.kpiVal}>{loading ? <span className={s.kpiSkeleton}/> : arboles.length}</p>
          </div>
          {!loading && arbolesPorSector.length > 0 && (
            <>
              <div className={s.kpiDivider} />
              <p className={s.kpiDetailTitle}>Por sector</p>
              {arbolesPorSector.map(({ nombre, cnt }) => (
                <div key={nombre} className={s.kpiRow}>
                  <span className={s.kpiRowName}>{nombre}</span>
                  <div className={s.kpiBarWrap}>
                    <div className={s.kpiBarFill} style={{ width: `${Math.round((cnt/maxArb)*100)}%`, background: '#4CB968' }} />
                  </div>
                  <span className={s.kpiRowVal}>{cnt}</span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* CARD 2 — Plagas activas */}
        <div className={`${s.kpiCard} ${s.kpiCard2}`}>
          <div className={s.kpiTop}>
            <div className={s.kpiIcon} style={{ background: 'rgba(139,46,46,.10)' }}>
              <span className="material-icons" style={{ color: '#8B2E2E' }}>bug_report</span>
            </div>
            <div className={`${s.kpiTrend} ${s.kpiTrendDown}`}>
              <span className="material-icons">south</span>
            </div>
          </div>
          <div className={s.kpiInfo}>
            <p className={s.kpiLabel}>Plagas activas</p>
            <p className={s.kpiVal} style={{ color: '#8B2E2E' }}>
              {loading ? <span className={s.kpiSkeleton}/> : plagasActivas.length}
            </p>
          </div>
          {!loading && plagasActivas.length > 0 && (
            <>
              <div className={s.kpiDivider} />
              <p className={s.kpiDetailTitle}>Árboles afectados</p>
              {plagasActivas.map((p, i) => {
                const idArbol = get(p,'ID_ARBOL','id_arbol');
                const dias    = diasDesde(get(p,'FECHA_DETECCION','fecha_deteccion'));
                const tratado = arbolTratado(idArbol);
                // Registro plaga puede traer NOMBRE_ARBOL del JOIN del package
                const nombreDirecto = get(p,'NOMBRE_ARBOL','nombre_arbol');
                const arbol   = !nombreDirecto ? arboles.find(a => String(get(a,'ID_ARBOL','id_arbol')) === String(idArbol)) : null;
                const nombre  = nombreDirecto || get(arbol,'NOMBRE_ARBOL','nombre_arbol') || `Árbol #${idArbol}`;
                return (
                  <div key={i} className={s.plagaRow}>
                    <div className={s.plagaLeft}>
                      <span className={s.plagaArbol}>{nombre}</span>
                      <span className={s.plagaSub}>
                        {dias !== null ? `${dias} días enfermo` : 'Fecha no registrada'}
                      </span>
                    </div>
                    <span className={tratado ? s.badgeOk : s.badgeWarn}>
                      {tratado ? '✓ Tratado' : '✗ Sin tratar'}
                    </span>
                  </div>
                );
              })}
            </>
          )}
          {!loading && plagasActivas.length === 0 && (
            <p className={s.kpiEmpty}>Sin plagas activas registradas</p>
          )}
        </div>

        {/* CARD 3 — Fincas */}
        <div className={`${s.kpiCard} ${s.kpiCard3}`}>
          <div className={s.kpiTop}>
            <div className={s.kpiIcon} style={{ background: 'rgba(27,77,42,.10)' }}>
              <span className="material-icons" style={{ color: '#1B4D2A' }}>landscape</span>
            </div>
            <div className={`${s.kpiTrend} ${s.kpiTrendUp}`}>
              <span className="material-icons">north</span>
            </div>
          </div>
          <div className={s.kpiInfo}>
            <p className={s.kpiLabel}>Fincas activas</p>
            <p className={s.kpiVal}>{loading ? <span className={s.kpiSkeleton}/> : fincas.length}</p>
          </div>
          {!loading && sectoresPorFinca.length > 0 && (
            <>
              <div className={s.kpiDivider} />
              <p className={s.kpiDetailTitle}>Sectores por finca</p>
              {sectoresPorFinca.map(({ nombre, cnt }) => (
                <div key={nombre} className={s.kpiRow}>
                  <span className={s.kpiRowName}>{nombre}</span>
                  <div className={s.kpiBarWrap}>
                    <div className={s.kpiBarFill} style={{ width: `${Math.round((cnt/maxSec)*100)}%`, background: '#1B4D2A' }} />
                  </div>
                  <span className={s.kpiRowVal}>{cnt} sect.</span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* CARD 4 — Tratamientos */}
        <div className={`${s.kpiCard} ${s.kpiCard4}`}>
          <div className={s.kpiTop}>
            <div className={s.kpiIcon} style={{ background: 'rgba(212,168,83,.14)' }}>
              <span className="material-icons" style={{ color: '#D4A853' }}>medical_services</span>
            </div>
            <div className={`${s.kpiTrend} ${s.kpiTrendUp}`}>
              <span className="material-icons">north</span>
            </div>
          </div>
          <div className={s.kpiInfo}>
            <p className={s.kpiLabel}>Tratamientos</p>
            <p className={s.kpiVal} style={{ color: '#8B6F47' }}>
              {loading ? <span className={s.kpiSkeleton}/> : registrosTrat.length}
            </p>
          </div>
          {!loading && tratRecientes.length > 0 && (
            <>
              <div className={s.kpiDivider} />
              <p className={s.kpiDetailTitle}>Últimos aplicados</p>
              {tratRecientes.map((t, i) => {
                const idArbol = get(t,'ID_ARBOL','id_arbol');
                const dias    = diasDesde(get(t,'FECHA_APLICACION','fecha_aplicacion'));
                // Registro plaga puede traer NOMBRE_ARBOL del JOIN del package
                const nombreDirecto = get(t,'NOMBRE_ARBOL','nombre_arbol');
                const arbol   = !nombreDirecto ? arboles.find(a => String(get(a,'ID_ARBOL','id_arbol')) === String(idArbol)) : null;
                const nombre  = nombreDirecto || get(arbol,'NOMBRE_ARBOL','nombre_arbol') || `Árbol #${idArbol}`;
                const idTrat  = get(t,'ID_TIPO_TRATAMIENTO','id_tipo_tratamiento');
                // Nombre viene del JOIN en Oracle
                const nomTrat = get(t,'NOMBRE_TRATAMIENTO','nombre_tratamiento') || 'Tratamiento';
                return (
                  <div key={i} className={s.plagaRow}>
                    <div className={s.plagaLeft}>
                      <span className={s.plagaArbol}>{nombre}</span>
                      <span className={s.plagaSub}>{nomTrat}</span>
                    </div>
                    <span className={s.badgeOk}>
                      {dias !== null ? `hace ${dias}d` : '✓'}
                    </span>
                  </div>
                );
              })}
            </>
          )}
          {!loading && tratRecientes.length === 0 && (
            <p className={s.kpiEmpty}>Sin tratamientos registrados</p>
          )}
        </div>
      </div>

      {/* Acciones rápidas */}
      <section className={s.sectionBlock}>
        <div className={s.sectionHeader}>
          <div>
            <p className={s.sectionEyebrow}>ATAJOS</p>
            <h2 className={s.sectionTitle}>Acciones rápidas</h2>
          </div>
          <p className={s.sectionDescription}>Accesos directos a los módulos con mayor uso diario.</p>
        </div>
        <div className={s.quickGrid}>
          {quickModules.map(m => (
            <ModCard key={m.key} label={m.label} icon={m.icon} compact={false} onClick={() => onSelect(m.key)} />
          ))}
        </div>
      </section>

      {/* Secciones agrupadas */}
      <div className={s.sectionsGrid}>
        {groupedSections.map(section => {
          const meta = SECTION_META[section.title] || { title: section.title, description: '' };
          return (
            <section key={section.title} className={s.groupCard}>
              <div className={s.groupHeader}>
                <div>
                  <p className={s.groupEyebrow}>MÓDULOS</p>
                  <h3 className={s.groupTitle}>{meta.title}</h3>
                </div>
                {meta.description && <p className={s.groupDescription}>{meta.description}</p>}
              </div>
              <div className={s.moduleGrid}>
                {section.entries.map(m => (
                  <ModCard key={m.key} label={m.label} icon={m.icon} compact onClick={() => onSelect(m.key)} />
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
    <button type="button" className={`${s.modCard} ${compact ? s.modCardCompact : ''}`} onClick={onClick}>
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
