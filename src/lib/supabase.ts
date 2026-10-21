import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export type FormStatus = 'draft' | 'published';

export type QuestionType = 'text' | 'email' | 'multiple_choice' | 'yes_no';

export interface Form {
  id: string;
  title: string;
  description: string | null;
  status: FormStatus;
  welcome_text: string;
  theme_color: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  form_id: string;
  text: string;
  type: QuestionType;
  options: string[];
  required: boolean;
  position: number;
  created_at: string;
}

export interface ResponseRow {
  id: string;
  form_id: string;
  answers: Record<string, string>;
  created_at: string;
}

export type QuestionInput = Omit<Question, 'id' | 'form_id' | 'created_at'>;
