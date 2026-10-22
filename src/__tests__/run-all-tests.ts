import { getPermissions } from '../lib/auth';
import { generateCSVContent } from '../lib/export';
import { parseHash, routeToHash } from '../lib/router';
import type { Form, Question, ResponseRow } from '../lib/supabase';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failed++;
    console.error(`  ✕ FAIL: ${testName} ${details ? `(${details})` : ''}`);
  }
}

function suite(name: string, fn: () => void) {
  console.log(`\n--- Test Suite: ${name} ---`);
  fn();
}

// 1. RBAC Permissions Matrix
suite('Role-Based Access Control (RBAC)', () => {
  const admin = getPermissions('admin');
  assert(admin.canCreateForm === true, 'Admin can create forms');
  assert(admin.canDeleteForm === true, 'Admin can delete forms');
  assert(admin.canDeleteResponse === true, 'Admin can delete responses');
  assert(admin.canManageWebhooks === true, 'Admin can manage webhooks');
  assert(admin.canAccessAdminSettings === true, 'Admin can access system settings');

  const creator = getPermissions('creator');
  assert(creator.canCreateForm === true, 'Creator can create forms');
  assert(creator.canEditForm === true, 'Creator can edit forms');
  assert(creator.canDeleteForm === false, 'Creator CANNOT delete forms (Admin only)');
  assert(creator.canDeleteResponse === false, 'Creator CANNOT delete responses (Audit integrity)');
  assert(creator.canExportCSV === true, 'Creator can export CSV');

  const viewer = getPermissions('viewer');
  assert(viewer.canCreateForm === false, 'Viewer CANNOT create forms');
  assert(viewer.canEditForm === false, 'Viewer CANNOT edit forms');
  assert(viewer.canDeleteForm === false, 'Viewer CANNOT delete forms');
  assert(viewer.canExportCSV === true, 'Viewer CAN export CSV (Read-only analytics allowed)');
});

// 2. CSV Export Formatting & RFC 4180 Escaping
suite('CSV Export Engine', () => {
  const sampleForm: Form = {
    id: 'f1',
    title: 'Customer Survey',
    description: null,
    status: 'published',
    welcome_text: 'Hello',
    theme_color: '#2563eb',
    slug: 'cust-survey',
    created_at: '2026-10-22T00:00:00.000Z',
    updated_at: '2026-10-22T00:00:00.000Z',
  };

  const sampleQuestions: Question[] = [
    {
      id: 'q1',
      form_id: 'f1',
      text: 'What is your name?',
      type: 'text',
      options: [],
      required: true,
      position: 0,
      created_at: '',
    },
    {
      id: 'q2',
      form_id: 'f1',
      text: 'Feedback, thoughts & suggestions',
      type: 'text',
      options: [],
      required: false,
      position: 1,
      created_at: '',
    },
  ];

  const sampleResponses: ResponseRow[] = [
    {
      id: 'r1',
      form_id: 'f1',
      answers: {
        q1: 'Alice Smith',
        q2: 'Fast, great "quote" & great experience!',
      },
      created_at: '2026-10-22T01:00:00.000Z',
    },
    {
      id: 'r2',
      form_id: 'f1',
      answers: {
        q1: 'Bob Jones',
        q2: 'Line 1\nLine 2',
      },
      created_at: '2026-10-22T02:00:00.000Z',
    },
  ];

  const csv = generateCSVContent(sampleForm, sampleQuestions, sampleResponses);
  assert(csv.includes('"Response ID"'), 'Contains Response ID header');
  assert(csv.includes('"What is your name?"'), 'Contains Question 1 header');
  assert(csv.includes('"Feedback, thoughts & suggestions"'), 'Contains Question 2 header with comma escaping');
  assert(csv.includes('"Fast, great ""quote"" & great experience!"'), 'Properly escapes internal quotes per RFC 4180');
  assert(csv.includes('"Line 1\nLine 2"'), 'Properly quotes multiline answer string');
});

// 3. Question Validation Logic
suite('Question Validation Rules', () => {
  function validateField(q: Question, val: string): boolean {
    const v = val.trim();
    if (q.required && !v) return false;
    if (!v) return true;

    if (q.type === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }
    if (q.type === 'rating') {
      const n = Number(v);
      const scale = q.validation?.ratingScale || 5;
      return !isNaN(n) && n >= 1 && n <= scale;
    }
    if (q.type === 'date') {
      const d = new Date(v);
      if (isNaN(d.getTime())) return false;
      if (q.validation?.minDate && d < new Date(q.validation.minDate)) return false;
      if (q.validation?.maxDate && d > new Date(q.validation.maxDate)) return false;
      return true;
    }
    return true;
  }

  const reqEmailQ: Question = {
    id: 'q_email',
    form_id: 'f1',
    text: 'Email',
    type: 'email',
    options: [],
    required: true,
    position: 0,
    created_at: '',
  };

  assert(validateField(reqEmailQ, '') === false, 'Rejects empty required email');
  assert(validateField(reqEmailQ, 'invalid-email') === false, 'Rejects malformed email address');
  assert(validateField(reqEmailQ, 'test@example.com') === true, 'Accepts valid email address');

  const ratingQ: Question = {
    id: 'q_rate',
    form_id: 'f1',
    text: 'Rating',
    type: 'rating',
    options: [],
    required: true,
    position: 1,
    validation: { ratingScale: 5 },
    created_at: '',
  };

  assert(validateField(ratingQ, '0') === false, 'Rejects 0 rating on 1-5 scale');
  assert(validateField(ratingQ, '6') === false, 'Rejects 6 rating on 1-5 scale');
  assert(validateField(ratingQ, '5') === true, 'Accepts 5 rating on 1-5 scale');
  assert(validateField(ratingQ, '3') === true, 'Accepts 3 rating on 1-5 scale');

  const dateQ: Question = {
    id: 'q_date',
    form_id: 'f1',
    text: 'Event Date',
    type: 'date',
    options: [],
    required: true,
    position: 2,
    validation: { minDate: '2026-10-01', maxDate: '2026-10-31' },
    created_at: '',
  };

  assert(validateField(dateQ, 'not-a-date') === false, 'Rejects invalid date string');
  assert(validateField(dateQ, '2026-09-30') === false, 'Rejects date earlier than minDate');
  assert(validateField(dateQ, '2026-11-01') === false, 'Rejects date later than maxDate');
  assert(validateField(dateQ, '2026-10-15') === true, 'Accepts valid in-range date');
});

// 4. Router and Hash Parsing
suite('Hash Router Serialization', () => {
  assert(parseHash('').name === 'home', 'Empty hash defaults to home');
  assert(parseHash('#/dashboard').name === 'dashboard', 'Parses dashboard route');
  assert(routeToHash({ name: 'builder', formId: 'f-123' }) === '#/builder/f-123', 'Serializes builder route');
  assert(routeToHash({ name: 'responses', formId: 'f-123' }) === '#/responses/f-123', 'Serializes responses route');
  assert(routeToHash({ name: 'public', slug: 'csat' }) === '#/f/csat', 'Serializes public form slug route');
});

console.log(`\n================================`);
console.log(`Test Execution Summary:`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);
console.log(`================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
