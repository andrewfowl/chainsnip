-- Create verification table for email verification
CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON verification(identifier);
CREATE INDEX IF NOT EXISTS idx_verification_expiresAt ON verification(expiresAt);

-- Add email_verified column to user table if it doesn't exist
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS emailVerified BOOLEAN NOT NULL DEFAULT FALSE;

-- Add audit logging table
CREATE TABLE IF NOT EXISTS auth_log (
  id TEXT PRIMARY KEY,
  userId TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  action TEXT NOT NULL, -- 'signin', 'signup', 'failed_signin', 'password_changed', etc.
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_message TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for auth logging
CREATE INDEX IF NOT EXISTS idx_auth_log_userId ON auth_log(userId);
CREATE INDEX IF NOT EXISTS idx_auth_log_email ON auth_log(email);
CREATE INDEX IF NOT EXISTS idx_auth_log_createdAt ON auth_log(createdAt);
CREATE INDEX IF NOT EXISTS idx_auth_log_action ON auth_log(action);
