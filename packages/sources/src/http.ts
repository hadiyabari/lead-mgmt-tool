/**
 * HTTP client with timeout, exponential backoff retries, and simple circuit breaker.
 */

import type { HttpClientOptions } from './types';

type CircuitState = { failures: number; openUntil: number };

const circuits = new Map<string, CircuitState>();

const DEFAULTS = {
  timeoutMs: 15_000,
  maxRetries: 3,
  baseDelayMs: 400,
  failureThreshold: 5,
  coolDownMs: 30_000,
};

function circuitKey(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function assertCircuit(host: string) {
  const c = circuits.get(host);
  if (c && c.openUntil > Date.now()) {
    throw new Error(`Circuit open for ${host} until ${new Date(c.openUntil).toISOString()}`);
  }
}

function recordSuccess(host: string) {
  circuits.delete(host);
}

function recordFailure(host: string) {
  const c = circuits.get(host) ?? { failures: 0, openUntil: 0 };
  c.failures += 1;
  if (c.failures >= DEFAULTS.failureThreshold) {
    c.openUntil = Date.now() + DEFAULTS.coolDownMs;
  }
  circuits.set(host, c);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function httpJson<T = unknown>(
  url: string,
  init: RequestInit & { opts?: HttpClientOptions } = {}
): Promise<T> {
  const opts = { ...DEFAULTS, ...init.opts };
  const host = circuitKey(url);
  assertCircuit(host);

  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), opts.timeoutMs);
    try {
      const res = await fetch(url, {
        ...init,
        signal: init.signal ?? controller.signal,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'LeadPilot/1.0 (official-registry-client)',
          ...(init.headers || {}),
        },
      });
      clearTimeout(timer);

      if (res.status === 429 || res.status >= 500) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
      }

      opts.onCost?.(opts.costPerCall ?? 0, { url });
      recordSuccess(host);
      return (await res.json()) as T;
    } catch (e) {
      clearTimeout(timer);
      lastError = e;
      recordFailure(host);
      if (attempt < opts.maxRetries) {
        const delay = opts.baseDelayMs * Math.pow(2, attempt);
        await sleep(delay);
        continue;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/** Reset circuits (tests). */
export function resetCircuits() {
  circuits.clear();
}
