import React, { useState } from 'react';
import { Menu, Plus, Trash2, Download, Check, Sparkles, Globe, Palette, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { LanguageMode, Message } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeSelector } from './ThemeSelector';

interface ChatHeaderProps {
  onToggleSidebar: () => void;
  title: string;
  languageMode: LanguageMode;
  onLanguageChange: (mode: LanguageMode) => void;
  onNewChat: () => void;
  onClearCurrentChat: () => void;
  messages: Message[];
  onOpenAuthModal: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onToggleSidebar,
  title,
  languageMode,
  onLanguageChange,
  onNewChat,
  onClearCurrentChat,
  messages,
  onOpenAuthModal,
}) => {
  const { currentUser, logout } = useAuth();
  const { theme, themeConfig } = useTheme();

  const [copiedExport, setCopiedExport] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleExport = async () => {
    if (messages.length === 0) return;
    const text = messages
      .map(
        (m) =>
          `### ${m.role === 'user' ? 'You' : 'Mera AI'} (${new Date(
            m.timestamp
          ).toLocaleTimeString()}):\n${m.content}\n`
      )
      .join('\n---\n\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopiedExport(true);
      setTimeout(() => setCopiedExport(false), 2000);
    } catch (err) {
      console.error('Failed to copy export:', err);
    }
  };

  const getLangBadge = () => {
    switch (languageMode) {
      case 'hindi':
        return '🕉️ हिन्दी';
      case 'hinglish':
        return '🇮🇳 Hinglish';
      case 'english':
        return '🌐 English';
      default:
        return '⚡ Auto';
    }
  };

  return (
    <header
      className={`h-14 border-b ${themeConfig.border} ${themeConfig.bgSidebar} backdrop-blur-md px-3 sm:px-4 flex items-center justify-between sticky top-0 z-30 transition-colors`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Sidebar Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Title & Model Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="truncate font-medium text-sm text-slate-200 tracking-tight">
            {title || 'Mera AI'}
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/70 border border-slate-700/60 text-[10px] text-emerald-400">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Gemini 3.8 Flash</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Theme Quick Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu((prev) => !prev)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title={`Active Theme: ${theme}`}
          >
            <Palette className="w-4 h-4 text-cyan-400" />
          </button>

          {showThemeMenu && (
            <div className={`absolute right-0 mt-2 w-48 ${themeConfig.bgSurface} border ${themeConfig.border} rounded-xl shadow-2xl p-1.5 z-50`}>
              <ThemeSelector onSelect={() => setShowThemeMenu(false)} />
            </div>
          )}
        </div>

        {/* Quick Language Toggle */}
        <div className="relative group">
          <button
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Change active language mode"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{getLangBadge()}</span>
          </button>

          <div className="absolute right-0 mt-1 w-36 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 hidden group-hover:block z-50">
            <button
              onClick={() => onLanguageChange('auto')}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-800 ${
                languageMode === 'auto' ? 'text-emerald-400 font-semibold' : 'text-slate-300'
              }`}
            >
              ⚡ Auto Detect
            </button>
            <button
              onClick={() => onLanguageChange('hinglish')}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-800 ${
                languageMode === 'hinglish' ? 'text-emerald-400 font-semibold' : 'text-slate-300'
              }`}
            >
              🇮🇳 Hinglish
            </button>
            <button
              onClick={() => onLanguageChange('hindi')}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-800 ${
                languageMode === 'hindi' ? 'text-emerald-400 font-semibold' : 'text-slate-300'
              }`}
            >
              🕉️ हिन्दी (Hindi)
            </button>
            <button
              onClick={() => onLanguageChange('english')}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-800 ${
                languageMode === 'english' ? 'text-emerald-400 font-semibold' : 'text-slate-300'
              }`}
            >
              🌐 English
            </button>
          </div>
        </div>

        {/* Export conversation */}
        {messages.length > 0 && (
          <button
            onClick={handleExport}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs flex items-center gap-1 cursor-pointer"
            title="Copy conversation"
          >
            {copiedExport ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Clear Current Chat */}
        {messages.length > 0 && (
          <div className="relative">
            {showClearConfirm ? (
              <div className="absolute right-0 top-8 bg-slate-900 border border-slate-700 rounded-lg p-2 shadow-2xl z-50 w-44">
                <p className="text-[11px] text-slate-300 mb-2">Clear this chat?</p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      onClearCurrentChat();
                      setShowClearConfirm(false);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded px-2 py-0.5 text-[10px] font-medium cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded px-2 py-0.5 text-[10px] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Clear current messages"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* New Chat icon */}
        <button
          onClick={onNewChat}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Start a new chat"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Auth / Profile Button */}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu((prev) => !prev)}
              className="flex items-center gap-1 p-1 rounded-full border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer"
              title={currentUser.email || 'Account'}
            >
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center text-[10px] font-bold">
                  {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                </div>
              )}
            </button>

            {showUserMenu && (
              <div className={`absolute right-0 mt-2 w-48 ${themeConfig.bgSurface} border ${themeConfig.border} rounded-xl shadow-2xl p-2 z-50 text-xs`}>
                <div className="px-2 py-1 mb-1 border-b border-slate-800">
                  <p className="font-semibold text-slate-200 truncate">
                    {currentUser.displayName || 'User'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-slate-800/80 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${themeConfig.accent} text-xs font-semibold shadow-xs transition-all cursor-pointer`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
