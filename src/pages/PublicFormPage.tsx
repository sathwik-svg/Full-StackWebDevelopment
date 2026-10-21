import { useCallback, useEffect, useState } from 'react';
import { Loader2, MessageCircle, AlertCircle } from 'lucide-react';
import { supabase, type Form, type Question } from '@/lib/supabase';
import { useNavigate } from '@/lib/router';
import { ChatbotWidget } from '@/components/ChatbotWidget';

export function PublicFormPage({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [widgetKey, setWidgetKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: formData, error: formErr } = await supabase
      .from('forms')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (formErr || !formData) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const f = formData as Form;
    if (f.status !== 'published') {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setForm(f);

    const { data: qData } = await supabase
      .from('questions')
      .select('*')
      .eq('form_id', f.id)
      .order('position', { ascending: true });
    setQuestions((qData || []) as Question[]);
    setLoading(false);
  }, [slug]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-5">
        <div className="text-center max-w-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Form not available</h1>
          <p className="text-sm text-slate-500 mt-2">This form may have been unpublished or doesn't exist. If you believe this is an error, contact the form owner.</p>
          <button onClick={() => navigate({ name: 'home' })} className="btn-secondary mt-6">Go home</button>
        </div>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <div className="mx-auto max-w-md w-full px-5 py-10 flex-1 flex flex-col">
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm mb-4" style={{ backgroundColor: form.theme_color }}>
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">{form.title}</h1>
          {form.description && <p className="text-sm text-slate-500 mt-2 leading-relaxed">{form.description}</p>}
        </div>
        <div className="flex-1 flex items-start justify-center">
          <div className="w-full">
            <ChatbotWidget
              key={widgetKey}
              form={form}
              questions={questions}
              embedded
              onSubmit={submit}
            />
          </div>
        </div>
        <div className="text-center mt-6">
          <button onClick={() => setWidgetKey((k) => k + 1)} className="text-xs text-slate-400 hover:text-slate-600 transition">
            Start over
          </button>
          <p className="text-xs text-slate-400 mt-3">Powered by Formflow</p>
        </div>
      </div>
    </div>
  );
}
