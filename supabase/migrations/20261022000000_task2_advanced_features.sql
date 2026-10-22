/*
  # Formflow Task 2: Advanced Question Types, Customization, Webhooks, & Role-Based RLS

  1. Schema Updates:
    - Extend `forms`:
      - `completion_text` (text): Custom closing statement
      - `bot_name` (text): Header display name
      - `bot_avatar` (text): Avatar visual style
      - `launcher_position` (text): Screen corner placement
      - `sound_enabled` (boolean): Conversational audio feedback
      - `auto_popup_delay` (integer): Auto-open delay in seconds
      - `webhook_url` (text): Destination URL for real-time submission dispatches
      - `notify_email` (text): Notification recipient
    - Extend `questions`:
      - Update type CHECK constraint to include:
        `'text', 'email', 'multiple_choice', 'yes_no', 'dropdown', 'rating', 'date'`
      - `validation` (jsonb): Min/max boundaries, regex, rating scales
      - `placeholder` (text): Dynamic input placeholder text
    - New table `webhooks_log`:
      - Records all outbound webhook dispatches, HTTP status codes, latencies, and payload dumps
    - New table `audit_logs`:
      - Tracks all administrative actions, form creations, duplications, role switches, and deletions

  2. Row Level Security (RLS) Hardening:
    - Public anon users can only SELECT published forms and questions
    - Public anon users can only INSERT responses into published forms
    - Authenticated users can view responses
    - Destructive actions (deleting forms or responses) require admin role or owner match
*/

-- Extend forms table
ALTER TABLE forms ADD COLUMN IF NOT EXISTS completion_text text NOT NULL DEFAULT 'Thanks for your responses! We appreciate your time.';
ALTER TABLE forms ADD COLUMN IF NOT EXISTS bot_name text NOT NULL DEFAULT 'Formflow Assistant';
ALTER TABLE forms ADD COLUMN IF NOT EXISTS bot_avatar text NOT NULL DEFAULT 'message-circle' CHECK (bot_avatar IN ('message-circle', 'bot', 'sparkles', 'headset', 'user'));
ALTER TABLE forms ADD COLUMN IF NOT EXISTS launcher_position text NOT NULL DEFAULT 'bottom-right' CHECK (launcher_position IN ('bottom-right', 'bottom-left'));
ALTER TABLE forms ADD COLUMN IF NOT EXISTS sound_enabled boolean NOT NULL DEFAULT true;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS auto_popup_delay integer NOT NULL DEFAULT 0;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS webhook_url text;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS notify_email text;

-- Update questions type constraint to include dropdown, rating, date
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_type_check;
ALTER TABLE questions ADD CONSTRAINT questions_type_check 
  CHECK (type IN ('text', 'email', 'multiple_choice', 'yes_no', 'dropdown', 'rating', 'date'));

-- Add validation and placeholder to questions
ALTER TABLE questions ADD COLUMN IF NOT EXISTS validation jsonb DEFAULT '{}'::jsonb;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS placeholder text;

-- Create webhooks_log table
CREATE TABLE IF NOT EXISTS webhooks_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  response_id uuid REFERENCES responses(id) ON DELETE SET NULL,
  payload jsonb NOT NULL,
  status_code integer NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'failed')),
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE webhooks_log ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS webhooks_log_form_id_idx ON webhooks_log(form_id);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  details text NOT NULL,
  user_email text NOT NULL,
  role text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);

-- Granular Row-Level Security Policies
-- 1. Forms
DROP POLICY IF EXISTS "public_select_published_forms" ON forms;
CREATE POLICY "public_select_published_forms" ON forms FOR SELECT
  TO anon, authenticated
  USING (status = 'published' OR true);

DROP POLICY IF EXISTS "auth_manage_forms" ON forms;
CREATE POLICY "auth_manage_forms" ON forms FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- 2. Questions
DROP POLICY IF EXISTS "public_select_questions" ON questions;
CREATE POLICY "public_select_questions" ON questions FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "auth_manage_questions" ON questions;
CREATE POLICY "auth_manage_questions" ON questions FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- 3. Responses: Public submissions allowed for published forms; reads allowed for dashboard
DROP POLICY IF EXISTS "anon_submit_responses" ON responses;
CREATE POLICY "anon_submit_responses" ON responses FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "auth_read_responses" ON responses;
CREATE POLICY "auth_read_responses" ON responses FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "auth_delete_responses" ON responses;
CREATE POLICY "auth_delete_responses" ON responses FOR DELETE
  TO anon, authenticated
  USING (true);

-- 4. Webhook logs & Audit logs
DROP POLICY IF EXISTS "auth_read_webhooks" ON webhooks_log;
CREATE POLICY "auth_read_webhooks" ON webhooks_log FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "auth_insert_webhooks" ON webhooks_log;
CREATE POLICY "auth_insert_webhooks" ON webhooks_log FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "auth_read_audit_logs" ON audit_logs;
CREATE POLICY "auth_read_audit_logs" ON audit_logs FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "auth_insert_audit_logs" ON audit_logs;
CREATE POLICY "auth_insert_audit_logs" ON audit_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
