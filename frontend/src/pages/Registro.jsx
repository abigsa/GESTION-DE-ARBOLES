import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import s from './Registro.module.css';

export default function Registro({ onLogin }) {
  const { registrar, loading } = useAuth();
  const [form, setForm] = useState({ username:'', email:'', password_hash:'', nombres:'', apellidos:'', telefono:'' });
  const [verPass, setVerPass] = useState(false);
  const [error,   setError]   = useState('');
  const [exito,   setExito]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password_hash) {
      setError('Usuario, correo y contraseña son obligatorios'); return;
    }
    if (form.password_hash.length < 6) { setError('Mínimo 6 caracteres'); return; }
    setError('');
    const res = await registrar({ ...form, rol_id:3, estado:'ACTIVO' });
    if (res.ok) { setExito('Cuenta creada. Ahora puedes iniciar sesión.'); setTimeout(onLogin, 1800); }
    else setError(res.mensaje);
  };

  return (
    <div className={s.root}>
      <div className={s.card}>
        <div className={s.header}>
          <div className={s.logo}><span className="material-icons">park</span></div>
          <div><h2>Nueva cuenta</h2><p>Completa tus datos para acceder al sistema</p></div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <p className={s.secTitle}><span className="material-icons">lock_outline</span> Datos de acceso</p>
          <Field icon="person_outline" ph="Nombre de usuario" value={form.username} onChange={v => set('username',v)} />
          <Field icon="email" ph="Correo electrónico" type="email" value={form.email} onChange={v => set('email',v)} />
          <div style={{position:'relative'}}>
            <Field icon="lock_outline" ph="Contraseña" type={verPass?'text':'password'} value={form.password_hash} onChange={v => set('password_hash',v)} />
            <button type="button" className={s.eye} onClick={() => setVerPass(v => !v)}>
              <span className="material-icons">{verPass?'visibility_off':'visibility'}</span>
            </button>
          </div>

          <p className={s.secTitle} style={{marginTop:18}}><span className="material-icons">badge</span> Datos personales</p>
          <div className={s.row2}>
            <Field icon="person_outline" ph="Nombres"   value={form.nombres}   onChange={v => set('nombres',v)} />
            <Field icon="person_outline" ph="Apellidos" value={form.apellidos} onChange={v => set('apellidos',v)} />
          </div>
          <Field icon="phone" ph="Teléfono (opcional)" value={form.telefono} onChange={v => set('telefono',v)} />

          {error && <p className={s.error}>{error}</p>}
          {exito && <p className={s.exito}>{exito}</p>}

          <button type="submit" className={s.btn} disabled={loading}>
            {loading ? <span className={s.spinner}/> : 'CREAR CUENTA'}
          </button>
        </form>

        <p className={s.loginRow}>¿Ya tienes cuenta? <button type="button" onClick={onLogin}>Inicia sesión</button></p>
      </div>
    </div>
  );
}

function Field({ icon, ph, type='text', value, onChange }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:10,background:'var(--fondo-claro)',border:'1px solid var(--pergamino-verde)',borderRadius:'var(--radius-md)',padding:'0 14px',marginBottom:10}}>
      <span className="material-icons" style={{fontSize:17,color:'var(--verde-medio)',flexShrink:0}}>{icon}</span>
      <input type={type} placeholder={ph} value={value} onChange={e=>onChange(e.target.value)}
        style={{flex:1,border:'none',background:'transparent',padding:'12px 0',fontSize:13,color:'var(--verde-profundo)',fontWeight:500,outline:'none'}}/>
    </div>
  );
}
