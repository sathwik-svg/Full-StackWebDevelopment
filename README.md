# Formflow — Interactive Form Builder with Chatbot Widget

A full-stack web app for creating conversational forms and embedding a chatbot widget on any website. Visitors answer one question at a time in a chat-style interface, and responses are saved to a dashboard for review.

## Features

- **Landing page** — Hero, feature highlights, "How it works" walkthrough, and a live chatbot widget demo.
- **Dashboard** — View total forms and responses, create/edit/delete/publish forms, and see submission counts at a glance.
- **Form builder** — Add text, email, multiple choice, and yes/no questions. Reorder with up/down controls, mark questions required, and preview the chatbot widget live.
- **Chatbot widget** — Conversational, one-question-at-a-time interface with welcome and completion messages, built-in validation, and customizable color + welcome text. Available as a floating button that works on desktop and mobile.
- **Public forms** — Each published form gets a unique shareable URL. Responses are saved to the database with timestamps.
- **Embeddable snippet** — A single `<script>` tag loads the floating widget on any external website.
- **Response management** — Browse individual submissions with timestamps in a master-detail view.

## Tech stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Backend/Database:** Supabase (PostgreSQL)
- **Icons:** lucide-react

## Getting started

```bash
npm install
npm run dev
```

The app opens at `http://localhost:5173`. Supabase credentials are pre-configured in `.env`.

## How to use

1. Open the dashboard from the landing page.
2. Click **New form** to create a form.
3. Add questions (text, email, multiple choice, or yes/no), reorder as needed, and toggle required.
4. Go to **Settings** → **Publish form** to generate a public link.
5. View the **Embed demo** page to get the one-line snippet for external sites.
6. Share the public link — responses appear in the **Responses** tab of each form.

## Embedding the widget

Add this script tag to any website's HTML:

```html
<script src="https://your-host/formflow-widget.js" data-form-slug="YOUR_FORM_SLUG" async></script>
```

The widget loads as a floating chat bubble in the bottom-right corner.

## Database schema

- `forms` — id, title, description, status (draft/published), welcome_text, theme_color, slug, timestamps
- `questions` — id, form_id, text, type, options (JSON), required, position
- `responses` — id, form_id, answers (JSON), created_at

All tables have row-level security enabled with public policies (single-tenant, no auth).
