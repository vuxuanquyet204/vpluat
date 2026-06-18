/**
 * Export CSV helper — tự viết, không cần papaparse.
 * Hỗ trợ escape dấu phẩy, dấu nháy, xuống dòng.
 */

'use client';

export interface CsvColumn<T> {
  key: keyof T | string;
  header: string;
  format?: (row: T) => string | number | boolean | null | undefined;
}

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns: CsvColumn<T>[],
): void {
  const header = columns.map((c) => escapeCsvCell(c.header)).join(',');
  const rows = data.map((row) =>
    columns
      .map((c) => {
        const raw = c.format ? c.format(row) : (row as Record<string, unknown>)[c.key as string];
        return escapeCsvCell(raw);
      })
      .join(','),
  );
  const csv = '\uFEFF' + [header, ...rows].join('\r\n'); // BOM cho Excel
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
