import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  MessageSquare,
  Globe,
  X,
  Check,
  Edit2,
  Trash,
  HelpCircle,
  Search,
  LogIn,
  LogOut,
  User as UserIcon,
  Cloud,
  CloudCheck,
  Palette,
} from 'lucide-react';
import { Conversation, LanguageMode, AppTheme } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeSelector } from './ThemeSelector';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onClearAll: () => void;
  languageMode: LanguageMode;
  onLanguageChange: (mode: LanguageMode) => void;
  serverStatus: { hasKey: boolean; model: string } | null;
  onOpenAuthModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onClearAll,
  languageMode,
  onLanguageChange,
  serverStatus,
  onOpenAuthModal,
}) => {
  const { currentUser, logout } = useAuth();
  const { theme, themeConfig } = useTheme();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const startEditing = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  const saveEditing = (id: string) => {
    if (editingTitle.trim()) {
      onRenameConversation(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 md:w-64 ${themeConfig.bgSidebar} border-r ${themeConfig.border} flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className={`p-3.5 border-b ${themeConfig.border}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-500/20">
                M
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-100 text-sm tracking-tight flex items-center gap-1.5">
                  Mera AI
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-medium">
                    v3.8
                  </span>
                </span>
                <span className="text-[10px] text-slate-400">
                  हिन्दी • Hinglish • English
                </span>
              </div>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 md:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Primary Button */}
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg ${themeConfig.accent} font-medium text-xs tracking-wide shadow-sm transition-all cursor-pointer group active:scale-[0.98]`}
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
            <span>New Chat</span>
            <kbd className="hidden md:inline-block ml-auto text-[9px] bg-black/20 text-white/90 px-1 py-0.5 rounded border border-white/20">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* User Account Bar */}
        <div className={`px-3 py-2 border-b ${themeConfig.border} bg-black/20`}>
          {currentUser ? (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-6 h-6 rounded-full border border-slate-700 object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center text-[10px] font-bold">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex flex-col">
                  <span className="truncate text-slate-200 font-medium text-xs">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <Cloud className="w-2.5 h-2.5" /> Cloud Synced
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenAuthModal();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs text-slate-200 font-medium transition-all cursor-pointer group"
            >
              <span className="flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                Sign In / Save Chats
              </span>
              <span className="text-[10px] text-slate-400 group-hover:text-white">Free</span>
            </button>
          )}
        </div>

        {/* Language Preference */}
        <div className={`px-3 py-2.5 border-b ${themeConfig.border} bg-black/10`}>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Language Preference
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 text-[11px]">
            <button
              onClick={() => onLanguageChange('auto')}
              className={`px-2 py-1.5 rounded-md font-medium text-left truncate transition-colors cursor-pointer ${
                languageMode === 'auto'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              ⚡ Auto Detect
            </button>
            <button
              onClick={() => onLanguageChange('hinglish')}
              className={`px-2 py-1.5 rounded-md font-medium text-left truncate transition-colors cursor-pointer ${
                languageMode === 'hinglish'
                  ? themeConfig.activeNav
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              🇮🇳 Hinglish
            </button>
            <button
              onClick={() => onLanguageChange('hindi')}
              className={`px-2 py-1.5 rounded-md font-medium text-left truncate transition-colors cursor-pointer ${
                languageMode === 'hindi'
                  ? 'bg-amber-950/70 text-amber-300 border border-amber-700/60 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              🕉️ हिन्दी (Hindi)
            </button>
            <button
              onClick={() => onLanguageChange('english')}
              className={`px-2 py-1.5 rounded-md font-medium text-left truncate transition-colors cursor-pointer ${
                languageMode === 'english'
                  ? 'bg-blue-950/70 text-blue-300 border border-blue-700/60 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              🌐 English
            </button>
          </div>
        </div>

        {/* Conversations Search */}
        {conversations.length > 3 && (
          <div className="px-3 pt-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full bg-slate-900/80 border border-slate-800 rounded-md pl-8 pr-2 py-1 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-slate-700"
              />
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 text-xs">
          <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase flex items-center justify-between">
            <span>Conversations ({filteredConversations.length})</span>
            {currentUser && <span className="text-emerald-400 lowercase">cloud</span>}
          </div>

          {filteredConversations.length === 0 ? (
            <div className="px-3 py-6 text-center text-slate-500 text-xs">
              {searchQuery ? 'No matching chats found' : 'No chats yet. Start talking to Mera AI!'}
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const isEditing = conv.id === editingId;

              return (
                <div
                  key={conv.id}
                  className={`group relative flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-800/90 text-white font-medium shadow-xs border border-slate-700/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                  onClick={() => {
                    if (!isEditing) {
                      onSelectConversation(conv.id);
                      if (window.innerWidth < 768) onClose();
                    }
                  }}
                >
                  <MessageSquare
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? themeConfig.accentText : 'text-slate-500'
                    }`}
                  />

                  {isEditing ? (
                    <div
                      className="flex-1 flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditing(conv.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                        className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={() => saveEditing(conv.id)}
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="truncate flex-1 text-left">
                        {conv.title || 'Untitled conversation'}
                      </span>

                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(conv);
                          }}
                          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700/60"
                          title="Rename"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conv.id);
                          }}
                          className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-slate-700/60"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className={`p-3 border-t ${themeConfig.border} bg-black/20 space-y-1.5`}>
          {/* Theme Palette Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowThemeModal((prev) => !prev)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 text-xs transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-cyan-400" />
                Theme: <strong className="text-slate-200 capitalize">{theme}</strong>
              </span>
              <span className="text-[10px] text-slate-500">Toggle</span>
            </button>

            {/* Inline Theme Dropdown */}
            {showThemeModal && (
              <div className={`mt-1.5 p-1 rounded-xl bg-slate-900 border ${themeConfig.border} shadow-2xl`}>
                <ThemeSelector onSelect={() => setShowThemeModal(false)} />
              </div>
            )}
          </div>

          {/* Clear History */}
          {conversations.length > 0 && (
            <div>
              {showConfirmClear ? (
                <div className="bg-red-950/40 border border-red-800/50 rounded-lg p-2 text-xs">
                  <p className="text-red-200 text-[11px] mb-2 font-medium">
                    Clear all chat history?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onClearAll();
                        setShowConfirmClear(false);
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded px-2 py-1 text-[11px] font-medium"
                    >
                      Yes, Clear
                    </button>
                    <button
                      onClick={() => setShowConfirmClear(false)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded px-2 py-1 text-[11px]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirmClear(true)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 text-xs transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Trash className="w-3.5 h-3.5" />
                    Clear History
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Architecture & Setup Guide */}
          <button
            onClick={() => setShowSetupModal(true)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 text-xs transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              Setup & Auth Info
            </span>
          </button>

          {/* Server / Cloud Status */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  serverStatus?.hasKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              {serverStatus?.hasKey ? 'Gemini 3.8 Flash' : 'API Key Setup'}
            </span>
            <span className="text-[10px] text-slate-500">
              {currentUser ? 'Cloud Synced' : 'Guest Mode'}
            </span>
          </div>
        </div>
      </aside>

      {/* Setup Guide Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                Mera AI Architecture & Auth
              </h3>
              <button
                onClick={() => setShowSetupModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <p className="font-medium text-emerald-400 mb-1">
                  1. Secure User Authentication
                </p>
                <p>
                  Users can sign in using <strong>Google OAuth</strong> or <strong>Email & Password</strong>. Your credentials and tokens are secured via Firebase Auth.
                </p>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <p className="font-medium text-emerald-400 mb-1">
                  2. Cloud Conversation Persistence
                </p>
                <p>
                  Chat history is stored in Firestore at <code className="text-emerald-300">/users/&#123;uid&#125;/conversations</code>, protected by strict owner security rules so only you can read or edit your chats.
                </p>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <p className="font-medium text-emerald-400 mb-1">
                  3. Color Themes
                </p>
                <p>
                  Toggle between <strong>Midnight</strong>, <strong>Ocean</strong>, and <strong>Forest</strong> themes to customize your chat bubbles and atmosphere.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowSetupModal(false)}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
