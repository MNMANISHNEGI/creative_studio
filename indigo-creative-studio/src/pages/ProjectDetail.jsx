import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppShell from '../components/AppShell';
import * as api from '../services/api';
import './ProjectDetail.css';

/* ─────────────────────────── constants ─────────────────────────── */

const CAMPAIGN_TYPES = [
  { value: 'new-launch',   label: 'New Launch',            emoji: '🚀' },
  { value: 'destination',  label: 'Destination Promotion',  emoji: '✈️' },
  { value: 'sale-offers',  label: 'Sale & Offers',          emoji: '🏷️' },
  { value: 'seasonal',     label: 'Seasonal Campaign',      emoji: '🌟' },
  { value: 'brand',        label: 'Brand Awareness',        emoji: '📣' },
  { value: 'announcement', label: 'Flight Announcement',    emoji: '📢' },
];

const CONTENT_TYPES = [
  { value: 'caption',    label: 'Caption',            icon: '📸', charLimit: 2200 },
  { value: 'headline',   label: 'Headline',           icon: '📰', charLimit: 70   },
  { value: 'sms',        label: 'SMS',                icon: '📱', charLimit: 160  },
  { value: 'push',       label: 'Push Notification',  icon: '🔔', charLimit: 100  },
  { value: 'email',      label: 'Email Subject',      icon: '📧', charLimit: 60   },
  { value: 'tagline',    label: 'Tagline',            icon: '🏷️', charLimit: 50   },
  { value: 'ooh',        label: 'OOH / Billboard',    icon: '🪧', charLimit: 8    },
];

const TONES = [
  { value: 'playful',       label: 'Playful',       icon: '🎉' },
  { value: 'urgent',        label: 'Urgent',        icon: '⚡' },
  { value: 'inspirational', label: 'Inspirational', icon: '✨' },
  { value: 'professional',  label: 'Professional',  icon: '💼' },
];

const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'hindi',   label: 'Hindi'   },
];

