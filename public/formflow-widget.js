/* Formflow chatbot widget — embeddable script v2.0
 * Usage: <script src="https://your-host/formflow-widget.js" data-form-slug="abc123" async></script>
 * Loads a published form from Supabase and renders an interactive conversational widget
 * Supports: short text, email, multiple choice, yes/no, dropdown, rating, and date.
 */
(function () {
  var script = document.currentScript;
  if (!script) return;
  var slug = script.getAttribute('data-form-slug');
  if (!slug) { console.error('[Formflow] data-form-slug is required.'); return; }

  // Read config injected by the host app at build time, or fall back to env.
  var SUPABASE_URL = window.__FORMFLOW_SUPABASE_URL__ || (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_URL) || '';
  var SUPABASE_KEY = window.__FORMFLOW_SUPABASE_KEY__ || (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_ANON_KEY) || '';

  var container = document.createElement('div');
  container.id = 'formflow-widget-root';
  document.body.appendChild(container);

  var state = {
    form: null,
    questions: [],
    messages: [],
    currentIndex: -1,
    answers: {},
    done: false,
    isOpen: false,
    error: '',
    submitting: false,
  };

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function api(path) {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      // Local fallback using window localStorage if hosted on same domain
      try {
        var forms = JSON.parse(localStorage.getItem('formflow_forms_v2') || '[]');
        if (path.indexOf('forms?slug=eq.') === 0) {
          var matched = forms.filter(function (f) { return f.slug === slug && f.status === 'published'; });
          return Promise.resolve(matched);
        }
        if (path.indexOf('questions?form_id=eq.') === 0) {
          var fId = path.split('questions?form_id=eq.')[1].split('&')[0];
          var questions = JSON.parse(localStorage.getItem('formflow_questions_v2') || '[]');
          return Promise.resolve(questions.filter(function (q) { return q.form_id === fId; }));
        }
      } catch (e) {
        return Promise.reject(e);
      }
    }

    return fetch(SUPABASE_URL + '/rest/v1/' + path, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
    }).then(function (r) {
      if (!r.ok) throw new Error('Request failed: ' + r.status);
      return r.json();
    });
  }

  function load() {
    api('forms?slug=eq.' + encodeURIComponent(slug) + '&limit=1')
      .then(function (forms) {
        if (!forms || forms.length === 0) throw new Error('Form not found or unpublished');
        var f = forms[0];
        if (f.status !== 'published') throw new Error('Form not published');
        state.form = f;
        return api('questions?form_id=eq.' + f.id + '&order=position.asc');
      })
      .then(function (qs) {
        state.questions = (qs || []).sort(function (a, b) { return a.position - b.position; });
        render();
      })
      .catch(function (err) {
        console.warn('[Formflow]', err.message);
      });
  }

  function validate(q, value) {
    var val = (value || '').trim();
    if (q.required && !val) return 'This question is required.';
    if (!val) return null;

    if (q.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      return 'Please enter a valid email address.';
    }
    if (q.type === 'rating') {
      var n = Number(val);
      var scale = (q.validation && q.validation.ratingScale) || 5;
      if (isNaN(n) || n < 1 || n > scale) return 'Please choose a rating between 1 and ' + scale;
    }
    return null;
  }

  function submit(answers) {
    if (SUPABASE_URL && SUPABASE_KEY) {
      fetch(SUPABASE_URL + '/rest/v1/responses', {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ form_id: state.form.id, answers: answers })
      }).catch(function (e) { console.error('[Formflow] Submit error:', e); });
    } else {
      try {
        var existing = JSON.parse(localStorage.getItem('formflow_responses_v2') || '[]');
        existing.push({
          id: 'resp_widget_' + Date.now(),
          form_id: state.form.id,
          answers: answers,
          created_at: new Date().toISOString()
        });
        localStorage.setItem('formflow_responses_v2', JSON.stringify(existing));
      } catch (e) {}
    }
  }

  function render() {
    container.innerHTML = '';
    if (!state.form) return;
    var accent = state.form.theme_color || '#2563eb';
    var isLeft = state.form.launcher_position === 'bottom-left';
    var posCss = isLeft ? 'left:24px;' : 'right:24px;';

    if (!state.isOpen) {
      var launcher = el('button', null);
      launcher.style.cssText = 'position:fixed;bottom:24px;' + posCss + 'width:56px;height:56px;border-radius:50%;background:' + accent + ';color:#fff;border:none;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:22px;z-index:99999;transition:transform 0.2s;';
      launcher.innerHTML = '&#128172;';
      launcher.onmouseover = function () { launcher.style.transform = 'scale(1.06)'; };
      launcher.onmouseout = function () { launcher.style.transform = 'scale(1)'; };
      launcher.onclick = function () { state.isOpen = true; render(); };
      container.appendChild(launcher);
      return;
    }

    var panel = el('div', null);
    panel.style.cssText = 'position:fixed;bottom:24px;' + posCss + 'width:380px;max-width:calc(100vw - 32px);height:540px;max-height:calc(100vh - 48px);background:#fff;border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,0.2);border:1px solid #e2e8f0;display:flex;flex-direction:column;overflow:hidden;z-index:99999;font-family:Inter,system-ui,sans-serif;';

    // Header
    var header = el('div', null);
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:14px 16px;color:#fff;background:' + accent + ';';
    var titleWrap = el('div', null);
    titleWrap.style.cssText = 'display:flex;align-items:center;gap:10px;';
    var avatar = el('div', null);
    avatar.style.cssText = 'width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:16px;';
    avatar.innerHTML = '&#128172;';
    var titles = el('div', null);
    var t1 = el('p', null, state.form.bot_name || state.form.title);
    t1.style.cssText = 'font-size:14px;font-weight:600;margin:0;line-height:1.2;';
    var statusText = state.done ? 'Complete' : (state.currentIndex >= 0 ? 'Question ' + (state.currentIndex + 1) + ' of ' + state.questions.length : 'Active');
    var t2 = el('p', null, statusText);
    t2.style.cssText = 'font-size:12px;margin:0;color:rgba(255,255,255,0.8);line-height:1.2;';
    titles.appendChild(t1); titles.appendChild(t2);
    titleWrap.appendChild(avatar); titleWrap.appendChild(titles);
    var closeBtn = el('button', null, '\u00d7');
    closeBtn.style.cssText = 'background:rgba(255,255,255,0.15);border:none;color:#fff;width:28px;height:28px;border-radius:8px;cursor:pointer;font-size:18px;line-height:1;';
    closeBtn.onclick = function () { state.isOpen = false; render(); };
    header.appendChild(titleWrap); header.appendChild(closeBtn);
    panel.appendChild(header);

    // Messages area
    var msgArea = el('div', null);
    msgArea.style.cssText = 'flex:1;overflow-y:auto;background:#f8fafc;padding:16px 14px;';
    state.messages.forEach(function (m) {
      var row = el('div', null);
      row.style.cssText = 'display:flex;justify-content:' + (m.role === 'user' ? 'flex-end' : 'flex-start') + ';margin-bottom:10px;';
      var bubble = el('div', null, m.text);
      bubble.style.cssText = 'max-width:80%;border-radius:14px;padding:10px 14px;font-size:14px;line-height:1.5;' + (m.role === 'user' ? 'background:#0f172a;color:#fff;border-radius:14px 14px 2px 14px;' : 'background:#fff;border:1px solid #e2e8f0;color:#334155;border-radius:14px 14px 14px 2px;');
      row.appendChild(bubble);
      msgArea.appendChild(row);
    });
    panel.appendChild(msgArea);

    if (state.error) {
      var errBar = el('div', null, state.error);
      errBar.style.cssText = 'padding:6px 16px;font-size:12px;color:#dc2626;background:#fef2f2;border-top:1px solid #fee2e2;';
      panel.appendChild(errBar);
    }

    var inputArea = el('div', null);
    inputArea.style.cssText = 'border-top:1px solid #f1f5f9;background:#fff;padding:12px;';

    if (state.done) {
      var doneMsg = el('p', null, state.form.completion_text || 'Thanks for your responses!');
      doneMsg.style.cssText = 'text-align:center;font-size:13px;color:#64748b;padding:8px;';
      inputArea.appendChild(doneMsg);
    } else if (state.currentIndex < 0) {
      var startBtn = el('button', null, "Let's begin \u2192");
      startBtn.style.cssText = 'width:100%;padding:10px;border-radius:10px;border:none;background:' + accent + ';color:#fff;font-size:14px;font-weight:600;cursor:pointer;';
      startBtn.onclick = function () {
        if (state.questions.length === 0) return;
        state.messages.push({ role: 'bot', text: state.form.welcome_text });
        state.currentIndex = 0;
        state.messages.push({ role: 'bot', text: state.questions[0].text });
        render();
      };
      if (state.messages.length === 0) {
        state.messages.push({ role: 'bot', text: state.form.welcome_text });
      }
      inputArea.appendChild(startBtn);
    } else {
      var q = state.questions[state.currentIndex];
      if (q.type === 'yes_no') {
        var btnRow = el('div', null);
        btnRow.style.cssText = 'display:flex;gap:8px;';
        ['Yes', 'No'].forEach(function (opt) {
          var b = el('button', null, opt);
          b.style.cssText = 'flex:1;padding:10px;border-radius:10px;border:none;' + (opt === 'Yes' ? 'background:' + accent + ';color:#fff;' : 'background:#fff;border:1px solid #e2e8f0;color:#334155;') + 'font-size:14px;font-weight:600;cursor:pointer;';
          b.onclick = function () { handleAnswer(q, opt); };
          btnRow.appendChild(b);
        });
        inputArea.appendChild(btnRow);
      } else if (q.type === 'multiple_choice' || q.type === 'dropdown') {
        var choiceWrap = el('div', null);
        choiceWrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;max-height:140px;overflow-y:auto;';
        (q.options || []).forEach(function (opt) {
          var b = el('button', null, opt);
          b.style.cssText = 'padding:8px 14px;border-radius:10px;border:1px solid #e2e8f0;background:#fff;color:#334155;font-size:13px;font-weight:500;cursor:pointer;text-align:left;';
          b.onclick = function () { handleAnswer(q, opt); };
          choiceWrap.appendChild(b);
        });
        inputArea.appendChild(choiceWrap);
      } else if (q.type === 'rating') {
        var ratingWrap = el('div', null);
        ratingWrap.style.cssText = 'display:flex;justify-content:center;gap:8px;padding:6px 0;';
        var scale = (q.validation && q.validation.ratingScale) || 5;
        for (var i = 1; i <= scale; i++) {
          (function (val) {
            var rBtn = el('button', null, String(val));
            rBtn.style.cssText = 'width:36px;height:36px;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:bold;cursor:pointer;font-size:14px;';
            rBtn.onclick = function () { handleAnswer(q, String(val)); };
            ratingWrap.appendChild(rBtn);
          })(i);
        }
        inputArea.appendChild(ratingWrap);
      } else if (q.type === 'date') {
        var dForm = el('form', null);
        dForm.style.cssText = 'display:flex;gap:8px;';
        var dInput = document.createElement('input');
        dInput.type = 'date';
        dInput.style.cssText = 'flex:1;padding:10px 14px;border-radius:10px;border:1px solid #e2e8f0;font-size:14px;outline:none;';
        var dBtn = el('button', null, '\u2192');
        dBtn.style.cssText = 'width:40px;height:40px;border-radius:10px;border:none;background:' + accent + ';color:#fff;font-size:16px;cursor:pointer;';
        dForm.appendChild(dInput); dForm.appendChild(dBtn);
        dForm.onsubmit = function (e) { e.preventDefault(); handleAnswer(q, dInput.value); };
        inputArea.appendChild(dForm);
      } else {
        var form = el('form', null);
        form.style.cssText = 'display:flex;gap:8px;';
        var input = document.createElement('input');
        input.type = q.type === 'email' ? 'email' : 'text';
        input.placeholder = q.type === 'email' ? 'you@example.com' : 'Type your answer...';
        input.style.cssText = 'flex:1;padding:10px 14px;border-radius:10px;border:1px solid #e2e8f0;font-size:14px;outline:none;';
        var sendBtn = el('button', null, '\u2192');
        sendBtn.style.cssText = 'width:40px;height:40px;border-radius:10px;border:none;background:' + accent + ';color:#fff;font-size:16px;cursor:pointer;';
        form.appendChild(input); form.appendChild(sendBtn);
        form.onsubmit = function (e) { e.preventDefault(); handleAnswer(q, input.value.trim()); };
        inputArea.appendChild(form);
      }
    }
    panel.appendChild(inputArea);
    container.appendChild(panel);
  }

  function handleAnswer(q, value) {
    var err = validate(q, value);
    if (err) { state.error = err; render(); return; }
    state.error = '';
    state.answers[q.id] = value;
    state.messages.push({ role: 'user', text: value });
    var nextIndex = state.currentIndex + 1;
    if (nextIndex >= state.questions.length) {
      submit(state.answers);
      state.done = true;
      state.messages.push({ role: 'bot', text: state.form.completion_text || 'Thanks for your responses! We appreciate your time.' });
    } else {
      state.currentIndex = nextIndex;
      state.messages.push({ role: 'bot', text: state.questions[nextIndex].text });
    }
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
