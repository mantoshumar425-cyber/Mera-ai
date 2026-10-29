import React from 'react';
import { Check, Palette } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { AppTheme } from '../types';

interface ThemeSelectorProps {
  onSelect?: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onSelect }) => {
  const { theme, setTheme } = useTheme();

  const themes: { id: AppTheme; name: string; desc: string; colors: string[] }[] = [
    {
      id: 'midnight',
      name: 'Midnight',
      desc: 'Dark Obsidian & Emerald accents',
      colors: ['#090d16', '#111827', '#10b981'],
    },
    {
      id: 'ocean',
      name: 'Ocean',
      desc: 'Deep Navy & Electric Cyan accents',
      colors: ['#030914', '#0b1b33', '#06b6d4'],
    },
    {
      id: 'forest',
      name: 'Forest',
      desc: 'Lush Pine & Jade Mint accents',
      colors: ['#040e08', '#0d2417', '#22c55e'],
    },
  ];

  return (
    <div className="space-y-1.5 p-1">
      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
        <Palette className="w-3 h-3 text-cyan-400" />
        Theme Palette
      </div>

      <div className="grid grid-cols-1 gap-1">
        {themes.map((t) => {
          const isSelected = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id);
                onSelect?.();
              }}
              className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                isSelected
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Color swatches */}
                <div className="flex -space-x-1 shrink-0">
                  {t.colors.map((c, i) => (
                    <span
                      key={i}
                      className="w-3.5 h-3.5 rounded-full border border-slate-900 shadow-xs"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="truncate">
                  <span className="block text-slate-200">{t.name}</span>
                </div>
              </div>

              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
