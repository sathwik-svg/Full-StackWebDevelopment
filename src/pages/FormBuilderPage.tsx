import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, GripVertical, Eye, Save, Loader2, Copy, Check, Settings, MessageCircle } from 'lucide-react';
import { supabase, type Form, type Question, type QuestionType } from '@/lib/supabase';
import { useNavigate } from '@/lib/router';
import { ChatbotWidget } from '@/components/ChatbotWidget';

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'text', label: 'Short text' },
  { value: 'email', label: 'Email' },
  { value: 'multiple_choice', label: 'Multiple choice' },
  { value: 'yes_no', label: 'Yes / No' },
];

export function FormBuilderPage({ formId }: { formId: string }) {
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingForm, setSavingForm] = useState(false);
  const [tab, setTab] = useState<'build' | 'preview' | 'settings'>('build');
  const [error, setError] = useState('');
  const [copiedSlug, setCopiedSlug] = useState(false);

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
    setSavingForm(true);
    const { error: err } = await supabase.from('forms').update(patch).eq('id', form.id);
    setSavingForm(false);
    if (err) {
      setError(err.message);
      return;
    }
    setForm({ ...form, ...patch });
  }

  async function addQuestion() {
    if (!form) return;
    const newPosition = questions.length;
    const { data, error: err } = await supabase
      .from('questions')
      .insert({
        form_id: form.id,
        text: 'New question',
        type: 'text',
        options: [],
        required: false,
        position: newPosition,
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
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
    const { error: err } = await supabase.from('questions').update(patch).eq('id', id);
    if (err) setError(err.message);
  }

  async function deleteQuestion(id: string) {
    const { error: err } = await supabase.from('questions').delete().eq('id', id);
    if (err) {
      setError(err.message);
      return;
    }
    const remaining = questions.filter((q) => q.id !== id);
    await reorder(remaining);
  }

  async function moveQuestion(index: number, dir: -1 | 1) {
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
          <button onClick={() => navigate({ name: 'dashboard' })} className="btn-secondary mt-4">Back to dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate({ name: 'dashboard' })} className="btn-ghost px-2.5">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{form.title || 'Untitled form'}</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {form.status === 'published' ? (
                  <span className="inline-flex items-center gap-1 text-green-600"><Eye className="h-3 w-3" /> Published</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-500">Draft</span>
                )}
                {' · '}{questions.length} questions
              </p>
            </div>
          </div>
          {form.status === 'published' && (
            <button onClick={copyPublicUrl} className="btn-secondary text-xs">
              {copiedSlug ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
              Copy public link
            </button>
          )}
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200 mb-6">
          {([
            { key: 'build', label: 'Questions', icon: Plus },
            { key: 'preview', label: 'Preview', icon: Eye },
            { key: 'settings', label: 'Settings', icon: Settings },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition ${tab === t.key ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {/* Build tab */}
        {tab === 'build' && (
          <div className="space-y-3">
            {questions.length === 0 && (
              <div className="card p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 mb-3">
                  <Plus className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">No questions yet</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">Add your first question to get started.</p>
              </div>
            )}
            {questions.map((q, i) => (
              <div key={q.id} className="card p-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-0.5 pt-2">
                    <button onClick={() => moveQuestion(i, -1)} disabled={i === 0} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition"><ChevronUp className="h-4 w-4" /></button>
                    <GripVertical className="h-4 w-4 text-slate-300" />
                    <button onClick={() => moveQuestion(i, 1)} disabled={i === questions.length - 1} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition"><ChevronDown className="h-4 w-4" /></button>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">{i + 1}</span>
                      <input
                        value={q.text}
                        onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                        placeholder="Question text"
                        className="input flex-1 font-medium"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 pl-8">
                      <select
                        value={q.type}
                        onChange={(e) => updateQuestion(q.id, { type: e.target.value as QuestionType, options: e.target.value === 'multiple_choice' ? q.options.length ? q.options : ['Option 1'] : [] })}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-slate-400 outline-none"
                      >
                        {QUESTION_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                        />
                        Required
                      </label>
                      <button onClick={() => deleteQuestion(q.id)} className="ml-auto btn-danger text-xs px-2.5 py-1.5">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {q.type === 'multiple_choice' && (
                      <div className="pl-8 space-y-2">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <input
                              value={opt}
                              onChange={(e) => {
                                const next = [...q.options];
                                next[oi] = e.target.value;
                                updateQuestion(q.id, { options: next });
                              }}
                              placeholder={`Option ${oi + 1}`}
                              className="input flex-1 py-2"
                            />
                            <button
                              onClick={() => updateQuestion(q.id, { options: q.options.filter((_, idx) => idx !== oi) })}
                              className="btn-ghost px-2 py-2"
                              disabled={q.options.length <= 1}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => updateQuestion(q.id, { options: [...q.options, `Option ${q.options.length + 1}`] })}
                          className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add option
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addQuestion} className="w-full rounded-xl border-2 border-dashed border-slate-300 py-4 text-sm font-medium text-slate-500 hover:border-slate-400 hover:text-slate-700 transition flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" /> Add question
            </button>
          </div>
        )}

        {/* Preview tab */}
        {tab === 'preview' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="h-5 w-5 text-slate-900" />
                <h3 className="text-base font-semibold text-slate-900">Chatbot widget preview</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">This is exactly what visitors see when they open your form.</p>
              <div className="flex justify-center">
                <div className="w-full max-w-sm">
                  <ChatbotWidget
                    key={questions.map((q) => q.id + q.text + q.type + JSON.stringify(q.options)).join(',')}
                    form={form}
                    questions={questions}
                    embedded
                    onSubmit={async () => ({ success: true })}
                  />
                </div>
              </div>
            </div>
            <div className="card p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4">Form summary</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <dt className="text-slate-500">Title</dt>
                  <dd className="font-medium text-slate-900">{form.title || 'Untitled'}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <dt className="text-slate-500">Questions</dt>
                  <dd className="font-medium text-slate-900">{questions.length}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <dt className="text-slate-500">Status</dt>
                  <dd className="font-medium text-slate-900">{form.status}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <dt className="text-slate-500">Public link</dt>
                  <dd className="font-medium text-slate-900 text-right truncate max-w-[180px]">/f/{form.slug}</dd>
                </div>
              </dl>
              <button
                onClick={() => navigate({ name: 'embed-demo', formId: form.id })}
                disabled={form.status !== 'published'}
                className="btn-secondary mt-5 w-full text-sm"
              >
                {form.status === 'published' ? 'View embed demo' : 'Publish to embed'}
              </button>
            </div>
          </div>
        )}

        {/* Settings tab */}
        {tab === 'settings' && (
          <div className="max-w-xl space-y-5">
            <div className="card p-6 space-y-4">
              <h3 className="text-base font-semibold text-slate-900">Form details</h3>
              <div>
                <label className="label">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  onBlur={(e) => saveFormMeta({ title: e.target.value })}
                  className="input"
                  placeholder="Form title"
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  onBlur={(e) => saveFormMeta({ description: e.target.value })}
                  className="input min-h-[80px]"
                  placeholder="A short description shown to respondents"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-sm font-medium text-slate-700">Publish status</p>
                  <p className="text-xs text-slate-500 mt-0.5">{form.status === 'published' ? 'Publicly accessible' : 'Only visible to you'}</p>
                </div>
                <button
                  onClick={() => saveFormMeta({ status: form.status === 'published' ? 'draft' : 'published' })}
                  className={form.status === 'published' ? 'btn-secondary text-sm' : 'btn-primary text-sm'}
                >
                  {savingForm && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {form.status === 'published' ? 'Unpublish' : 'Publish form'}
                </button>
              </div>
            </div>

            <div className="card p-6 space-y-4">
              <h3 className="text-base font-semibold text-slate-900">Chatbot widget customization</h3>
              <div>
                <label className="label">Welcome message</label>
                <input
                  value={form.welcome_text}
                  onChange={(e) => setForm({ ...form, welcome_text: e.target.value })}
                  onBlur={(e) => saveFormMeta({ welcome_text: e.target.value })}
                  className="input"
                  placeholder="Greeting shown when the chatbot opens"
                />
              </div>
              <div>
                <label className="label">Theme color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.theme_color}
                    onChange={(e) => setForm({ ...form, theme_color: e.target.value })}
                    onBlur={(e) => saveFormMeta({ theme_color: e.target.value })}
                    className="h-10 w-14 rounded-lg border border-slate-200 cursor-pointer"
                  />
                  <input
                    value={form.theme_color}
                    onChange={(e) => setForm({ ...form, theme_color: e.target.value })}
                    onBlur={(e) => saveFormMeta({ theme_color: e.target.value })}
                    className="input flex-1"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">Used for the widget header, buttons, and launcher icon.</p>
              </div>
            </div>

            <div className="card p-6 space-y-3">
              <h3 className="text-base font-semibold text-slate-900">Sharing</h3>
              <p className="text-sm text-slate-500">Public URL respondents use to answer your form.</p>
              <div className="flex items-center gap-2">
                <input value={`${window.location.origin}/#/f/${form.slug}`} readOnly className="input flex-1 text-xs font-mono" />
                <button onClick={copyPublicUrl} className="btn-secondary text-xs">
                  {copiedSlug ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
