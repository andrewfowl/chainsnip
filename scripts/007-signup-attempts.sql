CREATE TABLE IF NOT EXISTS signup_attempts (
  id BIGSERIAL PRIMARY KEY,
  ip_hash TEXT NOT NULL,
  succeeded BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS signup_attempts_ip_created_idx
  ON signup_attempts (ip_hash, created_at DESC);
