'use client';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: 'var(--bg-input)',
        border: '1px solid var(--border)',
        borderRadius: '40px',
        padding: '4px',
        cursor: 'pointer',
        width: '64px',
        height: '34px',
        position: 'relative',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
      }}
      aria-label="Toggle theme"
    >
      <div
        style={{
          position: 'absolute',
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: 'var(--accent-gradient)',
          transform: theme === 'dark' ? 'translateX(4px)' : 'translateX(34px)',
          transition: 'transform 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </div>
      <span style={{ 
        position: 'absolute', 
        left: '10px', 
        fontSize: '12px', 
        opacity: theme === 'dark' ? 1 : 0.3,
        transition: 'opacity 0.3s',
      }}>🌙</span>
      <span style={{ 
        position: 'absolute', 
        right: '10px', 
        fontSize: '12px', 
        opacity: theme === 'light' ? 1 : 0.3,
        transition: 'opacity 0.3s',
      }}>☀️</span>
    </button>
  );
}