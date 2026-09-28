import type { AuditClientOptions, AuditResultPayload, AuditFinding } from './types';

const memoryCache = new Map<string, { expires: number; value: AuditResultPayload }>();
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function cacheKey(url: string) {
  return url.trim().toLowerCase().replace(/\/$/, '');
}

function simulatedAudit(url: string): AuditResultPayload {
  const findings: AuditFinding[] = [
    {
      category: 'local_seo',
      severity: 'high',
      title: 'Google Business Profile incomplete',
      description: 'Missing categories, hours, or photos (simulated).',
    },
    {
      category: 'website',
      severity: 'medium',
      title: 'Weak mobile conversion path',
      description: 'Primary CTA below the fold on mobile (simulated).',
    },
    {
      category: 'aeo',
      severity: 'medium',
      title: 'No FAQ / entity markup',
      description: 'Limited structured data for AI answer engines (simulated).',
    },
  ];
  // Deterministic-ish score from URL length
  const score = 35 + (url.length % 40);
  return {
    url,
    score,
    findings,
    summary: `Simulated audit for ${url}: score ${score}/100.`,
    simulated: true,
    auditedAt: new Date().toISOString(),
    raw: { provider: 'simulation' },
  };
}

/**
 * Call agency audit tool.
 * Expected response shape (flexible):
 *   { score: number, findings: AuditFinding[], summary?: string }
 * or { data: { score, findings } }
 */
export async function runAudit(
  url: string,
  opts: AuditClientOptions = {}
): Promise<AuditResultPayload> {
  const key = cacheKey(url);
  const cached = memoryCache.get(key);
  if (cached && cached.expires > Date.now()) {
    return { ...cached.value, raw: { ...cached.value.raw, cacheHit: true } };
  }

  const simulation =
    opts.simulation ??
    process.env.SIMULATION_MODE === 'true' ||
    !opts.baseUrl && !process.env.AUDIT_TOOL_URL;

  if (simulation) {
    const payload = simulatedAudit(url);
    memoryCache.set(key, { expires: Date.now() + DEFAULT_TTL_MS, value: payload });
    return payload;
  }

  const base = (opts.baseUrl || process.env.AUDIT_TOOL_URL || '').replace(/\/$/, '');
  const apiKey = opts.apiKey || process.env.AUDIT_TOOL_API_KEY;
  const timeoutMs = opts.timeoutMs ?? 60_000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${base}/audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Audit tool HTTP ${res.status}: ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as Record<string, unknown>;
    const data = (json.data as Record<string, unknown>) || json;
    const score = Number(data.score ?? 0);
    const findings = (Array.isArray(data.findings) ? data.findings : []) as AuditFinding[];

    const payload: AuditResultPayload = {
      url,
      score,
      findings,
      summary: typeof data.summary === 'string' ? data.summary : undefined,
      auditedAt: new Date().toISOString(),
      raw: json,
    };

    memoryCache.set(key, { expires: Date.now() + DEFAULT_TTL_MS, value: payload });
    return payload;
  } catch (e) {
    clearTimeout(timer);
    // Fallback to simulation if tool unavailable (pipeline continues)
    const fallback = simulatedAudit(url);
    fallback.raw = {
      ...fallback.raw,
      fallback: true,
      error: e instanceof Error ? e.message : String(e),
    };
    return fallback;
  }
}

export function clearAuditCache() {
  memoryCache.clear();
}
