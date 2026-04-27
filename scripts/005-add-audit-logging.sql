-- Create audit log table for authentication events
CREATE TABLE IF NOT EXISTS auth_audit_log (
  id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  email TEXT,
  event_type TEXT NOT NULL, -- 'signin', 'signup', 'signout', 'password_change', 'email_verified', 'password_reset', etc.
  status TEXT NOT NULL, -- 'success', 'failure'
  reason TEXT, -- reason for failure if status is 'failure'
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON auth_audit_log("userId");
CREATE INDEX IF NOT EXISTS idx_audit_email ON auth_audit_log(email);
CREATE INDEX IF NOT EXISTS idx_audit_event_type ON auth_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON auth_audit_log("createdAt");

-- Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_user_event ON auth_audit_log("userId", event_type, "createdAt" DESC);
