/**
 * Website contact extraction – robots.txt respectful, timeout-bound.
 * Extracts emails/phones from homepage + common contact paths.
 */

import type {
  SourceAdapter,
  DiscoverQuery,
  DiscoverResult,
  EnrichInput,
  EnrichResult,
  AdapterContext,
} from '../types';

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}/g;

const CONTACT_PATHS = ['/', '/contact', '/contact-us', '/about', '/about-us'];

const BLOCKED_EMAIL_SUFFIXES = ['example.com', 'sentry.io', 'wixpress.com', 'schema.org'];

async function robotsAllows(origin: string, path: string, signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(`${origin}/robots.txt`, {
      signal: signal ?? AbortSignal.timeout(5_000),
      headers: { 'User-Agent': 'LeadPilotBot/1.0' },
    });
    if (!res.ok) return true; // fail-open if no robots
    const text = await res.text();
    // Very small parser: Disallow: / for User-agent: * or LeadPilotBot
    const lines = text.split(/\r?\n/);
    let applies = false;
    for (const line of lines) {
      const t = line.trim();
      if (/^user-agent:\s*\*/i.test(t) || /^user-agent:\s*leadpilot/i.test(t)) {
        applies = true;
        continue;
      }
      if (/^user-agent:/i.test(t)) applies = false;
      if (applies && /^disallow:\s*\/$/i.test(t)) return false;
      if (applies && /^disallow:\s*(.+)/i.test(t)) {
        const dis = RegExp.$1.trim();
        if (dis && path.startsWith(dis)) return false;
      }
    }
    return true;
  } catch {
    return true;
  }
}

function pickEmail(html: string): string | null {
  const matches = html.match(EMAIL_RE) || [];
  for (const m of matches) {
    const lower = m.toLowerCase();
    if (BLOCKED_EMAIL_SUFFIXES.some((s) => lower.endsWith(s))) continue;
    if (lower.includes('noreply') || lower.includes('no-reply')) continue;
    return lower;
  }
  return null;
}

function pickPhone(html: string): string | null {
  const matches = html.match(PHONE_RE) || [];
  for (const m of matches) {
    const digits = m.replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 15) return m.trim();
  }
  return null;
}

export const websiteExtractAdapter: SourceAdapter = {
  id: 'WEBSITE_EXTRACT',
  name: 'Website Contact Extraction',
  countries: ['US', 'UK', 'AU'],
  kind: 'enrichment',

  async discover(): Promise<DiscoverResult> {
    return { leads: [] };
  },

  async enrich(input: EnrichInput, ctx: AdapterContext): Promise<EnrichResult> {
    if (ctx.simulation || input.simulation) {
      return {
        simulated: true,
        email: 'info@example-clinic.com',
        phone: '+15550100777',
        website: input.website || (input.domain ? `https://${input.domain}` : null),
        raw: { simulated: true },
      };
    }

    let base = input.website || (input.domain ? `https://${input.domain}` : null);
    if (!base) return { raw: { error: 'no_website' } };
    if (!/^https?:\/\//i.test(base)) base = `https://${base}`;

    let origin: string;
    try {
      origin = new URL(base).origin;
    } catch {
      return { raw: { error: 'bad_url' } };
    }

    let email: string | null = null;
    let phone: string | null = null;
    const pagesFetched: string[] = [];

    for (const path of CONTACT_PATHS) {
      if (!(await robotsAllows(origin, path, ctx.signal))) {
        ctx.log?.('info', 'website.robots_blocked', { origin, path });
        continue;
      }
      try {
        const url = path === '/' ? base! : `${origin}${path}`;
        const res = await fetch(url, {
          signal: ctx.signal ?? AbortSignal.timeout(10_000),
          headers: {
            'User-Agent': 'LeadPilotBot/1.0 (+https://threezero.agency; contact enrichment)',
            Accept: 'text/html',
          },
          redirect: 'follow',
        });
        if (!res.ok) continue;
        const html = await res.text();
        pagesFetched.push(path);
        email = email || pickEmail(html);
        phone = phone || pickPhone(html);
        if (email && phone) break;
      } catch (e) {
        ctx.log?.('warn', 'website.fetch_failed', {
          path,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    return {
      email,
      phone,
      website: base,
      raw: { pagesFetched, origin },
    };
  },
};
