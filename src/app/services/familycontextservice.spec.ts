import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { Familycontextservice } from './familycontextservice';
import { Familyrelationshipservice } from './familyrelationshipservice';
import { UsersService } from './usuarioservice';
import { Loginservice } from './loginservice';
import { Healthprofileservice } from './healthprofileservice';
import { HealthprofileDTO } from '../model/HealthprofileDTO';

const perfil = (id: number, dueno: number, titular: number | null): HealthprofileDTO =>
  Object.assign(new HealthprofileDTO(), {
    idHealthProfile: id,
    idOwnerUser: dueno,
    idHolderUser: titular,
    active: true,
  });

describe('Familycontextservice', () => {
  let token: string, dueno: number, perfiles: HealthprofileDTO[], fcS: Familycontextservice;
  const hpS = { listPropios: vi.fn(() => of(perfiles)) };

  beforeEach(() => {
    sessionStorage.removeItem('latia.family.tab.4');
    sessionStorage.removeItem('latia.family.tab.9');
    token = 'primero';
    dueno = 4;
    perfiles = [perfil(11, 4, 4), perfil(12, 4, null), perfil(98, 9, 9)];
    hpS.listPropios.mockImplementation(() => of(perfiles));
    TestBed.configureTestingModule({
      providers: [
        { provide: Loginservice, useValue: { getToken: () => token } },
        {
          provide: UsersService,
          useValue: {
            cargarUsuarioActual: () => of({ idUser: dueno, firstName: 'Persona', lastName: 'Prueba' }),
            listId: vi.fn(),
          },
        },
        { provide: Healthprofileservice, useValue: hpS },
        {
          provide: Familyrelationshipservice,
          useValue: {
            listByProfile: () =>
              of([{ idFamilyRelationship: 3, idOriginProfile: 11, idRelativeProfile: 12, relationshipType: 'Madre' }]),
          },
        },
      ],
    });
    fcS = TestBed.inject(Familycontextservice);
  });

  it('deja al titular al centro, no repite vínculos y rechaza perfiles ajenos', () => {
    fcS.cargar().subscribe();
    expect(fcS.raiz()?.idHealthProfile).toBe(11);
    expect(fcS.vinculos.length).toBe(1);
    expect(fcS.seleccionar(12)).toBe(true);
    expect(fcS.idActivo()).toBe(12);
    expect(fcS.seleccionar(98)).toBe(false);
    expect(fcS.raiz()?.idHealthProfile).toBe(11);
  });

  it('no confunde al único dependiente con el titular', () => {
    perfiles = [perfil(12, 4, null)];
    fcS.cargar().subscribe();
    expect(fcS.raiz()).toBeNull();
    expect(fcS.idActivo()).toBeNull();
    expect(fcS.seleccionar(12)).toBe(true);
  });

  it('olvida la selección y los alias de la cuenta anterior al cambiar de sesión', () => {
    fcS.cargar().subscribe();
    fcS.agregarPerfil(perfil(15, 4, null), 4, 'Mi familiar');
    fcS.seleccionar(15);
    token = 'segundo';
    dueno = 9;
    perfiles = [perfil(91, 9, 9)];
    fcS.cargar().subscribe();
    expect(fcS.idActivo()).toBe(91);
    expect(fcS.seleccionar(15)).toBe(false);
    expect(sessionStorage.getItem('latia.family.tab.4')).toBeNull();
  });

  it('distingue una cuenta sin perfiles de una petición rechazada', () => {
    hpS.listPropios.mockReturnValueOnce(throwError(() => ({ status: 404 })));
    fcS.cargar().subscribe();
    expect(fcS.fase).toBe('listo');
    expect(fcS.perfiles).toEqual([]);
    hpS.listPropios.mockReturnValueOnce(throwError(() => ({ status: 403 })));
    fcS.cargar(true).subscribe({ error: () => {} });
    expect(fcS.fase).toBe('error');
    expect(fcS.idActivo()).toBeNull();
  });
});
