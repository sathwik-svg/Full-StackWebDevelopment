import { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  FileText,
  Inbox,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  BarChart3,
  ArrowRight,
  ExternalLink,
  Loader2,
  Copy,
  Layers,
  Search,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { supabase, duplicateForm, type Form } from '@/lib/supabase';
import { useNavigate } from '@/lib/router';
import { generateSlug, formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { TemplateGalleryModal } from '@/components/TemplateGalleryModal';

export function DashboardPage() {
  const navigate = useNavigate();
  const { role, permissions } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [templatesOpen, setTemplatesOpen] = useState(false);

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
    if (!permissions.canCreateForm) {
      setError('Your current role (Viewer) does not have permission to create forms.');
      return;
    }

    setCreating(true);
    setError('');
    const slug = generateSlug();
    const { data, error: err } = await supabase
      .from('forms')
      .insert({
        title: 'Untitled form',
        description: '',
        status: 'draft',
        welcome_text: 'Hi! Mind answering a few quick questions?',
        completion_text: 'Thanks for your responses! We appreciate your time.',
        theme_color: '#2563eb',
        bot_name: 'Formflow Assistant',
        bot_avatar: 'message-circle',
        launcher_position: 'bottom-right',
        sound_enabled: true,
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

  // Task 2: Form Duplication
  async function handleDuplicate(e: React.MouseEvent, formId: string) {
    e.stopPropagation();
    if (!permissions.canDuplicateForm) {
      setError('Your current role does not have permission to duplicate forms.');
      return;
    }

    setDuplicatingId(formId);
    setError('');
    try {
      const { form: duplicated } = await duplicateForm(formId);
      setSuccessMsg(`Form duplicated successfully as "${duplicated.title}"`);
      await load();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Duplication failed');
    } finally {
      setDuplicatingId(null);
    }
  }

  async function togglePublish(e: React.MouseEvent, form: Form) {
    e.stopPropagation();
    if (!permissions.canPublishForm) {
      setError('Your current role does not have permission to modify form status.');
      return;
    }

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
    if (!permissions.canDeleteForm) {
      setError('Permission denied: Only Admin users are authorized to delete forms.');
      setConfirmDelete(null);
      return;
    }

    const { error: err } = await supabase.from('forms').delete().eq('id', id);
    if (err) {
      setError(err.message);
      setConfirmDelete(null);
      return;
    }
    setForms((prev) => prev.filter((f) => f.id !== id));
    setConfirmDelete(null);
    setSuccessMsg('Form deleted.');
    setTimeout(() => setSuccessMsg(''), 2500);
  }

  const filteredForms = forms.filter((f) => {
    const matchesQuery =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ? true : f.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  const totalForms = forms.length;
  const totalResponses = Object.values(responseCounts).reduce((a, b) => a + b, 0);
  const publishedForms = forms.filter((f) => f.status === 'published').length;

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-10">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 capitalize">
                Role: {role}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Create, duplicate, manage, and inspect your conversational forms.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setTemplatesOpen(true)}
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              <Layers className="h-4 w-4 text-indigo-500" />
              Templates
            </button>

            {permissions.canCreateForm ? (
              <button onClick={createForm} disabled={creating} className="btn-primary text-xs">
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                New form
              </button>
            ) : (
              <button
                disabled
                className="btn-secondary text-xs opacity-50 cursor-not-allowed"
                title="Viewer role cannot create forms"
              >
                <Plus className="h-4 w-4" />
                New form (Viewer read-only)
              </button>
            )}
          </div>
        </div>

        {/* Success & Error alerts */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold text-red-400 hover:text-red-700">✕</button>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-center justify-between animate-fade-in">
            <span>✓ {successMsg}</span>
            <button onClick={() => setSuccessMsg('')} className="font-bold text-emerald-400 hover:text-emerald-700">✕</button>
          </div>
        )}

        {/* Stats row */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total forms</span>
              <FileText className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-3">{totalForms}</p>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Published</span>
              <Eye className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-3">{publishedForms}</p>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total responses</span>
              <Inbox className="h-5 w-5 text-indigo-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-3">{totalResponses}</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="card p-3 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search forms by title, slug, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 outline-none focus:border-slate-400 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
            <span className="text-slate-400 font-medium mr-1">Status:</span>
            {(['all', 'published', 'draft'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md font-semibold capitalize transition ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Forms List */}
        {loading ? (
          <div className="card p-12 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
            <p className="text-sm text-slate-400 mt-2">Loading forms...</p>
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
              <Sparkles className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              {searchQuery ? 'No forms match your search' : 'No forms created yet'}
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'Try clearing the search query or status filter.'
                : 'Start from scratch or pick a ready-to-use template with advanced question types.'}
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => setTemplatesOpen(true)} className="btn-secondary text-xs">
                Browse Templates
              </button>
              {permissions.canCreateForm && (
                <button onClick={createForm} className="btn-primary text-xs">
                  Create blank form
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredForms.map((form) => {
              const respCount = responseCounts[form.id] || 0;
              const isPublished = form.status === 'published';

              return (
                <div
                  key={form.id}
                  className="card p-5 hover:shadow-md transition-shadow group flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className="mt-1 h-3.5 w-3.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: form.theme_color || '#2563eb' }}
                      title={`Theme: ${form.theme_color}`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => navigate({ name: 'builder', formId: form.id })}
                          className="text-base font-bold text-slate-900 hover:text-indigo-600 transition truncate text-left"
                        >
                          {form.title}
                        </button>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isPublished
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {form.status}
                        </span>
                        {form.webhook_url && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                            Webhook Active
                          </span>
                        )}
                      </div>

                      {form.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{form.description}</p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 flex-wrap">
                        <span>Slug: <code className="text-slate-600 bg-slate-100 px-1 py-0.5 rounded">/f/{form.slug}</code></span>
                        <span>·</span>
                        <span>Created {formatDate(form.created_at)}</span>
                        <span>·</span>
                        <span className="font-semibold text-slate-700">
                          {respCount} {respCount === 1 ? 'response' : 'responses'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {/* View Public Form */}
                    {isPublished && (
                      <button
                        onClick={() => navigate({ name: 'public', slug: form.slug })}
                        className="btn-ghost p-2 text-slate-600 hover:text-slate-900"
                        title="View Public Chatbot"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    )}

                    {/* View Responses / Analytics */}
                    <button
                      onClick={() => navigate({ name: 'responses', formId: form.id })}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                      title="Responses & Analytics"
                    >
                      <BarChart3 className="h-3.5 w-3.5 text-indigo-500" />
                      <span>{respCount}</span>
                    </button>

                    {/* Task 2: Duplicate Form */}
                    <button
                      onClick={(e) => handleDuplicate(e, form.id)}
                      disabled={duplicatingId === form.id || !permissions.canDuplicateForm}
                      className="btn-secondary text-xs py-1.5 px-2.5 flex items-center gap-1"
                      title={permissions.canDuplicateForm ? 'Duplicate Form & Questions' : 'Viewer cannot duplicate forms'}
                    >
                      {duplicatingId === form.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-slate-600" />
                      )}
                      <span className="hidden sm:inline">Duplicate</span>
                    </button>

                    {/* Edit Form */}
                    <button
                      onClick={() => navigate({ name: 'builder', formId: form.id })}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>

                    {/* Toggle publish */}
                    {permissions.canPublishForm && (
                      <button
                        onClick={(e) => togglePublish(e, form)}
                        className="btn-ghost p-2 text-slate-600 hover:text-slate-900"
                        title={isPublished ? 'Unpublish' : 'Publish'}
                      >
                        {isPublished ? <EyeOff className="h-4 w-4 text-amber-600" /> : <Eye className="h-4 w-4 text-emerald-600" />}
                      </button>
                    )}

                    {/* Delete Form (Admin only) */}
                    {confirmDelete === form.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => deleteForm(form.id)}
                          className="btn-danger text-xs py-1 px-2.5 font-bold"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="btn-ghost text-xs py-1 px-2 text-slate-500"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (!permissions.canDeleteForm) {
                            setError('Only users with Admin role can permanently delete forms.');
                            return;
                          }
                          setConfirmDelete(form.id);
                        }}
                        disabled={!permissions.canDeleteForm}
                        className={`p-2 rounded-lg transition ${
                          permissions.canDeleteForm
                            ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                            : 'text-slate-200 cursor-not-allowed'
                        }`}
                        title={permissions.canDeleteForm ? 'Delete form' : 'Requires Admin role to delete forms'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TemplateGalleryModal
        isOpen={templatesOpen}
        onClose={() => {
          setTemplatesOpen(false);
          load();
        }}
      />
    </div>
  );
}

export default DashboardPage;
