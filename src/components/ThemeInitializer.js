'use client';
import { useEffect } from 'react';

export default function ThemeInitializer() {
  useEffect(() => {
    // This ensures theme is applied before any content renders
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      document.documentElement.classList.add(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return null;
}