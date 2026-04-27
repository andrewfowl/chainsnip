-- Migration 006: Clean up duplicate/unused tables and consolidate to Better Auth
-- Current state: 
--   - public.user (Better Auth - TEXT ids)
--   - public.users (Legacy - UUID ids)
--   - neon_auth.user (Neon Auth - UUID ids, unused)
--   - App tables (archives, custom_explorers, usage_stats) reference public.users with UUID

-- Strategy: Keep public.users as primary user table (has real user data)
-- Drop neon_auth schema entirely (unused)
-- Drop public.user (Better Auth - no data)
-- Update app tables to reference the consolidated user table

-- Step 1: Drop foreign key constraints from app tables
ALTER TABLE public.archives
DROP CONSTRAINT IF EXISTS archives_user_id_fkey;

ALTER TABLE public.custom_explorers
DROP CONSTRAINT IF EXISTS custom_explorers_user_id_fkey;

ALTER TABLE public.usage_stats
DROP CONSTRAINT IF EXISTS usage_stats_user_id_fkey;

-- Step 2: Drop the entire neon_auth schema (unused, all Neon Auth tables)
DROP SCHEMA IF EXISTS neon_auth CASCADE;

-- Step 3: Drop public.user (Better Auth table, no data in it - we use public.users)
DROP TABLE IF EXISTS public."user" CASCADE;

-- Step 4: Drop public.verification (Better Auth - not needed)
DROP TABLE IF EXISTS public.verification CASCADE;

-- Step 5: Drop public.account (Better Auth - not needed)
DROP TABLE IF EXISTS public.account CASCADE;

-- Step 6: Drop public.session (Better Auth session table - not needed)
DROP TABLE IF EXISTS public.session CASCADE;

-- Step 7: Drop public.sessions (duplicate, keep app using public.users)
DROP TABLE IF EXISTS public.sessions CASCADE;

-- Step 8: Ensure app tables have proper foreign keys to public.users
-- First ensure user_id columns are UUID type
ALTER TABLE public.archives
ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

ALTER TABLE public.custom_explorers
ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

ALTER TABLE public.usage_stats
ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- Step 9: Add foreign key constraints back
ALTER TABLE public.archives
ADD CONSTRAINT archives_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.custom_explorers
ADD CONSTRAINT custom_explorers_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.usage_stats
ADD CONSTRAINT usage_stats_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Final schema (consolidated):
-- public.users - Primary user table (UUID-based)
-- public.sessions - Session management for users
-- public.archives - User balance snapshots
-- public.custom_explorers - User custom explorers
-- public.usage_stats - User usage statistics
-- public.auth_audit_log - Audit logging
