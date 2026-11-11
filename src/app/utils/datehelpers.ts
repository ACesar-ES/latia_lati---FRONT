/**
 * Ayudas para fechas entre Angular y Spring.
 *
 * Por qué hacen falta:
 *  - Un Date de JavaScript se envía como "2026-11-02T05:00:00.000Z".
 *  - Spring NO puede convertir ese texto a LocalDate ni a LocalDateTime (da error 400).
 *  - Solo java.util.Date (como eventDate en ClinicalRecordDTO) acepta ese formato completo.
 *
 * Para los campos LocalDate (birthDate, documentDate, startDate, endDate) envía "yyyy-MM-dd".
 * Para LocalDateTime (reminderTime) envía "yyyy-MM-ddTHH:mm:ss".
 */

const dos = (n: number): string => String(n).padStart(2, '0');

/** Date -> "yyyy-MM-dd" (usa la fecha LOCAL, sin correrse de día por la zona horaria) */
export function toIsoDate(d: Date | string | null | undefined): string {
  if (!d) return '';
  if (typeof d === 'string') return d.substring(0, 10);
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

/** Date -> "yyyy-MM-ddTHH:mm:ss" (hora local, sin la "Z") */
export function toLocalDateTime(d: Date | null | undefined): string {
  if (!d) return '';
  return `${toIsoDate(d)}T${dos(d.getHours())}:${dos(d.getMinutes())}:${dos(d.getSeconds())}`;
}

/**
 * "yyyy-MM-dd" -> Date local, para el datepicker.
 * No uses new Date('2026-11-02'): lo interpreta como UTC y en Perú (UTC-5)
 * muestra el día anterior.
 */
export function fromIsoDate(s: string | null | undefined): Date {
  if (!s) return new Date();
  const [y, m, d] = s.substring(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}
