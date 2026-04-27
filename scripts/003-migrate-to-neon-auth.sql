-- Drop old custom auth tables (no longer needed with Neon Auth)
-- The neon_auth schema handles user, session, and account management
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Update archives to reference neon_auth.user
ALTER TABLE public.archives
DROP CONSTRAINT IF EXISTS archives_user_id_fkey;

ALTER TABLE public.archives
ADD CONSTRAINT archives_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES neon_auth."user"(id) ON DELETE CASCADE;

-- Update custom_explorers to reference neon_auth.user
ALTER TABLE public.custom_explorers
DROP CONSTRAINT IF EXISTS custom_explorers_user_id_fkey;

ALTER TABLE public.custom_explorers
ADD CONSTRAINT custom_explorers_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES neon_auth."user"(id) ON DELETE CASCADE;

-- Update usage_stats to reference neon_auth.user
ALTER TABLE public.usage_stats
DROP CONSTRAINT IF EXISTS usage_stats_user_id_fkey;

-- Change user_id to UUID if needed
ALTER TABLE public.usage_stats
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.usage_stats
ADD CONSTRAINT usage_stats_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES neon_auth."user"(id) ON DELETE CASCADE;

-- Add plan tracking to usage_stats if not exists
ALTER TABLE public.usage_stats
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise', 'lifetime'));
