import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, Subject, throwError } from 'rxjs';
import { FamilyContextService } from './familycontextservice';
import { FamilyRelationshipService } from './familyrelationshipservice';
import { UsersService } from './usuarioservice';
import { Loginservice } from './loginservice';
import { Healthprofileservice } from './healthprofileservice';
import { HealthprofileDTO } from '../model/HealthprofileDTO';
const profile = (id: number, owner: number, holder: number | null): HealthprofileDTO =>
  Object.assign(new HealthprofileDTO(), {
    idHealthProfile: id,
    idOwnerUser: owner,
    idHolderUser: holder,
    active: true,
  });
describe('Family context', () => {
  let token: string, owner: number, profiles: HealthprofileDTO[], context: FamilyContextService;
  let changes: Subject<void>;
  const health = { listOwned: vi.fn(() => of(profiles)) };
  beforeEach(() => {
    sessionStorage.removeItem('latia.family.tab.4');
    sessionStorage.removeItem('latia.family.tab.9');
    changes = new Subject<void>();
    token = 'first';
    owner = 4;
    profiles = [profile(11, 4, 4), profile(12, 4, null), profile(98, 9, 9)];
    health.listOwned.mockImplementation(() => of(profiles));
    TestBed.configureTestingModule({
      providers: [
        FamilyContextService,
        {
          provide: Loginservice,
          useValue: { getToken: () => token, sessionChanged$: changes.asObservable() },
        },
        {
          provide: UsersService,
          useValue: {
            limpiar: vi.fn(),
            cargarUsuarioActual: () =>
              of({ idUser: owner, firstName: 'Persona', lastName: 'Prueba' }),
            listId: vi.fn(),
          },
        },
        { provide: Healthprofileservice, useValue: health },
        {
          provide: FamilyRelationshipService,
          useValue: {
            byProfile: () =>
              of([
                {
                  idFamilyRelationship: 3,
                  idOriginProfile: 11,
                  idRelativeProfile: 12,
                  relationshipType: 'Madre',
                },
              ]),
          },
        },
      ],
    });
    context = TestBed.inject(FamilyContextService);
    TestBed.tick();
  });
  it('keeps the principal centered, deduplicates links and rejects foreign profiles', () => {
    context.load();
    expect(context.root()?.idHealthProfile).toBe(11);
    expect(context.links().length).toBe(1);
    expect(context.select(12)).toBe(true);
    expect(context.activeId()).toBe(12);
    expect(context.select(98)).toBe(false);
    expect(context.root()?.idHealthProfile).toBe(11);
  });
  it('never mistakes the only dependent for the principal', () => {
    profiles = [profile(12, 4, null)];
    context.load();
    expect(context.root()).toBeNull();
    expect(context.activeId()).toBeNull();
    expect(context.select(12)).toBe(true);
  });
  it('drops the previous account selection and aliases when the login changes', () => {
    context.load();
    context.acceptCreated(profile(15, 4, null), 4, 'Mi familiar');
    context.select(15);
    token = 'second';
    owner = 9;
    profiles = [profile(91, 9, 9)];
    changes.next();
    expect(context.activeId()).toBe(91);
    expect(context.select(15)).toBe(false);
    expect(sessionStorage.getItem('latia.family.tab.4')).toBeNull();
  });
  it('distinguishes an initially empty account from a denied request', () => {
    health.listOwned.mockReturnValueOnce(throwError(() => ({ status: 404 })));
    context.load();
    expect(context.phase()).toBe('ready');
    expect(context.profiles()).toEqual([]);
    health.listOwned.mockReturnValueOnce(throwError(() => ({ status: 403 })));
    context.load(true);
    expect(context.phase()).toBe('error');
    expect(context.activeId()).toBeNull();
  });
});
