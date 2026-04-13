import { useState, useEffect, useRef } from 'react';
import s from './DatePickerField.module.css';

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];
const DIAS = ['L','M','X','J','V','S','D'];

function parseDate(val) {
  if (!val) return null;
  const d = new Date(val + 'T00:00:00');
  return isNaN(d) ? null : d;
}

function formatDisplay(d) {
  if (!d) return '';
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

function formatValue(d) {
  if (!d) return '';
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function buildGrid(year, month) {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  // lunes=0 ... domingo=6
  let dow = first.getDay() - 1;
  if (dow < 0) dow = 6;

  const days = [];
  // días del mes anterior
  for (let i = dow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, outside: true });
  }
  // días del mes
  for (let i = 1; i <= last.getDate(); i++) {
    days.push({ date: new Date(year, month, i), outside: false });
  }
  // días del mes siguiente
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), outside: true });
  }
  return days;
}

export default function DatePickerField({ value, onChange, placeholder = 'dd/mm/aaaa', disabled }) {
  const selected  = parseDate(value);
  const today     = new Date();
  today.setHours(0,0,0,0);

  const [open, setOpen]   = useState(false);
  const [view, setView]   = useState(() => ({
    year:  selected ? selected.getFullYear()  : today.getFullYear(),
    month: selected ? selected.getMonth()     : today.getMonth(),
  }));

  const ref = useRef(null);

  // Cerrar al click fuera
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const prevMonth = () => setView(v => {
    const d = new Date(v.year, v.month - 1, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const nextMonth = () => setView(v => {
    const d = new Date(v.year, v.month + 1, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const selectDay = (date) => {
    onChange(formatValue(date));
    setOpen(false);
  };

  const clearDate = () => { onChange(''); setOpen(false); };
  const goToday   = () => {
    setView({ year: today.getFullYear(), month: today.getMonth() });
    selectDay(today);
  };

  const grid = buildGrid(view.year, view.month);

  const isSelected = (date) => selected && date.toDateString() === selected.toDateString();
  const isToday    = (date) => date.toDateString() === today.toDateString();

  return (
    <div className={s.wrap} ref={ref}>

      {/* Trigger */}
      <button
        type="button"
        className={`${s.trigger} ${open ? s.triggerOpen : ''} ${disabled ? s.triggerDisabled : ''}`}
        onClick={() => !disabled && setOpen(o => !o)}
      >
        <span className="material-icons">calendar_today</span>
        <span className={`${s.triggerText} ${!selected ? s.triggerPlaceholder : ''}`}>
          {selected ? formatDisplay(selected) : placeholder}
        </span>
        {selected && (
          <button
            type="button"
            className={s.clearBtn}
            onClick={e => { e.stopPropagation(); clearDate(); }}
          >
            <span className="material-icons">close</span>
          </button>
        )}
        {!selected && (
          <span className={`material-icons ${s.arrow}`}>
            {open ? 'expand_less' : 'expand_more'}
          </span>
        )}
      </button>

      {/* Dropdown calendario */}
      {open && (
        <div className={s.calendar}>

          {/* Header */}
          <div className={s.calHeader}>
            <button type="button" className={s.navBtn} onClick={prevMonth}>
              <span className="material-icons">chevron_left</span>
            </button>
            <span className={s.calTitle}>
              {MESES[view.month]} {view.year}
            </span>
            <button type="button" className={s.navBtn} onClick={nextMonth}>
              <span className="material-icons">chevron_right</span>
            </button>
          </div>

          {/* Días de la semana */}
          <div className={s.calDow}>
            {DIAS.map(d => <span key={d}>{d}</span>)}
          </div>

          {/* Grid de días */}
          <div className={s.calGrid}>
            {grid.map(({ date, outside }, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectDay(date)}
                className={[
                  s.calDay,
                  outside    ? s.calDayOut  : '',
                  isToday(date)    ? s.calDayToday   : '',
                  isSelected(date) ? s.calDaySelected : '',
                ].join(' ')}
              >
                {date.getDate()}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className={s.calFooter}>
            <button type="button" className={s.footBtn} onClick={clearDate}>
              Borrar
            </button>
            <button type="button" className={s.footBtnPrimary} onClick={goToday}>
              Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
