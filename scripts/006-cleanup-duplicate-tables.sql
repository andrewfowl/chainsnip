-- Migration 006: Clean up duplicate/unused tables
-- This migration removes orphaned tables from failed auth transitions

-- 1. Drop legacy custom auth tables (created by 002, should have been dropped by 003)
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. Drop the entire neon_auth schema (we're using Better Auth, not Neon Auth)
-- First drop all tables in neon_auth schema
DROP TABLE IF EXISTS neon_auth.invitation CASCADE;
DROP TABLE IF EXISTS neon_auth.member CASCADE;
DROP TABLE IF EXISTS neon_auth.organization CASCADE;
DROP TABLE IF EXISTS neon_auth.verification CASCADE;
DROP TABLE IF EXISTS neon_auth.account CASCADE;
DROP TABLE IF EXISTS neon_auth.session CASCADE;
DROP TABLE IF EXISTS neon_auth.jwks CASCADE;
DROP TABLE IF EXISTS neon_auth.project_config CASCADE;
DROP TABLE IF EXISTS neon_auth."user" CASCADE;

-- 3. Drop users_sync if it exists (referenced in old scripts but doesn't exist)
DROP TABLE IF EXISTS neon_auth.users_sync CASCADE;

-- 4. Clean up any orphaned foreign key references
-- Update archives to reference Better Auth user table
ALTER TABLE public.archives
DROP CONSTRAINT IF EXISTS archives_user_id_fkey;

-- Update custom_explorers to reference Better Auth user table  
ALTER TABLE public.custom_explorers
DROP CONSTRAINT IF EXISTS custom_explorers_user_id_fkey;

-- Update usage_stats to reference Better Auth user table
ALTER TABLE public.usage_stats
DROP CONSTRAINT IF EXISTS usage_stats_user_id_fkey;

-- 5. Ensure user_id columns are TEXT type (Better Auth uses TEXT IDs)
ALTER TABLE public.archives 
ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

ALTER TABLE public.custom_explorers 
ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

ALTER TABLE public.usage_stats 
ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- 6. Add proper foreign keys to Better Auth user table
ALTER TABLE public.archives
ADD CONSTRAINT archives_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;

ALTER TABLE public.custom_explorers
ADD CONSTRAINT custom_explorers_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;

ALTER TABLE public.usage_stats
ADD CONSTRAINT usage_stats_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;

-- 7. Summary of remaining tables after cleanup:
-- public.user (Better Auth - primary user storage)
-- public.session (Better Auth - session management)
-- public.account (Better Auth - OAuth accounts)
-- public.verification (Better Auth - email verification)
-- public.auth_audit_log (audit logging)
-- public.archives (app data)
-- public.custom_explorers (app data)
-- public.usage_stats (app data with plan info)
