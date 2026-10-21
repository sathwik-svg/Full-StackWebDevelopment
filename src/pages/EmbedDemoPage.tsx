import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Code2, Copy, Check, ExternalLink, MessageCircle } from 'lucide-react';
import { supabase, type Form, type Question } from '@/lib/supabase';
import { useNavigate } from '@/lib/router';
import { ChatbotWidget } from '@/components/ChatbotWidget';

export function EmbedDemoPage({ formId }: { formId: string }) {
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
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
    setLoading(false);
  }, [formId]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(answers: Record<string, string>): Promise<{ success: boolean; error?: string }> {
    if (!form) return { success: false, error: 'Form not loaded' };
    const { error: err } = await supabase.from('responses').insert({
      form_id: form.id,
      answers,
    });
    if (err) return { success: false, error: err.message };
    return { success: true };
  }

  function copySnippet() {
    if (!form) return;
    const origin = window.location.origin;
    const snippet = `<script src="${origin}/formflow-widget.js" data-form-slug="${form.slug}" async></script>`;
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const origin = window.location.origin;
  const snippet = `<script src="${origin}/formflow-widget.js" data-form-slug="${form.slug}" async></script>`;

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate({ name: 'dashboard' })} className="btn-ghost px-2.5"><ArrowLeft className="h-4 w-4" /></button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Embed demo</h1>
            <p className="text-xs text-slate-500 mt-0.5">{form.title}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: instructions & snippet */}
          <div className="space-y-5">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Code2 className="h-5 w-5 text-slate-900" />
                <h3 className="text-base font-semibold text-slate-900">Embed snippet</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">Paste this script tag into the HTML of any website. The chatbot widget appears as a floating button in the bottom-right corner.</p>
              <div className="relative">
                <pre className="rounded-lg bg-slate-900 text-slate-100 p-4 text-xs overflow-x-auto leading-relaxed"><code>{snippet}</code></pre>
                <button onClick={copySnippet} className="absolute top-2 right-2 rounded-md bg-white/10 px-2.5 py-1.5 text-xs text-white hover:bg-white/20 transition flex items-center gap-1.5">
                  {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-3">How it works</h3>
              <ol className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">1</span>
                  <span>Add the script tag to your website's HTML, anywhere in the <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">&lt;body&gt;</code>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">2</span>
                  <span>The widget loads as a floating chat bubble in the corner. Visitors click to open it.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">3</span>
                  <span>Responses are saved to your dashboard automatically. No backend setup needed.</span>
                </li>
              </ol>
            </div>

            <div className="card p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-3">Live preview</h3>
              <p className="text-sm text-slate-500 mb-4">See exactly how the widget appears on an external website. Click the chat bubble to start.</p>
              <button onClick={() => navigate({ name: 'public', slug: form.slug })} className="btn-secondary text-sm">
                <ExternalLink className="h-3.5 w-3.5" /> Open public form page
              </button>
            </div>
          </div>

          {/* Right: mock website preview */}
          <div>
            <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
              {/* Fake browser chrome */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 border-b border-slate-200">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 ml-3">
                  <div className="rounded-md bg-white border border-slate-200 px-3 py-1 text-xs text-slate-400 truncate">https://your-website.com</div>
                </div>
              </div>
              {/* Mock page content */}
              <div className="relative min-h-[520px] bg-gradient-to-br from-slate-50 to-white p-8">
                <div className="max-w-md">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-slate-800">Your Website</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to our site</h2>
                  <p className="text-sm text-slate-500 leading-relaxed mb-5">This is a demo of how the Formflow chatbot widget looks embedded on a real website. The floating button in the corner opens the conversational form.</p>
                  <div className="space-y-2.5">
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-5/6" />
                    <div className="h-3 bg-slate-100 rounded w-4/6" />
                  </div>
                  <div className="mt-6 flex gap-2">
                    <div className="h-9 bg-slate-200 rounded-lg w-24" />
                    <div className="h-9 bg-slate-100 rounded-lg w-20" />
                  </div>
                </div>
                <p className="absolute bottom-4 left-8 text-xs text-slate-400">This is a mock page. The widget on the right is live and functional.</p>

                {/* The actual floating widget */}
                <ChatbotWidget form={form} questions={questions} onSubmit={submit} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
