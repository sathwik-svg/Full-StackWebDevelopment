import { createClient } from '@supabase/supabase-js';
import { TEMPLATES } from './templates';
import { generateSlug } from './utils';

export type FormStatus = 'draft' | 'published';
export type QuestionType = 'text' | 'email' | 'multiple_choice' | 'yes_no' | 'dropdown' | 'rating' | 'date';
export type BotAvatar = 'message-circle' | 'bot' | 'sparkles' | 'headset' | 'user';
export type LauncherPosition = 'bottom-right' | 'bottom-left';

export interface ValidationRules {
  min?: number;
  max?: number;
  minDate?: string;
  maxDate?: string;
  regex?: string;
  customErrorMessage?: string;
  ratingScale?: number;
  ratingStyle?: 'stars' | 'numbers';
  lowRatingLabel?: string;
  highRatingLabel?: string;
}

export interface Form {
  id: string;
  title: string;
  description: string | null;
  status: FormStatus;
  welcome_text: string;
  completion_text?: string;
  theme_color: string;
  bot_name?: string;
  bot_avatar?: BotAvatar;
  launcher_position?: LauncherPosition;
  sound_enabled?: boolean;
  auto_popup_delay?: number;
  webhook_url?: string;
  notify_email?: string;
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
  validation?: ValidationRules;
  placeholder?: string;
  created_at: string;
}

export interface ResponseRow {
  id: string;
  form_id: string;
  answers: Record<string, string>;
  created_at: string;
}

export interface WebhookLog {
  id: string;
  form_id: string;
  response_id?: string;
  payload: Record<string, unknown>;
  status_code: number;
  status: 'success' | 'failed';
  url: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  user_email: string;
  role: string;
  created_at: string;
}

export type QuestionInput = Omit<Question, 'id' | 'form_id' | 'created_at'>;

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  rawUrl.startsWith('http') &&
  !rawUrl.includes('your-project-url') &&
  !rawKey.includes('your-anon-key')
);

// Real client if configured
const realSupabase = isSupabaseConfigured
  ? createClient(rawUrl, rawKey, { auth: { persistSession: false } })
  : null;

// --- Local Storage Reactive Storage Engine ---
const STORAGE_FORMS = 'formflow_forms_v2';
const STORAGE_QUESTIONS = 'formflow_questions_v2';
const STORAGE_RESPONSES = 'formflow_responses_v2';
const STORAGE_AUDIT = 'formflow_audit_logs';

function getStorage<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage quota exceeded or unavailable', err);
  }
}

