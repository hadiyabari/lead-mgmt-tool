import { describe, it, expect } from 'vitest';
import { classifyReply } from './classify';

describe('classifyReply', () => {
  it('detects unsubscribe', () => {
    expect(classifyReply(null, 'Please unsubscribe me from this list')).toBe('UNSUBSCRIBE');
  });

  it('detects bounce', () => {
    expect(classifyReply('Delivery Status Notification', 'Mail delivery failed: user unknown')).toBe(
      'BOUNCE'
    );
  });

  it('detects OOO', () => {
    expect(classifyReply('Out of office', 'I am away until Monday')).toBe('OUT_OF_OFFICE');
  });

  it('detects interested', () => {
    expect(classifyReply(null, 'Sounds good, lets schedule a call next week')).toBe('INTERESTED');
  });

  it('detects objection', () => {
    expect(classifyReply(null, 'Not interested, we already have an agency')).toBe('OBJECTION');
  });

  it('returns OTHER for generic text', () => {
    expect(classifyReply('Re: your note', 'Thanks for reaching out.')).toBe('OTHER');
  });
});
