import type { Form, Question, ResponseRow } from './supabase';

function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  // If string contains comma, newline, or quotes, wrap in quotes and escape internal quotes
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

export function generateCSVContent(form: Form, questions: Question[], responses: ResponseRow[]): string {
  const sortedQuestions = [...questions].sort((a, b) => a.position - b.position);

  // Headers
  const headers = ['Response ID', 'Submitted At (UTC)'];
  for (const q of sortedQuestions) {
    headers.push(q.text);
  }
  const rows = [headers.map(escapeCSV).join(',')];

  // Data rows
  for (const r of responses) {
    const row = [r.id, r.created_at];
    for (const q of sortedQuestions) {
      const ans = r.answers?.[q.id] ?? '';
      row.push(ans);
    }
    rows.push(row.map(escapeCSV).join(','));
  }

  return rows.join('\r\n');
}

export function downloadResponsesCSV(form: Form, questions: Question[], responses: ResponseRow[]): { count: number; filename: string } {
  const csv = generateCSVContent(form, questions, responses);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeSlug = (form.slug || 'form').replace(/[^a-zA-Z0-9-_]/g, '_');
  const filename = `${safeSlug}-responses-${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return { count: responses.length, filename };
}
