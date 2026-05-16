const express     = require('express');
const OpenAI      = require('openai');
const pool        = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

/* ── OpenAI client ──────────────────────────────────────────────── */
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* ── System prompt builder ─────────────────────────────────────── */
function buildSystemPrompt(contentType, tone, language) {
  const toneMap = {
    playful:       'fun, upbeat, and energetic — use emojis where appropriate',
    urgent:        'urgent and action-driving — create FOMO and time pressure',
    inspirational: 'inspiring and aspirational — paint a vivid picture',
    professional:  'professional, clear, and brand-safe',
  };

  const formatMap = {
    caption:   `a social media post caption (max 2200 characters, include 3-5 relevant hashtags)`,
    headline:  `a punchy ad headline (max 70 characters, no hashtags)`,
    sms:       `an SMS marketing message (max 160 characters, include CTA)`,
    push:      `a mobile push notification (max 100 characters total, title + body)`,
    email:     `an email subject line (max 60 characters, high open-rate optimized)`,
    tagline:   `a brand tagline (max 50 characters, memorable and concise)`,
    ooh:       `an OOH/billboard headline (max 8 words, bold and punchy)`,
  };

  const langInstruction = language === 'hindi'
    ? 'Write in Hindi (Devanagari script). Keep brand names and numbers in English.'
    : 'Write in English.';

  return `You are a senior copywriter for IndiGo (6E), India's largest low-cost airline.
Brand voice: bold, friendly, no-frills, optimistic.
Brand tagline: "On-time. Hassle-free. Affordable."
Tone for this output: ${toneMap[tone] || 'professional'}.
Format: Write ${formatMap[contentType] || 'marketing copy'}.
Language: ${langInstruction}
Rules:
- Never mention competitor airlines
- Always align with IndiGo's brand values
- Include a clear call-to-action
- Output ONLY the copy — no labels, no explanations, no markdown`;
}

/* ── POST /api/generate/copy ───────────────────────────────────── */
router.post('/copy', async (req, res) => {
  const {
    project_id,
    campaign_type,
    content_type  = 'caption',
    tone          = 'playful',
    language      = 'english',
    variations    = 3,
    prompt,
  } = req.body;

  if (!project_id) return res.status(400).json({ error: 'project_id is required' });
  if (!prompt?.trim()) return res.status(400).json({ error: 'prompt is required' });

  const count = Math.min(Math.max(parseInt(variations) || 3, 1), 5);

  try {
    const systemPrompt = buildSystemPrompt(content_type, tone, language);
    const userMessage  = `Campaign context: ${prompt.trim()}\nCampaign type: ${campaign_type || 'general'}`;

    /* Generate all variants in parallel */
    const requests = Array.from({ length: count }, () =>
      openai.chat.completions.create({
        model:       'gpt-4o-mini',
        max_tokens:  400,
        temperature: 0.85,
        messages: [
          { role: 'system',  content: systemPrompt },
          { role: 'user',    content: userMessage  },
        ],
      })
    );

    const responses = await Promise.all(requests);
    const variants  = responses.map(r => r.choices[0]?.message?.content?.trim() || '');

    const output = { variants };

    /* Save to DB */
    const { rows } = await pool.query(
      `INSERT INTO generations
         (project_id, user_id, tab_type, campaign_type, content_type, tone, language, prompt, output)
       VALUES ($1,$2,'copywriting',$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [project_id, req.user.id, campaign_type, content_type, tone, language, prompt.trim(), output]
    );

    res.json({ generation: rows[0], variants });
  } catch (err) {
    console.error('Generate copy error:', err?.message || err);
    if (err?.status === 401)
      return res.status(502).json({ error: 'Invalid OpenAI API key. Check server/.env' });
    res.status(500).json({ error: err?.message || 'Generation failed' });
  }
});

/* ── POST /api/generate/social ─────────────────────────────────── */
router.post('/social', async (req, res) => {
  const {
    project_id, campaign_type, platform = 'general',
    tone = 'playful', language = 'english', prompt,
  } = req.body;

  if (!project_id || !prompt?.trim())
    return res.status(400).json({ error: 'project_id and prompt are required' });

  try {
    const systemPrompt = buildSystemPrompt('caption', tone, language);
    const userMessage  = `Platform: ${platform}\nCampaign: ${prompt.trim()}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', max_tokens: 500, temperature: 0.85,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage  },
      ],
    });

    const caption = response.choices[0]?.message?.content?.trim() || '';
    const output  = { variants: [caption], platform };

    const { rows } = await pool.query(
      `INSERT INTO generations
         (project_id, user_id, tab_type, campaign_type, platform, tone, language, prompt, output)
       VALUES ($1,$2,'social',$3,$4,$5,$6,$7,$8) RETURNING *`,
      [project_id, req.user.id, campaign_type, platform, tone, language, prompt.trim(), output]
    );

    res.json({ generation: rows[0], caption });
  } catch (err) {
    console.error('Generate social error:', err?.message);
    res.status(500).json({ error: err?.message || 'Generation failed' });
  }
});

/* ── POST /api/generate/banner (placeholder — image gen later) ─── */
router.post('/banner', async (req, res) => {
  const { project_id, brief, aspect_ratio = '16:9', resolution = '1K' } = req.body;
  if (!project_id || !brief?.trim())
    return res.status(400).json({ error: 'project_id and brief are required' });

  try {
    /* Placeholder — DALL-E integration goes here when image API is ready */
    const output = { imageUrl: null, brief, aspect_ratio, resolution, status: 'pending' };

    const { rows } = await pool.query(
      `INSERT INTO generations
         (project_id, user_id, tab_type, prompt, output)
       VALUES ($1,$2,'banner',$3,$4) RETURNING *`,
      [project_id, req.user.id, brief.trim(), output]
    );

    res.json({ generation: rows[0], message: 'Banner queued — image generation coming soon' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/* ── GET /api/generate/history/:project_id ─────────────────────── */
router.get('/history/:project_id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM generations
       WHERE project_id = $1 AND user_id = $2
       ORDER BY created_at DESC`,
      [req.params.project_id, req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
