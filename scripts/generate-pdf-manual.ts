import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

const outputPath = path.resolve('public', 'Formflow_User_Manual.pdf');

const doc = new PDFDocument({
  size: 'A4',
  margin: 50,
  info: {
    Title: 'Formflow v2.0 - Complete User Manual & Engineering Reference',
    Author: 'Sathwik (Formflow Engineering)',
    Subject: 'Formflow Conversational Forms User Manual',
    Keywords: 'Formflow, Form Builder, Chatbot Widget, Supabase, RBAC, Webhooks, CSV Export',
  },
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Color Palette
const PRIMARY = '#1e1b4b'; // Deep Indigo
const ACCENT = '#4f46e5';  // Vibrant Indigo
const TEXT = '#1e293b';    // Slate 800
const MUTED = '#64748b';   // Slate 500
const LIGHT_BG = '#f8fafc';// Slate 50
const BORDER = '#e2e8f0';  // Slate 200
const GREEN = '#059669';   // Emerald

function drawHeader(title: string, category = 'USER MANUAL') {
  doc.rect(50, 40, doc.page.width - 100, 2).fill(ACCENT);
  doc.fontSize(8).fillColor(ACCENT).font('Helvetica-Bold').text(category.toUpperCase(), 50, 48);
  doc.fontSize(16).fillColor(PRIMARY).font('Helvetica-Bold').text(title, 50, 60);
  doc.moveDown(1.5);
}

function drawFooter(pageNumber: number) {
  const bottom = doc.page.height - 45;
  doc.rect(50, bottom, doc.page.width - 100, 1).fill(BORDER);
  doc.fontSize(8).fillColor(MUTED).font('Helvetica').text('Formflow v2.0 — Interactive Conversational Form Builder', 50, bottom + 8);
  doc.fontSize(8).fillColor(MUTED).font('Helvetica-Bold').text(`Page ${pageNumber}`, doc.page.width - 90, bottom + 8, { align: 'right', width: 40 });
}

// ================= PAGE 1: COVER PAGE =================
doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0f172a'); // Slate 900

// Background accent banner
doc.rect(0, 200, doc.page.width, 240).fill('#1e1b4b');

doc.fontSize(13).fillColor('#818cf8').font('Helvetica-Bold').text('ENTERPRISE APPLICATION REFERENCE', 60, 230, { characterSpacing: 2 });
doc.fontSize(38).fillColor('#ffffff').font('Helvetica-Bold').text('FORMFLOW v2.0', 60, 255);
doc.fontSize(16).fillColor('#38bdf8').font('Helvetica').text('Interactive Conversational Form Builder & Embeddable Widget', 60, 305);

doc.fontSize(11).fillColor('#cbd5e1').font('Helvetica').text(
  'Comprehensive User Manual, Feature Documentation, Security Guide & Deployment Reference.',
  60,
  340,
  { width: doc.page.width - 120, lineGap: 4 }
);

// Metadata box at bottom
const metaTop = doc.page.height - 200;
doc.rect(60, metaTop, doc.page.width - 120, 120).fill('#1e293b');
doc.rect(60, metaTop, doc.page.width - 120, 120).stroke('#334155');

doc.fontSize(10).fillColor('#94a3b8').font('Helvetica-Bold').text('RELEASE METADATA', 80, metaTop + 20);
doc.fontSize(9).fillColor('#ffffff').font('Helvetica').text('Author: Sathwik (ganjisathwik73@gmail.com)', 80, metaTop + 40);
doc.text('Project: Full-Stack Web Development Take-Home (Task 2)', 80, metaTop + 55);
doc.text('Stack: React 19 • TypeScript • Vite • Tailwind CSS v4 • Supabase PostgreSQL • RBAC', 80, metaTop + 70);
doc.text('Repository: https://github.com/sathwik-svg/Full-StackWebDevelopment', 80, metaTop + 85);

// ================= PAGE 2: TABLE OF CONTENTS =================
doc.addPage();
drawHeader('Table of Contents & Executive Summary');

doc.fontSize(10).fillColor(TEXT).font('Helvetica').text(
  'Formflow restructures conventional multi-field web surveys into guided, one-question-at-a-time conversational chat experiences. By pacing respondents through interactive dialogue bubbles, Formflow eliminates form abandonment, delivers real-time validation feedback, and surfaces instant quantitative analytics.',
  50,
  95,
  { width: doc.page.width - 100, lineGap: 4 }
);

const tocItems = [
  { no: '01', title: 'System Architecture & Installation Guide', page: 'Page 3' },
  { no: '02', title: 'Curated Template Library (CSAT, Events, HR, Sales)', page: 'Page 4' },
  { no: '03', title: 'Form Builder & 7 Supported Question Types', page: 'Page 5' },
  { no: '04', title: 'Advanced Validation Engine & Error Handling', page: 'Page 6' },
  { no: '05', title: 'Chatbot Personalization & Web Audio Sound Synthesis', page: 'Page 7' },
  { no: '06', title: 'Live Interactive Previewing & 1-Click Duplication', page: 'Page 8' },
  { no: '07', title: 'Public Form Publishing & Zero-Dependency Embed Widget', page: 'Page 9' },
  { no: '08', title: 'Real-Time Webhooks & Outbound Notifications', page: 'Page 10' },
  { no: '09', title: 'Interactive Analytics Dashboard & RFC 4180 CSV Export', page: 'Page 11' },
  { no: '10', title: 'Role-Based Access Control (RBAC), Supabase RLS & Test Suite', page: 'Page 12' },
];

let tocY = 165;
doc.rect(50, tocY - 10, doc.page.width - 100, 310).fill(LIGHT_BG);
doc.rect(50, tocY - 10, doc.page.width - 100, 310).stroke(BORDER);

tocItems.forEach((item) => {
  doc.fontSize(10).fillColor(ACCENT).font('Helvetica-Bold').text(item.no, 65, tocY);
  doc.fontSize(10).fillColor(TEXT).font('Helvetica-Bold').text(item.title, 95, tocY);
  doc.fontSize(9).fillColor(MUTED).font('Helvetica').text(item.page, doc.page.width - 110, tocY, { align: 'right', width: 45 });
  tocY += 28;
});

drawFooter(2);

// ================= PAGE 3: INSTALLATION & ARCHITECTURE =================
doc.addPage();
drawHeader('01. System Architecture & Installation');

doc.fontSize(12).fillColor(PRIMARY).font('Helvetica-Bold').text('System Prerequisites', 50, 95);
doc.fontSize(9.5).fillColor(TEXT).font('Helvetica').text(
  '• Node.js v18.0.0 or higher\n• npm, yarn, or pnpm package manager\n• Modern web browser with Web Audio API support (Chrome, Firefox, Safari, Edge)',
  50, 115, { lineGap: 3 }
);

doc.fontSize(12).fillColor(PRIMARY).font('Helvetica-Bold').text('Quick Start Commands', 50, 170);
doc.rect(50, 190, doc.page.width - 100, 80).fill('#0f172a');
doc.fontSize(9).fillColor('#38bdf8').font('Courier').text('# 1. Clone repository from GitHub', 65, 202);
doc.fontSize(9).fillColor('#ffffff').text('git clone https://github.com/sathwik-svg/Full-StackWebDevelopment.git', 65, 217);
doc.fontSize(9).fillColor('#38bdf8').text('# 2. Install dependencies & start development server', 65, 235);
doc.fontSize(9).fillColor('#ffffff').text('cd Full-StackWebDevelopment && npm install && npm run dev', 65, 250);

doc.fontSize(12).fillColor(PRIMARY).font('Helvetica-Bold').text('Dual-Mode Database Architecture', 50, 290);
doc.fontSize(9.5).fillColor(TEXT).font('Helvetica').text(
  'Formflow employs an intelligent hybrid database abstraction layer:\n\n' +
  '1. Remote Supabase Production Engine: When VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present, Formflow establishes a real-time connection to your managed PostgreSQL database enforcing Row Level Security (RLS).\n\n' +
  '2. Zero-Config Local Storage Fallback Engine: If remote credentials are not provided or during offline testing, Formflow seamlessly switches to an in-browser persistent PostgREST query simulator backed by localStorage, pre-seeded with rich sample forms, questions, and responses.',
  50, 310, { width: doc.page.width - 100, lineGap: 4 }
);

drawFooter(3);

// ================= PAGE 4: CURATED TEMPLATE LIBRARY =================
doc.addPage();
drawHeader('02. Curated Template Library');

doc.fontSize(9.5).fillColor(TEXT).font('Helvetica').text(
  'To accelerate onboarding, Formflow includes 5 battle-tested conversational templates. Each template features pre-configured questions, validation boundaries, custom bot personas, and theme palettes.',
  50, 95, { width: doc.page.width - 100, lineGap: 3 }
);

const templates = [
  { name: 'Customer Satisfaction (CSAT)', desc: 'Captures sentiment with a 5-star rating, department select dropdown, and qualitative suggestions.', cat: 'Feedback', color: '#4f46e5' },
  { name: 'Event Registration & RSVP', desc: 'Collects attendee details with a calendar date picker, ticket tier dropdown, and dietary requirements.', cat: 'Events', color: '#0284c7' },
  { name: 'Product Feedback & Bug Triage', desc: 'Captures defect reports with severity scales (1-5), category dropdowns, and reproduction notes.', cat: 'Support', color: '#ea580c' },
  { name: 'Candidate Screening Form', desc: 'Screen applicants with years of experience dropdowns, tech stack selections, and earliest start date.', cat: 'HR', color: '#059669' },
  { name: 'Sales Lead Qualification', desc: 'Qualifies inbound prospects with budget tier dropdowns, company size, and meeting interest toggle.', cat: 'Sales', color: '#7c3aed' },
];

let tplY = 160;
templates.forEach((t) => {
  doc.rect(50, tplY, doc.page.width - 100, 52).fill(LIGHT_BG);
  doc.rect(50, tplY, doc.page.width - 100, 52).stroke(BORDER);
  doc.rect(50, tplY, 4, 52).fill(t.color);

  doc.fontSize(10).fillColor(PRIMARY).font('Helvetica-Bold').text(t.name, 65, tplY + 10);
  doc.fontSize(8).fillColor(MUTED).font('Helvetica-Bold').text(`CATEGORY: ${t.cat.toUpperCase()}`, doc.page.width - 140, tplY + 10, { width: 80, align: 'right' });
  doc.fontSize(8.5).fillColor(TEXT).font('Helvetica').text(t.desc, 65, tplY + 28, { width: doc.page.width - 130 });

  tplY += 60;
});

doc.fontSize(10).fillColor(ACCENT).font('Helvetica-Bold').text('How to Instantiate a Template:', 50, 480);
doc.fontSize(9).fillColor(TEXT).font('Helvetica').text(
  '1. Open the Dashboard and click the "Templates" button in the upper toolbar.\n' +
  '2. Select any template from the modal dialog to preview all included questions and types.\n' +
  '3. Click "Use This Template" to clone the blueprint into your account and open the Form Builder.',
  50, 498, { lineGap: 3 }
);

drawFooter(4);

// ================= PAGE 5: FORM BUILDER & 7 QUESTION TYPES =================
doc.addPage();
drawHeader('03. Form Builder & 7 Question Types');

doc.fontSize(9.5).fillColor(TEXT).font('Helvetica').text(
  'The Formflow Builder provides an intuitive interface for assembling conversational flows. Question sequence is easily reorganized using the up/down controls, and mandatory status can be toggled per question.',
  50, 95, { width: doc.page.width - 100, lineGap: 3 }
);

const qTypes = [
  { type: 'Short Text', tag: 'text', desc: 'Standard single-line text input for names, answers, and short qualitative remarks.' },
  { type: 'Validated Email', tag: 'email', desc: 'Email input with real-time RFC regex formatting validation to prevent bad leads.' },
  { type: 'Multiple Choice', tag: 'multiple_choice', desc: 'Presents customizable option pills in the chat thread. One click advances the conversation.' },
  { type: 'Yes / No', tag: 'yes_no', desc: 'High-contrast binary action buttons for quick qualification and boolean questions.' },
  { type: 'Dropdown Select', tag: 'dropdown', desc: 'Searchable dropdown selection menu for large option lists (departments, countries, tiers).' },
  { type: 'Interactive Rating', tag: 'rating', desc: 'Star icons (★) or numeric buttons (1-5 or 1-10) with custom polarity labels (Poor to Great).' },
  { type: 'Calendar Date', tag: 'date', desc: 'Native HTML5 date picker enforcing minimum and maximum date boundary parameters.' },
];

let qY = 160;
qTypes.forEach((q) => {
  doc.rect(50, qY, doc.page.width - 100, 42).fill(LIGHT_BG);
  doc.rect(50, qY, doc.page.width - 100, 42).stroke(BORDER);

  doc.fontSize(10).fillColor(PRIMARY).font('Helvetica-Bold').text(q.type, 65, qY + 8);
  doc.fontSize(7.5).fillColor(ACCENT).font('Courier-Bold').text(`[type: '${q.tag}']`, 180, qY + 9);
  doc.fontSize(8.5).fillColor(TEXT).font('Helvetica').text(q.desc, 65, qY + 24, { width: doc.page.width - 130 });

  qY += 48;
});

drawFooter(5);

// ================= PAGE 6: VALIDATION & ERROR PREVENTION =================
doc.addPage();
drawHeader('04. Advanced Validation Engine');

doc.fontSize(9.5).fillColor(TEXT).font('Helvetica').text(
  'Formflow features an inline validation engine that catches malformed answers immediately without breaking the chat pacing. Respondents receive gentle, actionable error messages directly above the input box.',
  50, 95, { width: doc.page.width - 100, lineGap: 3 }
);

doc.fontSize(11).fillColor(PRIMARY).font('Helvetica-Bold').text('Enforced Validation Rules:', 50, 150);

const rules = [
  { name: 'Required Field Enforcement', detail: 'Ensures non-empty answers before advancing. Prevents accidental submission of blank responses.' },
  { name: 'Email Syntax Verification', detail: 'Validates structure against standard email regex /^[^\s@]+@[^\s@]+\.[^\s@]+$/. Rejects missing domains or invalid characters.' },
  { name: 'Date Range Boundaries', detail: 'Configurable minDate and maxDate limits prevent out-of-range calendar selections (e.g., past dates for future events).' },
  { name: 'Rating Scale Bounds', detail: 'Constrains scores strictly between 1 and the configured maximum scale (e.g. 5 or 10).' },
  { name: 'Text Character Length', detail: 'Optional min and max length bounds prevent incomplete answers or excessive payload sizes.' },
];

let rY = 175;
rules.forEach((r) => {
  doc.rect(50, rY, 12, 12).fill(ACCENT);
  doc.fontSize(10).fillColor(PRIMARY).font('Helvetica-Bold').text(r.name, 70, rY);
  doc.fontSize(8.5).fillColor(TEXT).font('Helvetica').text(r.detail, 70, rY + 14, { width: doc.page.width - 120, lineGap: 2 });
  rY += 45;
});

doc.rect(50, 420, doc.page.width - 100, 80).fill('#fef2f2');
doc.rect(50, 420, doc.page.width - 100, 80).stroke('#fca5a5');
doc.fontSize(9.5).fillColor('#991b1b').font('Helvetica-Bold').text('Example Inline Error Notification:', 65, 432);
doc.fontSize(9).fillColor('#b91c1c').font('Helvetica').text(
  '• "Please enter a valid email address (e.g., name@domain.com)."\n' +
  '• "Date cannot be earlier than 2026-10-25."\n' +
  '• "This question is required. Please provide an answer."',
  65, 452, { lineGap: 3 }
);

drawFooter(6);

// ================= PAGE 7: CHATBOT PERSONALIZATION & AUDIO =================
doc.addPage();
drawHeader('05. Chatbot Personalization & Audio');

doc.fontSize(9.5).fillColor(TEXT).font('Helvetica').text(
  'Formflow provides comprehensive branding and aesthetic controls in the "Design & Bot" tab of the Form Builder, transforming generic widgets into recognizable brand ambassadors.',
  50, 95, { width: doc.page.width - 100, lineGap: 3 }
);

doc.fontSize(11).fillColor(PRIMARY).font('Helvetica-Bold').text('Customization Capabilities:', 50, 145);

const customOptions = [
  { title: 'Brand Theme Color', desc: 'Interactive hex color picker and curated preset palette (Indigo, Royal Blue, Sky, Emerald, Orange, Rose, Slate). Dynamically styles headers, user message bubbles, submit buttons, and launcher bubbles.' },
  { title: 'Selectable Bot Personas', desc: 'Choose between 5 dedicated avatar styles: Message Bubble, Sparkles (AI Assistant), Friendly Robot, Support Headset, or Personal User Avatar.' },
  { title: 'Bot Display Name', desc: 'Custom title rendered in the widget top header (e.g. "Customer Success Bot" or "Events Concierge").' },
  { title: 'Welcome & Thank-You Text', desc: 'Fully customizable conversational greetings and completion messages with "Start Over" support.' },
  { title: 'Launcher Corner Docking', desc: 'Position the floating launcher button at either bottom-right or bottom-left to avoid clashing with other website widgets.' },
  { title: 'Web Audio API Synthesizer', desc: 'Zero external audio assets required. In-browser audio synthesis generates pleasant, subtle pops on message send and harmonic chimes on form completion (with header mute toggle).' },
  { title: 'Auto-Popup Delay', desc: 'Optionally open the conversational widget automatically after 3s, 5s, or 10s to prompt visitor participation.' },
];

let cY = 170;
customOptions.forEach((c) => {
  doc.fontSize(9.5).fillColor(ACCENT).font('Helvetica-Bold').text(`• ${c.title}: `, 50, cY);
  const titleWidth = doc.widthOfString(`• ${c.title}: `);
  doc.fontSize(8.5).fillColor(TEXT).font('Helvetica').text(c.desc, 50 + titleWidth, cY, { width: doc.page.width - 100 - titleWidth, lineGap: 2 });
  cY += 40;
});

drawFooter(7);

// ================= PAGE 8: LIVE PREVIEW & 1-CLICK DUPLICATION =================
doc.addPage();
drawHeader('06. Live Preview & 1-Click Duplication');

doc.fontSize(11).fillColor(PRIMARY).font('Helvetica-Bold').text('Live Interactive Preview', 50, 95);
doc.fontSize(9.5).fillColor(TEXT).font('Helvetica').text(
  'The "Live Preview" tab in the Form Builder renders the production-grade ChatbotWidget component in real time. Creators can test typing responses, clicking multiple choice buttons, picking calendar dates, and verifying sound synthesis without affecting published production data.',
  50, 115, { width: doc.page.width - 100, lineGap: 3 }
);

doc.fontSize(11).fillColor(PRIMARY).font('Helvetica-Bold').text('1-Click Form Duplication Workflow', 50, 200);
doc.fontSize(9.5).fillColor(TEXT).font('Helvetica').text(
  'Duplicating forms allows teams to reuse existing surveys across different campaigns, client tiers, or departments without re-entering questions from scratch.',
  50, 220, { width: doc.page.width - 100, lineGap: 3 }
);

doc.rect(50, 260, doc.page.width - 100, 120).fill(LIGHT_BG);
doc.rect(50, 260, doc.page.width - 100, 120).stroke(BORDER);

doc.fontSize(9.5).fillColor(PRIMARY).font('Helvetica-Bold').text('Automated Duplication Actions:', 65, 275);
doc.fontSize(8.5).fillColor(TEXT).font('Helvetica').text(
  '1. Copies form title and appends "(Copy)" suffix.\n' +
  '2. Generates a fresh, unique URL slug (e.g. csat-survey-copy-k8f2).\n' +
  '3. Replicates all question prompts, types, options arrays, and validation limits.\n' +
  '4. Preserves exact display sequence and question position indexes.\n' +
  '5. Sets status to "draft" so the duplicate cannot receive public answers until reviewed.\n' +
  '6. Resets response counter to 0 and records an immutable audit log entry.',
  65, 295, { lineGap: 3 }
);

drawFooter(8);

// ================= PAGE 9: PUBLISHING & EMBED WIDGET =================
doc.addPage();
drawHeader('07. Publishing & Zero-Dependency Widget');

doc.fontSize(11).fillColor(PRIMARY).font('Helvetica-Bold').text('1. Public Shareable URLs', 50, 95);
doc.fontSize(9.5).fillColor(TEXT).font('Helvetica').text(
  'When a form status is set to "published", Formflow generates a standalone shareable URL: /#/f/<slug>. The public respondent view is responsive, distraction-free, and accessible on any mobile device.',
  50, 115, { width: doc.page.width - 100, lineGap: 3 }
);

doc.fontSize(11).fillColor(PRIMARY).font('Helvetica-Bold').text('2. Embeddable Widget (<script> Tag)', 50, 175);
doc.fontSize(9.5).fillColor(TEXT).font('Helvetica').text(
  'Formflow includes a lightweight, vanilla JavaScript embed script (public/formflow-widget.js) weighing under 15KB with zero external dependencies. It works on any HTML site, WordPress, Webflow, Shopify, or custom React/Vue/Angular app.',
  50, 195, { width: doc.page.width - 100, lineGap: 3 }
);

doc.rect(50, 240, doc.page.width - 100, 60).fill('#0f172a');
doc.fontSize(8.5).fillColor('#38bdf8').font('Courier').text('<!-- Add to any website HTML body -->', 65, 252);
doc.fontSize(8.5).fillColor('#ffffff').text('<script src="https://your-domain.com/formflow-widget.js" data-form-slug="YOUR_SLUG" async></script>', 65, 272);

doc.fontSize(11).fillColor(PRIMARY).font('Helvetica-Bold').text('3. Interactive Embed Sandbox', 50, 325);
doc.fontSize(9.5).fillColor(TEXT).font('Helvetica').text(
  'Visit the "Embed Demo" page (/#/embed/<formId>) to preview how your conversational widget appears inside a simulated third-party browser window, test responsive mobile floating behavior, and copy the embed code snippet with one click.',
  50, 345, { width: doc.page.width - 100, lineGap: 3 }
);

drawFooter(9);

// ================= PAGE 10: WEBHOOKS & NOTIFICATIONS =================
doc.addPage();
drawHeader('08. Webhooks & Real-Time Notifications');

doc.fontSize(9.5).fillColor(TEXT).font('Helvetica').text(
  'Formflow allows teams to connect conversational surveys directly into their backend workflows, CRMs, Slack notifications, or data pipelines via outbound HTTP POST webhooks.',
  50, 95, { width: doc.page.width - 100, lineGap: 3 }
);

doc.fontSize(11).fillColor(PRIMARY).font('Helvetica-Bold').text('Webhook Configuration & Testing:', 50, 140);
doc.fontSize(9).fillColor(TEXT).font('Helvetica').text(
  '1. In the Form Builder, open the "Webhooks" tab.\n' +
  '2. Input your target endpoint URL (e.g. https://api.yourcompany.com/webhook or webhook.site).\n' +
  '3. Click "Test Ping": Formflow immediately dispatches a verification event and reports response HTTP status code and round-trip latency in milliseconds.',
  50, 160, { lineGap: 3 }
);

doc.fontSize(11).fillColor(PRIMARY).font('Helvetica-Bold').text('Standard JSON Dispatch Payload Schema:', 50, 230);
doc.rect(50, 250, doc.page.width - 100, 150).fill('#0f172a');
doc.fontSize(8).fillColor('#cbd5e1').font('Courier').text(
  '{\n' +
  '  "event": "form_response.created",\n' +
  '  "timestamp": "2026-10-22T04:00:00.000Z",\n' +
  '  "form": {\n' +
  '    "id": "form_csat_demo",\n' +
  '    "title": "Customer Satisfaction (CSAT)",\n' +
  '    "slug": "csat-feedback"\n' +
  '  },\n' +
  '  "response": {\n' +
  '    "id": "resp_csat_1",\n' +
  '    "submitted_at": "2026-10-22T04:00:00.000Z",\n' +
  '    "answers": {\n' +
  '      "q_csat_1": "5",\n' +
  '      "q_csat_2": "Customer Support",\n' +
  '      "q_csat_3": "Remarkably fast turnaround and crystal-clear instructions!"\n' +
  '    }\n' +
  '  }\n' +
  '}',
  65, 260
);

drawFooter(10);

// ================= PAGE 11: ANALYTICS & CSV EXPORT =================
doc.addPage();
drawHeader('09. Analytics Charts & CSV Export');

doc.fontSize(9.5).fillColor(TEXT).font('Helvetica').text(
  'Formflow provides visual analytics to transform raw submission tables into actionable executive insights without requiring third-party BI software.',
  50, 95, { width: doc.page.width - 100, lineGap: 3 }
);

doc.fontSize(11).fillColor(PRIMARY).font('Helvetica-Bold').text('Analytics Engine Components:', 50, 140);

const analyticsFeatures = [
  { name: 'Submissions Timeline Chart', desc: 'Chronological bar chart grouping response volume over daily and weekly intervals to identify peak traffic periods.' },
  { name: 'Star Rating & Sentiment Breakdown', desc: 'Computes weighted average score (e.g. 4.6 / 5.0) and renders distribution meters for each score tier.' },
  { name: 'Choice & Dropdown Analysis', desc: 'Visual horizontal percentage bars illustrating option selections across dropdown and multiple-choice questions.' },
  { name: 'Key Performance Indicators (KPIs)', desc: 'Surfaces Total Responses, Average Completion Rate (%), Average Flow Duration, and Active Form Status.' },
];

let aY = 165;
analyticsFeatures.forEach((a) => {
  doc.rect(50, aY, 8, 8).fill(ACCENT);
  doc.fontSize(10).fillColor(PRIMARY).font('Helvetica-Bold').text(a.name, 68, aY - 1);
  doc.fontSize(8.5).fillColor(TEXT).font('Helvetica').text(a.desc, 68, aY + 12, { width: doc.page.width - 120, lineGap: 2 });
  aY += 40;
});

doc.fontSize(11).fillColor(PRIMARY).font('Helvetica-Bold').text('RFC 4180 Compliant CSV Export', 50, 340);
doc.fontSize(9.5).fillColor(TEXT).font('Helvetica').text(
  'Formflow includes an automated CSV export engine. Clicking "Export CSV" compiles all recorded submissions, maps question prompt texts cleanly to column headers, and enforces RFC 4180 escaping (wrapping commas, multiline text, and double quotes) to ensure instant compatibility with Excel, Google Sheets, and PostgreSQL.',
  50, 360, { width: doc.page.width - 100, lineGap: 3 }
);

drawFooter(11);

// ================= PAGE 12: RBAC, RLS & TEST SUITE =================
doc.addPage();
drawHeader('10. Security, RBAC & Test Verification');

doc.fontSize(11).fillColor(PRIMARY).font('Helvetica-Bold').text('Role-Based Access Control (RBAC) Matrix', 50, 95);

// Draw RBAC table
const tableTop = 115;
doc.rect(50, tableTop, doc.page.width - 100, 20).fill(PRIMARY);
doc.fontSize(8.5).fillColor('#ffffff').font('Helvetica-Bold');
doc.text('PERMISSIONS', 60, tableTop + 6);
doc.text('ADMIN', 280, tableTop + 6);
doc.text('CREATOR', 360, tableTop + 6);
doc.text('VIEWER', 440, tableTop + 6);

const rbacRows = [
  { perm: 'Create, Edit & Duplicate Forms', a: 'YES', c: 'YES', v: 'NO' },
  { perm: 'Publish & Unpublish Forms', a: 'YES', c: 'YES', v: 'NO' },
  { perm: 'View Responses & Analytics', a: 'YES', c: 'YES', v: 'YES' },
  { perm: 'Export Submissions to CSV', a: 'YES', c: 'YES', v: 'YES' },
  { perm: 'Configure Outbound Webhooks', a: 'YES', c: 'YES', v: 'NO' },
  { perm: 'Delete Individual Submissions', a: 'YES', c: 'NO', v: 'NO' },
  { perm: 'Permanently Delete Forms', a: 'YES', c: 'NO', v: 'NO' },
  { perm: 'Inspect System Audit Logs', a: 'YES', c: 'NO', v: 'NO' },
];

let rowY = tableTop + 20;
rbacRows.forEach((r, idx) => {
  doc.rect(50, rowY, doc.page.width - 100, 18).fill(idx % 2 === 0 ? LIGHT_BG : '#ffffff');
  doc.rect(50, rowY, doc.page.width - 100, 18).stroke(BORDER);
  doc.fontSize(8).fillColor(TEXT).font('Helvetica').text(r.perm, 60, rowY + 5);
  doc.fontSize(8).fillColor(r.a === 'YES' ? GREEN : '#991b1b').font('Helvetica-Bold').text(r.a, 285, rowY + 5);
  doc.fontSize(8).fillColor(r.c === 'YES' ? GREEN : '#991b1b').font('Helvetica-Bold').text(r.c, 365, rowY + 5);
  doc.fontSize(8).fillColor(r.v === 'YES' ? GREEN : '#991b1b').font('Helvetica-Bold').text(r.v, 445, rowY + 5);
  rowY += 18;
});

doc.fontSize(11).fillColor(PRIMARY).font('Helvetica-Bold').text('Automated Test Suite Verification', 50, 310);
doc.rect(50, 330, doc.page.width - 100, 90).fill('#ecfdf5');
doc.rect(50, 330, doc.page.width - 100, 90).stroke('#a7f3d0');

doc.fontSize(9.5).fillColor(GREEN).font('Helvetica-Bold').text('✓ 35 / 35 Automated Unit Tests Passing (0 Failures)', 65, 345);
doc.fontSize(8.5).fillColor('#065f46').font('Helvetica').text(
  '• Role-Based Access Control: 14 assertions validating permission matrices across all 3 roles.\n' +
  '• Question Validation Engine: 11 assertions validating email regex, date bounds, ratings, and required rules.\n' +
  '• CSV Export Engine: 5 assertions testing RFC 4180 escaping, quotes encapsulation, and header mapping.\n' +
  '• Hash Router Engine: 5 assertions testing serialization and deserialization of client hash routes.',
  65, 365, { lineGap: 3 }
);

drawFooter(12);

// Finalize PDF
doc.end();

writeStream.on('finish', () => {
  console.log(`✓ PDF User Manual successfully generated at ${outputPath}`);
});
