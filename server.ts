import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Helper to get Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const SYSTEM_INSTRUCTION_BASE = `You are "Mera AI" (मेरा AI), a fast, helpful, highly intelligent, and culturally attuned AI assistant inspired by ChatGPT.

Key Guidelines:
1. Native Multilingual Support:
   - You natively and seamlessly understand and speak Hindi (हिन्दी in Devanagari script), Hinglish (Hindi written in Roman/English alphabet, e.g. "Mera code optimize kar do please"), and English.
   - Automatically detect the user's language and respond in the same language and tone:
     * English: Natural, crisp, professional English.
     * Hinglish: Natural, fluent, polite Hinglish (e.g. "Haan bilkul! Yeh solution aapke code ko speed up karega...").
     * Hindi (हिन्दी): Grammatically clean, respectful Devanagari Hindi (e.g. "नमस्ते! मैं आपकी सहायता करने के लिए तैयार हूँ।").
   - If the user asks for code, technical concepts, or translations across Hindi/English, assist smoothly.
2. Structure & Presentation:
   - Present responses using rich Markdown: clear headings, bullet points, numbered lists, tables, and formatted code blocks with language labels (e.g., \`\`\`python, \`\`\`javascript).
3. Personality & Demeanor:
   - Warm, respectful, polite ("Namaste", "Hello"), encouraging, and direct.
   - Retain full multi-turn conversation context for follow-up questions.`;

// Health check endpoint
app.get('/api/status', (_req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  res.json({
    status: 'ok',
    hasKey: Boolean(apiKey && apiKey.trim().length > 0),
    model: 'gemini-3.8-flash / gemini-3.1-flash-lite',
    name: 'Mera AI',
  });
});

interface ClientMessage {
  role: 'user' | 'assistant';
  content: string;
}

function buildContents(messages: ClientMessage[]) {
  return messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
}

function getSystemInstruction(preferredLanguage?: string) {
  let instruction = SYSTEM_INSTRUCTION_BASE;
  if (preferredLanguage === 'hindi') {
    instruction += '\n\n[USER PREFERENCE OVERRIDE]: Respond exclusively in Hindi (हिन्दी in Devanagari script).';
  } else if (preferredLanguage === 'hinglish') {
    instruction += '\n\n[USER PREFERENCE OVERRIDE]: Respond exclusively in natural Hinglish (Hindi written in Roman English alphabet).';
  } else if (preferredLanguage === 'english') {
    instruction += '\n\n[USER PREFERENCE OVERRIDE]: Respond exclusively in English.';
  }
  return instruction;
}

// Preferred models in priority order (ultra-fast sub-second latency with fallback)
const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];

// Non-streaming Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, preferredLanguage } = req.body as {
      messages: ClientMessage[];
      preferredLanguage?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Message history is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        error:
          'GEMINI_API_KEY is not configured on the server. Please configure your key in AI Studio Secrets.',
      });
    }

    const contents = buildContents(messages);
    const systemInstruction = getSystemInstruction(preferredLanguage);

    let lastError: Error | null = null;
    let replyText = '';

    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
          },
        });
        replyText = response.text || '';
        if (replyText) {
          return res.json({ reply: replyText, modelUsed: model });
        }
      } catch (err) {
        console.warn(`Model ${model} returned error, falling back if possible:`, err);
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    return res.status(500).json({
      error: lastError?.message || 'Failed to generate response from Gemini AI models.',
    });
  } catch (err: unknown) {
    console.error('Chat API Error:', err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Server error occurred.',
    });
  }
});

// Streaming Chat Endpoint via SSE
app.post('/api/chat/stream', async (req, res) => {
  let isClosed = false;
  req.on('close', () => {
    isClosed = true;
  });

  try {
    const { messages, preferredLanguage } = req.body as {
      messages: ClientMessage[];
      preferredLanguage?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Message history is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        error:
          'GEMINI_API_KEY is not configured on the server. Please configure your key in AI Studio Secrets.',
      });
    }

    const contents = buildContents(messages);
    const systemInstruction = getSystemInstruction(preferredLanguage);

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    let streamSuccess = false;
    let lastError: Error | null = null;

    for (const model of CANDIDATE_MODELS) {
      if (isClosed) break;
      try {
        const responseStream = await ai.models.generateContentStream({
          model,
          contents,
          config: {
            systemInstruction,
          },
        });

        for await (const chunk of responseStream) {
          if (isClosed) break;
          const text = chunk.text;
          if (text) {
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
          }
        }

        streamSuccess = true;
        break; // Successfully completed streaming
      } catch (err) {
        console.warn(`Streaming attempt on ${model} failed, attempting fallback:`, err);
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    if (!isClosed) {
      if (streamSuccess) {
        res.write('data: [DONE]\n\n');
      } else {
        const errorMsg =
          lastError?.message || 'Could not stream response. Please try again.';
        res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
      }
      res.end();
    }
  } catch (err: unknown) {
    console.error('Streaming handler error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Streaming failed',
      });
    } else {
      res.write(
        `data: ${JSON.stringify({
          error: err instanceof Error ? err.message : 'Unknown streaming error',
        })}\n\n`
      );
      res.end();
    }
  }
});

// Start Express and mount Vite middlewares or static files
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Mera AI server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
