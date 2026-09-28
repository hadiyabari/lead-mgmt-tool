import { describe, it, expect } from 'vitest';
import { validatePasswordStrength } from './password';

describe('validatePasswordStrength', () => {
  it('rejects short passwords', () => {
    expect(validatePasswordStrength('Short1')).not.toBeNull();
  });

  it('rejects missing uppercase', () => {
    expect(validatePasswordStrength('alllowercase1ab')).not.toBeNull();
  });

  it('rejects missing number', () => {
    expect(validatePasswordStrength('NoNumberHere!!')).not.toBeNull();
  });

  it('accepts strong password', () => {
    expect(validatePasswordStrength('StrongPass123')).toBeNull();
  });
});
