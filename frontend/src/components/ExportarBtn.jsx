import { useState } from 'react';
import s from './ExportarBtn.module.css';

// Exportar a CSV (compatible con Excel)
function exportCSV(data, cols, title) {
  if (!data.length) return;
  const header = cols.join(',');
  const rows   = data.map(row =>
    cols.map(col => {
      const val = String(row[col] ?? '').replace(/"/g, '""');
      return `"${val}"`;
    }).join(',')
  );
  const csv  = [header, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${title}_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Exportar a PDF usando la API de impresión del navegador
function exportPDF(data, cols, title) {
  if (!data.length) return;

  const thead = cols.map(c => `<th>${c.replace(/_/g,' ')}</th>`).join('');
  const tbody = data.map(row =>
    `<tr>${cols.map(col => `<td>${row[col] ?? '—'}</td>`).join('')}</tr>`
  ).join('');

  const html = `
    <!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8"/>
    <title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; color: #222; }
      h1   { font-size: 16px; color: #1B4D2A; margin-bottom: 4px; }
      p    { font-size: 10px; color: #8B6F47; margin-bottom: 14px; }
      table { width:100%; border-collapse:collapse; }
      th { background:#1B4D2A; color:#fff; padding:7px 10px; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:.4px; }
      td { padding:6px 10px; border-bottom:1px solid #DCEDDF; }
      tr:nth-child(even) td { background:#F2F7F3; }
      @media print { body { margin:10px; } }
    </style>
    </head><body>
    <h1>${title}</h1>
    <p>Generado el ${new Date().toLocaleDateString('es-GT', {year:'numeric',month:'long',day:'numeric'})} · ${data.length} registros</p>
    <table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>
    </body></html>
  `;

  const win = window.open('', '_blank');
  if (!win) { alert('Permite ventanas emergentes para exportar a PDF'); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 400);
}

export default function ExportarBtn({ data = [], cols = [], title = 'Reporte' }) {
  const [open, setOpen] = useState(false);

  if (!data.length) return null;

  return (
    <div className={s.wrap}>
      <button
        type="button"
        className={`${s.btn} ${open ? s.btnOpen : ''}`}
        onClick={() => setOpen(o => !o)}
        title="Exportar"
      >
        <span className="material-icons">download</span>
        <span className={s.label}>Exportar</span>
        <span className="material-icons" style={{fontSize:16}}>expand_more</span>
      </button>

      {open && (
        <div className={s.menu} onMouseLeave={() => setOpen(false)}>
          <button
            type="button"
            className={s.menuItem}
            onClick={() => { exportCSV(data, cols, title); setOpen(false); }}
          >
            <span className="material-icons">table_view</span>
            <div>
              <p>Excel / CSV</p>
              <span>Abrir en Excel o Sheets</span>
            </div>
          </button>
          <button
            type="button"
            className={s.menuItem}
            onClick={() => { exportPDF(data, cols, title); setOpen(false); }}
          >
            <span className="material-icons">picture_as_pdf</span>
            <div>
              <p>PDF</p>
              <span>Imprimir o guardar como PDF</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
