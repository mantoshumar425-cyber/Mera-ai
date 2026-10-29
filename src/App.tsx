import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessage } from './components/ChatMessage';
import { WelcomeScreen } from './components/WelcomeScreen';
import { InputBar } from './components/InputBar';
import { AuthModal } from './components/AuthModal';
import { Conversation, Message, LanguageMode } from './types';
import { ArrowDown, Key } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import {
  saveConversationToFirestore,
  loadUserConversationsFromFirestore,
  deleteConversationFromFirestore,
  clearAllConversationsFromFirestore,
} from './utils/firestoreStorage';

const STORAGE_KEY = 'mera_ai_conversations_v2';
const LANG_STORAGE_KEY = 'mera_ai_lang_preference';

function MainApp() {
  const { currentUser } = useAuth();
  const { themeConfig } = useTheme();

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load conversations from localStorage', e);
      return [];
    }
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const list: Conversation[] = saved ? JSON.parse(saved) : [];
      return list.length > 0 ? list[0].id : null;
    } catch {
      return null;
    }
  });

  const [languageMode, setLanguageMode] = useState<LanguageMode>(() => {
    try {
      return (localStorage.getItem(LANG_STORAGE_KEY) as LanguageMode) || 'auto';
    } catch {
      return 'auto';
    }
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [serverStatus, setServerStatus] = useState<{ hasKey: boolean; model: string } | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  // Sync with Firestore when logged in, or fallback to localStorage
  useEffect(() => {
    if (currentUser) {
      // Load user's conversations from cloud
      loadUserConversationsFromFirestore(currentUser.uid).then((cloudConvs) => {
        if (cloudConvs && cloudConvs.length > 0) {
          setConversations(cloudConvs);
          if (!activeConversationId || !cloudConvs.some((c) => c.id === activeConversationId)) {
            setActiveConversationId(cloudConvs[0].id);
          }
        }
      });
    }
  }, [currentUser]);

  // Sync conversations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to save conversations to localStorage', e);
    }
  }, [conversations]);

  // Sync language preference
  const handleLanguageChange = (mode: LanguageMode) => {
    setLanguageMode(mode);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, mode);
    } catch (e) {
      console.error(e);
    }
  };

  // Check server health and Gemini API key status
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setServerStatus({
          hasKey: Boolean(data.hasKey),
          model: data.model || 'gemini-3.8-flash',
        });
      })
      .catch((err) => {
        console.error('Failed to fetch /api/status:', err);
      });
  }, []);

  // Shortcut for New Chat (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Current active conversation
  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const currentMessages = activeConversation ? activeConversation.messages : [];

  // Auto-scroll handler
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  const handleScroll = () => {
    if (!chatScrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatScrollContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 160;
    setShowScrollBottom(isUp);
  };

  useEffect(() => {
    scrollToBottom(isGenerating ? 'auto' : 'smooth');
  }, [currentMessages, streamingContent, isGenerating]);

  // Create or switch to New Chat
  const handleNewChat = () => {
    if (isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
      setStreamingContent('');
    }

    const newConv: Conversation = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userId: currentUser?.uid,
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setInput('');

    if (currentUser) {
      saveConversationToFirestore(currentUser.uid, newConv);
    }
  };

  // Clear current active conversation messages
  const handleClearCurrentChat = () => {
    if (!activeConversationId) return;
    const updatedConvs = conversations.map((c) =>
      c.id === activeConversationId ? { ...c, messages: [], updatedAt: Date.now() } : c
    );
    setConversations(updatedConvs);

    if (currentUser) {
      const cleared = updatedConvs.find((c) => c.id === activeConversationId);
      if (cleared) {
        saveConversationToFirestore(currentUser.uid, cleared);
      }
    }
  };

  // Clear all conversations
  const handleClearAll = () => {
    if (isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
      setStreamingContent('');
    }
    setConversations([]);
    setActiveConversationId(null);

    if (currentUser) {
      clearAllConversationsFromFirestore(currentUser.uid);
    }
  };

  // Delete specific conversation
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
    }

    if (currentUser) {
      deleteConversationFromFirestore(currentUser.uid, id);
    }
  };

  // Rename conversation title
  const handleRenameConversation = (id: string, newTitle: string) => {
    const updated = conversations.map((c) =>
      c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c
    );
    setConversations(updated);

    if (currentUser) {
      const target = updated.find((c) => c.id === id);
      if (target) {
        saveConversationToFirestore(currentUser.uid, target);
      }
    }
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (streamingContent.trim() && activeConversationId) {
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: streamingContent + ' *(Response stopped)*',
        timestamp: Date.now(),
      };

      const updated = conversations.map((c) =>
        c.id === activeConversationId
          ? { ...c, messages: [...c.messages, assistantMsg], updatedAt: Date.now() }
          : c
      );

      setConversations(updated);

      if (currentUser) {
        const target = updated.find((c) => c.id === activeConversationId);
        if (target) saveConversationToFirestore(currentUser.uid, target);
      }
    }

    setIsGenerating(false);
    setStreamingContent('');
  };

  // Core send message handler
  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isGenerating) return;

    let targetConvId = activeConversationId;
    let updatedConversations = [...conversations];

    // If no active conversation, create one
    if (!targetConvId || !conversations.some((c) => c.id === targetConvId)) {
      const newConv: Conversation = {
        id: crypto.randomUUID(),
        title: prompt.slice(0, 36) + (prompt.length > 36 ? '...' : ''),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        userId: currentUser?.uid,
      };
      targetConvId = newConv.id;
      updatedConversations = [newConv, ...conversations];
      setActiveConversationId(targetConvId);
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };

    const currentConv = updatedConversations.find((c) => c.id === targetConvId);
    let newTitle = currentConv?.title || 'New Chat';
    if (newTitle === 'New Chat') {
      newTitle = prompt.slice(0, 36) + (prompt.length > 36 ? '...' : '');
    }

    const nextMessages = currentConv ? [...currentConv.messages, userMessage] : [userMessage];

    // Update conversation state with user message
    const savedState = updatedConversations.map((c) =>
      c.id === targetConvId
        ? {
            ...c,
            title: newTitle,
            messages: nextMessages,
            updatedAt: Date.now(),
            userId: currentUser?.uid,
          }
        : c
    );

    setConversations(savedState);

    if (currentUser) {
      const target = savedState.find((c) => c.id === targetConvId);
      if (target) saveConversationToFirestore(currentUser.uid, target);
    }

    setInput('');
    setIsGenerating(true);
    setStreamingContent('');

    const messageHistory = nextMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messageHistory,
          preferredLanguage: languageMode,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      const fullReply = data.reply || '';

      if (!fullReply) {
        throw new Error('Received an empty response from Gemini API.');
      }

      // Smooth typewriter stream simulation
      const chunkSize = 4;
      let currentIdx = 0;
      let accumulated = '';

      while (currentIdx < fullReply.length) {
        if (controller.signal.aborted) break;
        currentIdx = Math.min(currentIdx + chunkSize, fullReply.length);
        accumulated = fullReply.slice(0, currentIdx);
        setStreamingContent(accumulated);
        await new Promise((r) => setTimeout(r, 16));
      }

      if (!controller.signal.aborted) {
        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: fullReply,
          timestamp: Date.now(),
        };

        const finalConversations = conversations.map((c) =>
          c.id === targetConvId
            ? {
                ...c,
                messages: [...nextMessages, assistantMsg],
                updatedAt: Date.now(),
              }
            : c
        );

        setConversations(finalConversations);

        if (currentUser) {
          const finalConv = finalConversations.find((c) => c.id === targetConvId);
          if (finalConv) saveConversationToFirestore(currentUser.uid, finalConv);
        }
      }
    } catch (err: unknown) {
      if (controller.signal.aborted) {
        console.log('Stream was aborted by user');
      } else {
        console.error('Chat error:', err);
        const errMsg =
          err instanceof Error
            ? err.message
            : 'Could not connect to Mera AI service. Please verify server connection.';

        const errorAssistantMsg: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `⚠️ **Error:** ${errMsg}\n\n*If you haven't set your Gemini API key yet, please add it in AI Studio Secrets.*`,
          timestamp: Date.now(),
        };

        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetConvId
              ? { ...c, messages: [...c.messages, errorAssistantMsg], updatedAt: Date.now() }
              : c
          )
        );
      }
    } finally {
      setIsGenerating(false);
      setStreamingContent('');
      abortControllerRef.current = null;
    }
  };

  const handleRegenerate = () => {
    if (!activeConversation || currentMessages.length === 0 || isGenerating) return;

    let lastUserIndex = -1;
    for (let i = currentMessages.length - 1; i >= 0; i--) {
      if (currentMessages[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;

    const userPrompt = currentMessages[lastUserIndex].content;
    const trimmedMessages = currentMessages.slice(0, lastUserIndex);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId ? { ...c, messages: trimmedMessages } : c
      )
    );

    setTimeout(() => {
      handleSendMessage(userPrompt);
    }, 50);
  };

  const handleEditUserMessage = (text: string) => {
    setInput(text);
  };

  return (
    <div className={`flex h-dvh w-full ${themeConfig.bgMain} text-slate-100 overflow-hidden font-sans select-text transition-colors duration-300`}>
      {/* Sidebar Drawer */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => setActiveConversationId(id)}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onClearAll={handleClearAll}
        languageMode={languageMode}
        onLanguageChange={handleLanguageChange}
        serverStatus={serverStatus}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Main Chat Workspace */}
      <div className={`flex-1 flex flex-col h-full min-w-0 relative ${themeConfig.bgMain} transition-colors duration-300`}>
        {/* Missing Key Warning */}
        {serverStatus && !serverStatus.hasKey && (
          <div className="bg-amber-950/80 border-b border-amber-800/80 px-4 py-2 text-amber-200 text-xs flex items-center justify-between z-30">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>GEMINI_API_KEY</strong> not detected in environment secrets.
              </span>
            </div>
            <span className="text-[11px] bg-amber-900/60 border border-amber-700/60 rounded px-2 py-0.5 text-amber-300">
              Configure in Secrets Panel
            </span>
          </div>
        )}

        {/* Top Navbar */}
        <ChatHeader
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          title={activeConversation?.title || 'Mera AI'}
          languageMode={languageMode}
          onLanguageChange={handleLanguageChange}
          onNewChat={handleNewChat}
          onClearCurrentChat={handleClearCurrentChat}
          messages={currentMessages}
          onOpenAuthModal={() => setAuthModalOpen(true)}
        />

        {/* Chat Messages / Welcome View */}
        <div
          ref={chatScrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col scroll-smooth relative"
        >
          {currentMessages.length === 0 && !isGenerating ? (
            <WelcomeScreen onSelectPrompt={(p) => handleSendMessage(p)} />
          ) : (
            <div className="flex flex-col py-4 pb-8 space-y-1">
              {currentMessages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onRegenerate={msg.role === 'assistant' ? handleRegenerate : undefined}
                  onEdit={msg.role === 'user' ? handleEditUserMessage : undefined}
                />
              ))}

              {/* Streaming message */}
              {isGenerating && streamingContent && (
                <ChatMessage
                  message={{
                    id: 'streaming-assistant',
                    role: 'assistant',
                    content: streamingContent,
                    timestamp: Date.now(),
                  }}
                  isStreaming={true}
                />
              )}

              {/* Waiting Indicator */}
              {isGenerating && !streamingContent && (
                <div className={`w-full py-4 px-3 sm:px-4 md:px-6 ${themeConfig.bgBubbleAi} border-y ${themeConfig.border}`}>
                  <div className="max-w-3xl mx-auto flex gap-3 sm:gap-4 items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
                      <span className="text-xs font-bold">M</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 py-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"></div>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        Mera AI is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Floating Scroll Button */}
          {showScrollBottom && (
            <button
              onClick={() => scrollToBottom('smooth')}
              className="fixed bottom-24 right-6 md:right-10 z-20 p-2 rounded-full bg-slate-800/90 text-white border border-slate-700 shadow-xl hover:bg-slate-700 transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Scroll to bottom"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Input Bar */}
        <InputBar
          input={input}
          setInput={setInput}
          onSubmit={() => handleSendMessage()}
          isGenerating={isGenerating}
          onStop={handleStopGeneration}
          languageMode={languageMode}
        />
      </div>

      {/* Authentication Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </AuthProvider>
  );
}
