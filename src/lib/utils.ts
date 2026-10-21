export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

const SLUG_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function generateSlug(length = 8): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += SLUG_CHARS[Math.floor(Math.random() * SLUG_CHARS.length)];
  }
  return out;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
