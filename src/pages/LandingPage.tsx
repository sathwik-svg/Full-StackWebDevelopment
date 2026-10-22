import { useState } from 'react';
import {
  ArrowRight,
  MessageSquareText,
  Zap,
  BarChart3,
  Palette,
  Code2,
  Check,
  Star,
  Layers,
  FileSpreadsheet,
  Webhook,
  Shield,
  Calendar,
} from 'lucide-react';
import { useNavigate } from '@/lib/router';
import { ChatbotWidget } from '@/components/ChatbotWidget';
import type { Form, Question } from '@/lib/supabase';

const demoForm: Form = {
  id: 'demo-v2',
  title: 'Interactive Formflow Demo',
  description: 'Experience conversational surveys with advanced question types',
  status: 'published',
  welcome_text: 'Hi there! Experience Formflow v2 conversational forms with ratings, dropdowns, and dates. Ready?',
  completion_text: 'Awesome job! You just completed a conversational form. Jump into the dashboard to create your own!',
  theme_color: '#4f46e5',
  bot_name: 'Formflow Concierge',
  bot_avatar: 'sparkles',
  launcher_position: 'bottom-right',
  sound_enabled: true,
  slug: 'demo',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const demoQuestions: Question[] = [
  {
    id: 'dq1',
    form_id: 'demo-v2',
    text: "What's your name?",
    type: 'text',
    options: [],
    required: true,
    position: 0,
    placeholder: 'Alex Morgan',
    created_at: '',
  },
  {
    id: 'dq2',
    form_id: 'demo-v2',
    text: 'Overall, how would you rate conventional survey forms?',
    type: 'rating',
    options: [],
    required: true,
    position: 1,
    validation: {
      ratingScale: 5,
      ratingStyle: 'stars',
      lowRatingLabel: 'Tedious',
      highRatingLabel: 'Fun & Engaging',
    },
    created_at: '',
  },
  {
    id: 'dq3',
    form_id: 'demo-v2',
    text: 'Which Task 2 capability are you most eager to test?',
    type: 'dropdown',
    options: [
      'Advanced Question Types (Rating, Dropdown, Date)',
      'Real-Time Analytics & CSV Export',
      'Templates & 1-Click Duplication',
      'Secure Role-Based Access Control (RBAC)',
      'Outbound Webhooks & Notifications',
    ],
    required: true,
    placeholder: 'Select a feature...',
    position: 2,
    created_at: '',
  },
  {
    id: 'dq4',
    form_id: 'demo-v2',
    text: 'What email can we send the demo summary to?',
    type: 'email',
    options: [],
    required: false,
    placeholder: 'alex@example.com',
    position: 3,
    created_at: '',
  },
  {
    id: 'dq5',
    form_id: 'demo-v2',
    text: 'Ready to build conversational forms on your site?',
    type: 'yes_no',
    options: [],
    required: true,
    position: 4,
    created_at: '',
  },
];

const features = [
  {
    icon: MessageSquareText,
    title: 'Advanced Question Types',
    desc: 'Dropdown selectors, interactive star & number ratings, and HTML5 date pickers with min/max validation rules.',
  },
  {
    icon: BarChart3,
    title: 'Visual Analytics & Charts',
    desc: 'Response timelines, rating distribution breakdown, choice percentage bars, and question drop-off funnels.',
  },
  {
    icon: FileSpreadsheet,
    title: 'RFC 4180 CSV Export',
    desc: 'Download all form submissions as cleanly formatted spreadsheets with timestamps and mapped question headers.',
  },
  {
    icon: Layers,
    title: 'Curated Template Library',
    desc: 'One-click starter templates for CSAT, Event Registration, Bug Reports, Candidate Screening, and Sales Leads.',
  },
  {
    icon: Shield,
    title: 'Secure Role-Based Access',
    desc: 'Admin, Creator, and Viewer roles backed by Supabase Row-Level Security policies and immutable audit trails.',
  },
  {
    icon: Webhook,
    title: 'Real-Time Webhooks',
    desc: 'Configure outbound webhooks with automated retries, test ping delivery verification, and JSON payload logs.',
  },
];

const steps = [
  {
    n: '01',
    title: 'Choose a Template or Blank Form',
    desc: 'Start from scratch or pick a pre-configured template with dropdowns, ratings, dates, and validation rules.',
  },
  {
    n: '02',
    title: 'Customize Look & Webhooks',
    desc: 'Tune your brand colors, bot persona, audio effects, and specify an endpoint to receive real-time webhook pings.',
  },
  {
    n: '03',
    title: 'Collect, Analyze & Export',
    desc: 'Respondents answer in a conversational flow. Inspect live analytics charts and export complete datasets to CSV.',
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [demoKey, setDemoKey] = useState(0);

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #4f46e5 0, transparent 45%), radial-gradient(circle at 80% 30%, #06b6d4 0, transparent 45%), radial-gradient(circle at 50% 80%, #9333ea 0, transparent 40%)',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-5 py-24 md:py-32">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 mb-6 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Formflow Task 2 · Advanced Conversational Forms
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Forms that feel like a{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                conversation
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-xl">
              Build interactive conversational forms with dropdowns, star ratings, date pickers, instant duplication, analytics charts, CSV export, webhooks, and secure RBAC.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate({ name: 'dashboard' })}
                className="btn bg-white text-slate-900 hover:bg-slate-100 shadow-md font-bold"
              >
                Open Dashboard <ArrowRight className="h-4 w-4" />
              </button>
              <a href="#demo" className="btn border border-white/20 text-white hover:bg-white/5">
                Try the live demo
              </a>
            </div>
            <div className="mt-8 flex items-center gap-5 text-sm text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-400" /> Star Ratings & Dates
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-400" /> Webhooks & CSV Export
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-400" /> Supabase RLS Protected
              </span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Engineered for high-converting survey flows
          </h2>
          <p className="mt-4 text-slate-500 text-lg">
            A comprehensive suite of conversational tools for modern product teams, recruiters, and marketers.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="card p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 group bg-white"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white group-hover:scale-105 transition-transform shadow-xs">
                <f.icon className="h-5.5 w-5.5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">{f.title}</h3>
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
            <p className="mt-4 text-slate-500 text-lg">Three streamlined steps from idea to live deployment.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="relative card p-7 bg-white">
                <span className="text-4xl font-extrabold text-indigo-100">{s.n}</span>
                <h3 className="mt-3 text-lg font-bold text-slate-900">{s.title}</h3>
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
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 block mb-2">
              Interactive Test Drive
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Try the enhanced Task 2 chatbot widget
            </h2>
            <p className="mt-4 text-slate-500 text-base leading-relaxed">
              This live widget demonstrates the new question types: star ratings, searchable dropdown choices, and validation rules with conversational audio synthesis.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Interactive star rating & number scales',
                'Searchable dropdown option menus',
                'Inline validation & error prevention',
                'Audio feedback synthesized in-browser',
              ].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center gap-3">
              <button onClick={() => setDemoKey((k) => k + 1)} className="btn-secondary text-xs">
                Restart demo
              </button>
              <button onClick={() => navigate({ name: 'dashboard' })} className="btn-primary text-xs">
                Open Dashboard →
              </button>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white">
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
          <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to deploy your next conversational form?</h2>
          <p className="mt-4 text-slate-300 text-base">
            Create custom forms, clone templates, and embed lightweight widgets in minutes.
          </p>
          <button
            onClick={() => navigate({ name: 'dashboard' })}
            className="mt-8 btn bg-white text-slate-900 hover:bg-slate-100 shadow-lg font-bold"
          >
            Launch Formflow Dashboard <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
