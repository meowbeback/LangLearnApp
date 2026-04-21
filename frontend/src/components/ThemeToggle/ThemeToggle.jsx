import React, { useEffect, useState } from 'react';
import './ThemeToggle.css';

const THEME_KEY = 'langlearn-theme';

const ThemeToggle = () => {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setDark((v) => !v)}
      aria-label={dark ? 'Светлая тема' : 'Тёмная тема'}
    >
      {dark ? '☀' : '☾'}
    </button>
  );
};

export default ThemeToggle;