// Seed initial forms and sample responses if empty
export function seedInitialDataIfEmpty() {
  const existingForms = getStorage<Form[]>(STORAGE_FORMS, []);
  if (existingForms.length > 0) return;

  const now = new Date();
  const forms: Form[] = [];
  const questions: Question[] = [];
  const responses: ResponseRow[] = [];

  // Seed with CSAT Survey
  const csatTemplate = TEMPLATES[0];
  const csatId = 'form_csat_demo';
  const csatForm: Form = {
    id: csatId,
    title: csatTemplate.title,
    description: csatTemplate.description,
    status: 'published',
    welcome_text: csatTemplate.welcome_text,
    completion_text: csatTemplate.completion_text,
    theme_color: csatTemplate.theme_color,
    bot_name: csatTemplate.bot_name,
    bot_avatar: csatTemplate.bot_avatar,
    launcher_position: 'bottom-right',
    sound_enabled: true,
    auto_popup_delay: 0,
    webhook_url: 'https://webhook.site/formflow-demo',
    notify_email: 'feedback@formflow.app',
    slug: 'csat-feedback',
    created_at: new Date(now.getTime() - 86400000 * 5).toISOString(),
    updated_at: new Date(now.getTime() - 86400000 * 1).toISOString(),
  };
  forms.push(csatForm);

  const csatQuestions: Question[] = csatTemplate.questions.map((q, idx) => ({
    id: `q_csat_${idx + 1}`,
    form_id: csatId,
    text: q.text,
    type: q.type,
    options: q.options || [],
    required: q.required,
    position: idx,
    validation: q.validation,
    placeholder: q.placeholder,
    created_at: new Date(now.getTime() - 86400000 * 5).toISOString(),
  }));
  questions.push(...csatQuestions);

  // Add 4 realistic responses to CSAT
  const sampleAnswers = [
    {
      [csatQuestions[0].id]: '5',
      [csatQuestions[1].id]: 'Customer Support',
      [csatQuestions[2].id]: 'Remarkably fast turnaround and crystal-clear instructions. Loved it!',
      [csatQuestions[3].id]: 'sarah.m@company.com',
    },
    {
      [csatQuestions[0].id]: '4',
      [csatQuestions[1].id]: 'Technical & Product',
      [csatQuestions[2].id]: 'The chatbot interaction is very slick. Would love more webhook integrations.',
      [csatQuestions[3].id]: 'david.k@startup.io',
    },
    {
      [csatQuestions[0].id]: '5',
      [csatQuestions[1].id]: 'Sales & Onboarding',
      [csatQuestions[2].id]: 'Super friendly onboarding call. Answered all enterprise security questions.',
      [csatQuestions[3].id]: 'elena@enterprise.org',
    },
    {
      [csatQuestions[0].id]: '4',
      [csatQuestions[1].id]: 'Billing & Accounts',
      [csatQuestions[2].id]: 'Invoicing was easy to reconcile. Great experience.',
      [csatQuestions[3].id]: 'finance@agency.dev',
    },
  ];

  sampleAnswers.forEach((ans, i) => {
    responses.push({
      id: `resp_csat_${i + 1}`,
      form_id: csatId,
      answers: ans,
      created_at: new Date(now.getTime() - 86400000 * (4 - i)).toISOString(),
    });
  });

  // Seed Event Registration Form
  const eventTemplate = TEMPLATES[1];
  const eventId = 'form_event_demo';
  const eventForm: Form = {
    id: eventId,
    title: eventTemplate.title,
    description: eventTemplate.description,
    status: 'published',
    welcome_text: eventTemplate.welcome_text,
    completion_text: eventTemplate.completion_text,
    theme_color: eventTemplate.theme_color,
    bot_name: eventTemplate.bot_name,
    bot_avatar: eventTemplate.bot_avatar,
    launcher_position: 'bottom-right',
    sound_enabled: true,
    slug: 'event-rsvp-2026',
    created_at: new Date(now.getTime() - 86400000 * 3).toISOString(),
    updated_at: new Date(now.getTime() - 86400000 * 2).toISOString(),
  };
  forms.push(eventForm);

  const eventQuestions: Question[] = eventTemplate.questions.map((q, idx) => ({
    id: `q_event_${idx + 1}`,
    form_id: eventId,
    text: q.text,
    type: q.type,
    options: q.options || [],
    required: q.required,
    position: idx,
    validation: q.validation,
    placeholder: q.placeholder,
    created_at: new Date(now.getTime() - 86400000 * 3).toISOString(),
  }));
  questions.push(...eventQuestions);

  // Sample event response
  responses.push({
    id: 'resp_event_1',
    form_id: eventId,
    answers: {
      [eventQuestions[0].id]: 'Marcus Vance',
      [eventQuestions[1].id]: 'marcus@cloudtech.com',
      [eventQuestions[2].id]: '2026-11-15',
      [eventQuestions[3].id]: 'VIP All-Access Pass',
      [eventQuestions[4].id]: 'No',
    },
    created_at: new Date(now.getTime() - 86400000 * 1).toISOString(),
  });

  setStorage(STORAGE_FORMS, forms);
  setStorage(STORAGE_QUESTIONS, questions);
  setStorage(STORAGE_RESPONSES, responses);
  addAuditLog('system_init', 'Seeded initial forms, questions, and sample responses for CSAT and Event RSVP', 'admin', 'system@formflow.app');
}

// Initialize seed on module load
seedInitialDataIfEmpty();

export function addAuditLog(action: string, details: string, role = 'admin', email = 'admin@formflow.app') {
  try {
    const logs = getStorage<AuditLog[]>(STORAGE_AUDIT, []);
    const entry: AuditLog = {
      id: 'audit_' + Math.random().toString(36).substring(2, 10),
      action,
      details,
      user_email: email,
      role,
      created_at: new Date().toISOString(),
    };
    setStorage(STORAGE_AUDIT, [entry, ...logs].slice(0, 100));
  } catch {
    // Ignore storage errors
  }
}

export function getAuditLogs(): AuditLog[] {
  return getStorage<AuditLog[]>(STORAGE_AUDIT, []);
}

