import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '../../app.routes';
import { Loginservice } from '../../services/loginservice';
import { UsersService } from '../../services/usuarioservice';
import { Healthprofileservice } from '../../services/healthprofileservice';
import { FamilyRelationshipService } from '../../services/familyrelationshipservice';
import { FamilyContextService } from '../../services/familycontextservice';
import { Clinicalrecordservice } from '../../services/clinicalrecordservice';
import { HealthprofileDTO } from '../../model/HealthprofileDTO';
import { ClinicalrecordDTO } from '../../model/ClinicalrecordDTO';
import { FamilyrelationshipDTO } from '../../model/FamilyrelationshipDTO';
import { FamilyAddComponent } from './familyaddcomponent/familyaddcomponent';

const account = {
  idUser: 4,
  firstName: 'Valeria',
  lastName: 'Demo',
  email: 'demo@example.test',
  username: 'demo',
  active: true,
};
const profile = (id: number, holder: number | null) =>
  Object.assign(new HealthprofileDTO(), {
    idHealthProfile: id,
    idOwnerUser: 4,
    idHolderUser: holder,
    birthDate: '1999-01-01',
    phone: '000000000',
    sex: 'Otro',
    bloodType: 'A+',
    active: true,
  });
const edge = (id: number, a: number, b: number, type: string): FamilyrelationshipDTO => ({
  idFamilyRelationship: id,
  idOriginProfile: a,
  idRelativeProfile: b,
  relationshipType: type,
});
const record = (id: number, h: number, title: string): ClinicalrecordDTO =>
  Object.assign(new ClinicalrecordDTO(), {
    idClinicalRecord: id,
    idHealthProfile: h,
    title,
    recordType: 'Examen',
    eventDate: new Date('2026-01-01T12:00:00Z'),
    description: 'Datos ficticios',
    professionalName: 'Demo',
    idCondition: 1,
  });
describe('Family screens', () => {
  let people: HealthprofileDTO[],
    links: FamilyrelationshipDTO[],
    postProfile: ReturnType<typeof vi.fn>,
    postLink: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    sessionStorage.clear();
    people = [profile(11, 4), profile(12, 5), profile(13, null), profile(14, null)];
    links = [edge(1, 11, 12, 'Madre'), edge(2, 11, 13, 'Hijo'), edge(3, 12, 14, 'Padre')];
    postProfile = vi.fn(() => {
      const p = profile(50, null);
      people.push(p);
      return of(p);
    });
    postLink = vi.fn((a: number, b: number, t: string) => {
      const l = edge(4, a, b, t);
      links.push(l);
      return of(l);
    });
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        {
          provide: UsersService,
          useValue: {
            usuario$: new BehaviorSubject(account),
            cargarUsuarioActual: () => of(account),
            limpiar: vi.fn(),
            listId: () => of({ ...account, idUser: 5, firstName: 'Rosa' }),
          },
        },
        {
          provide: Loginservice,
          useValue: { getToken: () => 'mock-session', sessionChanged$: new Subject<void>() },
        },
        {
          provide: Healthprofileservice,
          useValue: { listOwned: () => of(people), insertHealthProfile: postProfile },
        },
        {
          provide: FamilyRelationshipService,
          useValue: {
            byProfile: (id: number) =>
              of(links.filter((l) => [l.idOriginProfile, l.idRelativeProfile].includes(id))),
            create: postLink,
          },
        },
      ],
    });
    vi.spyOn(TestBed.inject(Clinicalrecordservice), 'getClinicalRecord').mockReturnValue(
      of([
        record(71, 11, 'Documento de Valeria'),
        record(72, 12, 'Documento de Rosa'),
        record(73, 91, 'Documento ajeno'),
      ]),
    );
  });
  it('keeps the principal in the center and opens the chosen history via the selector', async () => {
    const h = await RouterTestingHarness.create('/familia');
    await h.fixture.whenStable();
    h.detectChanges();
    const page = h.routeNativeElement!;
    expect(page.querySelector('.root-row .node')?.textContent).toContain('Valeria Demo');
    expect(page.querySelector('.grandparents .node')?.textContent).toContain('Abuelo/a');
    const mother = Array.from(page.querySelectorAll<HTMLButtonElement>('.parents .node')).find(
      (b) => b.textContent.includes('Rosa Demo'),
    )!;
    mother.click();
    h.detectChanges();
    expect(page.querySelector('.detail h2')?.textContent).toContain('Rosa Demo');
    expect(page.querySelector('.root-row .node')?.textContent).toContain('Valeria Demo');
    Array.from(page.querySelectorAll<HTMLButtonElement>('.segmented button'))
      .find((b) => b.textContent.includes('Lista'))!
      .click();
    h.detectChanges();
    expect(page.querySelectorAll('tr[mat-row]').length).toBe(4);
    await h.navigateByUrl('/cambiar-perfil?volver=historial');
    h.routeNativeElement!.querySelector<HTMLButtonElement>(
      '[aria-label="Abrir perfil de Rosa Demo"]',
    )!.click();
    await h.fixture.whenStable();
    h.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/historial/listar');
    const text = h.routeNativeElement!.textContent;
    expect(text).toContain('Documento de Rosa');
    expect(text).not.toContain('Documento de Valeria');
    expect(text).not.toContain('Documento ajeno');
  });
  it('recovers a failed link without creating a second profile', async () => {
    postLink.mockReturnValueOnce(throwError(() => ({ status: 503 })));
    const h = await RouterTestingHarness.create();
    const view = await h.navigateByUrl('/familia/agregar?origen=11&tipo=Hijo', FamilyAddComponent);
    await h.fixture.whenStable();
    expect(view.link.controls.type.value).toBe('Hijo');
    view.person.setValue({
      alias: 'Familiar de prueba',
      birth: new Date(2014, 1, 2),
      sex: 'Otro',
      blood: 'A+',
      phone: '000000000',
    });
    h.routeNativeElement!.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    h.detectChanges();
    expect(h.routeNativeElement!.textContent).toContain('Reintentar vínculo');
    h.routeNativeElement!.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await h.fixture.whenStable();
    h.detectChanges();
    expect(postProfile).toHaveBeenCalledTimes(1);
    expect(postLink).toHaveBeenCalledTimes(2);
    expect(TestBed.inject(Router).url).toBe('/familia');
    expect(h.routeNativeElement!.querySelector('.detail h2')?.textContent).toContain(
      'Familiar de prueba',
    );
  });
  it('does not display an edit form for a record from another profile', async () => {
    const h = await RouterTestingHarness.create('/historial/actualizar/72');
    await h.fixture.whenStable();
    h.detectChanges();
    expect(TestBed.inject(FamilyContextService).activeId()).toBe(11);
    expect(h.routeNativeElement!.textContent).toContain('no está disponible en el perfil activo');
    expect(h.routeNativeElement!.querySelector('input[formcontrolname=titulo]')).toBeNull();
  });
});
