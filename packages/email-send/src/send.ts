import type { SendEmailInput, SendEmailResult } from './types';

function shouldSimulate(input: SendEmailInput): boolean {
  if (input.simulation === true) return true;
  if (process.env.SIMULATION_MODE === 'true') return true;
  if (!process.env.POSTMARK_API_TOKEN) return true;
  return false;
}

async function sendPostmark(input: SendEmailInput): Promise<SendEmailResult> {
  const token = process.env.POSTMARK_API_TOKEN;
  if (!token) {
    return { ok: false, simulated: false, provider: 'postmark', error: 'POSTMARK_API_TOKEN missing' };
  }

  const from =
    input.fromEmail ||
    process.env.EMAIL_FROM ||
    'noreply@threezero.agency';

  try {
    const res = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': token,
      },
      body: JSON.stringify({
        From: input.fromName ? `${input.fromName} <${from}>` : from,
        To: input.toName ? `${input.toName} <${input.toEmail}>` : input.toEmail,
        Subject: input.subject,
        HtmlBody: input.bodyHtml,
        TextBody: input.bodyText || undefined,
        MessageStream: process.env.POSTMARK_STREAM || 'outbound',
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      MessageID?: string;
      Message?: string;
      ErrorCode?: number;
    };

    if (!res.ok) {
      return {
        ok: false,
        simulated: false,
        provider: 'postmark',
        error: data.Message || `Postmark HTTP ${res.status}`,
      };
    }

    return {
      ok: true,
      simulated: false,
      provider: 'postmark',
      messageId: data.MessageID,
    };
  } catch (e) {
    return {
      ok: false,
      simulated: false,
      provider: 'postmark',
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (shouldSimulate(input)) {
    return {
      ok: true,
      simulated: true,
      provider: 'simulation',
      messageId: `sim_${Date.now().toString(36)}`,
    };
  }
  return sendPostmark(input);
}
