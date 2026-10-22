import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Eye,
  Save,
  Loader2,
  Copy,
  Check,
  Settings,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Bot,
  Headset,
  User,
  Star,
  Calendar,
  Layers,
  Send,
  Webhook,
  ShieldAlert,
} from 'lucide-react';
import {
  supabase,
  duplicateForm,
  type Form,
  type Question,
  type QuestionType,
  type BotAvatar,
  type LauncherPosition,
} from '@/lib/supabase';
import { useNavigate } from '@/lib/router';
import { ChatbotWidget } from '@/components/ChatbotWidget';
import { useAuth } from '@/lib/auth';
import { testWebhookEndpoint } from '@/lib/webhooks';

const QUESTION_TYPES: { value: QuestionType; label: string; icon: string }[] = [
  { value: 'text', label: 'Short text', icon: 'Aa' },
  { value: 'email', label: 'Email', icon: '@' },
  { value: 'multiple_choice', label: 'Multiple choice', icon: '::' },
  { value: 'dropdown', label: 'Dropdown select', icon: '▾' },
  { value: 'rating', label: 'Rating (Stars/Score)', icon: '★' },
  { value: 'date', label: 'Date', icon: '📅' },
  { value: 'yes_no', label: 'Yes / No', icon: '◩' },
];

const BOT_AVATARS: { value: BotAvatar; label: string }[] = [
  { value: 'message-circle', label: 'Message Bubble' },
  { value: 'sparkles', label: 'Sparkles / AI' },
  { value: 'bot', label: 'Friendly Bot' },
  { value: 'headset', label: 'Customer Support' },
  { value: 'user', label: 'Personal Avatar' },
];

const COLOR_PRESETS = [
  '#2563eb', // Royal Blue
  '#4f46e5', // Indigo
  '#7c3aed', // Purple
  '#059669', // Emerald
  '#0284c7', // Sky
  '#ea580c', // Orange
  '#e11d48', // Rose
  '#0f172a', // Slate Dark
];

