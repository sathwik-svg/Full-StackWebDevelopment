# Formflow — Conversational Form Builder & Embeddable Chatbot (Task 2)

Formflow transforms conventional, intimidating web forms into guided, one-at-a-time conversational chatbot experiences. Respondents stay engaged from the greeting to completion, yielding higher completion rates and richer qualitative insights.

Built with **React 19, TypeScript, Vite, Tailwind CSS, and Supabase (PostgreSQL with Row-Level Security)**.

---

## 🚀 What's New in Task 2

Task 2 upgrades Formflow into an enterprise-ready conversational survey platform with advanced question types, granular analytics, templates, webhooks, and role-based access control:

1. **Advanced Question Types**
   - **Dropdown Select:** Searchable options lists with custom placeholders.
   - **Interactive Ratings:** Star rating icons (★) and numbered button scales (1–5 or 1–10) with custom polarity labels (e.g. *Poor* to *Exceptional*).
   - **Date Picker:** HTML5 date selection with `minDate` and `maxDate` validation boundaries.
   - **Retained Task 1 Types:** Short text, validated email, multiple choice, and yes/no.

2. **Validation Engine**
   - Mandatory / Required question enforcement.
   - Strict RFC-compliant email regex format validation.
   - Calendar range limits (`minDate` / `maxDate`).
   - Rating numerical boundary checks.
   - Text input character length constraints (`min` / `max`).
   - Clear, non-disruptive inline error banners with instant recovery.

3. **Curated Template Library**
   - 5 ready-to-deploy templates with one-click generation:
     - **Customer Satisfaction (CSAT):** Star ratings, department dropdowns, and feedback text.
     - **Event Registration & RSVP:** Calendar dates, ticket tier dropdowns, and dietary requirements.
     - **Product Feedback & Bug Triage:** Severity ratings, category dropdowns, and issue descriptions.
     - **Candidate Screening:** Experience level dropdowns, specialization choices, and availability dates.
     - **Sales Lead Qualification:** Budget ranges, company info, and meeting requests.

4. **1-Click Form Duplication**
   - Clone any form from the Dashboard or Builder with a single click.
   - Generates a new unique URL slug, appends `(Copy)` to the title, duplicates all questions, options, and validation rules, resets submission counts, and places the copy in `draft` status.

5. **Chatbot Customization & Audio Synthesis**
   - **Bot Avatars:** Select from Message Bubble, Sparkles (AI), Friendly Bot, Support Headset, or Personal User.
   - **Bot Header Name:** Custom name displayed in the chatbot header.
   - **Completion Text:** Custom thank-you / closing statement per form.
   - **Floating Launcher Position:** Position the launcher bubble at `bottom-right` or `bottom-left`.
   - **Conversational Audio Effects:** Subtle Web Audio API synthesized pops/chimes on message exchange (toggleable with mute control).
   - **Auto-Popup Timer:** Automatically open the chat after a configured delay (e.g. 3s, 5s, 10s).

6. **Interactive Analytics Charts**
   - Submissions timeline bar chart showing response volume over recent dates.
   - Average satisfaction and rating distribution (breakdown of 5-star / 4-star / 3-star ratings).
   - Choice and dropdown distribution meters with percentages and counts.
   - Key performance indicators: Total Submissions, Completion Rate, Average Score, and Flow Duration.

7. **RFC 4180 CSV Export**
   - Instant export of all form submissions to a formatted CSV spreadsheet (`[slug]-responses-[date].csv`).
   - Question prompts are cleanly mapped to column headers.
   - Proper escaping of commas, quotation marks, and line breaks.

8. **Webhooks & Real-Time Notifications**
   - Configure outbound HTTP POST webhook URLs per form.
   - Submissions automatically trigger structured JSON payloads with response IDs, timestamps, and answers.
   - Built-in "Test Ping" button in the builder to verify endpoint responsiveness and measure latency.
   - Notification email configuration.

