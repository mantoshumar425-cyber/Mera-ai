export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  userId?: string;
}

export type LanguageMode = 'auto' | 'hindi' | 'hinglish' | 'english';

export type AppTheme = 'midnight' | 'ocean' | 'forest';

export interface ThemeColors {
  id: AppTheme;
  name: string;
  bgMain: string;
  bgSidebar: string;
  bgSurface: string;
  bgBubbleUser: string;
  bgBubbleAi: string;
  borderColor: string;
  accent: string;
  accentGradient: string;
  pillBg: string;
}
