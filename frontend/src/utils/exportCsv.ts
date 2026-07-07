export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

function escapeCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return escapeCell(String(value));
}

export function rowsToCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((col) => escapeCell(col.header)).join(',');
  const body = rows.map((row) => columns.map((col) => formatCell(col.value(row))).join(','));
  return [header, ...body].join('\r\n');
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
