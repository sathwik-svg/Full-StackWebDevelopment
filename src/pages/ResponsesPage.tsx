import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Inbox, Loader2, Trash2 } from 'lucide-react';
import { supabase, type Form, type Question, type ResponseRow } from '@/lib/supabase';
import { useNavigate } from '@/lib/router';
import { formatDate } from '@/lib/utils';

export function ResponsesPage({ formId }: { formId: string }) {
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data: formData, error: formErr } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .maybeSingle();
    if (formErr || !formData) {
      setError('Form not found.');
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

    const { data: rData } = await supabase
      .from('responses')
      .select('*')
      .eq('form_id', formId)
      .order('created_at', { ascending: false });
    setResponses((rData || []) as ResponseRow[]);
    setLoading(false);
  }, [formId]);

  useEffect(() => {
    load();
  }, [load]);

  async function deleteResponse(id: string) {
    const { error: err } = await supabase.from('responses').delete().eq('id', id);
    if (err) {
      setError(err.message);
      return;
    }
    setResponses((prev) => prev.filter((r) => r.id !== id));
    setSelectedId(null);
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
          <p className="text-slate-500">{error}</p>
          <button onClick={() => navigate({ name: 'dashboard' })} className="btn-secondary mt-4">Back to dashboard</button>
        </div>
      </div>
    );
  }

  const selected = responses.find((r) => r.id === selectedId);

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate({ name: 'dashboard' })} className="btn-ghost px-2.5"><ArrowLeft className="h-4 w-4" /></button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Responses</h1>
            <p className="text-xs text-slate-500 mt-0.5">{form.title} · {responses.length} total</p>
          </div>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {responses.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
              <Inbox className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No responses yet</h3>
            <p className="text-sm text-slate-500 mt-1">Publish your form and share the link to start collecting answers.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[300px_1fr] gap-5">
            {/* List */}
            <div className="space-y-2">
              {responses.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`w-full text-left card p-4 transition hover:shadow-md ${selectedId === r.id ? 'ring-2 ring-slate-900 border-slate-300' : ''}`}
                >
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {questions.length > 0 ? (r.answers[questions[0].id] || '—') : 'Response'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{formatDate(r.created_at)}</p>
                </button>
              ))}
            </div>

            {/* Detail */}
            <div className="card p-6">
              {selected ? (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Submission details</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{formatDate(selected.created_at)}</p>
                    </div>
                    <button onClick={() => deleteResponse(selected.id)} className="btn-danger text-xs">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                  <dl className="divide-y divide-slate-100">
                    {questions.map((q, i) => (
                      <div key={q.id} className="py-3.5">
                        <dt className="text-xs font-medium text-slate-500">
                          {i + 1}. {q.text}
                          {q.required && <span className="text-red-500 ml-0.5">*</span>}
                        </dt>
                        <dd className="text-sm text-slate-900 mt-1 break-words">
                          {selected.answers[q.id] ? (
                            <span className="inline-block rounded-md bg-slate-50 border border-slate-100 px-2.5 py-1.5">
                              {selected.answers[q.id]}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">No answer</span>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Inbox className="h-10 w-10 text-slate-300 mb-3" />
                  <p className="text-sm text-slate-500">Select a response to view its details.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
