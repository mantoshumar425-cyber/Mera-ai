import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Volume2, VolumeX, RotateCcw, Edit3, Sparkles, User } from 'lucide-react';
import { Message } from '../types';
import { renderMarkdown } from '../utils/markdown';
import { useTheme } from '../contexts/ThemeContext';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onEdit?: (text: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isStreaming,
  onRegenerate,
  onEdit,
}) => {
  const { themeConfig } = useTheme();
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Copy whole message
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  // Text-To-Speech
  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown symbols for cleaner speech
    const cleanText = message.content
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[#*`_~>[\]()]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Detect if text contains Hindi characters
    const hasHindi = /[\u0900-\u097F]/.test(cleanText);
    const voices = window.speechSynthesis.getVoices();

    if (hasHindi) {
      const hindiVoice = voices.find((v) => v.lang.startsWith('hi'));
      if (hindiVoice) utterance.voice = hindiVoice;
      utterance.lang = 'hi-IN';
    } else {
      const englishVoice = voices.find((v) => v.lang.startsWith('en'));
      if (englishVoice) utterance.voice = englishVoice;
      utterance.lang = 'en-US';
    }

    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Add copy buttons to any pre code blocks rendered inside markdown
  useEffect(() => {
    if (!contentRef.current || isUser) return;

    const preElements = contentRef.current.querySelectorAll('pre');
    preElements.forEach((pre) => {
      // Check if copy button already added
      if (pre.querySelector('.code-copy-btn')) return;

      pre.style.position = 'relative';

      const codeElement = pre.querySelector('code');
      const langClass = Array.from(codeElement?.classList || []).find((c) =>
        c.startsWith('language-')
      );
      const language = langClass ? langClass.replace('language-', '') : 'code';

      // Header bar for code
      const header = document.createElement('div');
      header.className =
        'flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 bg-slate-950/90 border-b border-slate-700/60 rounded-t-md font-mono select-none';

      const langSpan = document.createElement('span');
      langSpan.textContent = language.toUpperCase();
      langSpan.className = 'text-emerald-400 font-semibold';

      const copyBtn = document.createElement('button');
      copyBtn.className =
        'code-copy-btn inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer';
      copyBtn.innerHTML = `<span>Copy</span>`;

      copyBtn.onclick = async () => {
        const codeText = codeElement ? codeElement.innerText : pre.innerText;
        await navigator.clipboard.writeText(codeText);
        copyBtn.innerHTML = `<span class="text-emerald-400">Copied!</span>`;
        setTimeout(() => {
          copyBtn.innerHTML = `<span>Copy</span>`;
        }, 2000);
      };

      header.appendChild(langSpan);
      header.appendChild(copyBtn);

      pre.insertBefore(header, pre.firstChild);
    });
  }, [message.content, isUser]);

  return (
    <div
      className={`group w-full py-4 px-3 sm:px-4 md:px-6 transition-colors ${
        isUser ? 'bg-transparent' : `${themeConfig.bgBubbleAi} border-y ${themeConfig.border}`
      }`}
    >
      <div className="max-w-3xl mx-auto flex gap-3 sm:gap-4 items-start">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/10 font-medium text-xs">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sparkles className="w-4 h-4" />
              {/* Subtle Indian tricolor accent dot */}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-slate-950"></span>
              </span>
            </div>
          )}
        </div>

        {/* Content & Actions */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold tracking-wide text-slate-300">
              {isUser ? 'You' : 'Mera AI'}
            </span>
            <span className="text-[10px] text-slate-500">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Body */}
          {isUser ? (
            <div className={`whitespace-pre-wrap break-words text-sm sm:text-[15px] leading-relaxed font-normal border rounded-2xl rounded-tl-sm px-4 py-2.5 inline-block max-w-full shadow-xs ${themeConfig.bgBubbleUser}`}>
              {message.content}
            </div>
          ) : (
            <div
              ref={contentRef}
              className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-[15px] leading-relaxed break-words
                prose-headings:text-slate-100 prose-headings:font-semibold prose-headings:tracking-tight
                prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-h1:mt-4 prose-h1:mb-2 prose-h2:mt-3 prose-h2:mb-2
                prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5
                prose-code:text-emerald-300 prose-code:bg-slate-900/90 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
                prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-lg prose-pre:p-0 prose-pre:my-3 prose-pre:shadow-lg
                prose-strong:text-white prose-blockquote:border-l-emerald-500 prose-blockquote:bg-emerald-950/20 prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:rounded-r
                prose-table:border-collapse prose-th:border prose-th:border-slate-700 prose-th:p-2 prose-th:bg-slate-800/60 prose-td:border prose-td:border-slate-800 prose-td:p-2"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(message.content),
              }}
            />
          )}

          {/* Streaming blinking cursor */}
          {isStreaming && !isUser && (
            <span className="inline-block w-2 h-4 ml-1 bg-emerald-400 animate-pulse align-middle" />
          )}

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 mt-2.5 pt-1 text-slate-400">
            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-200 transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="Copy message"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Copy</span>
                </>
              )}
            </button>

            {/* Read aloud TTS button */}
            {!isUser && (
              <button
                onClick={handleSpeak}
                className={`p-1.5 rounded-md hover:bg-slate-800 transition-colors text-xs flex items-center gap-1 cursor-pointer ${
                  isSpeaking ? 'text-emerald-400 bg-emerald-950/40' : 'hover:text-slate-200'
                }`}
                title={isSpeaking ? 'Stop reading' : 'Read aloud'}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Stop Voice</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Listen</span>
                  </>
                )}
              </button>
            )}

            {/* Regenerate button for assistant */}
            {!isUser && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-200 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                title="Regenerate response"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-[11px]">Retry</span>
              </button>
            )}

            {/* Edit button for user message */}
            {isUser && onEdit && (
              <button
                onClick={() => onEdit(message.content)}
                className="p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-200 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                title="Edit message"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="text-[11px]">Edit</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
