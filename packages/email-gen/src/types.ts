export type EmailFact = {
  id: string;
  kind: 'audit_finding' | 'company' | 'enrichment' | 'offer' | 'compliance';
  text: string;
  source?: string;
};

export type AuditFindingLite = {
  title: string;
  severity?: string;
  category?: string;
  description?: string;
};

export type GenerateEmailInput = {
  companyName: string;
  toName?: string | null;
  website?: string | null;
  domain?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  vertical?: string | null;
  auditScore?: number | null;
  findings?: AuditFindingLite[];
  rating?: number | null;
  reviewCount?: number | null;
  offerName?: string | null;
  offerSummary?: string | null;
  senderName?: string | null;
  agencyName?: string | null;
  legalAddress?: string | null;
  simulation?: boolean;
};

export type GeneratedEmail = {
  subject: string;
  bodyText: string;
  bodyHtml: string;
  factsUsed: EmailFact[];
  simulated: boolean;
  model?: string;
};
