import { useState } from 'react';
import { ArrowRight, MessageSquareText, Zap, BarChart3, Palette, Code2, Check } from 'lucide-react';
import { useNavigate } from '@/lib/router';
import { ChatbotWidget } from '@/components/ChatbotWidget';
import type { Form, Question } from '@/lib/supabase';

const demoForm: Form = {
  id: 'demo',
  title: 'Quick Feedback Survey',
  description: '',
  status: 'published',
  welcome_text: 'Hi there! We would love your quick feedback. It only takes a minute.',
  theme_color: '#2563eb',
  slug: 'demo',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const demoQuestions: Question[] = [
  { id: 'dq1', form_id: 'demo', text: "What's your name?", type: 'text', options: [], required: true, position: 0, created_at: '' },
  { id: 'dq2', form_id: 'demo', text: 'What email can we reach you at?', type: 'email', options: [], required: true, position: 1, created_at: '' },
  { id: 'dq3', form_id: 'demo', text: 'How did you hear about us?', type: 'multiple_choice', options: ['Friend', 'Social media', 'Search', 'Other'], required: false, position: 2, created_at: '' },
  { id: 'dq4', form_id: 'demo', text: 'Would you recommend us to a friend?', type: 'yes_no', options: [], required: true, position: 3, created_at: '' },
];

const features = [
  { icon: MessageSquareText, title: 'Conversational chatbot widget', desc: 'Display questions one at a time in a chat interface. Visitors answer naturally, like a real conversation.' },
  { icon: Zap, title: 'Drag-free reorder & live preview', desc: 'Add, edit, reorder and delete questions. Preview exactly what respondents will see before you publish.' },
  { icon: BarChart3, title: 'Response dashboard', desc: 'Every submission is saved with a timestamp. Open any form to browse individual responses in detail.' },
  { icon: Palette, title: 'Customizable look & feel', desc: 'Set your brand color and a custom welcome message. The widget adapts to match your site instantly.' },
  { icon: Code2, title: 'One-line embed snippet', desc: 'Drop a single script tag onto any website. The floating widget works on desktop and mobile out of the box.' },
  { icon: Check, title: 'Validation built in', desc: 'Required fields, email format checks and choice validation keep your data clean with zero effort.' },
];

const steps = [
  { n: '01', title: 'Build your form', desc: 'Create a form in the dashboard and add questions — text, email, multiple choice, or yes/no.' },
  { n: '02', title: 'Publish & get a link', desc: 'Publish your form to generate a unique public URL and an embed snippet for your chatbot widget.' },
  { n: '03', title: 'Collect responses', desc: 'Visitors answer through the chatbot. Submissions land in your dashboard, ready to review.' },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [demoKey, setDemoKey] = useState(0);

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #3b82f6 0, transparent 45%), radial-gradient(circle at 80% 30%, #06b6d4 0, transparent 45%), radial-gradient(circle at 50% 80%, #8b5cf6 0, transparent 40%)' }} />
        <div className="relative mx-auto max-w-6xl px-5 py-24 md:py-32">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-blue-200 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" /> Conversational forms, reinvented
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Forms that feel like a <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">conversation</span>
            </h1>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-xl">
              Build interactive forms and embed a chatbot widget on any website. Collect responses one question at a time and manage everything from a clean dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => navigate({ name: 'dashboard' })} className="btn bg-white text-slate-900 hover:bg-slate-100">
                Get started free <ArrowRight className="h-4 w-4" />
              </button>
              <a href="#demo" className="btn border border-white/20 text-white hover:bg-white/5">Try the live demo</a>
            </div>
            <div className="mt-8 flex items-center gap-5 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-blue-400" /> No sign-up needed</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-blue-400" /> Embed anywhere</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-blue-400" /> Mobile ready</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Everything you need to collect answers</h2>
          <p className="mt-4 text-slate-500 text-lg">A focused toolkit for building, embedding, and reviewing conversational forms.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white group-hover:scale-105 transition-transform">
                <f.icon className="h-5.5 w-5.5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-slate-50 border-y border-slate-200">
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">How it works</h2>
            <p className="mt-4 text-slate-500 text-lg">Three steps from idea to live form.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="relative card p-7">
                <span className="text-4xl font-extrabold text-slate-200">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live demo */}
      <section id="demo" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">See the chatbot widget in action</h2>
            <p className="mt-4 text-slate-500 text-lg leading-relaxed">
              This is a real, working form rendered through the same chatbot widget you can embed on your own site. Try answering the questions — responses are saved live.
            </p>
            <ul className="mt-6 space-y-3">
              {['One question at a time', 'Built-in validation', 'Custom welcome message & colors', 'Works on any screen size'].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600"><Check className="h-3.5 w-3.5" /></span>
                  {t}
                </li>
              ))}
            </ul>
            <button onClick={() => setDemoKey((k) => k + 1)} className="mt-6 btn-secondary">Restart demo</button>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <ChatbotWidget
                key={demoKey}
                form={demoForm}
                questions={demoQuestions}
                embedded
                onSubmit={async () => ({ success: true })}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to build your first form?</h2>
          <p className="mt-4 text-slate-300 text-lg">Create a form, publish it, and embed the widget — all in a few minutes.</p>
          <button onClick={() => navigate({ name: 'dashboard' })} className="mt-8 btn bg-white text-slate-900 hover:bg-slate-100">
            Open the dashboard <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
