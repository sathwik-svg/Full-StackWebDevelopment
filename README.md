# Formflow 💬

[![React](https://img.shields.io/badge/React-19.0-blue.svg?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_&_RLS-3ECF8E.svg?logo=supabase&logoColor=white)](https://supabase.com/)
[![Automated Tests](https://img.shields.io/badge/Tests-35%2F35_Passing-brightgreen.svg)](https://github.com/sathwik-svg/Full-StackWebDevelopment)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Formflow** turns tedious, overwhelming forms into engaging, one-at-a-time conversational experiences. Visitors answer questions naturally in a chat interface, resulting in dramatically higher completion rates, fewer validation errors, and richer feedback.

---

## 📑 Table of Contents

- [Why Formflow?](#-why-formflow)
- [Task 2 Highlights](#-task-2-highlights)
- [System Architecture](#-system-architecture)
- [Comprehensive "How to Use" Guide](#-comprehensive-how-to-use-guide)
  - [1. Installation & Environment Setup](#1-installation--environment-setup)
  - [2. Starting with Pre-built Templates](#2-starting-with-pre-built-templates)
  - [3. Building Questions with Advanced Types](#3-building-questions-with-advanced-types)
  - [4. Configuring Custom Validation Rules](#4-configuring-custom-validation-rules)
  - [5. Chatbot Personalization & Conversational Audio](#5-chatbot-personalization--conversational-audio)
  - [6. Live Previewing & Rapid Prototyping](#6-live-previewing--rapid-prototyping)
  - [7. 1-Click Form Duplication](#7-1-click-form-duplication)
  - [8. Publishing & Shareable Public Links](#8-publishing--shareable-public-links)
  - [9. Embedding the Floating Widget on External Sites](#9-embedding-the-floating-widget-on-external-sites)
  - [10. Configuring Real-Time Webhooks & Notifications](#10-configuring-real-time-webhooks--notifications)
  - [11. Interactive Analytics & Visual Charts](#11-interactive-analytics--visual-charts)
  - [12. Exporting Responses to RFC 4180 CSV](#12-exporting-responses-to-rfc-4180-csv)
  - [13. Role-Based Access Control (RBAC) & Audit Trail](#13-role-based-access-control-rbac--audit-trail)
- [Database Schema & Row Level Security (RLS)](#-database-schema--row-level-security-rls)
- [Automated Testing Suite](#-automated-testing-suite)
- [Pushing Branch `task2` to GitHub](#-pushing-branch-task2-to-github)

---

## 💡 Why Formflow?

Traditional survey and intake forms overwhelm respondents with a wall of empty inputs, leading to high bounce rates and hurried answers. Formflow replaces static forms with a conversational assistant:

| Feature | Conventional Forms | Formflow Conversational Forms |
|---|---|---|
| **Pacing** | All questions visible at once | Focused, one question at a time |
| **Validation** | Aggregated errors upon submit | Instant inline validation with helpful guidance |
| **Engagement** | Mechanical and dry | Engaging chat with custom bot personas & sound |
| **Embeddability** | Heavy iframes that break responsive layouts | Ultra-lightweight standalone script (`~14KB`, zero dependencies) |
| **Analytics** | Raw tabular dumps only | Visual distribution funnels, star breakdowns, and timelines |

---

## ⚡ Task 2 Highlights

1. **7 Rich Question Types:**
   - `text` — Short text input with character bounds.
   - `email` — Validated email with regex enforcement.
   - `multiple_choice` — Interactive option buttons.
   - `yes_no` — Binary quick-response buttons.
   - `dropdown` — Searchable dropdown select menus.
   - `rating` — Star icons (★) or numeric scales (1–5 or 1–10) with custom polarity labels.
   - `date` — Calendar picker with `minDate` and `maxDate` boundary enforcement.
2. **Template Library:** 5 one-click starter blueprints (CSAT, Event RSVP, Bug Triage, Candidate Screening, Sales Lead Qualification).
3. **1-Click Form Duplication:** Clone any form, its questions, and validation parameters with automatic slug generation.
4. **Chatbot Customization:** Selectable bot avatars (`sparkles`, `bot`, `headset`, `user`, `message-circle`), custom bot headers, theme palettes, corner positioning (`bottom-right` or `bottom-left`), and Web Audio API synthesized sound feedback.
5. **Interactive Analytics:** Real-time KPI cards, submission timelines, star rating distributions, choice breakdown meters, and question drop-off funnels.
6. **RFC 4180 CSV Export:** Instant spreadsheet downloads with mapped question prompts and proper character escaping.
7. **Webhooks & Alerts:** Outbound HTTP POST payloads on submission, test ping delivery verification, and latency inspection.
8. **Role-Based Access Control (RBAC):** `Admin`, `Creator`, and `Viewer` security roles with navbar role switcher, deletion guards, and immutable audit logs.

---

## 🏛 System Architecture

```
/
├── public/
│   ├── formflow-widget.js          # Standalone vanilla JS embed script (<15KB)
│   ├── formflow-task2.bundle       # Standalone Git bundle containing Task 2 commits
│   └── patches/                    # Standard Git patch file
├── src/
│   ├── __tests__/
│   │   └── run-all-tests.ts        # Comprehensive unit test suite (35 assertions)
│   ├── components/
│   │   ├── AdminSettingsModal.tsx  # RBAC permissions, audit log viewer & DB inspector
│   │   ├── AnalyticsCharts.tsx     # Visual chart engine (timeline, ratings, choices)
│   │   ├── ChatbotWidget.tsx       # Conversational chat engine with audio & validation
│   │   ├── Navbar.tsx              # Navigation with live RBAC switcher & modal triggers
│   │   └── TemplateGalleryModal.tsx# Template selector and preview modal
│   ├── lib/
│   │   ├── auth.ts                 # RBAC context, permissions matrix & session store
│   │   ├── export.ts               # RFC 4180 compliant CSV export generator
│   │   ├── router.ts               # Hash router (#/dashboard, #/builder/:id, etc.)
│   │   ├── sound.ts                # Web Audio API sound synthesizer
│   │   ├── supabase.ts             # Hybrid client (Live Supabase + Local Storage engine)
│   │   ├── templates.ts            # Curated template blueprints
│   │   ├── utils.ts                # Slug generation and formatting helpers
│   │   └── webhooks.ts             # Webhook dispatcher and test ping utility
│   ├── pages/
│   │   ├── DashboardPage.tsx       # Form list, duplication, search, filters & KPIs
│   │   ├── EmbedDemoPage.tsx       # Embed snippet generator & live browser sandbox
│   │   ├── FormBuilderPage.tsx     # 4-tab builder (Questions, Preview, Design, Webhooks)
│   │   ├── LandingPage.tsx         # Marketing landing page with interactive demo
│   │   ├── PublicFormPage.tsx      # Standalone public respondent view (/#/f/<slug>)
│   │   └── ResponsesPage.tsx       # Master-detail submissions, analytics & CSV export
│   ├── App.tsx                     # Top-level application with AuthProvider
│   ├── index.css                   # Tailwind CSS v4 styling & animations
│   └── main.tsx                    # React DOM entry point
├── supabase/
│   └── migrations/
│       ├── 20261021112737_create_forms_questions_responses.sql
│       └── 20261022000000_task2_advanced_features.sql
├── scripts/
│   └── push-to-github.sh           # Automated GitHub push helper script
└── README.md
```

---

## 📖 Comprehensive "How to Use" Guide

### 1. Installation & Environment Setup

#### Clone & Install Dependencies
```bash
git clone https://github.com/sathwik-svg/Full-StackWebDevelopment.git
cd Full-StackWebDevelopment
npm install
```

#### Environment Variables (Optional)
Formflow includes a **high-fidelity local storage engine** that works instantly out of the box with zero external configuration. If you wish to connect to a live Supabase project, create a `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 2. Starting with Pre-built Templates

Instead of starting from a blank canvas, click the **Templates** button in the navigation bar or dashboard to open the **Template Gallery**:

1. **Customer Satisfaction (CSAT):** 5-star rating, department dropdown, qualitative feedback, and contact email.
2. **Event Registration & RSVP:** Full name, email, attendance date picker, ticket tier dropdown, and dietary restrictions.
3. **Product Feedback & Bug Triage:** Issue category dropdown, severity scale (1–5), bug description, and follow-up email.
4. **Candidate Screening:** Full name, email, years of experience dropdown, tech stack selector, and earliest start date.
5. **Sales Lead Qualification:** Organization name, work email, budget range dropdown, and demo request toggle.

Click **"Use This Template"** to instantly generate the form, configure all questions, and redirect to the Builder.

---

### 3. Building Questions with Advanced Types

Navigate to the **Questions** tab in the Form Builder (`/#/builder/<formId>`):

- **Add Questions:** Click any question type button on the toolbar (`Short text`, `Email`, `Multiple choice`, `Dropdown select`, `Rating`, `Date`, `Yes / No`).
- **Reorder Sequence:** Use the **▲** and **▼** buttons on each question card to adjust the conversation flow.
- **Toggle Required:** Check the **Required** box to enforce mandatory answers.
- **Custom Placeholders:** Provide custom placeholder hints (e.g. `you@company.com`, `Select ticket tier...`).

---

### 4. Configuring Custom Validation Rules

Each question type supports specific validation rules:
- **Rating Parameters:** Select scale (`5 points` or `10 points`), visual style (`Star Icons` or `Numeric Buttons`), and custom polarity labels (e.g. *Low: Poor*, *High: Excellent*).
- **Date Range Boundaries:** Set **Minimum Allowed Date** and **Maximum Allowed Date** to prevent out-of-range bookings or registrations.
- **Dropdown & Multiple Choice:** Add, edit, or remove choice options with real-time preview.
- **Inline Validation:** If a respondent skips a required question or enters an invalid email or date, the chatbot provides an immediate, gentle inline warning without reloading.

---

### 5. Chatbot Personalization & Conversational Audio

Switch to the **Design & Bot** tab in the Builder:
- **Bot Persona & Avatar:** Select from 5 distinct avatar styles (`Message Bubble`, `Sparkles / AI`, `Friendly Bot`, `Customer Support`, `Personal Avatar`).
- **Bot Display Name:** Customize the name shown in the chat window header (e.g. *Acme Support Concierge*).
- **Welcome Greeting:** Craft the initial conversational icebreaker.
- **Completion / Thank-You Message:** Customize the closing statement shown when the respondent finishes.
- **Launcher Corner:** Choose whether the floating button docks at `bottom-right` or `bottom-left`.
- **Auto-Popup Timer:** Automatically open the chat after 3, 5, or 10 seconds to prompt user interaction.
- **Conversational Audio:** Toggle synthesized Web Audio sound effects (subtle pop on send, chime on receive).

---

### 6. Live Previewing & Rapid Prototyping

Click the **Live Preview** tab inside the Builder:
- Interactively test the full conversational flow directly in the browser.
- Verify validation rules, sound effects, button choices, and completion screens before publishing to real users.

---

### 7. 1-Click Form Duplication

To clone a form:
1. On the **Dashboard**, locate the form card and click **Duplicate**.
2. Or in the **Form Builder**, click the **Duplicate** button in the top action bar.
3. Formflow automatically generates a new unique slug (`[slug]-copy-[random]`), duplicates all questions, options, and validation rules, resets submission counters, and saves the copy in `draft` status.

---

### 8. Publishing & Shareable Public Links

1. In the **Design & Bot** tab or on the Dashboard, click **Publish Form**.
2. Formflow generates a dedicated public URL:
   ```
   https://your-domain.com/#/f/<slug>
   ```
3. The public page is a distraction-free, focused respondent experience featuring the form title, description, and interactive chatbot widget.

---

### 9. Embedding the Floating Widget on External Sites

Formflow includes a zero-dependency, vanilla JavaScript embed script (`public/formflow-widget.js`).

#### Step 1: Add the script tag to your website's HTML
```html
<script src="https://your-domain.com/formflow-widget.js" data-form-slug="YOUR_FORM_SLUG" async></script>
```

#### Step 2: (Optional) Configure custom Supabase credentials
```html
<script>
  window.__FORMFLOW_SUPABASE_URL__ = 'https://your-project.supabase.co';
  window.__FORMFLOW_SUPABASE_KEY__ = 'your-anon-key';
</script>
<script src="https://your-domain.com/formflow-widget.js" data-form-slug="YOUR_FORM_SLUG" async></script>
```

#### Interactive Embed Sandbox
Visit `/#/embed/<formId>` to preview the widget inside a simulated browser window, test floating interactions, and copy the ready-to-paste script snippet.

---

### 10. Configuring Real-Time Webhooks & Notifications

Switch to the **Webhooks** tab in the Form Builder:
1. Enter your destination endpoint URL (e.g. `https://webhook.site/...` or your backend API).
2. Click **Test Ping** to send a test event and inspect HTTP status codes and response latency.
3. Whenever a respondent submits a form, Formflow dispatches a structured `POST` JSON payload:

```json
{
  "event": "form_response.created",
  "timestamp": "2026-10-22T03:00:00.000Z",
  "form": {
    "id": "form_csat_demo",
    "title": "Customer Satisfaction (CSAT)",
    "slug": "csat-feedback"
  },
  "response": {
    "id": "resp_12345",
    "submitted_at": "2026-10-22T03:00:00.000Z",
    "answers": {
      "q_csat_1": "5",
      "q_csat_2": "Customer Support",
      "q_csat_3": "Remarkably fast turnaround and crystal-clear instructions!",
      "q_csat_4": "sarah@company.com"
    }
  }
}
```

---

### 11. Interactive Analytics & Visual Charts

Open the **Responses** page (`/#/responses/<formId>`) and click **Analytics Charts**:
- **KPI Metrics:** Total Submissions, Completion Rate, Average Satisfaction Score, and Average Completion Duration.
- **Submissions Timeline:** Daily response volume bar chart.
- **Rating Distributions:** Star rating breakdown (5★, 4★, 3★, 2★, 1★) with counts and visual percentage meters.
- **Dropdown & Choice Analysis:** Option distribution charts for multiple-choice and dropdown fields.
- **Date Field Summaries:** Earliest and latest dates submitted.

---

### 12. Exporting Responses to RFC 4180 CSV

1. In the **Responses** view, click the **Export CSV** button in the header.
2. Formflow instantly compiles all submissions, maps question texts to columns, properly escapes commas, quotation marks, and line breaks, and triggers a direct browser download:
   ```
   [form-slug]-responses-2026-10-22.csv
   ```

---

### 13. Role-Based Access Control (RBAC) & Audit Trail

Formflow includes a role-based access control engine. Click the **Role Switcher** badge in the navbar to test different user contexts:

| Permission | Admin | Creator | Viewer |
|---|:---:|:---:|:---:|
| **Create Forms** | ✅ | ✅ | ❌ |
| **Edit Questions & Settings** | ✅ | ✅ | ❌ |
| **Duplicate Forms** | ✅ | ✅ | ❌ |
| **Publish / Unpublish** | ✅ | ✅ | ❌ |
| **View Analytics & Submissions** | ✅ | ✅ | ✅ |
| **Export to CSV** | ✅ | ✅ | ✅ |
| **Configure Webhooks** | ✅ | ✅ | ❌ |
| **Delete Submissions** | ✅ | ❌ | ❌ |
| **Delete Forms** | ✅ | ❌ | ❌ |
| **Access Security & Audit Center** | ✅ | ❌ | ❌ |

- **Viewer Guard:** Read-only users see informative badges explaining that destructive and modification actions are disabled.
- **Submission Protection:** Only Admins can delete responses, ensuring submission data cannot be tampered with by creators.
- **Audit Log Trail:** Click **Security & Audit** in the navigation bar to inspect chronological records of all administrative actions (form creation, duplication, role switches, deletions).

---

## 🗄 Database Schema & Row Level Security (RLS)

All tables have Row Level Security enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).

### Migration Files
- `supabase/migrations/20261021112737_create_forms_questions_responses.sql`: Core tables for forms, questions, and responses.
- `supabase/migrations/20261022000000_task2_advanced_features.sql`: Task 2 extensions, check constraints, `webhooks_log`, `audit_logs`, and role-based policies.

### SQL Migration Snippet
```sql
-- Extend forms table
ALTER TABLE forms ADD COLUMN IF NOT EXISTS completion_text text NOT NULL DEFAULT 'Thanks for your responses! We appreciate your time.';
ALTER TABLE forms ADD COLUMN IF NOT EXISTS bot_name text NOT NULL DEFAULT 'Formflow Assistant';
ALTER TABLE forms ADD COLUMN IF NOT EXISTS bot_avatar text NOT NULL DEFAULT 'message-circle';
ALTER TABLE forms ADD COLUMN IF NOT EXISTS launcher_position text NOT NULL DEFAULT 'bottom-right';
ALTER TABLE forms ADD COLUMN IF NOT EXISTS sound_enabled boolean NOT NULL DEFAULT true;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS webhook_url text;

-- Check constraint for question types
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_type_check;
ALTER TABLE questions ADD CONSTRAINT questions_type_check 
  CHECK (type IN ('text', 'email', 'multiple_choice', 'yes_no', 'dropdown', 'rating', 'date'));

-- Row-level security for public submissions
CREATE POLICY "anon_submit_responses" ON responses FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
```

---

## 🧪 Automated Testing Suite

Formflow includes a test suite covering the entire business logic and security policies.

### Run Tests
```bash
npm test
```

### Verified Test Results (35/35 Passing):
```
--- Test Suite: Role-Based Access Control (RBAC) ---
  ✓ PASS: Admin can create forms
  ✓ PASS: Admin can delete forms
  ✓ PASS: Admin can delete responses
  ✓ PASS: Admin can manage webhooks
  ✓ PASS: Admin can access system settings
  ✓ PASS: Creator can create forms
  ✓ PASS: Creator can edit forms
  ✓ PASS: Creator CANNOT delete forms (Admin only)
  ✓ PASS: Creator CANNOT delete responses (Audit integrity)
  ✓ PASS: Creator can export CSV
  ✓ PASS: Viewer CANNOT create forms
  ✓ PASS: Viewer CANNOT edit forms
  ✓ PASS: Viewer CANNOT delete forms
  ✓ PASS: Viewer CAN export CSV (Read-only analytics allowed)

--- Test Suite: CSV Export Engine ---
  ✓ PASS: Contains Response ID header
  ✓ PASS: Contains Question 1 header
  ✓ PASS: Contains Question 2 header with comma escaping
  ✓ PASS: Properly escapes internal quotes per RFC 4180
  ✓ PASS: Properly quotes multiline answer string

--- Test Suite: Question Validation Rules ---
  ✓ PASS: Rejects empty required email
  ✓ PASS: Rejects malformed email address
  ✓ PASS: Accepts valid email address
  ✓ PASS: Rejects 0 rating on 1-5 scale
  ✓ PASS: Rejects 6 rating on 1-5 scale
  ✓ PASS: Accepts 5 rating on 1-5 scale
  ✓ PASS: Accepts 3 rating on 1-5 scale
  ✓ PASS: Rejects invalid date string
  ✓ PASS: Rejects date earlier than minDate
  ✓ PASS: Rejects date later than maxDate
  ✓ PASS: Accepts valid in-range date

--- Test Suite: Hash Router Serialization ---
  ✓ PASS: Empty hash defaults to home
  ✓ PASS: Parses dashboard route
  ✓ PASS: Serializes builder route
  ✓ PASS: Serializes responses route
  ✓ PASS: Serializes public form slug route

================================
Test Execution Summary:
Passed: 35
Failed: 0
Total:  35
================================
```

---

## 🚀 Pushing Branch `task2` to GitHub

All Task 2 code, migrations, tests, and documentation are committed on the **`task2`** branch in this repository.

### Option 1: One-Line Push with GitHub Personal Access Token (PAT)
```bash
git push https://<YOUR_GITHUB_TOKEN>@github.com/sathwik-svg/Full-StackWebDevelopment.git task2
```

### Option 2: Using the Included Push Script
```bash
GITHUB_TOKEN=your_token_here ./scripts/push-to-github.sh
```

### Option 3: Using SSH Key
```bash
git remote set-url origin git@github.com:sathwik-svg/Full-StackWebDevelopment.git
git push -u origin task2
```

### Option 4: Merge Directly into `main` and Push
```bash
git checkout main
git merge task2
git push origin main
```

---

## 📄 License

This project is licensed under the **MIT License**.
