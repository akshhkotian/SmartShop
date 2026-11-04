import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn"
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      aria-label="Toggle theme mode"
    >
      {isDark ? (
        <Sun size={20} className="text-warning" />
      ) : (
        <Moon size={20} style={{ color: '#7367c8' }} />
      )}
    </button>
  );
}