// Query builder mock that mimics PostgREST API
function createMockQueryBuilder(table: string) {
  let filterFn = (_item: any) => true;
  let sortFn: ((a: any, b: any) => number) | null = null;
  let limitCount: number | null = null;
  let isCountExact = false;
  let isHead = false;

  const getItems = (): any[] => {
    if (table === 'forms') return getStorage<Form[]>(STORAGE_FORMS, []);
    if (table === 'questions') return getStorage<Question[]>(STORAGE_QUESTIONS, []);
    if (table === 'responses') return getStorage<ResponseRow[]>(STORAGE_RESPONSES, []);
    if (table === 'webhooks_log') return getStorage<WebhookLog[]>('formflow_webhook_logs', []);
    if (table === 'audit_logs') return getStorage<AuditLog[]>(STORAGE_AUDIT, []);
    return [];
  };

  const saveItems = (items: any[]) => {
    if (table === 'forms') setStorage(STORAGE_FORMS, items);
    if (table === 'questions') setStorage(STORAGE_QUESTIONS, items);
    if (table === 'responses') setStorage(STORAGE_RESPONSES, items);
    if (table === 'webhooks_log') setStorage('formflow_webhook_logs', items);
    if (table === 'audit_logs') setStorage(STORAGE_AUDIT, items);
  };

  const builder: any = {
    select: (_cols?: string, options?: { count?: string; head?: boolean }) => {
      if (options?.count === 'exact') isCountExact = true;
      if (options?.head) isHead = true;
      return builder;
    },
    eq: (column: string, value: any) => {
      const prevFilter = filterFn;
      filterFn = (item: any) => prevFilter(item) && item[column] === value;
      return builder;
    },
    order: (column: string, options?: { ascending?: boolean }) => {
      const asc = options?.ascending ?? true;
      sortFn = (a: any, b: any) => {
        const valA = a[column];
        const valB = b[column];
        if (valA < valB) return asc ? -1 : 1;
        if (valA > valB) return asc ? 1 : -1;
        return 0;
      };
      return builder;
    },
    limit: (n: number) => {
      limitCount = n;
      return builder;
    },
    insert: async (values: any) => {
      const items = getItems();
      const records = Array.isArray(values) ? values : [values];
      const inserted = records.map((r) => {
        const id = r.id || 'id_' + Math.random().toString(36).substring(2, 11);
        const now = new Date().toISOString();
        return {
          ...r,
          id,
          created_at: r.created_at || now,
          updated_at: r.updated_at || now,
        };
      });
      saveItems([...items, ...inserted]);

      const singleRecord = inserted[0];
      return {
        data: Array.isArray(values) ? inserted : singleRecord,
        error: null,
        select: () => ({
          single: async () => ({ data: singleRecord, error: null }),
          maybeSingle: async () => ({ data: singleRecord, error: null }),
        }),
      };
    },
    update: (patch: any) => {
      return {
        eq: async (col: string, val: any) => {
          const items = getItems();
          let count = 0;
          const updated = items.map((item) => {
            if (item[col] === val) {
              count++;
              return { ...item, ...patch, updated_at: new Date().toISOString() };
            }
            return item;
          });
          saveItems(updated);
          return { data: count > 0 ? patch : null, error: null };
        },
      };
    },
    delete: () => {
      return {
        eq: async (col: string, val: any) => {
          const items = getItems();
          const filtered = items.filter((item) => item[col] !== val);
          saveItems(filtered);
          // If deleting a form, cascade delete questions and responses
          if (table === 'forms' && col === 'id') {
            const qs = getStorage<Question[]>(STORAGE_QUESTIONS, []).filter((q) => q.form_id !== val);
            setStorage(STORAGE_QUESTIONS, qs);
            const rs = getStorage<ResponseRow[]>(STORAGE_RESPONSES, []).filter((r) => r.form_id !== val);
            setStorage(STORAGE_RESPONSES, rs);
          }
          return { data: null, error: null };
        },
      };
    },
    then: (resolve: (val: any) => void) => {
      const items = getItems();
      let result = items.filter(filterFn);
      if (sortFn) result.sort(sortFn);
      if (limitCount !== null) result = result.slice(0, limitCount);

      if (isHead) {
        return Promise.resolve({ data: null, count: result.length, error: null }).then(resolve);
      }
      return Promise.resolve({
        data: result,
        count: isCountExact ? result.length : null,
        error: null,
      }).then(resolve);
    },
    maybeSingle: async () => {
      const items = getItems();
      const filtered = items.filter(filterFn);
      return { data: filtered[0] || null, error: null };
    },
    single: async () => {
      const items = getItems();
      const filtered = items.filter(filterFn);
      if (filtered.length === 0) {
        return { data: null, error: { message: 'Row not found' } };
      }
      return { data: filtered[0], error: null };
    },
  };

  return builder;
}

