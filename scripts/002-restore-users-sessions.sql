-- ChainSnip Database Schema v2 - Restore users and sessions tables
-- Since Stack Auth SDK doesn't work with React 19, we use custom auth

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise', 'lifetime')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table for auth
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update usage_stats to reference users table
ALTER TABLE usage_stats DROP CONSTRAINT IF EXISTS usage_stats_pkey;
ALTER TABLE usage_stats ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE usage_stats ADD PRIMARY KEY (user_id);
ALTER TABLE usage_stats ADD CONSTRAINT usage_stats_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Update archives to reference users table
ALTER TABLE archives ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE archives DROP CONSTRAINT IF EXISTS archives_user_id_fkey;
ALTER TABLE archives ADD CONSTRAINT archives_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Update custom_explorers to reference users table
ALTER TABLE custom_explorers ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE custom_explorers DROP CONSTRAINT IF EXISTS custom_explorers_user_id_fkey;
ALTER TABLE custom_explorers ADD CONSTRAINT custom_explorers_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Indexes for sessions
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
