import React, { useState } from 'react';
import { Sparkles, Terminal, Compass, BookOpen, HeartHandshake } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectPrompt }) => {
  const { themeConfig } = useTheme();
  const [activeTab, setActiveTab] = useState<'hinglish' | 'hindi' | 'english'>('hinglish');

  const prompts = {
    hinglish: [
      {
        icon: <Terminal className="w-4 h-4 text-emerald-400" />,
        title: 'Code Optimize & Explain',
        desc: 'Mera Python ya JavaScript code analyze aur optimize kar do with comments',
        query: 'Mera Python code analyze aur optimize karne ke tips do with practical examples',
      },
      {
        icon: <Compass className="w-4 h-4 text-cyan-400" />,
        title: 'Career & Roadmap',
        desc: 'Web Development ya AI Engineer banne ka complete roadmap simple words mein',
        query: 'Full Stack Web Developer banne ka complete 2026 roadmap simple Hinglish mein samjhao',
      },
      {
        icon: <BookOpen className="w-4 h-4 text-amber-400" />,
        title: 'Complex Topic Explained',
        desc: 'Cloud Computing aur APIs ka concept real-world example dekar samjhao',
        query: 'Cloud computing aur REST APIs ka concept real-world analogies ke saath Hinglish mein samjhao',
      },
      {
        icon: <HeartHandshake className="w-4 h-4 text-pink-400" />,
        title: 'Professional Email / Resume',
        desc: 'Manager ko leave request ya appraisal follow-up email draft kar do',
        query: 'Ek polite aur professional email draft karo jisme main 3 din ki leave mang raha hoon',
      },
    ],
    hindi: [
      {
        icon: <Compass className="w-4 h-4 text-amber-400" />,
        title: 'भारतीय इतिहास व संस्कृति',
        desc: 'भारत के प्रमुख ऐतिहासिक धरोहरों और वास्तुशिल्प का विस्तृत वर्णन',
        query: 'भारत के प्रमुख 5 ऐतिहासिक धरोहरों और उनके सांस्कृतिक महत्व का संक्षेप में वर्णन करें',
      },
      {
        icon: <HeartHandshake className="w-4 h-4 text-emerald-400" />,
        title: 'जीवनशैली व स्वास्थ्य',
        desc: 'दैनिक जीवन में तनाव प्रबंधन और एकाग्रता बढ़ाने के 5 व्यावहारिक उपाय',
        query: 'दैनिक जीवन में मानसिक तनाव कम करने और कार्य-जीवन संतुलन बनाए रखने के 5 उपाय बताएं',
      },
      {
        icon: <BookOpen className="w-4 h-4 text-cyan-400" />,
        title: 'प्रेरणादायी साहित्य',
        desc: 'कठिन परिश्रम और आशावादिता पर एक प्रेरक निबंध या विचार',
        query: 'दृढ़ संकल्प और निरंतर प्रयास की शक्ति पर एक संक्षिप्त एवं प्रेरक विचार प्रस्तुत करें',
      },
      {
        icon: <Terminal className="w-4 h-4 text-purple-400" />,
        title: 'तकनीकी व्याख्या हिन्दी में',
        desc: 'आर्टिफिशियल इंटेलिजेंस और मशीन लर्निंग को सरल हिन्दी में समझें',
        query: 'आर्टिफिशियल इंटेलिजेंस (AI) और मशीन लर्निंग क्या है? इसे सरल हिन्दी में उदाहरण सहित समझाएं',
      },
    ],
    english: [
      {
        icon: <Terminal className="w-4 h-4 text-emerald-400" />,
        title: 'Code Architecture & Debugging',
        desc: 'Explain asynchronous programming patterns and microservices design',
        query: 'Explain event-driven architecture vs request-response with practical architectural trade-offs',
      },
      {
        icon: <Compass className="w-4 h-4 text-cyan-400" />,
        title: 'Scientific Concepts',
        desc: 'Demystify quantum computing and superposition using simple intuition',
        query: 'Explain quantum computing and superposition using a clear, intuitive analogy without heavy math',
      },
      {
        icon: <BookOpen className="w-4 h-4 text-amber-400" />,
        title: 'Writing & Communication',
        desc: 'Draft executive summaries, project proposals, or strategic documentation',
        query: 'Write a compelling executive summary for a cloud migration project proposal',
      },
      {
        icon: <HeartHandshake className="w-4 h-4 text-pink-400" />,
        title: 'Interview Preparation',
        desc: 'Simulate behavioral and technical engineering interview questions',
        query: 'Give me 5 behavioral interview questions for a Senior Software Engineer with STAR framework answer tips',
      },
    ],
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-3xl mx-auto w-full my-auto text-center">
      {/* Insignia / Brand */}
      <div className="relative mb-5 group">
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 p-0.5 shadow-xl ${themeConfig.accentGlow} flex items-center justify-center transition-transform group-hover:scale-105 duration-300`}
        >
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
            <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 via-teal-300 to-cyan-400 font-sans">
              M
            </span>
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none" />
          </div>
        </div>
        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>Gemini 3.8</span>
        </div>
      </div>

      {/* Greeting Title */}
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
        Namaste! How can I help you today?
      </h1>
      <p className="text-sm sm:text-base text-slate-400 max-w-lg mb-6 leading-relaxed">
        I am <span className={`${themeConfig.accentText} font-semibold`}>Mera AI</span>. Ask me questions in{' '}
        <span className="text-slate-200">English</span>,{' '}
        <span className="text-amber-300 font-medium">हिन्दी</span>, or{' '}
        <span className="text-cyan-300 font-medium">Hinglish</span>.
      </p>

      {/* Language starter tabs */}
      <div
        className={`flex items-center gap-2 p-1 rounded-xl ${themeConfig.bgSurface} border ${themeConfig.border} mb-6 text-xs font-medium`}
      >
        <button
          onClick={() => setActiveTab('hinglish')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'hinglish'
              ? `${themeConfig.accent} shadow-sm`
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🇮🇳 Hinglish Examples
        </button>
        <button
          onClick={() => setActiveTab('hindi')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'hindi'
              ? `${themeConfig.accent} shadow-sm`
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🕉️ हिन्दी Examples
        </button>
        <button
          onClick={() => setActiveTab('english')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'english'
              ? `${themeConfig.accent} shadow-sm`
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🌐 English Examples
        </button>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {prompts[activeTab].map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.query)}
            className={`group flex flex-col p-3.5 rounded-xl ${themeConfig.bgSurface}/70 hover:${themeConfig.bgSurface} border ${themeConfig.border} hover:border-slate-600 transition-all text-left cursor-pointer active:scale-[0.99] shadow-xs`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 rounded-lg bg-black/30 group-hover:bg-black/50 transition-colors">
                {item.icon}
              </div>
              <span
                className={`text-xs font-semibold text-slate-200 group-hover:${themeConfig.accentText} transition-colors`}
              >
                {item.title}
              </span>
            </div>
            <p className="text-[12px] text-slate-400 leading-snug line-clamp-2">
              "{item.desc}"
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
