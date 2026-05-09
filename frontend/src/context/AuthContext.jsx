import { createContext, useContext, useState, useCallback, useEffect } from 'react';

// URL central — cambia solo aquí para apuntar a producción
const API = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const AuthCtx = createContext(null);

// ── Helper fetch con token automático ────────────────────
// Úsalo en lugar de fetch() directo en todos los componentes
export async function apiFetch(url, options = {}) {
  const token = sessionStorage.getItem('ga_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });

  // Si el token expiró, limpiar sesión y recargar para ir al login
  if (res.status === 401) {
    sessionStorage.removeItem('ga_token');
    sessionStorage.removeItem('ga_usuario');
    window.location.reload();
    return res;
  }
  return res;
}

export function AuthProvider({ children }) {
  const [loading,   setLoading]   = useState(false);
  const [iniciando, setIniciando] = useState(true);

  const [usuario, setUsuario] = useState(() => {
    try {
      const token = sessionStorage.getItem('ga_token');
      const saved = sessionStorage.getItem('ga_usuario');
      if (token && saved) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) return JSON.parse(saved);
      }
    } catch {}
    return null;
  });

  useEffect(() => { setIniciando(false); }, []);

  // ── Login ─────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok && res.status !== 401)
        return { ok: false, mensaje: `Error del servidor (${res.status})` };

      const data = await res.json();
      if (!data.ok) return { ok: false, mensaje: data.mensaje || 'Credenciales incorrectas' };

      // Guardar token JWT
      if (data.token) sessionStorage.setItem('ga_token', data.token);

      // Obtener datos completos del usuario con token ya guardado
      const usuarioBase = data.data;
      const id = usuarioBase.ID_USUARIO ?? usuarioBase.id_usuario;
      let usuarioCompleto = usuarioBase;
      if (id) {
        try {
          const r2 = await apiFetch(`${API}/usuarios/${id}`);
          const d2 = await r2.json();
          if (d2.ok && d2.data) usuarioCompleto = d2.data;
        } catch (_) {}
      }

      setUsuario(usuarioCompleto);
      try { sessionStorage.setItem('ga_usuario', JSON.stringify(usuarioCompleto)); } catch {}
      return { ok: true };
    } catch {
      return { ok: false, mensaje: 'Error de conexión con el servidor' };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Registro ──────────────────────────────────────────
  const registrar = useCallback(async (datos) => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      const data = await res.json();
      return data.ok ? { ok: true } : { ok: false, mensaje: data.mensaje || 'Error al registrar' };
    } catch {
      return { ok: false, mensaje: 'Error de conexión con el servidor' };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Actualizar perfil ─────────────────────────────────
  const actualizarPerfil = useCallback(async (datos) => {
    if (!usuario) return { ok: false, mensaje: 'No hay sesión activa' };
    const id = usuario.ID_USUARIO ?? usuario.id_usuario;
    if (!id) return { ok: false, mensaje: 'No se pudo identificar el usuario' };
    setLoading(true);
    try {
      const res = await apiFetch(`${API}/usuarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          rol_id:    usuario.ROL_ID   ?? usuario.rol_id   ?? 3,
          username:  usuario.USERNAME ?? usuario.username,
          nombres:   datos.nombres   || null,
          apellidos: datos.apellidos || null,
          email:     datos.email     || null,
          telefono:  datos.telefono  || null,
          estado:    usuario.ESTADO  ?? usuario.estado ?? 'ACTIVO',
        }),
      });
      const data = await res.json();
      if (data.ok || data.success) {
        const updated = {
          ...usuario,
          NOMBRES: datos.nombres, APELLIDOS: datos.apellidos,
          EMAIL: datos.email, TELEFONO: datos.telefono,
          nombres: datos.nombres, apellidos: datos.apellidos,
          email: datos.email, telefono: datos.telefono,
        };
        setUsuario(updated);
        try { sessionStorage.setItem('ga_usuario', JSON.stringify(updated)); } catch {}
        return { ok: true };
      }
      return { ok: false, mensaje: data.mensaje || 'Error al actualizar' };
    } catch {
      return { ok: false, mensaje: 'Error de conexión con el servidor' };
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  // ── Logout ────────────────────────────────────────────
  const logout = useCallback(() => {
    setUsuario(null);
    try {
      sessionStorage.removeItem('ga_usuario');
      sessionStorage.removeItem('ga_token');
    } catch {}
  }, []);

  const getToken = () => { try { return sessionStorage.getItem('ga_token') || null; } catch { return null; } };

  const isAdmin    = (usuario?.ROL_ID ?? usuario?.rol_id ?? 3) <= 2;
  const displayName = usuario?.NOMBRES ?? usuario?.nombres ?? usuario?.USERNAME ?? usuario?.username ?? 'Usuario';
  const rolLabel   = isAdmin ? 'Administrador' : 'Técnico de campo';

  return (
    <AuthCtx.Provider value={{
      usuario, loading, iniciando,
      isLoggedIn: !!usuario,
      isAdmin, displayName, rolLabel,
      login, registrar, logout, actualizarPerfil, getToken,
      API,
    }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
export { API };
