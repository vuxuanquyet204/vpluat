/**
 * Minimal CSV parser — không cần papaparse.
 * Hỗ trợ quoted values, escaped quotes (""), CRLF.
 */

export interface ParsedCsv {
  headers: string[];
  rows: Array<Record<string, string>>;
}

function parseLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuote) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else {
          inQuote = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === ',') {
        out.push(cur);
        cur = '';
      } else if (ch === '"') {
        inQuote = true;
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur);
  return out;
}

export function parseCsv(input: string): ParsedCsv {
  const text = input.replace(/^\uFEFF/, ''); // strip BOM
  const lines: string[] = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      const next = text[i + 1];
      if (inQuote && next === '"') {
        cur += '""';
        i += 1;
      } else {
        inQuote = !inQuote;
        cur += ch;
      }
    } else if ((ch === '\n' || ch === '\r') && !inQuote) {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      if (cur.length > 0 || lines.length === 0) lines.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.length > 0) lines.push(cur);

  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = parseLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows: Array<Record<string, string>> = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseLine(lines[i]);
    if (cells.every((c) => c === '')) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (cells[idx] ?? '').trim();
    });
    rows.push(row);
  }
  return { headers, rows };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}