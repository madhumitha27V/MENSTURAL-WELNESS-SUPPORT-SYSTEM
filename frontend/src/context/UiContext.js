import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const UiContext = createContext(null);

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme = window.localStorage.getItem('wellness-theme');
  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme;
  }

  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const UiProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    document.body.dataset.theme = theme;
    window.localStorage.setItem('wellness-theme', theme);
  }, [theme]);

  useEffect(() => () => {
    toasts.forEach((toast) => clearTimeout(toast.timerId));
  }, [toasts]);

  const toggleTheme = useCallback(() => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark')), []);

  const removeToast = useCallback((id) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((message, variant = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const timerId = window.setTimeout(() => removeToast(id), 3200);

    setToasts((currentToasts) => [...currentToasts, { id, message, variant, timerId }]);
  }, [removeToast]);

  const value = useMemo(() => ({ theme, toggleTheme, notify, removeToast, toasts }), [theme, toggleTheme, notify, removeToast, toasts]);

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
};

export const useUI = () => {
  const context = useContext(UiContext);

  if (!context) {
    throw new Error('useUI must be used within a UiProvider');
  }

  return context;
};