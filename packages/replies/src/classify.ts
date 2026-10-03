export type ReplyClass =
  | 'INTERESTED'
  | 'OBJECTION'
  | 'UNSUBSCRIBE'
  | 'OUT_OF_OFFICE'
  | 'BOUNCE'
  | 'OTHER'
  | 'UNCLASSIFIED';

const RULES: { cls: ReplyClass; patterns: RegExp[] }[] = [
  {
    cls: 'UNSUBSCRIBE',
    patterns: [
      /\bunsubscribe\b/i,
      /\bremove me\b/i,
      /\bopt[\s-]?out\b/i,
      /\bstop emailing\b/i,
      /\bdo not contact\b/i,
      /\btake me off\b/i,
    ],
  },
  {
    cls: 'BOUNCE',
    patterns: [
      /\bdelivery (status notification|failure|has failed)\b/i,
      /\bmailer-daemon\b/i,
      /\bundeliverable\b/i,
      /\buser unknown\b/i,
      /\bmailbox (full|unavailable)\b/i,
      /\b550\b.*\b5\.\d\.\d\b/,
    ],
  },
  {
    cls: 'OUT_OF_OFFICE',
    patterns: [
      /\bout of (the )?office\b/i,
      /\bautomatic reply\b/i,
      /\bauto[- ]?reply\b/i,
      /\bon leave\b/i,
      /\baway from (the )?office\b/i,
    ],
  },
  {
    cls: 'INTERESTED',
    patterns: [
      /\binterested\b/i,
      /\bsounds good\b/i,
      /\blet'?s (talk|chat|connect|schedule)\b/i,
      /\bbook a (call|meeting)\b/i,
      /\bsend (over )?(more|the) (info|details)\b/i,
      /\bwhen (can|could) we\b/i,
      /\bavailable (to )?(chat|talk|meet)\b/i,
    ],
  },
  {
    cls: 'OBJECTION',
    patterns: [
      /\bnot interested\b/i,
      /\bno thank/i,
      /\balready (have|working with)\b/i,
      /\btoo expensive\b/i,
      /\bnot a (good )?fit\b/i,
      /\bplease don'?t\b/i,
    ],
  },
];

/**
 * Rule-based classifier. Deterministic; no LLM required.
 * First matching category wins (order: unsub, bounce, OOO, interested, objection).
 */
export function classifyReply(subject?: string | null, bodyText?: string | null): ReplyClass {
  const text = `${subject || ''}\n${bodyText || ''}`.trim();
  if (!text) return 'UNCLASSIFIED';

  for (const rule of RULES) {
    for (const re of rule.patterns) {
      if (re.test(text)) return rule.cls;
    }
  }
  return 'OTHER';
}
