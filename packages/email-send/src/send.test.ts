import { describe, it, expect } from 'vitest';
import { sendEmail } from './send';

describe('sendEmail', () => {
  it('simulates when simulation flag is set', async () => {
    const r = await sendEmail({
      toEmail: 'a@example.com',
      subject: 'Test',
      bodyHtml: '<p>Hi</p>',
      simulation: true,
    });
    expect(r.ok).toBe(true);
    expect(r.simulated).toBe(true);
    expect(r.provider).toBe('simulation');
    expect(r.messageId).toBeTruthy();
  });
});
