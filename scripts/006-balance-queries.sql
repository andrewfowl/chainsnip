CREATE TABLE IF NOT EXISTS balance_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  network text NOT NULL,
  network_name text NOT NULL,
  wallet_address text NOT NULL,
  contract_address text,
  symbol text NOT NULL,
  balance text NOT NULL,
  balance_raw text NOT NULL,
  decimals integer NOT NULL,
  block_number bigint NOT NULL,
  block_date timestamptz NOT NULL,
  queried_at timestamptz NOT NULL DEFAULT now(),
  client_name text
);

CREATE INDEX IF NOT EXISTS balance_queries_user_queried_idx
  ON balance_queries (user_id, queried_at DESC);

CREATE INDEX IF NOT EXISTS balance_queries_user_client_idx
  ON balance_queries (user_id, lower(client_name));
