import { authenticator } from 'otplib';
import QRCode from 'qrcode';

authenticator.options = { window: 1 };

export function generateMfaSecret(): string {
  return authenticator.generateSecret();
}

export function verifyMfaToken(secret: string, token: string): boolean {
  try {
    return authenticator.verify({ token: token.replace(/\s/g, ''), secret });
  } catch {
    return false;
  }
}

export function getMfaOtpauthUrl(secret: string, email: string, issuer = 'LeadPilot'): string {
  return authenticator.keyuri(email, issuer, secret);
}

export async function getMfaQrDataUrl(otpauthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpauthUrl);
}
