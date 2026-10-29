import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppTheme } from '../types';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  themeConfig: {
    name: string;
    description: string;
    bgMain: string;
    bgSidebar: string;
    bgSurface: string;
    bgBubbleUser: string;
    bgBubbleAi: string;
    border: string;
    accent: string;
    accentGlow: string;
    accentText: string;
    activeNav: string;
  };
}

const THEME_STORAGE_KEY = 'mera_ai_active_theme';

export const THEMES: Record<AppTheme, ThemeContextType['themeConfig']> = {
  midnight: {
    name: 'Midnight',
    description: 'Deep Obsidian with emerald neon highlights',
    bgMain: 'bg-slate-950',
    bgSidebar: 'bg-[#090d16]',
    bgSurface: 'bg-slate-900',
    bgBubbleUser: 'bg-slate-800/80 border-slate-700/60 text-slate-100',
    bgBubbleAi: 'bg-slate-900/50 border-slate-800/60',
    border: 'border-slate-800/80',
    accent: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    accentGlow: 'shadow-emerald-500/20',
    accentText: 'text-emerald-400',
    activeNav: 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60',
  },
  ocean: {
    name: 'Ocean',
    description: 'Deep abyss navy with glowing cyan & sapphire',
    bgMain: 'bg-[#050d1a]',
    bgSidebar: 'bg-[#030914]',
    bgSurface: 'bg-[#0b1b33]',
    bgBubbleUser: 'bg-[#0f294a] border-[#183d6e] text-cyan-50',
    bgBubbleAi: 'bg-[#081528]/80 border-[#122847]',
    border: 'border-[#152e52]',
    accent: 'bg-cyan-600 hover:bg-cyan-500 text-white',
    accentGlow: 'shadow-cyan-500/25',
    accentText: 'text-cyan-400',
    activeNav: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
  },
  forest: {
    name: 'Forest',
    description: 'Deep pine shadows with lush emerald & mint',
    bgMain: 'bg-[#06120b]',
    bgSidebar: 'bg-[#040e08]',
    bgSurface: 'bg-[#0d2417]',
    bgBubbleUser: 'bg-[#123822] border-[#1c5434] text-emerald-50',
    bgBubbleAi: 'bg-[#081c11]/80 border-[#143d25]',
    border: 'border-[#173e27]',
    accent: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    accentGlow: 'shadow-emerald-500/25',
    accentText: 'text-emerald-400',
    activeNav: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as AppTheme;
      return saved && THEMES[saved] ? saved : 'midnight';
    } catch {
      return 'midnight';
    }
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        themeConfig: THEMES[theme],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
