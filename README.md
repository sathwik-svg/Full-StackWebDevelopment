# Formflow

**An interactive form builder that turns surveys into conversations.**

Formflow lets you create conversational forms, embed a chatbot widget on any website, and collect responses through a chat-style interface — one question at a time. No sign-up walls, no setup ceremony, just a clean dashboard for building and reviewing forms.

> Built as a full-stack MVP for a Software Engineer Intern take-home. The app satisfies every completion criterion: create a form, publish it, embed the chatbot widget on a test page, collect responses, and view saved submissions in the dashboard.

---

## Why Formflow?

Traditional forms dump every question on the screen at once. Respondents skim, rush, and bounce. Formflow restructures the same questions into a guided, one-at-a-time chat experience that keeps people engaged from the first question to the thank-you message.

| Traditional form | Formflow chatbot |
|---|---|
| All questions visible at once | One question at a time, in context |
| Feels like paperwork | Feels like a conversation |
| Validation errors pile up on submit | Inline, per-question validation |
| Static, generic styling | Customizable accent color and welcome message |
| Hosted on one platform only | Embeddable on any website with one script tag |

---

## Features

### Landing page
A responsive marketing page with a hero, feature highlights, a three-step "How it works" walkthrough, and a **fully interactive chatbot demo** visitors can answer right on the page — no dashboard visit required.

### Dashboard
A single screen to manage everything: total forms, published count, and aggregate response counts as stat cards. Create, edit, delete, publish, and unpublish forms without leaving the page. Each form row surfaces its status, response count, and creation date.

### Form builder
- **Four question types:** short text, email, multiple choice, and yes/no.
- **Reorder freely:** move questions up or down to control the conversation flow.
- **Required toggle:** mark any question as mandatory; the widget enforces it.
- **Live preview:** a dedicated Preview tab renders the actual chatbot widget with your current questions — exactly what respondents will see.
- **Settings tab:** edit title, description, welcome message, theme color, and publish status. Copy the public link with one click.

### Chatbot widget
The centerpiece of the app. A conversational interface that:
- Displays questions **one at a time** in a chat thread with bot/user bubbles.
- Shows a **welcome message** and a **completion message** with a "start over" option.
- Validates input inline — required fields, email format, and choice selection.
- Renders a **floating launcher bubble** in the corner (desktop and mobile) or can be embedded inline.
- Adapts its **accent color** and **welcome text** to match your brand.
- Displays a **progress bar** and a "Question X of N" indicator.
- Shows a **typing indicator** while saving responses.

### Public forms & publishing
Every published form gets a unique shareable URL (`/#/f/<slug>`). Unpublished forms are hidden from respondents. The public page is a focused, standalone experience with no dashboard chrome — just the form and the chatbot.

### Embeddable snippet
A single `<script>` tag loads the floating chatbot widget on any external website. The embed demo page renders the widget inside a mock browser frame so you can see exactly how it looks on a third-party site, and provides a copyable snippet ready to paste.

### Response management
A master-detail view lets you browse individual submissions, each with a timestamp and the full question-answer breakdown. Responses can be deleted individually.

---

## Tech stack

| Layer | Technology | Why |
|---|---|---|
| Frontend framework | React 18 + TypeScript | Type-safe, component-driven UI |
| Build tool | Vite 7 | Fast HMR, optimized production builds |
| Styling | Tailwind CSS 3 | Utility-first, consistent design system |
| Database | Supabase (PostgreSQL) | Managed Postgres with row-level security |
| Icons | lucide-react | Lightweight, tree-shakeable icon set |
| Embeddable widget | Vanilla JS | Zero dependencies, works on any site |

---

## Getting started

### Prerequisites

- Node.js 18+
- npm (or your package manager of choice)

### Installation

```bash
git clone https://github.com/your-username/formflow.git
cd formflow
npm install
```

### Environment

Supabase credentials are pre-configured in `.env`. If you're forking the project, provide your own:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Run the development server

```bash
npm run dev
```

The app opens at `http://localhost:5173`.

### Build for production

```bash
npm run build
npm run preview
```

---

## Usage guide

