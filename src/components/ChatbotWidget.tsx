import { useEffect, useRef, useState, useId } from 'react';
import {
  MessageCircle,
  X,
  Send,
  ArrowLeft,
  Bot,
  Sparkles,
  Headset,
  User,
  Star,
  Calendar,
  Volume2,
  VolumeX,
  ChevronDown,
  Search,
} from 'lucide-react';
import type { Form, Question, BotAvatar } from '@/lib/supabase';
import { playChatSound } from '@/lib/sound';
import { dispatchWebhook } from '@/lib/webhooks';

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
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [soundMuted, setSoundMuted] = useState(form.sound_enabled === false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sortedQuestions = [...questions].sort((a, b) => a.position - b.position);
  const total = sortedQuestions.length;

  // Auto-popup timer if configured
  useEffect(() => {
    if (!embedded && !isOpen && form.auto_popup_delay && form.auto_popup_delay > 0) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, form.auto_popup_delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [embedded, isOpen, form.auto_popup_delay]);

  // Initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ id: 'welcome', role: 'bot', text: form.welcome_text }]);
      if (!soundMuted) playChatSound('receive');
    }
  }, [isOpen, messages.length, form.welcome_text, soundMuted]);

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, submitting]);

  // Focus input on active text/email question
  useEffect(() => {
    if (isOpen && currentIndex >= 0 && !done) {
      inputRef.current?.focus();
    }
  }, [isOpen, currentIndex, done]);

  function triggerSound(type: 'send' | 'receive' | 'complete') {
    if (!soundMuted) {
      playChatSound(type);
    }
  }

  function startQuestions() {
    if (total === 0) {
      setMessages((m) => [...m, { id: 'no-q', role: 'bot', text: 'This form has no questions yet.' }]);
      return;
    }
    setCurrentIndex(0);
    const q = sortedQuestions[0];
    setMessages((m) => [...m, { id: `q-${q.id}`, role: 'bot', text: q.text }]);
    triggerSound('receive');
  }

  function handleStart() {
    setMessages((m) => [...m, { id: `user-start-${Date.now()}`, role: 'user', text: "Let's begin" }]);
    triggerSound('send');
    setTimeout(startQuestions, 350);
  }

  function pushUser(text: string) {
    setMessages((m) => [...m, { id: `user-${Date.now()}`, role: 'user', text }]);
    triggerSound('send');
  }

  function pushBot(text: string) {
    setMessages((m) => [...m, { id: `bot-${Date.now()}`, role: 'bot', text }]);
    triggerSound('receive');
  }

  // --- Complete Validation Engine (Task 2) ---
  function validate(q: Question, value: string): string | null {
    const val = value.trim();

    // 1. Required check
    if (q.required && !val) {
      return 'This question is required. Please provide an answer.';
    }

    if (!val) return null; // If optional and empty, passes

    // 2. Email format validation
    if (q.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        return 'Please enter a valid email address (e.g., name@domain.com).';
      }
    }

    // 3. Date validation
    if (q.type === 'date') {
      const dateVal = new Date(val);
      if (isNaN(dateVal.getTime())) {
        return 'Please enter a valid date (YYYY-MM-DD).';
      }
      if (q.validation?.minDate) {
        const min = new Date(q.validation.minDate);
        if (dateVal < min) {
          return `Date cannot be earlier than ${q.validation.minDate}.`;
        }
      }
      if (q.validation?.maxDate) {
        const max = new Date(q.validation.maxDate);
        if (dateVal > max) {
          return `Date cannot be later than ${q.validation.maxDate}.`;
        }
      }
    }

    // 4. Rating validation
    if (q.type === 'rating') {
      const num = Number(val);
      const maxScale = q.validation?.ratingScale || 5;
      if (isNaN(num) || num < 1 || num > maxScale) {
        return `Please select a rating between 1 and ${maxScale}.`;
      }
    }

    // 5. Text length bounds and custom regex
    if (q.type === 'text') {
      if (q.validation?.min && val.length < q.validation.min) {
        return `Answer must be at least ${q.validation.min} characters.`;
      }
      if (q.validation?.max && val.length > q.validation.max) {
        return `Answer cannot exceed ${q.validation.max} characters.`;
      }
      if (q.validation?.regex) {
        try {
          const reg = new RegExp(q.validation.regex);
          if (!reg.test(val)) {
            return q.validation.customErrorMessage || 'Answer does not match the required format.';
          }
        } catch {
          // Invalid regex in configuration, ignore
        }
      }
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
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);

    const nextIndex = currentIndex + 1;
    if (nextIndex >= total) {
      finish(newAnswers);
    } else {
      setCurrentIndex(nextIndex);
      const nextQ = sortedQuestions[nextIndex];
      setTimeout(() => pushBot(nextQ.text), 300);
    }
  }

  async function finish(allAnswers: Record<string, string>) {
    setSubmitting(true);
    const result = await onSubmit(allAnswers);
    setSubmitting(false);

    if (result.success) {
      setDone(true);
      triggerSound('complete');
      const closing = form.completion_text || 'Thanks for your responses! We appreciate your time.';
      setMessages((m) => [...m, { id: 'done', role: 'bot', text: closing }]);

      // Trigger Webhook if configured
      if (form.webhook_url) {
        const dummyId = 'resp_' + Math.random().toString(36).substring(2, 9);
        dispatchWebhook(form, dummyId, allAnswers);
      }
    } else {
      pushBot(result.error || 'Something went wrong saving your response. Please try again.');
      setCurrentIndex(total - 1);
    }
  }

  function handleSubmitText(e: React.FormEvent) {
    e.preventDefault();
    if (currentIndex < 0 || done || submitting) return;
    const q = sortedQuestions[currentIndex];
    if (q.type === 'multiple_choice' || q.type === 'yes_no' || q.type === 'rating' || q.type === 'dropdown') return;

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
    setHoverRating(null);
    setDropdownSearch('');
  }

  const currentQ = currentIndex >= 0 ? sortedQuestions[currentIndex] : null;
  const isWaitingForStart = isOpen && messages.length <= 1 && currentIndex === -1 && !done;
  const accent = form.theme_color || '#2563eb';

  // Render Bot Avatar Icon
  function renderAvatar(avatar?: BotAvatar, className = 'h-4 w-4 text-white') {
    switch (avatar) {
      case 'sparkles':
        return <Sparkles className={className} />;
      case 'bot':
        return <Bot className={className} />;
      case 'headset':
        return <Headset className={className} />;
      case 'user':
        return <User className={className} />;
      case 'message-circle':
      default:
        return <MessageCircle className={className} />;
    }
  }

  const positionClass = form.launcher_position === 'bottom-left' ? 'left-6' : 'right-6';

  const chatPanel = (
    <div
      className="flex flex-col bg-white"
      style={{
        width: embedded ? '100%' : 380,
        height: embedded ? '100%' : 560,
        maxHeight: embedded ? 'none' : 'calc(100vh - 100px)',
        borderRadius: embedded ? 0 : 16,
        boxShadow: embedded ? 'none' : '0 16px 48px -4px rgba(15, 23, 42, 0.18)',
        overflow: 'hidden',
        border: embedded ? 'none' : '1px solid #e2e8f0',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 text-white" style={{ backgroundColor: accent }}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 shadow-inner">
            {renderAvatar(form.bot_avatar, 'h-5 w-5 text-white')}
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">{form.bot_name || form.title}</p>
            <p className="text-xs text-white/80 leading-tight">
              {done ? 'Complete' : currentIndex >= 0 ? `Question ${currentIndex + 1} of ${total}` : 'Active Assistant'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSoundMuted(!soundMuted)}
            className="rounded-lg p-1.5 hover:bg-white/20 transition text-white/90 hover:text-white"
            title={soundMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {soundMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          {!embedded && (
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 hover:bg-white/20 transition text-white/90 hover:text-white"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {currentIndex >= 0 && !done && (
        <div className="h-1.5 w-full bg-slate-100">
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / total) * 100}%`, backgroundColor: accent }}
          />
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll bg-slate-50 px-3.5 py-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
            {m.role === 'bot' && (
              <div
                className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-xs"
                style={{ backgroundColor: accent }}
              >
                {renderAvatar(form.bot_avatar, 'h-3.5 w-3.5 text-white')}
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-slate-900 text-white rounded-br-sm shadow-sm'
                  : 'bg-white text-slate-800 rounded-bl-sm shadow-sm border border-slate-200/80'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isWaitingForStart && (
          <div className="flex justify-end animate-fade-in-up">
            <button
              onClick={handleStart}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-95 hover:scale-102 active:scale-98"
              style={{ backgroundColor: accent }}
            >
              Let's Begin →
            </button>
          </div>
        )}

        {done && (
          <div className="flex justify-center pt-3 animate-fade-in-up">
            <button
              onClick={restart}
              className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Start over
            </button>
          </div>
        )}

        {submitting && (
          <div className="flex justify-start animate-fade-in">
            <div
              className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: accent }}
            >
              {renderAvatar(form.bot_avatar, 'h-3.5 w-3.5 text-white')}
            </div>
            <div className="rounded-2xl rounded-bl-sm bg-white border border-slate-200 px-4 py-3 shadow-xs">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inline Validation Error */}
      {error && (
        <div className="px-4 py-2 text-xs font-medium text-red-600 bg-red-50 border-t border-red-200 animate-fade-in flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-700">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Input Area */}
      {!done && (
        <div className="border-t border-slate-200 bg-white p-3">
          {/* 1. Multiple Choice */}
          {currentQ && currentQ.type === 'multiple_choice' && (
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
              {currentQ.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChoice(opt)}
                  disabled={submitting}
                  className="rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 disabled:opacity-50 text-left"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* 2. Yes / No */}
          {currentQ && currentQ.type === 'yes_no' && (
            <div className="flex gap-2.5">
              <button
                onClick={() => handleChoice('Yes')}
                disabled={submitting}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition hover:opacity-95 shadow-xs disabled:opacity-50"
                style={{ backgroundColor: accent }}
              >
                Yes
              </button>
              <button
                onClick={() => handleChoice('No')}
                disabled={submitting}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 shadow-xs disabled:opacity-50"
              >
                No
              </button>
            </div>
          )}

          {/* 3. Dropdown Selector (Task 2) */}
          {currentQ && currentQ.type === 'dropdown' && (
            <div className="space-y-2">
              {currentQ.options.length > 5 && (
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={dropdownSearch}
                    onChange={(e) => setDropdownSearch(e.target.value)}
                    placeholder="Search options..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-slate-400"
                  />
                </div>
              )}
              <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {currentQ.options
                  .filter((opt) => !dropdownSearch || opt.toLowerCase().includes(dropdownSearch.toLowerCase()))
                  .map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleChoice(opt)}
                      disabled={submitting}
                      className="w-full text-left rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition flex items-center justify-between"
                    >
                      <span className="truncate">{opt}</span>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400 -rotate-90" />
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* 4. Rating Star / Number Scale (Task 2) */}
          {currentQ && currentQ.type === 'rating' && (
            <div className="space-y-2 py-1">
              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: currentQ.validation?.ratingScale || 5 }, (_, i) => i + 1).map((val) => {
                  const isStars = currentQ.validation?.ratingStyle !== 'numbers';
                  const active = (hoverRating !== null ? hoverRating >= val : false);

                  if (isStars) {
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleChoice(String(val))}
                        onMouseEnter={() => setHoverRating(val)}
                        onMouseLeave={() => setHoverRating(null)}
                        disabled={submitting}
                        className="p-1.5 transition-transform hover:scale-125 focus:outline-none"
                        aria-label={`${val} stars`}
                      >
                        <Star
                          className={`h-7 w-7 transition-colors ${
                            active
                              ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                              : 'fill-slate-100 text-slate-300'
                          }`}
                        />
                      </button>
                    );
                  }

                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleChoice(String(val))}
                      onMouseEnter={() => setHoverRating(val)}
                      onMouseLeave={() => setHoverRating(null)}
                      disabled={submitting}
                      className={`h-9 w-9 rounded-xl font-bold text-sm transition-all border ${
                        active
                          ? 'border-transparent text-white shadow-sm scale-110'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                      style={active ? { backgroundColor: accent } : undefined}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>

              {(currentQ.validation?.lowRatingLabel || currentQ.validation?.highRatingLabel) && (
                <div className="flex justify-between px-2 text-[11px] font-medium text-slate-400">
                  <span>{currentQ.validation?.lowRatingLabel || '1'}</span>
                  <span>{currentQ.validation?.highRatingLabel || `${currentQ.validation?.ratingScale || 5}`}</span>
                </div>
              )}
            </div>
          )}

          {/* 5. Date Input (Task 2) */}
          {currentQ && currentQ.type === 'date' && (
            <form onSubmit={handleSubmitText} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="date"
                  value={inputValue}
                  min={currentQ.validation?.minDate}
                  max={currentQ.validation?.maxDate}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={submitting}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition"
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !inputValue.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition hover:opacity-90 disabled:opacity-50 shadow-xs"
                style={{ backgroundColor: accent }}
                aria-label="Confirm Date"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* 6. Text and Email input */}
          {currentQ && (currentQ.type === 'text' || currentQ.type === 'email') && (
            <form onSubmit={handleSubmitText} className="flex gap-2">
              <input
                ref={inputRef}
                type={currentQ.type === 'email' ? 'email' : 'text'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={submitting}
                placeholder={currentQ.placeholder || (currentQ.type === 'email' ? 'you@example.com' : 'Type your answer...')}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={submitting || (!inputValue.trim() && currentQ.required)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition hover:opacity-90 disabled:opacity-50 shadow-xs"
                style={{ backgroundColor: accent }}
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          )}

          {currentIndex < 0 && !isWaitingForStart && !submitting && (
            <p className="text-center text-xs text-slate-400 py-1 font-medium">Ready when you are</p>
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
          className={`fixed bottom-6 ${positionClass} z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-all hover:scale-105 active:scale-95 animate-fade-in`}
          style={{ backgroundColor: accent }}
          aria-label="Open chat"
        >
          {renderAvatar(form.bot_avatar, 'h-6 w-6 text-white')}
        </button>
      )}

      {isOpen && (
        <div className={`fixed bottom-6 ${positionClass} z-50 animate-fade-in-up`}>
          {chatPanel}
        </div>
      )}
    </>
  );
}

export default ChatbotWidget;
