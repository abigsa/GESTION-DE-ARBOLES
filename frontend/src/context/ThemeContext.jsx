import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeCtx = createContext({ mode: 'light', toggle: () => {} });

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem('ga_theme') || 'light'; }
    catch { return 'light'; }
  });

  /* Apply data-theme attribute to <html> for CSS variables */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    try { localStorage.setItem('ga_theme', mode); }
    catch {}
  }, [mode]);

  const toggle = useCallback(() => {
    setMode(m => m === 'light' ? 'dark' : 'light');
  }, []);

  return (
    <ThemeCtx.Provider value={{ mode, toggle, isDark: mode === 'dark' }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