// Unified client interface
export const supabase = {
  from: (table: string) => {
    if (isSupabaseConfigured && realSupabase) {
      return realSupabase.from(table);
    }
    return createMockQueryBuilder(table);
  },
  auth: realSupabase?.auth ?? {
    getSession: async () => ({ data: { session: null }, error: null }),
  },
};

// Form Duplication helper (Task 2 requirement)
export async function duplicateForm(formId: string): Promise<{ form: Form; questions: Question[] }> {
  // 1. Fetch source form
  const { data: sourceForm, error: formErr } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .single();

  if (formErr || !sourceForm) {
    throw new Error(formErr?.message || 'Source form not found for duplication');
  }

  // 2. Fetch source questions
  const { data: sourceQuestions } = await supabase
    .from('questions')
    .select('*')
    .eq('form_id', formId)
    .order('position', { ascending: true });

  const original = sourceForm as Form;
  const newSlug = `${original.slug.slice(0, 16)}-copy-${generateSlug(4)}`;

  // 3. Create duplicate form in draft status
  const newFormData: Partial<Form> = {
    title: `${original.title} (Copy)`,
    description: original.description,
    status: 'draft', // Always duplicate into draft
    welcome_text: original.welcome_text,
    completion_text: original.completion_text || 'Thank you for your responses!',
    theme_color: original.theme_color,
    bot_name: original.bot_name,
    bot_avatar: original.bot_avatar,
    launcher_position: original.launcher_position,
    sound_enabled: original.sound_enabled,
    auto_popup_delay: original.auto_popup_delay,
    webhook_url: original.webhook_url,
    notify_email: original.notify_email,
    slug: newSlug,
  };

  const { data: createdForm, error: createErr } = await supabase
    .from('forms')
    .insert(newFormData)
    .select()
    .single();

  if (createErr || !createdForm) {
    throw new Error(createErr?.message || 'Failed to create duplicated form');
  }

  const newForm = createdForm as Form;

  // 4. Duplicate questions
  const clonedQuestions: Question[] = [];
  if (sourceQuestions && sourceQuestions.length > 0) {
    for (const q of sourceQuestions as Question[]) {
      const qInput: Partial<Question> = {
        form_id: newForm.id,
        text: q.text,
        type: q.type,
        options: q.options || [],
        required: q.required,
        position: q.position,
        validation: q.validation ? JSON.parse(JSON.stringify(q.validation)) : undefined,
        placeholder: q.placeholder,
      };

      const { data: newQ } = await supabase
        .from('questions')
        .insert(qInput)
        .select()
        .single();

      if (newQ) clonedQuestions.push(newQ as Question);
    }
  }

  addAuditLog(
    'form_duplicated',
    `Duplicated form "${original.title}" into "${newForm.title}" (ID: ${newForm.id})`,
    'creator',
    'user@formflow.app'
  );

  return { form: newForm, questions: clonedQuestions };
}

// Create Form from Template helper (Task 2 requirement)
export async function createFormFromTemplate(templateId: string): Promise<Form> {
  const t = TEMPLATES.find((tpl) => tpl.id === templateId);
  if (!t) throw new Error('Template not found');

  const slug = `${t.id}-${generateSlug(5)}`;
  const { data: newForm, error: formErr } = await supabase
    .from('forms')
    .insert({
      title: t.title,
      description: t.description,
      status: 'draft',
      welcome_text: t.welcome_text,
      completion_text: t.completion_text,
      theme_color: t.theme_color,
      bot_name: t.bot_name,
      bot_avatar: t.bot_avatar,
      launcher_position: 'bottom-right',
      sound_enabled: true,
      slug,
    })
    .select()
    .single();

  if (formErr || !newForm) {
    throw new Error(formErr?.message || 'Failed to instantiate template');
  }

  const created = newForm as Form;

  for (let i = 0; i < t.questions.length; i++) {
    const q = t.questions[i];
    await supabase.from('questions').insert({
      form_id: created.id,
      text: q.text,
      type: q.type,
      options: q.options || [],
      required: q.required,
      position: i,
      validation: q.validation,
      placeholder: q.placeholder,
    });
  }

  addAuditLog(
    'template_used',
    `Created new form "${created.title}" using template "${t.title}"`,
    'creator',
    'user@formflow.app'
  );

  return created;
}
