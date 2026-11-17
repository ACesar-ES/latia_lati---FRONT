import { describe, expect, it } from 'vitest';
import type { FamilyrelationshipDTO } from '../model/FamilyrelationshipDTO';
import { nearby, relationshipTo, relationshipProblem, onlyProfileRecords } from './family-tree';
const edge = (a: number, b: number, t: string): FamilyrelationshipDTO => ({
  idFamilyRelationship: a * 100 + b,
  idOriginProfile: a,
  idRelativeProfile: b,
  relationshipType: t,
});
const tree = [
  edge(10, 20, 'Madre'),
  edge(30, 10, 'Hija'),
  edge(20, 40, 'Padre'),
  edge(10, 50, 'Hijo'),
];
describe('Family tree', () => {
  it('positions parents and children using both stored directions', () => {
    expect(nearby(tree, 10, 'up')).toEqual([20, 30]);
    expect(nearby(tree, 10, 'down')).toEqual([50]);
  });
  it('places a grandparent on the correct parent branch', () => {
    expect(nearby(tree, 20, 'up')).toEqual([40]);
    expect(relationshipTo(tree, 10, 40)).toBe('Abuelo/a');
  });
  it('does not mix independent households', () =>
    expect(nearby([...tree, edge(70, 80, 'Padre')], 10, 'up')).toEqual([20, 30]));
  it('rejects self links, inverse duplicates and ancestry cycles', () => {
    expect(relationshipProblem(tree, 10, 10, 'Hijo')).toBeTruthy();
    expect(relationshipProblem(tree, 20, 10, 'Hija')).toBeTruthy();
    expect(relationshipProblem(tree, 40, 50, 'Madre')).toContain('ciclo');
    expect(relationshipProblem(tree, 30, 61, 'Padre')).toBe('');
  });
  it('does not treat other types of kinship as parents', () =>
    expect(nearby([edge(10, 80, 'Tía')], 10, 'up')).toEqual([]));
  it('only returns records for the selected profile', () => {
    const m = { idHealthProfile: 10, title: 'A' },
      o = { idHealthProfile: 20, title: 'B' };
    expect(onlyProfileRecords([m, o], 20)).toEqual([o]);
    expect(onlyProfileRecords([m, o], null)).toEqual([]);
  });
});
