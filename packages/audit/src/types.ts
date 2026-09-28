/**
 * Agency audit tool contract: URL → structured score + findings
 */

export type AuditFinding = {
  id?: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | string;
  title: string;
  description?: string;
  evidence?: string;
};

export type AuditResultPayload = {
  url: string;
  score: number; // 0–100
  findings: AuditFinding[];
  summary?: string;
  raw?: Record<string, unknown>;
  simulated?: boolean;
  auditedAt: string; // ISO
};

export type AuditClientOptions = {
  /** Base URL of the agency audit tool API */
  baseUrl?: string;
  /** API key / bearer if required */
  apiKey?: string;
  timeoutMs?: number;
  simulation?: boolean;
};
