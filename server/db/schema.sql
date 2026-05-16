-- Run as superuser: psql -U postgres -f schema.sql

CREATE DATABASE indigo;
\c indigo;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(255) NOT NULL,
  department    VARCHAR(100) DEFAULT 'Digital',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Projects ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  color_idx   INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Generations (text + images) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS generations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tab_type      VARCHAR(50)  NOT NULL,   -- social | copywriting | banner
  campaign_type VARCHAR(100),
  content_type  VARCHAR(100),            -- caption | headline | sms | ...
  platform      VARCHAR(100),            -- twitter | facebook | ...
  tone          VARCHAR(100),
  language      VARCHAR(50)  DEFAULT 'english',
  prompt        TEXT,
  output        JSONB        DEFAULT '{}',  -- { variants:[], imageUrl:'' }
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Indexes ────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_projects_user   ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_gen_project     ON generations(project_id);
CREATE INDEX IF NOT EXISTS idx_gen_user        ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_gen_tab         ON generations(tab_type);
CREATE INDEX IF NOT EXISTS idx_gen_created     ON generations(created_at DESC);