9. **Secure Role-Based Access Control (RBAC)**
   - Three distinct operational roles:
     - **Admin:** Full privileges (create, edit, duplicate, permanently delete forms, delete submissions, manage webhooks, view audit logs).
     - **Creator / Editor:** Can create, edit, duplicate, and publish forms, view responses, and export CSVs. Cannot permanently destroy forms or tamper with raw submission audit trails.
     - **Viewer:** Read-only access to forms, live previews, responses, and CSV exports. Cannot modify questions, publish status, or settings.
   - Real-time Role Switcher in the top navigation to test all RBAC security constraints.
   - System audit log tracking all form creation, duplication, and configuration events.

10. **Secure Supabase RLS Hardening**
    - Migration file: `supabase/migrations/20261022000000_task2_advanced_features.sql`.
    - Extended schema constraints and Row-Level Security policies.
    - Zero-config Local Storage fallback engine for instant offline prototyping without credentials.

11. **Automated Test Suite**
    - 35 automated unit tests covering RBAC permissions, RFC 4180 CSV escaping, question validation, and routing.
    - Run via `npm test`.

---

## 🧱 Architecture & Project Structure

```
├── public/
│   └── formflow-widget.js          # Standalone embeddable widget script (vanilla JS)
├── src/
│   ├── __tests__/
│   │   └── run-all-tests.ts        # Automated unit test suite (35 tests)
│   ├── components/
│   │   ├── AdminSettingsModal.tsx  # RBAC matrix, audit log trail, and DB status
│   │   ├── AnalyticsCharts.tsx     # Visual response distribution and timeline charts
│   │   ├── ChatbotWidget.tsx       # Conversational chat component with audio & validation
│   │   ├── Navbar.tsx              # Navigation bar with live RBAC role switcher
│   │   └── TemplateGalleryModal.tsx# Template selector modal
│   ├── lib/
│   │   ├── auth.tsx                # Role-Based Access Control context & permissions
│   │   ├── export.ts               # RFC 4180 CSV generation & download
│   │   ├── router.ts               # Client-side hash router
│   │   ├── sound.ts                # Web Audio API conversational sound synthesizer
│   │   ├── supabase.ts             # Hybrid client (Supabase + reactive local storage fallback)
│   │   ├── templates.ts            # Curated template definitions with validation rules
│   │   ├── utils.ts                # Slug generator, date formatting, cn helper
│   │   └── webhooks.ts             # Outbound webhook dispatcher and ping tester
│   ├── pages/
│   │   ├── DashboardPage.tsx       # Form list, duplication, search, filters, KPIs
│   │   ├── EmbedDemoPage.tsx       # Script snippet generator and live browser sandbox
│   │   ├── FormBuilderPage.tsx     # Question builder, live preview, design, webhooks
│   │   ├── LandingPage.tsx         # Marketing page with interactive Task 2 live demo
│   │   ├── PublicFormPage.tsx      # Standalone public respondent view (/#/f/<slug>)
│   │   └── ResponsesPage.tsx       # Submissions table, details, analytics, CSV export
│   ├── App.tsx                     # Top-level routing and AuthProvider wrap
│   ├── index.css                   # Tailwind v4 styles and animation keyframes
│   └── main.tsx                    # React root entry point
├── supabase/
│   └── migrations/
│       ├── 20261021112737_create_forms_questions_responses.sql  # Task 1 migration
│       └── 20261022000000_task2_advanced_features.sql          # Task 2 schema & RLS
├── index.html                      # HTML entry point with metadata sync
├── metadata.json                   # AI Studio app metadata
├── package.json                    # Dependencies & npm scripts
└── vite.config.ts                  # Vite build configuration with @ alias
```

---

## 🔒 Supabase Database Schema & RLS

