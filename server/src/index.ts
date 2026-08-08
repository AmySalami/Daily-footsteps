// =========================================================
// DailyFootsteps — thin AI proxy (E9)
// Holds the Anthropic API key and forwards review requests to Claude,
// returning a typed Review (structured outputs). The key never reaches
// the browser. This is the only server component in the app.
// =========================================================
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

// Load a local .env if present (Node 21.7+). Harmless if the file is absent.
try {
  process.loadEnvFile('.env');
} catch {
  /* no .env — rely on the ambient environment */
}

const PORT = Number(process.env.PORT ?? 8787);
const MODEL = 'claude-opus-5'; // change here to use a cheaper tier (e.g. claude-sonnet-5)
const HAS_KEY = Boolean(process.env.ANTHROPIC_API_KEY);

const LANG_NAME: Record<string, string> = { en: 'English', de: 'German' };

// JSON schema the model must fill — mirrors the app's Review type (minus fields
// the client fills in: `original` and per-word `date`).
const REVIEW_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    score: { type: 'integer', description: '0–100 rating of grammar, clarity, and range' },
    polished: { type: 'string', description: 'A corrected, natural version of the text' },
    changed: { type: 'boolean', description: 'true if polished differs meaningfully from the original' },
    suggestions: {
      type: 'array',
      description: '2–4 short, actionable tips',
      items: { type: 'string' },
    },
    vocab: {
      type: 'array',
      description: 'Up to 6 useful words drawn from the learner’s own text',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          word: { type: 'string' },
          type: { type: 'string', enum: ['noun', 'verb', 'adj', 'adv', 'other'] },
          meaning: { type: 'string', description: 'A short English gloss' },
          usage: { type: 'string', description: 'A brief note on how the word is used' },
          example: { type: 'string', description: 'An example sentence, ideally from the learner’s text' },
        },
        required: ['word', 'type', 'meaning', 'usage', 'example'],
      },
    },
  },
  required: ['score', 'polished', 'changed', 'suggestions', 'vocab'],
} as const;

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, model: MODEL, hasKey: HAS_KEY });
});

app.post('/review', async (req, res) => {
  const { text, title, lang } = req.body ?? {};

  if (typeof text !== 'string' || text.trim().split(/\s+/).length < 3) {
    return res.status(400).json({ error: 'text must be a string of at least 3 words' });
  }
  if (lang !== 'en' && lang !== 'de') {
    return res.status(400).json({ error: 'lang must be "en" or "de"' });
  }
  if (!HAS_KEY) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY is not set on the proxy' });
  }

  const language = LANG_NAME[lang];
  const system =
    `You are an expert ${language} tutor giving feedback on a language learner's short piece of writing. ` +
    `Return ONLY a JSON object matching the provided schema. ` +
    `score: 0–100 on grammar, clarity, and range. ` +
    `polished: a corrected, natural ${language} version of the text. ` +
    `changed: true if polished differs meaningfully from the original. ` +
    `suggestions: 2–4 short, actionable tips, written in ${language}. ` +
    `vocab: up to 6 useful words taken from the learner's own text — for each give the word as written, ` +
    `its type, a short English gloss as the meaning, a brief usage note, and an example sentence ` +
    `(prefer one from the learner's text). Be encouraging and precise.`;

  const userContent = title ? `Topic: ${title}\n\n${text}` : text;

  // output_config is newer than some published SDK typings; build the body loosely.
  const body: Record<string, unknown> = {
    model: MODEL,
    max_tokens: 4096,
    system,
    messages: [{ role: 'user', content: userContent }],
    output_config: {
      effort: 'low',
      format: { type: 'json_schema', schema: REVIEW_SCHEMA },
    },
  };

  try {
    const response = await client.messages.create(body as unknown as Anthropic.MessageCreateParamsNonStreaming);
    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return res.status(502).json({ error: 'no text block in model response' });
    }
    const data = JSON.parse(textBlock.text);
    return res.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[review] error:', message);
    return res.status(502).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`DailyFootsteps proxy on http://localhost:${PORT}  (model: ${MODEL}, key: ${HAS_KEY ? 'set' : 'MISSING'})`);
});
