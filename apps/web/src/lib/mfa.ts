import { authenticator } from 'otplib';

authenticator.options = { window: 1 };

export function generateMfaSecret(): string {
  return authenticator.generateSecret();
}

export function mfaOtpauthUrl(opts: { email: string; secret: string; issuer?: string }): string {
  return authenticator.keyuri(
    opts.email,
    opts.issuer || 'LeadPilot',
    opts.secret
  );
}

export function verifyMfaToken(secret: string, token: string): boolean {
  try {
    return authenticator.verify({ token: token.replace(/\s/g, ''), secret });
  } catch {
    return false;
  }
}
