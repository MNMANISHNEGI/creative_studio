const express     = require('express');
const OpenAI      = require('openai');
const { GoogleGenAI } = require('@google/genai');
const pool        = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

/* ── OpenAI client (copywriting) ────────────────────────────────── */
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* ── Gemini client (social + banner) ───────────────────────────── */
const gemini = new GoogleGenAI({ apiKey: process.env.gemini_api_key });

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

    /* Generate all variants in parallel using Gemini */
    const requests = Array.from({ length: count }, () =>
      gemini.models.generateContent({
        model:    'gemini-2.0-flash',
        contents: `${systemPrompt}\n\n${userMessage}`,
      })
    );

    const responses = await Promise.all(requests);
    const variants  = responses.map(r => r.text?.trim() || '');

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

/* ── POST /api/generate/social (Gemini Flash) ──────────────────── */
router.post('/social', async (req, res) => {
  const {
    project_id, campaign_type, platform = 'general',
    tone = 'playful', language = 'english', prompt,
  } = req.body;

  if (!project_id || !prompt?.trim())
    return res.status(400).json({ error: 'project_id and prompt are required' });

  const platLabels = {
    twitter: 'X (Twitter) — max 280 chars, punchy, include 2-3 hashtags',
    facebook: 'Facebook — conversational, 1-3 sentences, include a CTA',
    whatsapp: 'WhatsApp broadcast — friendly, direct, max 200 chars',
    instagram: 'Instagram — engaging caption, 3-5 hashtags, emoji welcome',
    general: 'General social media — versatile, clear, with a CTA',
  };

  const toneMap = {
    playful: 'fun, upbeat, and energetic',
    urgent: 'urgent, action-driving, create FOMO',
    inspirational: 'inspiring and aspirational',
    professional: 'professional, clear, brand-safe',
  };

  const langNote = language === 'hindi'
    ? 'Write in Hindi (Devanagari script). Keep brand names and numbers in English.'
    : 'Write in English.';

  const fullPrompt = `You are a senior social media copywriter for IndiGo (6E), India's largest low-cost airline.
Brand voice: bold, friendly, no-frills, optimistic. Tagline: "On-time. Hassle-free. Affordable."
Tone: ${toneMap[tone] || 'professional'}.
Platform: ${platLabels[platform] || platLabels.general}.
Language: ${langNote}
Campaign type: ${campaign_type || 'general'}
Campaign brief: ${prompt.trim()}

Write ONLY the social media post — no labels, no explanations. Output the post text directly.`;

  try {
    const response = await gemini.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: fullPrompt,
    });

    const caption = response.text?.trim() || '';
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

/* ── POST /api/generate/banner (Gemini Imagen 3) ───────────────── */
router.post('/banner', async (req, res) => {
  const {
    project_id, brief, aspect_ratio = '16:9', resolution = '1K',
    custom_width, custom_height,
  } = req.body;

  if (!project_id || !brief?.trim())
    return res.status(400).json({ error: 'project_id and brief are required' });

  /* Map aspect ratio to Imagen-supported values */
  const ratioMap = {
    '16:9': '16:9', '1:1': '1:1', '4:5': '4:5',
    '9:16': '9:16', '3:2': '3:4', 'Custom': '1:1',
  };
  const imagenRatio = ratioMap[aspect_ratio] || '16:9';

  const imagePrompt = `A high-quality, professional marketing banner for IndiGo (6E), India's low-cost airline.
Brand colors: deep blue (#0033A0) and white. Modern, clean, aviation-themed.
Creative brief: ${brief.trim()}
Resolution hint: ${resolution}. Aspect ratio: ${aspect_ratio}.
${custom_width && custom_height ? `Target size: ${custom_width}×${custom_height}px.` : ''}
Style: professional advertising banner, photorealistic, no text overlays, premium airline brand.`;

  try {
    const response = await gemini.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: imagePrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: imagenRatio,
      },
    });

    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!imageBytes) throw new Error('No image returned from Imagen');

    const imageUrl = `data:image/jpeg;base64,${imageBytes}`;
    const output   = { imageUrl, brief, aspect_ratio, resolution, status: 'done' };

    const { rows } = await pool.query(
      `INSERT INTO generations
         (project_id, user_id, tab_type, prompt, output)
       VALUES ($1,$2,'banner',$3,$4) RETURNING id, project_id, tab_type, created_at`,
      [project_id, req.user.id, brief.trim(), output]
    );

    res.json({ generation: rows[0], imageUrl });
  } catch (err) {
    console.error('Generate banner error:', err?.message);
    res.status(500).json({ error: err?.message || 'Image generation failed' });
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
