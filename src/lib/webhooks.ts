import type { Form, WebhookLog } from './supabase';

export interface WebhookPayload {
  event: 'form_response.created' | 'webhook.ping';
  timestamp: string;
  form: {
    id: string;
    title: string;
    slug: string;
  };
  response?: {
    id: string;
    submitted_at: string;
    answers: Record<string, string>;
  };
}

export async function testWebhookEndpoint(url: string, form: Form): Promise<{ success: boolean; statusCode?: number; latencyMs: number; error?: string }> {
  const start = performance.now();
  const testPayload: WebhookPayload = {
    event: 'webhook.ping',
    timestamp: new Date().toISOString(),
    form: {
      id: form.id,
      title: form.title,
      slug: form.slug,
    },
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Formflow-Webhooks/2.0',
        'X-Formflow-Event': 'webhook.ping',
      },
      body: JSON.stringify(testPayload),
      signal: AbortSignal.timeout(8000),
    });

    const latencyMs = Math.round(performance.now() - start);
    return {
      success: res.ok,
      statusCode: res.status,
      latencyMs,
      error: res.ok ? undefined : `Server returned HTTP ${res.status}: ${res.statusText}`,
    };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - start);
    const msg = err instanceof Error ? err.message : 'Connection failed';
    return {
      success: false,
      statusCode: 0,
      latencyMs,
      error: msg.includes('timeout') ? 'Request timed out after 8 seconds' : msg,
    };
  }
}

export async function dispatchWebhook(form: Form, responseId: string, answers: Record<string, string>): Promise<WebhookLog | null> {
  if (!form.webhook_url || !form.webhook_url.trim()) {
    return null;
  }

  const payload: WebhookPayload = {
    event: 'form_response.created',
    timestamp: new Date().toISOString(),
    form: {
      id: form.id,
      title: form.title,
      slug: form.slug,
    },
    response: {
      id: responseId,
      submitted_at: new Date().toISOString(),
      answers,
    },
  };

  let statusCode = 200;
  let status: 'success' | 'failed' = 'success';

  try {
    const res = await fetch(form.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Formflow-Webhooks/2.0',
        'X-Formflow-Event': 'form_response.created',
        'X-Formflow-Form-Id': form.id,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000),
    });

    statusCode = res.status;
    status = res.ok ? 'success' : 'failed';
  } catch {
    statusCode = 504;
    status = 'failed';
  }

  const log: WebhookLog = {
    id: 'wh_' + Math.random().toString(36).substring(2, 11),
    form_id: form.id,
    response_id: responseId,
    payload: payload as unknown as Record<string, unknown>,
    status_code: statusCode,
    status,
    url: form.webhook_url,
    created_at: new Date().toISOString(),
  };

  // Save log into localStorage so user can review recent webhook executions
  try {
    const existing = JSON.parse(localStorage.getItem('formflow_webhook_logs') || '[]') as WebhookLog[];
    localStorage.setItem('formflow_webhook_logs', JSON.stringify([log, ...existing].slice(0, 50)));
  } catch {
    // Ignore storage errors
  }

  return log;
}
