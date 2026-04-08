import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ── Cambia esta URL si el backend corre en otra dirección ──
const API = 'http://localhost:3000/api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [usuario,   setUsuario]   = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [iniciando, setIniciando] = useState(true);

  // Cargar sesión guardada en localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ga_usuario');
      if (saved) setUsuario(JSON.parse(saved));
    } catch (_) {}
    setIniciando(false);
  }, []);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.ok) {
        setUsuario(data.data);
        localStorage.setItem('ga_usuario', JSON.stringify(data.data));
        return { ok: true };
      }
      return { ok: false, mensaje: data.mensaje || 'Credenciales incorrectas' };
    } catch (e) {
      return { ok: false, mensaje: 'Error de conexión con el servidor' };
    } finally {
      setLoading(false);
    }
  }, []);

  const registrar = useCallback(async (datos) => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      const data = await res.json();
      return data.ok
        ? { ok: true }
        : { ok: false, mensaje: data.mensaje || 'Error al registrar' };
    } catch (e) {
      return { ok: false, mensaje: 'Error de conexión con el servidor' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUsuario(null);
    localStorage.removeItem('ga_usuario');
  }, []);

  const isAdmin     = (usuario?.ROL_ID ?? usuario?.rol_id ?? 3) <= 2;
  const displayName = usuario?.USERNAME ?? usuario?.username ?? 'Usuario';
  const rolLabel    = isAdmin ? 'Administrador' : 'Técnico de campo';

  return (
    <AuthCtx.Provider value={{
      usuario, loading, iniciando,
      isLoggedIn: !!usuario,
      isAdmin, displayName, rolLabel,
      login, registrar, logout,
      API,
    }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
export { API };
