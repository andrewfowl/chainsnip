-- ChainSnip Database Schema
-- Usage stats table tracks user data and plans (linked to neon_auth.users_sync)
CREATE TABLE IF NOT EXISTS usage_stats (
  user_id TEXT PRIMARY KEY,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise', 'lifetime')),
  total_captures_ever INTEGER NOT NULL DEFAULT 0,
  last_reset_date TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Archives table (user_id references Stack Auth users via neon_auth.users_sync)
CREATE TABLE IF NOT EXISTS archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  url TEXT NOT NULL,
  wallet_address TEXT,
  chain TEXT,
  explorer TEXT,
  title TEXT,
  content TEXT,
  client_name TEXT,
  thumbnail TEXT,
  screenshot_url TEXT,
  html_url TEXT,
  proof_hash TEXT,
  capture_status TEXT NOT NULL DEFAULT 'pending' CHECK (capture_status IN ('pending', 'capturing', 'completed', 'failed')),
  capture_error TEXT,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  snapshot_date TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  schedule_interval TEXT CHECK (schedule_interval IS NULL OR schedule_interval IN ('monthly')),
  next_scheduled_save TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'failed', 'pending')),
  FOREIGN KEY (user_id) REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE
);

-- Custom explorers table (user_id references Stack Auth users)
CREATE TABLE IF NOT EXISTS custom_explorers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_archives_user_id ON archives(user_id);
CREATE INDEX IF NOT EXISTS idx_archives_archived_at ON archives(archived_at DESC);
CREATE INDEX IF NOT EXISTS idx_archives_chain ON archives(chain);
CREATE INDEX IF NOT EXISTS idx_archives_client_name ON archives(client_name);
CREATE INDEX IF NOT EXISTS idx_custom_explorers_user_id ON custom_explorers(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_id ON usage_stats(user_id);
