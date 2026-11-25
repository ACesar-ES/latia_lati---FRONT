import { DocumentPeriod } from '../model/DocumentPeriod';
import { MonthlyDocumentCountDTO } from '../model/MonthlyDocumentCountDTO';
import { fromIsoDate, toIsoDate } from './datehelpers';

export function defaultDocumentPeriod(today: Date = new Date()): DocumentPeriod {
  const start = new Date(today.getFullYear(), today.getMonth() - 11, 1);
  return new DocumentPeriod(toIsoDate(start), toIsoDate(today));
}

// Rellena los meses sin documentos. Enero de dos años distintos nunca comparte una barra.
export function buildMonthlySeries(period: DocumentPeriod, rows: MonthlyDocumentCountDTO[]) {
  const counts = new Map(rows.map((r) => [r.year * 12 + r.month - 1, r.total] as const));
  const start = fromIsoDate(period.startDate);
  const end = fromIsoDate(period.endDate);
  const first = start.getFullYear() * 12 + start.getMonth();
  const last = end.getFullYear() * 12 + end.getMonth();
  const format = new Intl.DateTimeFormat('es-PE', { month: 'short', year: 'numeric' });
  const series: { key: number; label: string; total: number }[] = [];
  for (let key = first; key <= last; key++) {
    const date = new Date(Math.floor(key / 12), key % 12, 1);
    series.push({ key, label: format.format(date), total: counts.get(key) ?? 0 });
  }
  return series;
}

export function documentLink(value: string): string | null {
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
    // Los expedientes de demostración del backend tienen URL de ejemplo, no un PDF real.
    if (url.hostname === 'example.com' && url.pathname.startsWith('/latia/documentos-ficticios/')) return null;
    return url.href;
  } catch {
    return null;
  }
}