const SOCIAL_PLATFORMS = [
  {
    id: 'twitter', label: 'X (Twitter)', color: '#000000',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="plat-icon">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L2.25 2.25h6.835l4.263 5.638 5.896-5.638Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: 'facebook', label: 'Facebook', color: '#1877F2',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="plat-icon">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: 'whatsapp', label: 'WhatsApp', color: '#25D366',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="plat-icon">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    id: 'instagram', label: 'Instagram', color: '#E1306C',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="plat-icon">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    id: 'general', label: 'General', color: '#6b7280',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="plat-icon">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

const TABS = [
  {
    id: 'social', label: 'Social',
    icon: () => (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="tab-icon">
        <circle cx="15" cy="4" r="2.5" /><circle cx="5" cy="10" r="2.5" /><circle cx="15" cy="16" r="2.5" />
        <path d="M7.5 9l5-3.5M7.5 11l5 3.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'copywriting', label: 'Copywriting',
    icon: () => (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="tab-icon">
        <path d="M13.5 3.5l3 3L7 16H4v-3L13.5 3.5z" strokeLinejoin="round" /><path d="M11 6l3 3" />
      </svg>
    ),
  },
  {
    id: 'banner', label: 'Banner',
    icon: () => (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="tab-icon">
        <rect x="2" y="4" width="16" height="12" rx="2" /><path d="M2 8h16" />
        <circle cx="6" cy="6" r="0.8" fill="currentColor" /><circle cx="9" cy="6" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
];

const ASPECT_RATIOS = ['16:9', '1:1', '4:5', '9:16', '3:2', 'Custom'];
const RESOLUTIONS   = ['1K', '2K', '4K'];

const PLATFORM_SIZES = {
  twitter:   ['1200×675 — Landscape', '1080×1080 — Square', '1080×1350 — Portrait'],
  facebook:  ['1200×630 — Feed',      '1080×1080 — Square', '1080×1920 — Story'],
  whatsapp:  ['1080×1080 — Square',   '900×1600 — Story'],
  instagram: ['1080×1080 — Square',   '1080×1350 — Portrait', '1080×1920 — Story'],
  general:   ['1920×1080 — HD',       '1200×628 — Web',       '1080×1080 — Square'],
};

/* ─────────────────────────── small components ─────────────────────────── */

const EmptyCanvas = ({ message }) => (
  <div className="pd-canvas-empty">
    <svg viewBox="0 0 64 64" fill="none" width="64" height="64">
      <rect x="8" y="10" width="48" height="44" rx="5" fill="#e8edf8" stroke="#c7d2f0" strokeWidth="1.5" />
      <rect x="14" y="18" width="36" height="6" rx="2" fill="#c7d2f0" />
      <rect x="14" y="28" width="22" height="4" rx="2" fill="#dde3f4" />
      <rect x="14" y="36" width="28" height="4" rx="2" fill="#dde3f4" />
      <circle cx="48" cy="46" r="10" fill="#0033A0" />
      <path d="M44 46l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <h3 className="pd-canvas-title">Ready to create your campaign?</h3>
    <p className="pd-canvas-sub">{message}</p>
  </div>
);

/* Copy card — shown in right panel after "Generate Copy" */
const CopyCard = ({ index, text, contentType, tone, language, onCopy, copied }) => {
  const ct = CONTENT_TYPES.find(c => c.value === contentType) || CONTENT_TYPES[0];

  return (
    <div className="cw-card">
      <div className="cw-card-header">
        <div className="cw-card-badges">
          <span className="cw-badge cw-badge-type">{ct.icon} {ct.label}</span>
          <span className="cw-badge cw-badge-tone">
            {TONES.find(t => t.value === tone)?.icon} {TONES.find(t => t.value === tone)?.label}
          </span>
          {language === 'hindi' && <span className="cw-badge cw-badge-lang">हिंदी</span>}
        </div>
        <span className="cw-variant-num">Variant {index + 1}</span>
      </div>

      <div className="cw-card-body">
        {text ? (
          <p className="cw-variant-text">{text}</p>
        ) : (
          <p className="cw-pending-note">Generating…</p>
        )}
      </div>

      <div className="cw-card-footer">
        <span className="cw-char-limit">{text ? `${text.length} chars` : `Limit: ${ct.charLimit}`}</span>
        <div className="cw-card-actions">
          <button className="cw-action-btn cw-like-btn" title="Good">
            <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" width="15" height="15">
              <path d="M5 9l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="9" r="7.5" />
            </svg>
          </button>
          <button className="cw-action-btn cw-dislike-btn" title="Poor">
            <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" width="15" height="15">
              <path d="M6 9h6M9 6v6" strokeLinecap="round" />
              <circle cx="9" cy="9" r="7.5" />
            </svg>
          </button>
          <button
            className={`cw-action-btn cw-copy-btn ${copied ? 'copied' : ''}`}
            onClick={onCopy}
            disabled={!text}
            title="Copy to clipboard"
          >
            {copied ? (
              <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
                <path d="M3 9l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" width="14" height="14">
                <rect x="6" y="6" width="9" height="9" rx="1.5" />
                <path d="M12 6V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2" />
              </svg>
            )}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── main component ─────────────────────────── */

export default function ProjectDetail() {
  const navigate  = useNavigate();
  const { state } = useLocation();
  const project   = state?.project || { name: 'Project', colorIdx: 0 };

  /* tab state */
  const [activeTab,      setActiveTab]      = useState('social');
  const [activePlatform, setActivePlatform] = useState('twitter');

  /* social form */
  const [campaignType, setCampaignType] = useState('');
  const [socialPrompt, setSocialPrompt] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  /* copywriting form */
  const [cwCampaignType, setCwCampaignType] = useState('');
  const [cwContentType,  setCwContentType]  = useState('caption');
  const [cwTone,         setCwTone]         = useState('playful');
  const [cwLanguage,     setCwLanguage]     = useState('english');
  const [cwVariations,   setCwVariations]   = useState(3);
  const [cwPrompt,       setCwPrompt]       = useState('');
  const [cwGenerated,    setCwGenerated]    = useState(false);
  const [cwVariants,     setCwVariants]     = useState([]);
  const [cwGenerating,   setCwGenerating]   = useState(false);
  const [cwError,        setCwError]        = useState('');
  const [cwCopied,       setCwCopied]       = useState({});

  /* banner form */
  const [brief,       setBrief]       = useState('');
  const [refImages,   setRefImages]   = useState([]);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [resolution,  setResolution]  = useState('1K');
  const [customW,     setCustomW]     = useState('');
  const [customH,     setCustomH]     = useState('');
  const fileInputRef = useRef(null);

  /* derived */
  const socialReady  = campaignType && socialPrompt.trim().length > 10;
  const cwReady      = cwCampaignType && cwPrompt.trim().length > 10;
  const bannerReady  = brief.trim().length > 2;

  const handleFileChange = (e) => {
    const files   = Array.from(e.target.files).slice(0, 3 - refImages.length);
    const newImgs = files.map(f => ({ name: f.name, url: URL.createObjectURL(f) }));
    setRefImages(prev => [...prev, ...newImgs].slice(0, 3));
  };

  const handleGenerateCopy = async () => {
    if (!cwReady || cwGenerating) return;
    setCwGenerating(true);
    setCwError('');
    setCwGenerated(false);
    setCwVariants([]);
    try {
      const result = await api.generateCopy({
        project_id:    project.id,
        campaign_type: cwCampaignType,
        content_type:  cwContentType,
        tone:          cwTone,
        language:      cwLanguage,
        variations:    cwVariations,
        prompt:        cwPrompt,
      });
      setCwVariants(result.variants || []);
      setCwGenerated(true);
      setCwCopied({});
    } catch (err) {
      setCwError(err.message || 'Generation failed. Check server logs.');
    } finally {
      setCwGenerating(false);
    }
  };

  const handleCopyCopy = (index) => {
    const text = cwVariants[index];
    if (text) navigator.clipboard.writeText(text).catch(() => {});
    setCwCopied(prev => ({ ...prev, [index]: true }));
    setTimeout(() => setCwCopied(prev => ({ ...prev, [index]: false })), 2000);
  };

  const handleVariationStep = (delta) => {
    setCwVariations(v => Math.min(5, Math.max(1, v + delta)));
  };

  /* ─── render ─── */
  return (
    <AppShell activeNav="projects">
      <div className="pd-root">

        {/* Breadcrumb */}
        <div className="pd-breadcrumb">
          <button className="pd-back-btn" onClick={() => navigate('/dashboard')}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="pd-bc-link" onClick={() => navigate('/dashboard')}>Projects</span>
          <span className="pd-bc-sep">/</span>
          <span className="pd-bc-cur">{project.name}</span>
        </div>

        {/* Main tab bar */}
        <div className="pd-tab-bar-wrap">
          <div className="pd-tab-bar">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`pd-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Social platform sub-tabs */}
        {activeTab === 'social' && (
          <div className="pd-platform-bar">
            <div className="pd-platform-inner">
              {SOCIAL_PLATFORMS.map(plat => {
                const Icon   = plat.icon;
                const active = activePlatform === plat.id;
                return (
                  <button
                    key={plat.id}
                    className={`pd-platform-btn ${active ? 'active' : ''}`}
                    style={active ? { '--plat-color': plat.color } : {}}
                    onClick={() => setActivePlatform(plat.id)}
                  >
                    <span className="pd-plat-icon-wrap" style={active ? { color: plat.color } : {}}>
                      <Icon />
                    </span>
                    {plat.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Two-column body */}
        <div className="pd-body">

          {/* ══════════ LEFT SIDEBAR ══════════ */}
          <aside className="pd-sidebar">
            <div className="pd-sidebar-inner">

              {/* ── BANNER sidebar ── */}
              {activeTab === 'banner' && (
                <>
                  <h2 className="pd-sidebar-title">Website creative</h2>
                  <div className="pd-field">
                    <label className="pd-label">Creative brief <span className="pd-required">*</span></label>
                    <textarea className="pd-textarea" value={brief} onChange={e => setBrief(e.target.value)}
                      placeholder="Describe the creative you want to generate..." rows={5} maxLength={500} />
                  </div>
                  <div className="pd-field">
                    <label className="pd-label">Reference images<span className="pd-optional"> (optional, max 3)</span></label>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileChange} />
                    {refImages.length < 3 && (
                      <button type="button" className="pd-upload-btn" onClick={() => fileInputRef.current?.click()}>
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
                          <path d="M10 3v10M5 8l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M3 17h14" strokeLinecap="round" />
                        </svg>
                        Add images
                      </button>
                    )}
                    {refImages.length > 0 && (
                      <div className="pd-ref-images">
                        {refImages.map((img, i) => (
                          <div key={i} className="pd-ref-thumb">
                            <img src={img.url} alt={img.name} />
                            <button className="pd-ref-remove" onClick={() => setRefImages(p => p.filter((_, j) => j !== i))}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="pd-row-two">
                    <div className="pd-field">
                      <label className="pd-label">Aspect ratio</label>
                      <div className="pd-select-wrap">
                        <select className="pd-select" value={aspectRatio} onChange={e => setAspectRatio(e.target.value)}>
                          {ASPECT_RATIOS.map(r => <option key={r}>{r}</option>)}
                        </select>
                        <svg className="pd-select-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    </div>
                    <div className="pd-field">
                      <label className="pd-label">Resolution hint</label>
                      <div className="pd-select-wrap">
                        <select className="pd-select" value={resolution} onChange={e => setResolution(e.target.value)}>
                          {RESOLUTIONS.map(r => <option key={r}>{r}</option>)}
                        </select>
                        <svg className="pd-select-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    </div>
                  </div>
                  <div className="pd-row-two">
                    <div className="pd-field">
                      <label className="pd-label pd-label-sm">Custom width<span className="pd-optional"> (px)</span></label>
                      <input className="pd-input" type="number" placeholder="e.g. 1920" value={customW} onChange={e => setCustomW(e.target.value)} min={1} />
                    </div>
                    <div className="pd-field">
                      <label className="pd-label pd-label-sm">Custom height<span className="pd-optional"> (px)</span></label>
                      <input className="pd-input" type="number" placeholder="e.g. 1080" value={customH} onChange={e => setCustomH(e.target.value)} min={1} />
                    </div>
                  </div>
                  <button className={`pd-generate-btn ${bannerReady ? 'ready' : 'disabled'}`} disabled={!bannerReady}>
                    Generate website image
                  </button>
                </>
              )}

              {/* ── COPYWRITING sidebar ── */}
              {activeTab === 'copywriting' && (
                <>
                  <h2 className="pd-sidebar-title">Copy Generator</h2>

                  {/* Campaign type */}
                  <div className="pd-field">
                    <label className="pd-label">Campaign Type <span className="pd-required">*</span></label>
                    <div className="pd-select-wrap">
                      <select className="pd-select" value={cwCampaignType} onChange={e => { setCwCampaignType(e.target.value); setCwGenerated(false); }}>
                        <option value="" disabled>Select campaign type...</option>
                        {CAMPAIGN_TYPES.map(ct => <option key={ct.value} value={ct.value}>{ct.emoji}  {ct.label}</option>)}
                      </select>
                      <svg className="pd-select-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  </div>

                  {/* Content type */}
                  <div className="pd-field">
                    <label className="pd-label">Content Type <span className="pd-required">*</span></label>
                    <div className="pd-select-wrap">
                      <select className="pd-select" value={cwContentType} onChange={e => { setCwContentType(e.target.value); setCwGenerated(false); }}>
                        {CONTENT_TYPES.map(ct => <option key={ct.value} value={ct.value}>{ct.icon}  {ct.label}</option>)}
                      </select>
                      <svg className="pd-select-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <span className="pd-char-limit-hint">
                      Character limit: <strong>{CONTENT_TYPES.find(c => c.value === cwContentType)?.charLimit}</strong>
                    </span>
                  </div>

                  {/* Tone pills */}
                  <div className="pd-field">
                    <label className="pd-label">Tone</label>
                    <div className="cw-pill-group">
                      {TONES.map(t => (
                        <button
                          key={t.value}
                          type="button"
                          className={`cw-pill ${cwTone === t.value ? 'active' : ''}`}
                          onClick={() => { setCwTone(t.value); setCwGenerated(false); }}
                        >
                          {t.icon} {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language toggle */}
                  <div className="pd-field">
                    <label className="pd-label">Language</label>
                    <div className="cw-lang-toggle">
                      {LANGUAGES.map(l => (
                        <button
                          key={l.value}
                          type="button"
                          className={`cw-lang-btn ${cwLanguage === l.value ? 'active' : ''}`}
                          onClick={() => { setCwLanguage(l.value); setCwGenerated(false); }}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Number of variations */}
                  <div className="pd-field">
                    <label className="pd-label">Variations</label>
                    <div className="cw-stepper">
                      <button className="cw-step-btn" onClick={() => handleVariationStep(-1)} disabled={cwVariations <= 1}>−</button>
                      <span className="cw-step-val">{cwVariations}</span>
                      <button className="cw-step-btn" onClick={() => handleVariationStep(1)} disabled={cwVariations >= 5}>+</button>
                    </div>
                  </div>

                  {/* Campaign brief */}
                  <div className="pd-field pd-field-grow">
                    <label className="pd-label">Campaign brief <span className="pd-required">*</span></label>
                    <textarea
                      className="pd-textarea"
                      value={cwPrompt}
                      onChange={e => { setCwPrompt(e.target.value); setCwGenerated(false); }}
                      placeholder="e.g. IndiGo's Diwali sale — 30% off on domestic routes. Target: families planning holiday travel. Tone should feel festive and urgent. Key message: Book before the offer ends."
                      rows={6}
                      maxLength={500}
                    />
                    <span className="pd-char-count">{cwPrompt.length} / 500</span>
                  </div>

                  <button
                    className={`pd-generate-btn ${cwReady && !cwGenerating ? 'ready' : 'disabled'}`}
                    disabled={!cwReady || cwGenerating}
                    onClick={handleGenerateCopy}
                  >
                    {cwGenerating ? (
                      <>
                        <span className="pd-gen-spinner" />
                        Generating…
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="pd-gen-icon">
                          <path d="M13.5 3.5l3 3L7 16H4v-3L13.5 3.5z" strokeLinejoin="round" /><path d="M11 6l3 3" />
                        </svg>
                        Generate Copy
                      </>
                    )}
                  </button>

                  {cwError && (
                    <div className="pd-gen-error">{cwError}</div>
                  )}
                  {!cwReady && !cwError && (
                    <p className="pd-hint">Select campaign type and describe your brief to generate copy.</p>
                  )}
                </>
              )}

              {/* ── SOCIAL sidebar ── */}
              {activeTab === 'social' && (
                <>
                  <h2 className="pd-sidebar-title">Campaign Details</h2>
                  <div className="pd-field">
                    <label className="pd-label">Campaign Type <span className="pd-required">*</span></label>
                    <div className="pd-select-wrap">
                      <select className="pd-select" value={campaignType} onChange={e => setCampaignType(e.target.value)}>
                        <option value="" disabled>Select campaign type...</option>
                        {CAMPAIGN_TYPES.map(ct => <option key={ct.value} value={ct.value}>{ct.emoji}  {ct.label}</option>)}
                      </select>
                      <svg className="pd-select-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  </div>
                  <div className="pd-field pd-field-grow">
                    <label className="pd-label">Describe your campaign <span className="pd-required">*</span></label>
                    <textarea
                      className="pd-textarea"
                      value={socialPrompt}
                      onChange={e => setSocialPrompt(e.target.value)}
                      placeholder="e.g. I want to launch a new summer sale for IndiGo's routes to Goa and Maldives. The goal is to drive bookings among young travellers. Key message: Fly more, pay less — flat 30% off on select routes this weekend."
                      rows={9}
                      maxLength={500}
                    />
                    <span className="pd-char-count">{socialPrompt.length} / 500</span>
                  </div>
                  <div className="pd-field">
                    <label className="pd-label">Output Size</label>
                    <div className="pd-select-wrap">
                      <select className="pd-select" value={selectedSize} onChange={e => setSelectedSize(e.target.value)}>
                        <option value="">Auto (recommended)</option>
                        {(PLATFORM_SIZES[activePlatform] || []).map(s => <option key={s}>{s}</option>)}
                      </select>
                      <svg className="pd-select-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  </div>
                  <button className={`pd-generate-btn ${socialReady ? 'ready' : 'disabled'}`} disabled={!socialReady}>
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="pd-gen-icon">
                      <path d="M10 3v2M10 15v2M3 10H1M19 10h-2M5.05 5.05 3.636 3.636M16.364 16.364l-1.414-1.414M5.05 14.95l-1.414 1.414M16.364 3.636l-1.414 1.414" strokeLinecap="round" />
                      <circle cx="10" cy="10" r="3.5" />
                    </svg>
                    Generate Creative
                  </button>
                  {!socialReady && <p className="pd-hint">Select a campaign type and describe your campaign to generate.</p>}
                </>
              )}
            </div>
          </aside>

          {/* ══════════ RIGHT CANVAS ══════════ */}
          <section className="pd-canvas">

            {/* ── Banner canvas ── */}
            {activeTab === 'banner' && (
              <div className="pd-result-panel">
                <div className="pd-result-header">
                  <span className="pd-result-label">Result</span>
                  <div className="pd-result-actions">
                    <button className="pd-result-btn">
                      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" width="15" height="15">
                        <circle cx="9" cy="9" r="7" /><path d="M9 6v4l2.5 2.5" strokeLinecap="round" />
                      </svg>
                      History
                    </button>
                    <button className="pd-result-btn">
                      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" width="15" height="15">
                        <path d="M3 9a6 6 0 1 1 12 0" strokeLinecap="round" />
                        <path d="M9 3V1M6 4L4.5 2.5M12 4l1.5-1.5" strokeLinecap="round" />
                        <path d="M3 13h12M5 16h8" strokeLinecap="round" />
                      </svg>
                      Refine
                    </button>
                    <button className="pd-result-btn pd-result-icon-btn" aria-label="Download">
                      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" width="16" height="16">
                        <path d="M9 3v9M5 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3 15h12" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="pd-result-area">
                  {!bannerReady ? (
                    <EmptyCanvas message="Fill in the creative brief on the left to generate your website banner." />
                  ) : (
                    <div className="pd-banner-placeholder">
                      <div className="pd-banner-img-box">
                        <svg viewBox="0 0 120 68" fill="none" stroke="#c7d2f0" strokeWidth="1.2" width="120" height="68">
                          <rect x="1" y="1" width="118" height="66" rx="5" />
                          <circle cx="30" cy="28" r="10" />
                          <path d="M1 50l25-20 18 18 14-14 40 32" />
                        </svg>
                        <p>Generated banner will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Copywriting canvas ── */}
            {activeTab === 'copywriting' && (
              !cwGenerated ? (
                <EmptyCanvas message="Fill in your campaign brief on the left and click Generate Copy to create tailored copy variants." />
              ) : (
                <div className="cw-result-panel">
                  {/* Result header */}
                  <div className="cw-result-header">
                    <div className="cw-result-meta">
                      <span className="cw-result-title">Results</span>
                      <span className="cw-result-count">{cwVariations} variant{cwVariations > 1 ? 's' : ''}</span>
                    </div>
                    <div className="cw-result-actions">
                      <button className="pd-result-btn" onClick={() => setCwGenerated(false)}>
                        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" width="15" height="15">
                          <path d="M3 9a6 6 0 1 1 12 0" strokeLinecap="round" />
                          <path d="M9 3V1M6 4L4.5 2.5M12 4l1.5-1.5" strokeLinecap="round" />
                          <path d="M3 13h12M5 16h8" strokeLinecap="round" />
                        </svg>
                        Regenerate
                      </button>
                      <button className="pd-result-btn">
                        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" width="15" height="15">
                          <path d="M9 3v9M5 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M3 15h12" strokeLinecap="round" />
                        </svg>
                        Export all
                      </button>
                    </div>
                  </div>

                  {/* Summary chips */}
                  <div className="cw-summary-row">
                    <span className="cw-summary-chip">
                      {CAMPAIGN_TYPES.find(c => c.value === cwCampaignType)?.emoji}{' '}
                      {CAMPAIGN_TYPES.find(c => c.value === cwCampaignType)?.label}
                    </span>
                    <span className="cw-summary-chip">
                      {CONTENT_TYPES.find(c => c.value === cwContentType)?.icon}{' '}
                      {CONTENT_TYPES.find(c => c.value === cwContentType)?.label}
                    </span>
                    <span className="cw-summary-chip">
                      {TONES.find(t => t.value === cwTone)?.icon}{' '}
                      {TONES.find(t => t.value === cwTone)?.label}
                    </span>
                    <span className="cw-summary-chip">
                      {cwLanguage === 'hindi' ? '🇮🇳 Hindi' : '🇬🇧 English'}
                    </span>
                  </div>

                  {/* Copy cards grid */}
                  <div className={`cw-cards-grid ${cwVariations === 1 ? 'single' : cwVariations === 2 ? 'two' : 'three'}`}>
                    {Array.from({ length: cwVariations }).map((_, i) => (
                      <CopyCard
                        key={i}
                        index={i}
                        text={cwVariants[i] || ''}
                        contentType={cwContentType}
                        tone={cwTone}
                        language={cwLanguage}
                        onCopy={() => handleCopyCopy(i)}
                        copied={!!cwCopied[i]}
                      />
                    ))}
                  </div>
                </div>
              )
            )}

            {/* ── Social canvas ── */}
            {activeTab === 'social' && (
              !socialReady ? (
                <EmptyCanvas message={`Fill out the campaign details on the left to generate tailored content for ${SOCIAL_PLATFORMS.find(p => p.id === activePlatform)?.label}.`} />
              ) : (
                <div className="pd-canvas-ready">
                  <div className="pd-canvas-header">
                    <div className="pd-canvas-meta">
                      <span className="pd-canvas-tag">{CAMPAIGN_TYPES.find(c => c.value === campaignType)?.emoji} {CAMPAIGN_TYPES.find(c => c.value === campaignType)?.label}</span>
                      <span className="pd-canvas-tag tag-plat">{SOCIAL_PLATFORMS.find(p => p.id === activePlatform)?.label}</span>
                    </div>
                    <span className="pd-canvas-status">Waiting to generate</span>
                  </div>
                  <div className="pd-mockup-area">
                    <div className="pd-social-mockup">
                      <div className="pd-mockup-header-row">
                        <div className="pd-mockup-avatar" />
                        <div><div className="pd-mockup-name-bar" /><div className="pd-mockup-date-bar" /></div>
                      </div>
                      <div className="pd-mockup-img-placeholder">
                        <svg viewBox="0 0 60 48" fill="none" stroke="#c7d2f0" strokeWidth="1.5" width="60" height="48">
                          <rect x="2" y="2" width="56" height="44" rx="4" /><circle cx="20" cy="18" r="6" />
                          <path d="M2 34l14-12 10 10 8-8 24 18" />
                        </svg>
                        <p>Creative will appear here after generation</p>
                      </div>
                      <div className="pd-mockup-caption-bar" />
                      <div className="pd-mockup-caption-bar short" />
                    </div>
                  </div>
                </div>
              )
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
