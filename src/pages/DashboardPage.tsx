import { useCallback, useEffect, useState } from 'react';
import { Plus, FileText, Inbox, Pencil, Trash2, Eye, EyeOff, BarChart3, ArrowRight, ExternalLink, Loader2 } from 'lucide-react';
import { supabase, type Form } from '@/lib/supabase';
import { useNavigate } from '@/lib/router';
import { generateSlug, formatDate } from '@/lib/utils';

export function DashboardPage() {
  const navigate = useNavigate();
  const [forms, setForms] = useState<Form[]>([]);
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data: formsData, error: formsError } = await supabase
      .from('forms')
      .select('*')
      .order('created_at', { ascending: false });
    if (formsError) {
      setError(formsError.message);
      setLoading(false);
      return;
    }
    const formsList = (formsData || []) as Form[];
    setForms(formsList);

    const counts: Record<string, number> = {};
    await Promise.all(
      formsList.map(async (f) => {
        const { count } = await supabase
          .from('responses')
          .select('id', { count: 'exact', head: true })
          .eq('form_id', f.id);
        counts[f.id] = count || 0;
      })
    );
    setResponseCounts(counts);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createForm() {
    setCreating(true);
    setError('');
    const slug = generateSlug();
    const { data, error: err } = await supabase
      .from('forms')
      .insert({
        title: 'Untitled form',
        description: '',
        status: 'draft',
        slug,
      })
      .select()
      .single();
    setCreating(false);
    if (err) {
      setError(err.message);
      return;
    }
    navigate({ name: 'builder', formId: (data as Form).id });
  }

  async function togglePublish(form: Form) {
    const newStatus = form.status === 'published' ? 'draft' : 'published';
    const { error: err } = await supabase
      .from('forms')
      .update({ status: newStatus })
      .eq('id', form.id);
    if (err) {
      setError(err.message);
      return;
    }
    setForms((prev) => prev.map((f) => (f.id === form.id ? { ...f, status: newStatus } : f)));
  }

  async function deleteForm(id: string) {
    const { error: err } = await supabase.from('forms').delete().eq('id', id);
    if (err) {
      setError(err.message);
      setConfirmDelete(null);
      return;
    }
    setForms((prev) => prev.filter((f) => f.id !== id));
    setConfirmDelete(null);
  }

  const totalForms = forms.length;
  const totalResponses = Object.values(responseCounts).reduce((a, b) => a + b, 0);
  const publishedForms = forms.filter((f) => f.status === 'published').length;

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Create, manage, and publish your conversational forms.</p>
          </div>
          <button onClick={createForm} disabled={creating} className="btn-primary">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            New form
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total forms</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{totalForms}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Published</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{publishedForms}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <Eye className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total responses</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{totalResponses}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Inbox className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Forms list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : forms.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
              <FileText className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No forms yet</h3>
            <p className="text-sm text-slate-500 mt-1 mb-5">Create your first form to get started.</p>
            <button onClick={createForm} disabled={creating} className="btn-primary mx-auto">
              <Plus className="h-4 w-4" /> Create a form
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {forms.map((form) => (
              <div key={form.id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-base font-semibold text-slate-900 truncate">{form.title || 'Untitled form'}</h3>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${form.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {form.status === 'published' ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {form.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    {form.description && <p className="text-sm text-slate-500 mt-1 line-clamp-1">{form.description}</p>}
                    <p className="text-xs text-slate-400 mt-2">Created {formatDate(form.created_at)} · {responseCounts[form.id] || 0} responses</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => navigate({ name: 'builder', formId: form.id })} className="btn-ghost text-xs">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button onClick={() => navigate({ name: 'responses', formId: form.id })} className="btn-ghost text-xs">
                      <BarChart3 className="h-3.5 w-3.5" /> Responses
                      <span className="ml-0.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">{responseCounts[form.id] || 0}</span>
                    </button>
                    {form.status === 'published' && (
                      <>
                        <button onClick={() => navigate({ name: 'public', slug: form.slug })} className="btn-ghost text-xs">
                          <ExternalLink className="h-3.5 w-3.5" /> View
                        </button>
                        <button onClick={() => navigate({ name: 'embed-demo', formId: form.id })} className="btn-ghost text-xs">
                          <ArrowRight className="h-3.5 w-3.5" /> Embed
                        </button>
                      </>
                    )}
                    <button onClick={() => togglePublish(form)} className="btn-secondary text-xs">
                      {form.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button onClick={() => setConfirmDelete(form.id)} className="btn-danger text-xs">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in p-5" onClick={() => setConfirmDelete(null)}>
          <div className="card max-w-sm w-full p-6 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900">Delete this form?</h3>
            <p className="text-sm text-slate-500 mt-2">This will permanently delete the form, its questions, and all responses. This cannot be undone.</p>
            <div className="mt-6 flex gap-2 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => deleteForm(confirmDelete)} className="btn bg-red-600 text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
