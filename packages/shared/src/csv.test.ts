import { describe, it, expect } from 'vitest';
import { parseCsv, guessColumnMapping } from './csv';

describe('parseCsv', () => {
  it('parses simple CSV', () => {
    const { headers, rows } = parseCsv('email,phone\na@b.com,123\nc@d.com,456\n');
    expect(headers).toEqual(['email', 'phone']);
    expect(rows).toHaveLength(2);
    expect(rows[0].email).toBe('a@b.com');
  });

  it('handles quoted commas', () => {
    const { rows } = parseCsv('email,name\n"a@b.com","Doe, Jane"\n');
    expect(rows[0].name).toBe('Doe, Jane');
  });

  it('guesses columns', () => {
    const m = guessColumnMapping(['Email Address', 'Mobile Phone', 'Website']);
    expect(m.email).toBe('Email Address');
    expect(m.phone).toBe('Mobile Phone');
    expect(m.domain).toBe('Website');
  });
});
