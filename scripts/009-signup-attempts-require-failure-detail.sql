-- Rows logged before 008 have no email/reason; those values are unrecoverable.
UPDATE signup_attempts
SET email = COALESCE(email, '(not recorded)'),
    reason = COALESCE(reason, 'legacy_unrecorded')
WHERE succeeded = false AND (email IS NULL OR reason IS NULL);

ALTER TABLE signup_attempts DROP CONSTRAINT IF EXISTS signup_attempts_failure_detail;
ALTER TABLE signup_attempts
  ADD CONSTRAINT signup_attempts_failure_detail
  CHECK (succeeded OR (email IS NOT NULL AND reason IS NOT NULL AND reason <> ''));
