import { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, Layers, Star, Calendar, CheckCircle2 } from 'lucide-react';
import { TEMPLATES, type FormTemplate } from '@/lib/templates';
import { createFormFromTemplate } from '@/lib/supabase';
import { useNavigate } from '@/lib/router';

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TemplateGalleryModal({ isOpen, onClose }: TemplateGalleryModalProps) {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate>(TEMPLATES[0]);
  const [creating, setCreating] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'feedback', label: 'Customer Feedback' },
    { id: 'registration', label: 'Events & Registration' },
    { id: 'support', label: 'Product & Bug Triage' },
    { id: 'hr', label: 'HR & Screening' },
    { id: 'sales', label: 'Sales & Lead Gen' },
  ];

  const filteredTemplates = filterCategory === 'all'
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === filterCategory);

  async function handleUseTemplate(template: FormTemplate) {
    setCreating(true);
    try {
      const created = await createFormFromTemplate(template.id);
      onClose();
      navigate({ name: 'builder', formId: created.id });
    } catch (err) {
      console.error('Failed to create form from template', err);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Formflow Template Library</h2>
              <p className="text-xs text-slate-500">Pick a pre-built conversational flow with advanced question types</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2 overflow-x-auto bg-white">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterCategory === cat.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="flex-1 grid md:grid-cols-[1.1fr_1.4fr] overflow-hidden">
          {/* Templates List */}
          <div className="p-4 border-r border-slate-200 overflow-y-auto space-y-2 bg-slate-50/30">
            {filteredTemplates.map((t) => {
              const isSelected = selectedTemplate.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-white ring-2 ring-indigo-100 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{t.title}</h3>
                    <span
                      className="h-3 w-3 rounded-full shrink-0 mt-1"
                      style={{ backgroundColor: t.theme_color }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-slate-500">
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md">{t.questions.length} questions</span>
                    <span className="capitalize text-slate-400">· {t.category}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Template Details & Questions Preview */}
          <div className="p-6 overflow-y-auto flex flex-col justify-between bg-white">
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="inline-block h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: selectedTemplate.theme_color }}
                  />
                  <h3 className="text-lg font-bold text-slate-900">{selectedTemplate.title}</h3>
                </div>
                <p className="text-xs text-slate-500">{selectedTemplate.description}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Greeting & Bot Persona</h4>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                  <p className="font-semibold text-slate-900">Bot Name: {selectedTemplate.bot_name}</p>
                  <p className="text-slate-600 italic">"{selectedTemplate.welcome_text}"</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Included Questions ({selectedTemplate.questions.length})</h4>
                  <span className="text-[11px] text-slate-400">Conversational sequence</span>
                </div>
                <div className="space-y-2">
                  {selectedTemplate.questions.map((q, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-700">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800">{q.text}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                            {q.type}
                          </span>
                          {q.required && (
                            <span className="text-[10px] text-red-500 font-medium">Required</span>
                          )}
                          {q.options && q.options.length > 0 && (
                            <span className="text-[10px] text-slate-400 truncate">
                              ({q.options.slice(0, 2).join(', ')}{q.options.length > 2 ? '...' : ''})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-end gap-3">
              <button onClick={onClose} className="btn-secondary text-xs">
                Cancel
              </button>
              <button
                onClick={() => handleUseTemplate(selectedTemplate)}
                disabled={creating}
                className="btn-primary text-xs flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <Sparkles className="h-4 w-4" />
                {creating ? 'Creating Form...' : 'Use This Template'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
