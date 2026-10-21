import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, ArrowLeft } from 'lucide-react';
import type { Form, Question } from '@/lib/supabase';

interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
}

interface ChatbotWidgetProps {
  form: Form;
  questions: Question[];
  onSubmit: (answers: Record<string, string>) => Promise<{ success: boolean; error?: string }>;
  embedded?: boolean;
}

export function ChatbotWidget({ form, questions, onSubmit, embedded = false }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(embedded);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [inputValue, setInputValue] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sortedQuestions = [...questions].sort((a, b) => a.position - b.position);
  const total = sortedQuestions.length;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ id: 'welcome', role: 'bot', text: form.welcome_text }]);
    }
  }, [isOpen, messages.length, form.welcome_text]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && currentIndex >= 0 && !done) {
      inputRef.current?.focus();
    }
  }, [isOpen, currentIndex, done]);

  function startQuestions() {
    if (total === 0) {
      setMessages((m) => [...m, { id: 'no-q', role: 'bot', text: 'This form has no questions yet.' }]);
      return;
    }
    setCurrentIndex(0);
    const q = sortedQuestions[0];
    setMessages((m) => [...m, { id: `q-${q.id}`, role: 'bot', text: q.text }]);
  }

  function handleStart() {
    setMessages((m) => [...m, { id: `user-start-${Date.now()}`, role: 'user', text: "Let's begin" }]);
    setTimeout(startQuestions, 400);
  }

  function pushUser(text: string) {
    setMessages((m) => [...m, { id: `user-${Date.now()}`, role: 'user', text }]);
  }
  function pushBot(text: string) {
    setMessages((m) => [...m, { id: `bot-${Date.now()}`, role: 'bot', text }]);
  }

  function validate(q: Question, value: string): string | null {
    if (q.required && !value.trim()) return 'This question is required.';
    if (q.type === 'email' && value.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Please enter a valid email address.';
    }
    return null;
  }

  function advance(currentQ: Question, value: string) {
    const err = validate(currentQ, value);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setAnswers((a) => ({ ...a, [currentQ.id]: value }));

    const nextIndex = currentIndex + 1;
    if (nextIndex >= total) {
      finish({ ...answers, [currentQ.id]: value });
    } else {
      setCurrentIndex(nextIndex);
      const nextQ = sortedQuestions[nextIndex];
      pushBot(nextQ.text);
    }
  }

  async function finish(allAnswers: Record<string, string>) {
    setSubmitting(true);
    const result = await onSubmit(allAnswers);
    setSubmitting(false);
    if (result.success) {
      setDone(true);
      setMessages((m) => [...m, { id: 'done', role: 'bot', text: 'Thanks for your responses! We appreciate your time.' }]);
    } else {
      pushBot(result.error || 'Something went wrong saving your response. Please try again.');
      setCurrentIndex(total - 1);
    }
  }

  function handleSubmitText(e: React.FormEvent) {
    e.preventDefault();
    if (currentIndex < 0 || done || submitting) return;
    const q = sortedQuestions[currentIndex];
    if (q.type === 'multiple_choice' || q.type === 'yes_no') return;
    pushUser(inputValue.trim());
    advance(q, inputValue.trim());
    setInputValue('');
  }

  function handleChoice(value: string) {
    if (currentIndex < 0 || done || submitting) return;
    const q = sortedQuestions[currentIndex];
    pushUser(value);
    advance(q, value);
  }

  function restart() {
    setMessages([{ id: 'welcome-restart', role: 'bot', text: form.welcome_text }]);
    setCurrentIndex(-1);
    setAnswers({});
    setError('');
    setDone(false);
    setInputValue('');
  }

  const currentQ = currentIndex >= 0 ? sortedQuestions[currentIndex] : null;
  const isWaitingForStart = isOpen && messages.length <= 1 && currentIndex === -1 && !done;
  const accent = form.theme_color || '#2563eb';

  const chatPanel = (
    <div
      className="flex flex-col bg-white"
      style={{
        width: embedded ? '100%' : 360,
        height: embedded ? '100%' : 520,
        maxHeight: embedded ? 'none' : 'calc(100vh - 120px)',
        borderRadius: embedded ? 0 : 16,
        boxShadow: embedded ? 'none' : '0 12px 40px rgba(0,0,0,0.18)',
        overflow: 'hidden',
        border: embedded ? 'none' : '1px solid #e2e8f0',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 text-white" style={{ backgroundColor: accent }}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <MessageCircle className="h-4.5 w-4.5" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">{form.title}</p>
            <p className="text-xs text-white/80 leading-tight">{done ? 'Complete' : currentIndex >= 0 ? `Question ${currentIndex + 1} of ${total}` : 'Online'}</p>
          </div>
        </div>
        {!embedded && (
          <button onClick={() => setIsOpen(false)} className="rounded-lg p-1.5 hover:bg-white/20 transition" aria-label="Close chat">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Progress bar */}
      {currentIndex >= 0 && !done && (
        <div className="h-1 w-full bg-slate-100">
          <div className="h-full transition-all duration-300" style={{ width: `${(currentIndex / total) * 100}%`, backgroundColor: accent }} />
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll bg-slate-50 px-3.5 py-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
            {m.role === 'bot' && (
              <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: accent }}>
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-white text-slate-900 rounded-br-sm shadow-sm border border-slate-100'
                  : 'bg-white text-slate-700 rounded-bl-sm shadow-sm border border-slate-100'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isWaitingForStart && (
          <div className="flex justify-end animate-fade-in-up">
            <button onClick={handleStart} className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90" style={{ backgroundColor: accent }}>
              Start
            </button>
          </div>
        )}

        {done && (
          <div className="flex justify-center pt-2 animate-fade-in-up">
            <button onClick={restart} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
              <ArrowLeft className="h-3.5 w-3.5" /> Start over
            </button>
          </div>
        )}

        {submitting && (
          <div className="flex justify-start animate-fade-in">
            <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: accent }}>
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            <div className="rounded-2xl rounded-bl-sm bg-white border border-slate-100 px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-1.5 text-xs font-medium text-red-600 bg-red-50 border-t border-red-100 animate-fade-in">
          {error}
        </div>
      )}

      {/* Input area */}
      {!done && (
        <div className="border-t border-slate-100 bg-white p-3">
          {currentQ && currentQ.type === 'multiple_choice' && (
            <div className="flex flex-wrap gap-2">
              {currentQ.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChoice(opt)}
                  disabled={submitting}
                  className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
          {currentQ && currentQ.type === 'yes_no' && (
            <div className="flex gap-2">
              <button onClick={() => handleChoice('Yes')} disabled={submitting} className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: accent }}>
                Yes
              </button>
              <button onClick={() => handleChoice('No')} disabled={submitting} className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
                No
              </button>
            </div>
          )}
          {currentQ && (currentQ.type === 'text' || currentQ.type === 'email') && (
            <form onSubmit={handleSubmitText} className="flex gap-2">
              <input
                ref={inputRef}
                type={currentQ.type === 'email' ? 'email' : 'text'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={submitting}
                placeholder={currentQ.type === 'email' ? 'you@example.com' : 'Type your answer...'}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition disabled:opacity-50"
              />
              <button type="submit" disabled={submitting || !inputValue.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white transition hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: accent }} aria-label="Send">
                <Send className="h-4 w-4" />
              </button>
            </form>
          )}
          {currentIndex < 0 && !isWaitingForStart && !submitting && (
            <p className="text-center text-xs text-slate-400 py-1">Chat ended</p>
          )}
        </div>
      )}
    </div>
  );

  if (embedded) return chatPanel;

  return (
    <>
      {/* Floating launcher button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 animate-fade-in"
          style={{ backgroundColor: accent }}
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">{chatPanel}</div>
      )}
    </>
  );
}

export default ChatbotWidget;