### `forms`
| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Unique form ID |
| `title` | text | Form title |
| `description` | text | Optional subtitle |
| `status` | text | `'draft'` or `'published'` |
| `welcome_text` | text | Greeting shown by the chatbot widget |
| `completion_text` | text | Closing message upon submission (Task 2) |
| `theme_color` | text | Hex color for header, buttons, launcher |
| `bot_name` | text | Header display name for bot persona (Task 2) |
| `bot_avatar` | text | Avatar style: `'message-circle'`, `'bot'`, `'sparkles'`, `'headset'`, `'user'` (Task 2) |
| `launcher_position` | text | `'bottom-right'` or `'bottom-left'` (Task 2) |
| `sound_enabled` | boolean | Audio pop feedback toggle (Task 2) |
| `auto_popup_delay` | integer | Auto-open delay in seconds (0 = disabled) (Task 2) |
| `webhook_url` | text | Outbound webhook endpoint (Task 2) |
| `notify_email` | text | Alert email address (Task 2) |
| `slug` | text (unique) | Public URL slug (`/#/f/<slug>`) |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last updated timestamp |

### `questions`
| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Unique question ID |
| `form_id` | uuid (FK) | References `forms(id)` ON DELETE CASCADE |
| `text` | text | Question prompt prompt |
| `type` | text | `'text'`, `'email'`, `'multiple_choice'`, `'yes_no'`, `'dropdown'`, `'rating'`, `'date'` |
| `options` | jsonb | Array of options for choices and dropdowns |
| `required` | boolean | Mandatory question flag |
| `position` | integer | Display order sequence |
| `validation` | jsonb | Min/max bounds, date ranges, rating scale (Task 2) |
| `placeholder` | text | Optional text input placeholder (Task 2) |
| `created_at` | timestamptz | Creation timestamp |

### `responses`
| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Unique submission ID |
| `form_id` | uuid (FK) | References `forms(id)` ON DELETE CASCADE |
| `answers` | jsonb | Map of `{ question_id: answer_value }` |
| `created_at` | timestamptz | Submission timestamp |

### `webhooks_log` (Task 2)
| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Unique log ID |
| `form_id` | uuid (FK) | References `forms(id)` ON DELETE CASCADE |
| `response_id` | uuid | References `responses(id)` |
| `payload` | jsonb | Full JSON payload dispatched |
| `status_code` | integer | HTTP status code returned (200, 404, 500, etc.) |
| `status` | text | `'success'` or `'failed'` |
| `url` | text | Destination endpoint |
| `created_at` | timestamptz | Dispatch timestamp |

---

## 🛡️ Role-Based Access Control (RBAC) Matrix

| Permission | Admin | Creator | Viewer |
|---|:---:|:---:|:---:|
| Create Form | ✅ | ✅ | ❌ |
| Edit Questions & Settings | ✅ | ✅ | ❌ |
| Duplicate Form | ✅ | ✅ | ❌ |
| Publish / Unpublish Form | ✅ | ✅ | ❌ |
| View Responses & Analytics | ✅ | ✅ | ✅ |
| Export Submissions to CSV | ✅ | ✅ | ✅ |
| Configure Webhooks & Alerts | ✅ | ✅ | ❌ |
| Delete Submissions | ✅ | ❌ | ❌ |
| Permanently Delete Forms | ✅ | ❌ | ❌ |
| Access Security & Audit Center | ✅ | ❌ | ❌ |

---

## 🧪 Automated Testing

Run the automated test suite:
```bash
npm test
```

### Verified Test Results:
- **RBAC Matrix:** 14 assertions testing permissions across Admin, Creator, and Viewer roles.
- **CSV Export Engine:** 5 assertions validating RFC 4180 column header mapping, quotes escaping, and multiline string containment.
- **Question Validation Rules:** 11 assertions checking email regex, date boundaries (`minDate`/`maxDate`), rating scale boundaries (`1–5`), and required checks.
- **Hash Router Serialization:** 5 assertions verifying hash parsing and route generation.
- **Total:** 35 passing tests, 0 failures.

---

## 🛠️ Verification & Build Commands

```bash
# Type check and linting
npm run lint

# Build for production
npm run build

# Run unit tests
npm test

# Run dev server
npm run dev
```
