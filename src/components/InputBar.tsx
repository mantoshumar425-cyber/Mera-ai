import React, { useRef, useEffect, useState } from 'react';
import { ArrowUp, Square, Mic, MicOff } from 'lucide-react';
import { LanguageMode } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface InputBarProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  isGenerating: boolean;
  onStop: () => void;
  languageMode: LanguageMode;
  disabled?: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({
  input,
  setInput,
  onSubmit,
  isGenerating,
  onStop,
  languageMode,
  disabled = false,
}) => {
  const { themeConfig } = useTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      // Choose recognition language
      if (languageMode === 'hindi') {
        recognition.lang = 'hi-IN';
      } else {
        recognition.lang = 'en-IN'; // Indian English / Hinglish
      }

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInput(transcript);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (e: any) => {
        console.error('Speech recognition error', e);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [languageMode, setInput]);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Could not start speech recognition', err);
      }
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && input.trim()) {
        onSubmit();
      }
    }
  };

  const getPlaceholder = () => {
    switch (languageMode) {
      case 'hindi':
        return 'मेरा AI से कुछ भी पूछें (हिन्दी में)...';
      case 'hinglish':
        return 'Mera AI se kuch bhi pucho (Hinglish mein)...';
      case 'english':
        return 'Ask Mera AI anything (in English)...';
      default:
        return 'Ask Mera AI anything in English, हिन्दी, or Hinglish...';
    }
  };

  return (
    <footer className="w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-2 pb-3 px-3 sm:px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!isGenerating && input.trim()) {
              onSubmit();
            }
          }}
          className={`relative flex items-end ${themeConfig.bgSurface} border ${themeConfig.border} rounded-2xl p-2 shadow-xl focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all`}
        >
          {/* Voice Input Button */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500/20 text-red-400 animate-pulse'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Voice input (Hindi/English)'}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-red-400" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={getPlaceholder()}
            className="flex-1 bg-transparent border-0 outline-none resize-none text-slate-100 placeholder-slate-500 text-sm sm:text-[15px] px-2 py-1 max-h-44 leading-relaxed font-sans"
          />

          {/* Send or Stop Button */}
          <div className="flex items-center gap-1.5 ml-1">
            {isGenerating ? (
              <button
                type="button"
                onClick={onStop}
                className="w-8 h-8 rounded-xl bg-slate-200 text-slate-950 hover:bg-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                title="Stop generation"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() || disabled}
                className={`w-8 h-8 rounded-xl ${themeConfig.accent} disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-sm cursor-pointer active:scale-95`}
                title="Send message (Enter)"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </form>

        {/* Disclaimer Note */}
        <div className="flex items-center justify-center gap-1.5 mt-2 text-[11px] text-slate-500">
          <span>Mera AI can make mistakes. Verify critical facts and information.</span>
        </div>
      </div>
    </footer>
  );
};
