import { createContext, useContext, useState, useCallback } from 'react';

const API = 'http://localhost:3000/api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [usuario,   setUsuario]   = useState(null);
  const [loading,   setLoading]   = useState(false);
  const iniciando = false;

  // ── Login ─────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/usuarios/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, password }),
      });
      if (!res.ok && res.status !== 401)
        return { ok: false, mensaje: `Error del servidor (${res.status})` };

      const data = await res.json();
      if (!data.ok)
        return { ok: false, mensaje: data.mensaje || 'Credenciales incorrectas' };

      // Login exitoso — obtener datos completos del usuario (incluye TELEFONO)
      const usuarioBase = data.data;
      const id = usuarioBase.ID_USUARIO ?? usuarioBase.id_usuario;

      let usuarioCompleto = usuarioBase;
      if (id) {
        try {
          const r2   = await fetch(`${API}/usuarios/${id}`);
          const d2   = await r2.json();
          if (d2.ok && d2.data) usuarioCompleto = d2.data;
        } catch (_) {
          // Si falla la segunda llamada usamos los datos del login
        }
      }

      setUsuario(usuarioCompleto);
      return { ok: true };
    } catch (e) {
      return { ok: false, mensaje: 'Error de conexión con el servidor' };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Registro ──────────────────────────────────────
  const registrar = useCallback(async (datos) => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/usuarios`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(datos),
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

  // ── Actualizar perfil ─────────────────────────────
  const actualizarPerfil = useCallback(async (datos) => {
    if (!usuario) return { ok: false, mensaje: 'No hay sesión activa' };
    const id = usuario.ID_USUARIO ?? usuario.id_usuario;
    if (!id) return { ok: false, mensaje: 'No se pudo identificar el usuario' };

    setLoading(true);
    try {
      const res = await fetch(`${API}/usuarios/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
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
        // Actualizar en memoria con los nuevos datos
        const updated = {
          ...usuario,
          NOMBRES:   datos.nombres,
          APELLIDOS: datos.apellidos,
          EMAIL:     datos.email,
          TELEFONO:  datos.telefono,
          nombres:   datos.nombres,
          apellidos: datos.apellidos,
          email:     datos.email,
          telefono:  datos.telefono,
        };
        setUsuario(updated);
        return { ok: true };
      }
      return { ok: false, mensaje: data.mensaje || 'Error al actualizar' };
    } catch (e) {
      return { ok: false, mensaje: 'Error de conexión con el servidor' };
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  // ── Logout ────────────────────────────────────────
  const logout = useCallback(() => {
    setUsuario(null);
    try { localStorage.removeItem('ga_usuario'); } catch (_) {}
  }, []);

  // ── Helpers ───────────────────────────────────────
  const isAdmin = (usuario?.ROL_ID ?? usuario?.rol_id ?? 3) <= 2;

  const displayName =
    usuario?.NOMBRES  ?? usuario?.nombres  ??
    usuario?.USERNAME ?? usuario?.username ?? 'Usuario';

  const rolLabel = isAdmin ? 'Administrador' : 'Técnico de campo';

  return (
    <AuthCtx.Provider value={{
      usuario, loading, iniciando,
      isLoggedIn: !!usuario,
      isAdmin, displayName, rolLabel,
      login, registrar, logout, actualizarPerfil,
      API,
    }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
export { API };
