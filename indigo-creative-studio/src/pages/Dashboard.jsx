import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import './Dashboard.css';

const CARD_COLORS = ['#e8650a', '#0033A0', '#009b6e', '#7c3aed', '#dc2626', '#0891b2'];

const CalendarIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" className="cal-icon">
    <rect x="1" y="2" width="14" height="13" rx="2" />
    <path d="M1 6h14M5 1v2M11 1v2" />
  </svg>
);

const FolderIcon = ({ color }) => (
  <svg viewBox="0 0 32 28" fill="none" className="project-folder-icon">
    <path d="M2 6C2 4.343 3.343 3 5 3h8l3 4h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6z"
      fill={color} opacity="0.15" />
    <path d="M2 6C2 4.343 3.343 3 5 3h8l3 4h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6z"
      stroke={color} strokeWidth="1.8" fill="none" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="#9ca3af" strokeWidth="1.8" className="search-icon-svg">
    <circle cx="8.5" cy="8.5" r="5.5" /><path d="M13 13l4 4" strokeLinecap="round" />
  </svg>
);

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ── Explore gallery ───────────────────────────────────────────── */
const TAB_ICONS = {
  copywriting: '✍️', social: '📱', banner: '🖼️',
};
const CONTENT_LABELS = {
  caption: 'Caption', headline: 'Headline', sms: 'SMS',
  push: 'Push', email: 'Email Subject', tagline: 'Tagline', ooh: 'OOH',
};
const PLAT_LABELS = {
  twitter: 'X (Twitter)', facebook: 'Facebook',
  whatsapp: 'WhatsApp', instagram: 'Instagram', general: 'General',
};

