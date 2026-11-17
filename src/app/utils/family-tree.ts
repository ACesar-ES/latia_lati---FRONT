import type { FamilyrelationshipDTO } from '../model/FamilyrelationshipDTO';

export const KINSHIPS = ['Madre', 'Padre', 'Hija', 'Hijo'] as const;
export type Kinship = (typeof KINSHIPS)[number];
type Level = 'up' | 'down';
function direction(type: string): Level | null {
  const value = type.trim().toLowerCase();
  if (['madre', 'padre', 'mother', 'father', 'parent', 'progenitor'].includes(value)) return 'up';
  if (['hijo', 'hija', 'hijo/a', 'son', 'daughter', 'child'].includes(value)) return 'down';
  return null;
}
export function nearby(links: FamilyrelationshipDTO[], center: number, level: Level): number[] {
  const result = new Set<number>();
  for (const link of links) {
    const d = direction(link.relationshipType);
    if (!d) continue;
    if (link.idOriginProfile === center && d === level) result.add(link.idRelativeProfile);
    if (link.idRelativeProfile === center && d !== level) result.add(link.idOriginProfile);
  }
  return [...result].filter((id) => id !== center).sort((a, b) => a - b);
}
export function relationshipTo(
  links: FamilyrelationshipDTO[],
  root: number,
  person: number,
): string {
  if (root === person) return 'Tú · perfil principal';
  const direct = links.find((e) => e.idOriginProfile === root && e.idRelativeProfile === person);
  if (direct) return direct.relationshipType;
  if (nearby(links, root, 'up').includes(person)) return 'Progenitor/a';
  if (nearby(links, root, 'down').includes(person)) return 'Hijo/a';
  if (nearby(links, root, 'up').some((id) => nearby(links, id, 'up').includes(person)))
    return 'Abuelo/a';
  return 'Familiar';
}
export function relationshipProblem(
  links: FamilyrelationshipDTO[],
  origin: number,
  relative: number,
  kind: Kinship,
): string {
  if (origin === relative) return 'Una persona no puede ser su propio familiar.';
  if (
    links.some(
      (e) =>
        (e.idOriginProfile === origin && e.idRelativeProfile === relative) ||
        (e.idOriginProfile === relative && e.idRelativeProfile === origin),
    )
  )
    return 'Estos perfiles ya están vinculados.';
  const parent = direction(kind) === 'up' ? relative : origin;
  const stack = [parent === relative ? origin : relative],
    seen = new Set<number>();
  while (stack.length) {
    const id = stack.pop()!;
    if (id === parent) return 'Ese vínculo formaría un ciclo en el árbol.';
    if (!seen.has(id)) {
      seen.add(id);
      stack.push(...nearby(links, id, 'down'));
    }
  }
  return '';
}
export function onlyProfileRecords<T extends { idHealthProfile: number }>(
  rows: T[],
  id: number | null,
): T[] {
  return id === null ? [] : rows.filter((r) => r.idHealthProfile === id);
}
