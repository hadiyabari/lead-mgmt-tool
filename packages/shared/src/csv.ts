/**
 * Minimal CSV parser – handles quoted fields, commas, newlines.
 * No external dependency; sufficient for ledger imports up to tens of thousands of rows.
 */

export type CsvParseResult = {
  headers: string[];
  rows: Record<string, string>[];
};

export function parseCsv(text: string): CsvParseResult {
  const records: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = '';
  };
  const pushRow = () => {
    // skip completely empty trailing rows
    if (row.length === 1 && row[0] === '' && records.length > 0) {
      row = [];
      return;
    }
    records.push(row);
    row = [];
  };

  const s = text.replace(/^\uFEFF/, ''); // BOM
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const next = s[i + 1];

    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      pushField();
    } else if (c === '\n') {
      pushField();
      pushRow();
    } else if (c === '\r') {
      // ignore; handle \r\n via \n
    } else {
      field += c;
    }
  }
  // last field/row
  pushField();
  if (row.length > 1 || (row.length === 1 && row[0] !== '')) pushRow();

  if (records.length === 0) return { headers: [], rows: [] };

  const headers = records[0].map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let r = 1; r < records.length; r++) {
    const obj: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = (records[r][c] ?? '').trim();
    }
    rows.push(obj);
  }
  return { headers, rows };
}

/** Guess column mapping from common header names. */
export function guessColumnMapping(headers: string[]): {
  email?: string;
  phone?: string;
  domain?: string;
  date?: string;
} {
  const lower = headers.map((h) => ({ raw: h, key: h.toLowerCase().replace(/[\s_]+/g, '') }));
  const find = (...candidates: string[]) =>
    lower.find((h) => candidates.some((c) => h.key === c || h.key.includes(c)))?.raw;

  return {
    email: find('email', 'emailaddress', 'mail', 'e-mail'),
    phone: find('phone', 'mobile', 'tel', 'telephone', 'phonenumber'),
    domain: find('domain', 'website', 'url', 'companydomain'),
    date: find('date', 'contactedat', 'lastcontacted', 'sentat', 'createdat'),
  };
}