function ExploreGallery() {
  const [items,  setItems]  = useState([]);
  const [stats,  setStats]  = useState({});
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [copied,  setCopied]  = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getExplore(filter || undefined);
      setItems(data.items);
      setStats(data.stats);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(p => ({ ...p, [id]: true }));
    setTimeout(() => setCopied(p => ({ ...p, [id]: false })), 2000);
  };

  return (
    <div className="explore-page">
      {/* Stats bar */}
      <div className="explore-stats">
        <div className="explore-stat-card">
          <span className="explore-stat-val">{stats.total || 0}</span>
          <span className="explore-stat-label">Total Creatives</span>
        </div>
        <div className="explore-stat-card">
          <span className="explore-stat-val">{stats.copy_count || 0}</span>
          <span className="explore-stat-label">Copy Variants</span>
        </div>
        <div className="explore-stat-card">
          <span className="explore-stat-val">{stats.social_count || 0}</span>
          <span className="explore-stat-label">Social Posts</span>
        </div>
        <div className="explore-stat-card">
          <span className="explore-stat-val">{stats.banner_count || 0}</span>
          <span className="explore-stat-label">Banners</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="explore-filters">
        {[
          { value: '',             label: 'All' },
          { value: 'copywriting',  label: '✍️ Copy' },
          { value: 'social',       label: '📱 Social' },
          { value: 'banner',       label: '🖼️ Banner' },
        ].map(f => (
          <button
            key={f.value}
            className={`explore-filter-btn ${filter === f.value ? 'active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
        <button className="explore-refresh-btn" onClick={load} title="Refresh">
          <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
            <path d="M3 9a6 6 0 1 1 12 0" strokeLinecap="round" />
            <path d="M15 3v6h-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="explore-loading">
          <div className="explore-spinner" />
          <span>Loading creatives…</span>
        </div>
      ) : error ? (
        <div className="explore-error">
          <p>⚠️ {error}</p>
          <button className="explore-retry-btn" onClick={load}>Retry</button>
        </div>
      ) : items.length === 0 ? (
        <div className="explore-empty">
          <svg viewBox="0 0 64 64" fill="none" width="56" height="56">
            <rect x="8" y="10" width="48" height="44" rx="5" fill="#e8edf8" stroke="#c7d2f0" strokeWidth="1.5" />
            <rect x="14" y="20" width="36" height="5" rx="2" fill="#c7d2f0" />
            <rect x="14" y="30" width="22" height="4" rx="2" fill="#dde3f4" />
            <rect x="14" y="38" width="28" height="4" rx="2" fill="#dde3f4" />
          </svg>
          <h3>No creatives yet</h3>
          <p>Go to a project and generate some copy or social content — it will appear here.</p>
        </div>
      ) : (
        <div className="explore-grid">
          {items.map(item => {
            const variants = item.output?.variants || [];
            const color    = CARD_COLORS[item.color_idx % CARD_COLORS.length];
            return (
              <div key={item.id} className="explore-card">
                <div className="explore-card-header" style={{ borderLeftColor: color }}>
                  <div className="explore-card-badges">
                    <span className="explore-badge explore-badge-type">
                      {TAB_ICONS[item.tab_type]} {item.tab_type}
                    </span>
                    {item.content_type && (
                      <span className="explore-badge">
                        {CONTENT_LABELS[item.content_type] || item.content_type}
                      </span>
                    )}
                    {item.platform && (
                      <span className="explore-badge">
                        {PLAT_LABELS[item.platform] || item.platform}
                      </span>
                    )}
                  </div>
                  <span className="explore-card-project">{item.project_name}</span>
                </div>

                {item.campaign_type && (
                  <div className="explore-campaign-chip">{item.campaign_type.replace('-', ' ')}</div>
                )}

                {/* Prompt */}
                <div className="explore-prompt">
                  <span className="explore-prompt-label">Brief</span>
                  <p className="explore-prompt-text">{item.prompt}</p>
                </div>

                {/* Variants */}
                {variants.length > 0 ? (
                  <div className="explore-variants">
                    {variants.map((v, i) => (
                      <div key={i} className="explore-variant">
                        <p className="explore-variant-text">{v}</p>
                        <button
                          className={`explore-copy-btn ${copied[`${item.id}-${i}`] ? 'copied' : ''}`}
                          onClick={() => handleCopy(v, `${item.id}-${i}`)}
                        >
                          {copied[`${item.id}-${i}`] ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : item.tab_type === 'banner' ? (
                  <div className="explore-banner-placeholder">
                    <svg viewBox="0 0 48 30" fill="none" stroke="#c7d2f0" strokeWidth="1.2" width="48" height="30">
                      <rect x="1" y="1" width="46" height="28" rx="3" />
                      <circle cx="12" cy="12" r="5" /><path d="M1 22l10-8 8 8 6-6 14 12" />
                    </svg>
                    <span>Image pending generation</span>
                  </div>
                ) : null}

                <div className="explore-card-footer">
                  <span className="explore-date">{formatDate(item.created_at)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Main Dashboard ────────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [projects,    setProjects]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab,   setActiveTab]   = useState('projects');
  const [showModal,   setShowModal]   = useState(false);
  const [form,        setForm]        = useState({ name: '', description: '' });
  const [formErrors,  setFormErrors]  = useState({});
  const [saving,      setSaving]      = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      const rows = await api.getProjects();
      setProjects(rows);
    } catch (e) {
      console.error('Failed to load projects:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCreatives = projects.reduce((s, p) => s + (p.generation_count || 0), 0);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setFormErrors({ name: 'Project name is required' }); return; }
    setSaving(true);
    try {
      const colorIdx = projects.length % CARD_COLORS.length;
      const created  = await api.createProject(form.name.trim(), form.description.trim(), colorIdx);
      setProjects(prev => [created, ...prev]);
      setForm({ name: '', description: '' });
      setShowModal(false);
    } catch (e) {
      setFormErrors({ name: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm({ name: '', description: '' });
    setFormErrors({});
  };

  const openProject = (project) => {
    navigate(`/project/${project.id}`, { state: { project } });
  };

  const handleSignOut = () => { logout(); navigate('/login'); };

  /* User display */
  const userInitials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <AppShell activeNav={activeTab === 'explore' ? 'explore' : 'projects'}
      onNavChange={setActiveTab} user={user} onSignOut={handleSignOut}>
      <main className="db-main">
        {activeTab === 'projects' ? (
          <div className="db-projects-page">
            <div className="db-page-header">
              <div>
                <h1 className="db-page-title">Projects</h1>
                <div className="db-stats-row">
                  <span className="db-stat"><strong>{projects.length}</strong> Your Projects</span>
                  <span className="db-stat-divider">|</span>
                  <span className="db-stat"><strong>{totalCreatives}</strong> Creatives by You</span>
                </div>
              </div>
              <button className="db-new-project-btn" onClick={() => setShowModal(true)}>
                + New Project
              </button>
            </div>

            <div className="db-search-wrap">
              <SearchIcon />
              <input type="text" className="db-search-input" placeholder="Search projects..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>

            {loading ? (
              <div className="db-loading">
                <div className="db-spinner" /><span>Loading projects…</span>
              </div>
            ) : (
              <div className="db-projects-grid">
                {filtered.map(project => (
                  <div key={project.id} className="db-project-card"
                    onClick={() => openProject(project)} role="button" tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && openProject(project)}>
                    <div className="db-card-top">
                      <FolderIcon color={CARD_COLORS[project.color_idx % CARD_COLORS.length]} />
                    </div>
                    <div className="db-card-body">
                      <h3 className="db-card-title">{project.name}</h3>
                      <p className="db-card-desc">{project.description || 'No description provided.'}</p>
                    </div>
                    <div className="db-card-footer">
                      <CalendarIcon />
                      <span className="db-card-date">{formatDate(project.created_at)}</span>
                      {project.generation_count > 0 && (
                        <span className="db-card-gen-count">{project.generation_count} creatives</span>
                      )}
                    </div>
                  </div>
                ))}
                <button className="db-project-card db-new-card" onClick={() => setShowModal(true)}>
                  <div className="db-new-card-inner">
                    <span className="db-new-card-plus">+</span>
                    <span className="db-new-card-label">New Project</span>
                  </div>
                </button>
              </div>
            )}

            {filtered.length === 0 && searchQuery && !loading && (
              <div className="db-empty-state">No projects match "{searchQuery}"</div>
            )}
          </div>
        ) : (
          <ExploreGallery />
        )}
      </main>

      {showModal && (
        <div className="db-modal-overlay" onClick={handleCloseModal}>
          <div className="db-modal" onClick={e => e.stopPropagation()}>
            <div className="db-modal-header">
              <h2 className="db-modal-title">New Project</h2>
              <button className="db-modal-close" onClick={handleCloseModal}>
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <form className="db-modal-form" onSubmit={handleCreateProject} noValidate>
              <div className={`db-form-group ${formErrors.name ? 'has-error' : ''}`}>
                <label htmlFor="proj-name">Project Name <span className="required">*</span></label>
                <input id="proj-name" name="name" type="text"
                  placeholder="e.g. Summer Campaign 2026"
                  value={form.name} onChange={handleFormChange} autoFocus />
                {formErrors.name && <span className="db-error-msg">{formErrors.name}</span>}
              </div>
              <div className="db-form-group">
                <label htmlFor="proj-desc">Description <span className="optional">(optional)</span></label>
                <textarea id="proj-desc" name="description"
                  placeholder="Brief description of this project..."
                  value={form.description} onChange={handleFormChange} rows={3} />
              </div>
              <div className="db-modal-actions">
                <button type="button" className="db-modal-cancel" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="db-modal-create" disabled={saving}>
                  {saving ? 'Creating…' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
