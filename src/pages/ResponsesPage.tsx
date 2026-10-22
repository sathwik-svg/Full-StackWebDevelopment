import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Inbox,
  Loader2,
  Trash2,
  Download,
  BarChart3,
  ListFilter,
  CheckCircle,
  FileSpreadsheet,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { supabase, type Form, type Question, type ResponseRow } from '@/lib/supabase';
import { useNavigate } from '@/lib/router';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { downloadResponsesCSV } from '@/lib/export';
import { AnalyticsCharts } from '@/components/AnalyticsCharts';

export function ResponsesPage({ formId }: { formId: string }) {
  const navigate = useNavigate();
  const { role, permissions } = useAuth();
  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'submissions' | 'analytics'>('analytics');
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

    const respList = (rData || []) as ResponseRow[];
    setResponses(respList);
    if (respList.length > 0 && !selectedId) {
      setSelectedId(respList[0].id);
    }
    setLoading(false);
  }, [formId, selectedId]);

  useEffect(() => {
    load();
  }, [load]);

  // Task 2: CSV Export
  function handleExportCSV() {
    if (!form || responses.length === 0) return;
    const { count, filename } = downloadResponsesCSV(form, questions, responses);
    setToastMsg(`Exported ${count} responses to ${filename}`);
    setTimeout(() => setToastMsg(''), 3500);
  }

  async function deleteResponse(id: string) {
    if (!permissions.canDeleteResponse) {
      setError('Security policy: Only Admin users can delete responses to preserve audit integrity.');
      setConfirmDeleteId(null);
      return;
    }

    const { error: err } = await supabase.from('responses').delete().eq('id', id);
    if (err) {
      setError(err.message);
      return;
    }
    const updated = responses.filter((r) => r.id !== id);
    setResponses(updated);
    setSelectedId(updated.length > 0 ? updated[0].id : null);
    setConfirmDeleteId(null);
    setToastMsg('Response deleted.');
    setTimeout(() => setToastMsg(''), 2500);
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

  const selected = responses.find((r) => r.id === selectedId);

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ name: 'dashboard' })}
              className="btn-ghost p-2 text-slate-600 hover:text-slate-900"
              title="Back to Dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{form.title}</h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {responses.length} {responses.length === 1 ? 'submission' : 'submissions'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect submissions, analyze trends, or export to CSV spreadsheet.
              </p>
            </div>
          </div>

          {/* Tab & Actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5 text-indigo-600" />
                Analytics Charts
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'submissions' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListFilter className="h-3.5 w-3.5 text-slate-600" />
                Individual Answers
              </button>
            </div>

            {/* Task 2: CSV Export Button */}
            <button
              onClick={handleExportCSV}
              disabled={responses.length === 0}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50"
              title="Export all submissions to CSV"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Notifications & Toast */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold text-red-400">✕</button>
          </div>
        )}

        {toastMsg && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800 flex items-center justify-between animate-fade-in">
            <span className="flex items-center gap-1.5 font-semibold">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              {toastMsg}
            </span>
            <button onClick={() => setToastMsg('')} className="font-bold text-emerald-500">✕</button>
          </div>
        )}

        {/* Content Tabs */}
        {responses.length === 0 ? (
          <div className="card p-12 text-center bg-white">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 mb-4">
              <Inbox className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No responses recorded yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Make sure your form is published and share your link or embed widget on your website to start collecting submissions.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => navigate({ name: 'builder', formId: form.id })}
                className="btn-secondary text-xs"
              >
                Open Form Builder
              </button>
              {form.status === 'published' && (
                <button
                  onClick={() => navigate({ name: 'public', slug: form.slug })}
                  className="btn-primary text-xs"
                >
                  Open Live Chat Form
                </button>
              )}
            </div>
          </div>
        ) : activeTab === 'analytics' ? (
          /* TAB: Analytics Charts (Task 2) */
          <AnalyticsCharts form={form} questions={questions} responses={responses} />
        ) : (
          /* TAB: Master-Detail Individual Submissions */
          <div className="grid lg:grid-cols-[320px_1fr] gap-5">
            {/* Left Column: Submissions List */}
            <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-1">
              {responses.map((r, i) => {
                const firstAnswer = questions.length > 0 ? (r.answers?.[questions[0].id] || '—') : 'Submission';
                const isSelected = selectedId === r.id;

                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    className={`w-full text-left card p-4 transition-all ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-100 bg-white shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="font-semibold text-slate-500">#{responses.length - i}</span>
                      <span>{formatDate(r.created_at)}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {firstAnswer}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 truncate">
                      ID: {r.id.slice(0, 12)}...
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Detailed Breakdown */}
            <div className="card p-6 bg-white border border-slate-200 min-h-[400px]">
              {selected ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Submission Details</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Recorded on {formatDate(selected.created_at)} · ID: <code className="font-mono text-slate-600">{selected.id}</code>
                      </p>
                    </div>

                    {/* Delete Response (Admin Only) */}
                    {confirmDeleteId === selected.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => deleteResponse(selected.id)}
                          className="btn-danger text-xs py-1 px-3 font-bold"
                        >
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="btn-ghost text-xs py-1 px-2 text-slate-500"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (!permissions.canDeleteResponse) {
                            setError('Only Admin users are permitted to delete submissions to protect data integrity.');
                            return;
                          }
                          setConfirmDeleteId(selected.id);
                        }}
                        disabled={!permissions.canDeleteResponse}
                        className={`text-xs p-2 rounded-lg flex items-center gap-1 transition ${
                          permissions.canDeleteResponse
                            ? 'text-red-500 hover:bg-red-50 hover:text-red-700'
                            : 'text-slate-300 cursor-not-allowed'
                        }`}
                        title={permissions.canDeleteResponse ? 'Delete submission' : 'Only Admins can delete responses'}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-[11px]">Delete</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {questions.map((q, idx) => {
                      const answer = selected.answers?.[q.id] || '(No answer provided)';
                      return (
                        <div key={q.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-slate-700">{q.text}</span>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 ml-auto">
                              {q.type}
                            </span>
                          </div>
                          <div className="pl-7">
                            <p className="text-sm font-medium text-slate-900 bg-white p-2.5 rounded-lg border border-slate-200/80">
                              {answer}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
                  Select a submission on the left to view question details
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResponsesPage;
