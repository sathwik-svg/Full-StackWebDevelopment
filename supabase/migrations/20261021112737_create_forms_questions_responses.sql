/*
# Create forms, questions, and responses tables (single-tenant)

This migration sets up the core data model for the form builder app.

1. New Tables
- `forms`: Top-level forms. Each form has a title, description, publish status, customizable welcome text and theme color, plus a public slug used for shareable URLs.
  - `id` (uuid, primary key)
  - `title` (text, not null)
  - `description` (text, nullable)
  - `status` (text, 'draft' or 'published', default 'draft')
  - `welcome_text` (text, default greeting shown by the chatbot widget)
  - `theme_color` (text, hex color for the chatbot widget, default blue)
  - `slug` (text, unique short identifier used in public URLs)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
- `questions`: Individual questions within a form. Ordered by `position`.
  - `id` (uuid, primary key)
  - `form_id` (uuid, references forms, cascade delete)
  - `text` (text, the question prompt)
  - `type` (text: 'text', 'email', 'multiple_choice', 'yes_no')
  - `options` (jsonb, choices for multiple_choice questions)
  - `required` (boolean, default false)
  - `position` (integer, display order)
  - `created_at` (timestamptz)
- `responses`: Submitted form answers.
  - `id` (uuid, primary key)
  - `form_id` (uuid, references forms, cascade delete)
  - `answers` (jsonb, map of question_id -> answer value)
  - `created_at` (timestamptz)

2. Security
- All tables have RLS enabled.
- Because this is a single-tenant app with no sign-in, all CRUD policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)` — the data is intentionally shared/public.

3. Indexes
- `questions` on `form_id` for form-scoped question lookups.
- `responses` on `form_id` for form-scoped response lookups.
- `forms` on `slug` for public URL lookups (unique index).
*/

CREATE TABLE IF NOT EXISTS forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  welcome_text text NOT NULL DEFAULT 'Hi! Thanks for visiting. Mind answering a few quick questions?',
  theme_color text NOT NULL DEFAULT '#2563eb',
  slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_forms" ON forms;
CREATE POLICY "anon_select_forms" ON forms FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_forms" ON forms;
CREATE POLICY "anon_insert_forms" ON forms FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_forms" ON forms;
CREATE POLICY "anon_update_forms" ON forms FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_forms" ON forms;
CREATE POLICY "anon_delete_forms" ON forms FOR DELETE
  TO anon, authenticated USING (true);

CREATE UNIQUE INDEX IF NOT EXISTS forms_slug_unique ON forms (slug);

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  text text NOT NULL,
  type text NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'email', 'multiple_choice', 'yes_no')),
  options jsonb DEFAULT '[]'::jsonb,
  required boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_questions" ON questions;
CREATE POLICY "anon_select_questions" ON questions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_questions" ON questions;
CREATE POLICY "anon_insert_questions" ON questions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_questions" ON questions;
CREATE POLICY "anon_update_questions" ON questions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_questions" ON questions;
CREATE POLICY "anon_delete_questions" ON questions FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS questions_form_id_idx ON questions (form_id);

CREATE TABLE IF NOT EXISTS responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_responses" ON responses;
CREATE POLICY "anon_select_responses" ON responses FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_responses" ON responses;
CREATE POLICY "anon_insert_responses" ON responses FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_responses" ON responses;
CREATE POLICY "anon_delete_responses" ON responses FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS responses_form_id_idx ON responses (form_id);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS forms_updated_at ON forms;
CREATE TRIGGER forms_updated_at BEFORE UPDATE ON forms
FOR EACH ROW EXECUTE FUNCTION update_updated_at();