export function FormBuilderPage({ formId }: { formId: string }) {
  const navigate = useNavigate();
  const { role, permissions } = useAuth();
  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingForm, setSavingForm] = useState(false);
  const [tab, setTab] = useState<'build' | 'preview' | 'settings' | 'webhooks'>('build');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedSlug, setCopiedSlug] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data: formData, error: formErr } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .maybeSingle();

    if (formErr || !formData) {
      setError(formErr?.message || 'Form not found.');
      setLoading(false);
      return;
    }
    setForm(formData as Form);

    const { data: qData } = await supabase
      .from('questions')
      .select('*')
      .eq('form_id', formId)
      .order('position', { ascending: true });

    setQuestions((qData || []) as Question[]);
    setLoading(false);
  }, [formId]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveFormMeta(patch: Partial<Form>) {
    if (!form) return;
    if (!permissions.canEditForm) {
      setError('Viewer role cannot modify form configuration.');
      return;
    }
    setSavingForm(true);
    const { error: err } = await supabase.from('forms').update(patch).eq('id', form.id);
    setSavingForm(false);
    if (err) {
      setError(err.message);
      return;
    }
    setForm({ ...form, ...patch });
    setSuccessMsg('Settings saved');
    setTimeout(() => setSuccessMsg(''), 2000);
  }

  async function addQuestion(type: QuestionType = 'text') {
    if (!form) return;
    if (!permissions.canEditForm) {
      setError('Viewer role cannot add questions.');
      return;
    }

    const newPosition = questions.length;
    let initialOptions: string[] = [];
    if (type === 'multiple_choice' || type === 'dropdown') {
      initialOptions = ['Option 1', 'Option 2', 'Option 3'];
    }

    const { data, error: err } = await supabase
      .from('questions')
      .insert({
        form_id: form.id,
        text: type === 'rating' ? 'How would you rate your experience?' : type === 'date' ? 'Select your date:' : 'New question',
        type,
        options: initialOptions,
        required: false,
        position: newPosition,
        placeholder: '',
        validation: type === 'rating' ? { ratingScale: 5, ratingStyle: 'stars', lowRatingLabel: 'Poor', highRatingLabel: 'Great' } : {},
      })
      .select()
      .single();

    if (err) {
      setError(err.message);
      return;
    }
    setQuestions([...questions, data as Question]);
  }

  async function updateQuestion(id: string, patch: Partial<Question>) {
    if (!permissions.canEditForm) {
      setError('Viewer role cannot edit questions.');
      return;
    }
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
    const { error: err } = await supabase.from('questions').update(patch).eq('id', id);
    if (err) setError(err.message);
  }

  async function deleteQuestion(id: string) {
    if (!permissions.canEditForm) {
      setError('Viewer role cannot delete questions.');
      return;
    }
    const { error: err } = await supabase.from('questions').delete().eq('id', id);
    if (err) {
      setError(err.message);
      return;
    }
    const remaining = questions.filter((q) => q.id !== id);
    await reorder(remaining);
  }

  async function moveQuestion(index: number, dir: -1 | 1) {
    if (!permissions.canEditForm) return;
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= questions.length) return;
    const reordered = [...questions];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    await reorder(reordered);
  }

  async function reorder(list: Question[]) {
    const updates = list.map((q, i) => ({ id: q.id, position: i }));
    setQuestions(list.map((q, i) => ({ ...q, position: i })));
    await Promise.all(
      updates.map((u) => supabase.from('questions').update({ position: u.position }).eq('id', u.id))
    );
  }

  async function handleDuplicateCurrentForm() {
    if (!form || !permissions.canDuplicateForm) return;
    setDuplicating(true);
    try {
      const { form: dup } = await duplicateForm(form.id);
      navigate({ name: 'builder', formId: dup.id });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Duplication failed');
    } finally {
      setDuplicating(false);
    }
  }

  async function handleTestWebhook() {
    if (!form || !form.webhook_url) return;
    setTestingWebhook(true);
    setWebhookResult(null);
    const res = await testWebhookEndpoint(form.webhook_url, form);
    setTestingWebhook(false);
    if (res.success) {
      setWebhookResult(`✓ Webhook ping succeeded! Status: ${res.statusCode} (${res.latencyMs}ms)`);
    } else {
      setWebhookResult(`✕ Webhook delivery failed: ${res.error || 'Unknown error'} (${res.latencyMs}ms)`);
    }
  }

  function copyPublicUrl() {
    if (!form) return;
    const url = `${window.location.origin}/#/f/${form.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(true);
    setTimeout(() => setCopiedSlug(false), 2000);
  }

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500">{error || 'Form not found.'}</p>
          <button onClick={() => navigate({ name: 'dashboard' })} className="btn-secondary mt-4">
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const isPublished = form.status === 'published';

  return (
    <div className="pt-16 min-h-screen bg-slate-50 flex flex-col">
      {/* Top Builder Bar */}
      <div className="border-b border-slate-200 bg-white sticky top-16 z-30 shadow-2xs">
        <div className="mx-auto max-w-6xl px-5 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate({ name: 'dashboard' })}
              className="btn-ghost p-1.5 text-slate-500 hover:text-slate-800"
              title="Return to Dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: form.theme_color }}
              />
              <h1 className="text-sm font-bold text-slate-900 truncate">{form.title}</h1>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {form.status}
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTab('build')}
              className={`px-3 py-1.5 rounded-lg transition ${
                tab === 'build' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Questions ({questions.length})
            </button>
            <button
              onClick={() => setTab('preview')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                tab === 'preview' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Live Preview
            </button>
            <button
              onClick={() => setTab('settings')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                tab === 'settings' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              Design & Bot
            </button>
            <button
              onClick={() => setTab('webhooks')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                tab === 'webhooks' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Webhook className="h-3.5 w-3.5" />
              Webhooks
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDuplicateCurrentForm}
              disabled={duplicating || !permissions.canDuplicateForm}
              className="btn-secondary text-xs py-1.5 px-2.5 flex items-center gap-1"
              title="Duplicate Form"
            >
              {duplicating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">Duplicate</span>
            </button>

            {isPublished && (
              <button
                onClick={copyPublicUrl}
                className="btn-secondary text-xs py-1.5 px-2.5 flex items-center gap-1 text-slate-700"
                title="Copy public link"
              >
                {copiedSlug ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{copiedSlug ? 'Copied' : 'Share link'}</span>
              </button>
            )}

            <button
              onClick={() => navigate({ name: 'responses', formId: form.id })}
              className="btn-primary text-xs py-1.5 px-3"
            >
              Responses
            </button>
          </div>
        </div>
      </div>

      {/* Role Alert for Viewer */}
      {!permissions.canEditForm && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 text-xs text-amber-800 text-center font-medium flex items-center justify-center gap-1.5">
          <ShieldAlert className="h-4 w-4 text-amber-600" />
          You are viewing this form in Read-Only Viewer mode. Switch to Creator or Admin in the top-right to edit.
        </div>
      )}

      {/* Error & Success banner */}
      {error && (
        <div className="mx-auto max-w-4xl w-full px-5 mt-4">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold text-red-400">✕</button>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="mx-auto max-w-4xl w-full px-5 mt-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-800 flex items-center justify-between">
            <span>✓ {successMsg}</span>
            <button onClick={() => setSuccessMsg('')} className="font-bold text-emerald-400">✕</button>
          </div>
        </div>
      )}

      {/* Main Builder Content Area */}
      <div className="mx-auto max-w-4xl w-full px-5 py-8 flex-1">
        {/* TAB 1: BUILD (Questions List) */}
        {tab === 'build' && (
          <div className="space-y-6">
            {/* Quick Add Question Toolbar */}
            {permissions.canEditForm && (
              <div className="card p-4 bg-white border border-slate-200 shadow-2xs">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
                  Add Question Type
                </span>
                <div className="flex flex-wrap gap-2">
                  {QUESTION_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => addQuestion(t.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 text-xs font-semibold text-slate-700 transition flex items-center gap-1.5"
                    >
                      <span className="font-mono text-slate-400">{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Questions stack */}
            {questions.length === 0 ? (
              <div className="card p-12 text-center bg-white">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-3">
                  <Plus className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">No questions added yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Click any question type above to start building your conversational flow.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="card p-5 bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      {/* Drag / Index handle */}
                      <div className="flex flex-col items-center gap-1 mt-1 text-slate-400">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                          {idx + 1}
                        </span>
                        {permissions.canEditForm && (
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => moveQuestion(idx, -1)}
                              disabled={idx === 0}
                              className="p-0.5 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                            >
                              <ChevronUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => moveQuestion(idx, 1)}
                              disabled={idx === questions.length - 1}
                              className="p-0.5 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Question Body */}
                      <div className="flex-1 space-y-3 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                          <input
                            type="text"
                            value={q.text}
                            disabled={!permissions.canEditForm}
                            onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                            placeholder="Enter your question prompt..."
                            className="text-sm font-semibold text-slate-900 w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none pb-0.5 transition"
                          />

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Type selector */}
                            <select
                              value={q.type}
                              disabled={!permissions.canEditForm}
                              onChange={(e) => {
                                const newType = e.target.value as QuestionType;
                                const patch: Partial<Question> = { type: newType };
                                if ((newType === 'multiple_choice' || newType === 'dropdown') && (!q.options || q.options.length === 0)) {
                                  patch.options = ['Option 1', 'Option 2', 'Option 3'];
                                }
                                if (newType === 'rating' && !q.validation?.ratingScale) {
                                  patch.validation = { ratingScale: 5, ratingStyle: 'stars', lowRatingLabel: 'Poor', highRatingLabel: 'Great' };
                                }
                                updateQuestion(q.id, patch);
                              }}
                              className="text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700 outline-none"
                            >
                              {QUESTION_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                            </select>

                            {/* Required toggle */}
                            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={q.required}
                                disabled={!permissions.canEditForm}
                                onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                                className="rounded text-indigo-600 focus:ring-0"
                              />
                              <span className="font-medium">Required</span>
                            </label>

                            {/* Delete */}
                            {permissions.canEditForm && (
                              <button
                                onClick={() => deleteQuestion(q.id)}
                                className="p-1 text-slate-400 hover:text-red-600 transition"
                                title="Delete question"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Optional placeholder */}
                        {(q.type === 'text' || q.type === 'email') && (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400 font-medium">Input Placeholder:</span>
                            <input
                              type="text"
                              value={q.placeholder || ''}
                              disabled={!permissions.canEditForm}
                              onChange={(e) => updateQuestion(q.id, { placeholder: e.target.value })}
                              placeholder={q.type === 'email' ? 'e.g. name@example.com' : 'e.g. Type your response here...'}
                              className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 text-slate-700 flex-1 outline-none"
                            />
                          </div>
                        )}

                        {/* Dropdown & Multiple Choice options editor */}
                        {(q.type === 'multiple_choice' || q.type === 'dropdown') && (
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                              {q.type === 'dropdown' ? 'Dropdown Options List' : 'Multiple Choice Options'}
                            </span>
                            <div className="space-y-1.5">
                              {q.options.map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400 w-4 text-center">{optIdx + 1}.</span>
                                  <input
                                    type="text"
                                    value={opt}
                                    disabled={!permissions.canEditForm}
                                    onChange={(e) => {
                                      const nextOptions = [...q.options];
                                      nextOptions[optIdx] = e.target.value;
                                      updateQuestion(q.id, { options: nextOptions });
                                    }}
                                    className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 outline-none"
                                  />
                                  {permissions.canEditForm && q.options.length > 1 && (
                                    <button
                                      onClick={() => {
                                        const nextOptions = q.options.filter((_, i) => i !== optIdx);
                                        updateQuestion(q.id, { options: nextOptions });
                                      }}
                                      className="text-slate-400 hover:text-red-500 p-1"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ))}
                              {permissions.canEditForm && (
                                <button
                                  onClick={() => {
                                    const nextOptions = [...q.options, `Option ${q.options.length + 1}`];
                                    updateQuestion(q.id, { options: nextOptions });
                                  }}
                                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-1 pt-1"
                                >
                                  <Plus className="h-3 w-3" /> Add Option
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Rating Configuration (Task 2) */}
                        {q.type === 'rating' && (
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-xs">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                              Rating Parameters
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <div>
                                <label className="text-[10px] text-slate-500 block mb-1">Max Scale</label>
                                <select
                                  value={q.validation?.ratingScale || 5}
                                  disabled={!permissions.canEditForm}
                                  onChange={(e) =>
                                    updateQuestion(q.id, {
                                      validation: { ...q.validation, ratingScale: Number(e.target.value) },
                                    })
                                  }
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
                                >
                                  <option value={5}>5 Points / Stars</option>
                                  <option value={10}>10 Points</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-500 block mb-1">Visual Style</label>
                                <select
                                  value={q.validation?.ratingStyle || 'stars'}
                                  disabled={!permissions.canEditForm}
                                  onChange={(e) =>
                                    updateQuestion(q.id, {
                                      validation: {
                                        ...q.validation,
                                        ratingStyle: e.target.value as 'stars' | 'numbers',
                                      },
                                    })
                                  }
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
                                >
                                  <option value="stars">Star Icons (★)</option>
                                  <option value="numbers">Numeric Buttons (1..N)</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-500 block mb-1">Low Label</label>
                                <input
                                  type="text"
                                  value={q.validation?.lowRatingLabel || ''}
                                  disabled={!permissions.canEditForm}
                                  onChange={(e) =>
                                    updateQuestion(q.id, {
                                      validation: { ...q.validation, lowRatingLabel: e.target.value },
                                    })
                                  }
                                  placeholder="e.g. Poor"
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-500 block mb-1">High Label</label>
                                <input
                                  type="text"
                                  value={q.validation?.highRatingLabel || ''}
                                  disabled={!permissions.canEditForm}
                                  onChange={(e) =>
                                    updateQuestion(q.id, {
                                      validation: { ...q.validation, highRatingLabel: e.target.value },
                                    })
                                  }
                                  placeholder="e.g. Excellent"
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Date Configuration (Task 2) */}
                        {q.type === 'date' && (
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-xs">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                              Date Boundaries (Optional)
                            </span>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] text-slate-500 block mb-1">Minimum Allowed Date</label>
                                <input
                                  type="date"
                                  value={q.validation?.minDate || ''}
                                  disabled={!permissions.canEditForm}
                                  onChange={(e) =>
                                    updateQuestion(q.id, {
                                      validation: { ...q.validation, minDate: e.target.value },
                                    })
                                  }
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-500 block mb-1">Maximum Allowed Date</label>
                                <input
                                  type="date"
                                  value={q.validation?.maxDate || ''}
                                  disabled={!permissions.canEditForm}
                                  onChange={(e) =>
                                    updateQuestion(q.id, {
                                      validation: { ...q.validation, maxDate: e.target.value },
                                    })
                                  }
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LIVE PREVIEW */}
        {tab === 'preview' && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="text-center mb-6">
              <h3 className="text-base font-bold text-slate-900">Interactive Chatbot Preview</h3>
              <p className="text-xs text-slate-500 mt-1">
                Test the actual conversational experience, inline validations, and sound feedback exactly as respondents see it.
              </p>
            </div>

            <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
              <ChatbotWidget
                form={form}
                questions={questions}
                embedded
                onSubmit={async (answers) => {
                  console.log('Preview submission:', answers);
                  return { success: true };
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 3: DESIGN & BOT CUSTOMIZATION (Task 2) */}
        {tab === 'settings' && (
          <div className="card p-6 bg-white space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Chatbot Appearance & Customization</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize colors, persona, bot name, welcome greeting, and completion messages.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Title & Description */}
              <div className="space-y-4">
                <div>
                  <label className="label">Form Title</label>
                  <input
                    type="text"
                    value={form.title}
                    disabled={!permissions.canEditForm}
                    onChange={(e) => saveFormMeta({ title: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Subtitle / Description</label>
                  <textarea
                    rows={2}
                    value={form.description || ''}
                    disabled={!permissions.canEditForm}
                    onChange={(e) => saveFormMeta({ description: e.target.value })}
                    placeholder="Brief description for share links and public page header"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Bot Display Name</label>
                  <input
                    type="text"
                    value={form.bot_name || 'Formflow Assistant'}
                    disabled={!permissions.canEditForm}
                    onChange={(e) => saveFormMeta({ bot_name: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Bot Persona / Avatar</label>
                  <div className="grid grid-cols-2 gap-2">
                    {BOT_AVATARS.map((av) => (
                      <button
                        key={av.value}
                        type="button"
                        disabled={!permissions.canEditForm}
                        onClick={() => saveFormMeta({ bot_avatar: av.value })}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                          form.bot_avatar === av.value
                            ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-200'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {av.value === 'sparkles' && <Sparkles className="h-4 w-4 text-indigo-500" />}
                        {av.value === 'bot' && <Bot className="h-4 w-4 text-blue-500" />}
                        {av.value === 'headset' && <Headset className="h-4 w-4 text-amber-500" />}
                        {av.value === 'user' && <User className="h-4 w-4 text-emerald-500" />}
                        {av.value === 'message-circle' && <MessageCircle className="h-4 w-4 text-slate-600" />}
                        <span>{av.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Theme Color & Messages */}
              <div className="space-y-4">
                <div>
                  <label className="label">Theme Accent Color</label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="color"
                      value={form.theme_color}
                      disabled={!permissions.canEditForm}
                      onChange={(e) => saveFormMeta({ theme_color: e.target.value })}
                      className="h-10 w-12 rounded cursor-pointer border border-slate-200"
                    />
                    <input
                      type="text"
                      value={form.theme_color}
                      disabled={!permissions.canEditForm}
                      onChange={(e) => saveFormMeta({ theme_color: e.target.value })}
                      className="input font-mono uppercase text-xs"
                    />
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => saveFormMeta({ theme_color: color })}
                        disabled={!permissions.canEditForm}
                        className="h-6 w-6 rounded-full border border-white shadow-2xs hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Welcome Greeting Message</label>
                  <textarea
                    rows={2}
                    value={form.welcome_text}
                    disabled={!permissions.canEditForm}
                    onChange={(e) => saveFormMeta({ welcome_text: e.target.value })}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label">Completion / Thank You Message (Task 2)</label>
                  <textarea
                    rows={2}
                    value={form.completion_text || 'Thanks for your responses! We appreciate your time.'}
                    disabled={!permissions.canEditForm}
                    onChange={(e) => saveFormMeta({ completion_text: e.target.value })}
                    className="input text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="label">Launcher Corner</label>
                    <select
                      value={form.launcher_position || 'bottom-right'}
                      disabled={!permissions.canEditForm}
                      onChange={(e) => saveFormMeta({ launcher_position: e.target.value as LauncherPosition })}
                      className="input text-xs"
                    >
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Auto-Popup (Seconds)</label>
                    <select
                      value={form.auto_popup_delay || 0}
                      disabled={!permissions.canEditForm}
                      onChange={(e) => saveFormMeta({ auto_popup_delay: Number(e.target.value) })}
                      className="input text-xs"
                    >
                      <option value={0}>Disabled (Click only)</option>
                      <option value={3}>Open after 3s</option>
                      <option value={5}>Open after 5s</option>
                      <option value={10}>Open after 10s</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer mt-2 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.sound_enabled !== false}
                      disabled={!permissions.canEditForm}
                      onChange={(e) => saveFormMeta({ sound_enabled: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span className="font-semibold">Enable subtle Web Audio sound feedback</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Publishing toggle */}
            <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Form Publishing Status</h4>
                <p className="text-xs text-slate-500">
                  {isPublished
                    ? 'This form is live. Anyone with the URL can submit responses.'
                    : 'This form is draft. It cannot receive public submissions until published.'}
                </p>
              </div>

              {permissions.canPublishForm && (
                <button
                  onClick={() => saveFormMeta({ status: isPublished ? 'draft' : 'published' })}
                  className={`btn text-xs px-4 py-2 font-bold ${
                    isPublished ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {isPublished ? 'Unpublish to Draft' : 'Publish Form Now'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: WEBHOOKS & NOTIFICATIONS (Task 2) */}
        {tab === 'webhooks' && (
          <div className="card p-6 bg-white space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Webhook className="h-5 w-5 text-indigo-600" />
                Webhooks & Real-Time Notifications
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Receive instant HTTP POST payloads whenever a respondent submits this form.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Destination Webhook URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://webhook.site/your-endpoint or https://api.mycompany.com/webhook"
                    value={form.webhook_url || ''}
                    disabled={!permissions.canManageWebhooks}
                    onChange={(e) => saveFormMeta({ webhook_url: e.target.value })}
                    className="input font-mono text-xs"
                  />
                  {permissions.canManageWebhooks && (
                    <button
                      onClick={handleTestWebhook}
                      disabled={testingWebhook || !form.webhook_url}
                      className="btn-secondary text-xs shrink-0 flex items-center gap-1.5"
                    >
                      {testingWebhook ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      Test Ping
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  We send a JSON payload with <code>event: 'form_response.created'</code>, response ID, timestamp, and all answer pairs.
                </p>
              </div>

              {webhookResult && (
                <div className={`p-3 rounded-xl border text-xs font-mono ${
                  webhookResult.startsWith('✓')
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}>
                  {webhookResult}
                </div>
              )}

              <div>
                <label className="label">Submission Notification Email (Optional)</label>
                <input
                  type="email"
                  placeholder="alerts@company.com"
                  value={form.notify_email || ''}
                  disabled={!permissions.canManageWebhooks}
                  onChange={(e) => saveFormMeta({ notify_email: e.target.value })}
                  className="input text-xs"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Webhook JSON Payload Schema</h4>
                <pre className="text-[11px] font-mono text-slate-700 bg-white p-3 rounded-lg border border-slate-200 overflow-x-auto">
{`{
  "event": "form_response.created",
  "timestamp": "2026-10-22T03:00:00.000Z",
  "form": {
    "id": "${form.id}",
    "title": "${form.title}",
    "slug": "${form.slug}"
  },
  "response": {
    "id": "resp_xyz",
    "submitted_at": "2026-10-22T03:00:00.000Z",
    "answers": {
      "question_id": "Respondent value"
    }
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FormBuilderPage;