1. **Create a form** — Open the dashboard and click **New form**.
2. **Add questions** — In the builder, add questions of any supported type. Reorder with the up/down arrows, toggle required, and edit multiple-choice options inline.
3. **Customize** — Switch to the **Settings** tab to set the title, description, welcome message, and theme color.
4. **Preview** — Switch to the **Preview** tab to test the chatbot widget with your live questions.
5. **Publish** — In Settings, click **Publish form** to generate a public URL.
6. **Share** — Copy the public link or the embed snippet from the **Embed demo** page.
7. **Collect** — As respondents answer, submissions appear in the **Responses** tab with timestamps.

---

## Embedding the widget

Add this script tag to any website's HTML — no build step, no dependencies:

```html
<script src="https://your-host/formflow-widget.js" data-form-slug="YOUR_FORM_SLUG" async></script>
```

The widget injects a floating chat bubble in the bottom-right corner. On click, it opens the conversational form and saves responses directly to your database.

To configure Supabase credentials for the embedded widget, set these globals on your page before the script loads:

```html
<script>
  window.__FORMFLOW_SUPABASE_URL__ = 'your-project-url';
  window.__FORMFLOW_SUPABASE_KEY__ = 'your-anon-key';
</script>
<script src="https://your-host/formflow-widget.js" data-form-slug="YOUR_FORM_SLUG" async></script>
```

---

## Database schema

Three tables power the entire app. All have row-level security enabled.

### `forms`

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Unique form identifier |
| `title` | text | Form title shown in widget header |
| `description` | text | Optional subtitle on the public page |
| `status` | text | `draft` or `published` |
| `welcome_text` | text | Greeting shown when the chatbot opens |
| `theme_color` | text | Hex color for widget header, buttons, launcher |
| `slug` | text (unique) | Short identifier used in public URLs |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last-modified timestamp (auto-updated via trigger) |

### `questions`

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Unique question identifier |
| `form_id` | uuid (FK → forms) | Parent form, cascade delete |
| `text` | text | The question prompt |
| `type` | text | `text`, `email`, `multiple_choice`, or `yes_no` |
| `options` | jsonb | Choices for multiple-choice questions |
| `required` | boolean | Whether the question must be answered |
| `position` | integer | Display order |
| `created_at` | timestamptz | Creation timestamp |

### `responses`

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Unique response identifier |
| `form_id` | uuid (FK → forms) | Parent form, cascade delete |
| `answers` | jsonb | Map of question_id → answer value |
| `created_at` | timestamptz | Submission timestamp |

---

## Project structure

```
public/
  formflow-widget.js          # Standalone embeddable chatbot widget script
src/
  components/
    ChatbotWidget.tsx          # Core chatbot UI (inline + floating modes)
    Navbar.tsx                 # Shared navbar and footer
  lib/
    router.ts                  # Lightweight hash-based router
    supabase.ts                # Supabase client and shared types
    utils.ts                   # Helpers (slug generation, date formatting)
  pages/
    LandingPage.tsx            # Marketing page with live demo
    DashboardPage.tsx          # Form management dashboard
    FormBuilderPage.tsx        # Question builder, preview, and settings
    ResponsesPage.tsx          # Submission browser (master-detail)
    PublicFormPage.tsx         # Public form page for respondents
    EmbedDemoPage.tsx          # Embed preview with mock browser + snippet
  App.tsx                      # Router shell
  index.css                    # Tailwind + custom components
supabase/
  migrations/
    ..._create_forms_questions_responses.sql
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |

---

## Security

- **Row-level security** is enabled on every table.
- The app is single-tenant (no authentication required by design), so policies are scoped to `anon, authenticated` — the anon-key frontend can read and write its own data.
- The `forms.slug` column has a unique index for reliable public URL lookups.
- The `updated_at` column is maintained automatically by a database trigger.

---

## Completion criteria checklist

- [x] Create a form
- [x] Publish the form
- [x] Embed the chatbot widget on a test website
- [x] Collect responses through the chatbot
- [x] View saved submissions in the dashboard
- [x] Responsive landing page
- [x] Functional form builder with all four question types
- [x] Public form links with database-backed responses
- [x] Clean code, responsive design, and proper validation

---

## License

MIT
