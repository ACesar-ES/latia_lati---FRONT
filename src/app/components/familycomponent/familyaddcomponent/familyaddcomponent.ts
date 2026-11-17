import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { of, switchMap, throwError } from 'rxjs';
import { Menucomponent } from '../../menucomponent/menucomponent';
import { FamilyStateComponent } from '../familystatecomponent';
import { FamilyContextService } from '../../../services/familycontextservice';
import { FamilyRelationshipService } from '../../../services/familyrelationshipservice';
import { Healthprofileservice } from '../../../services/healthprofileservice';
import { KINSHIPS, Kinship, relationshipProblem } from '../../../utils/family-tree';
import { toIsoDate } from '../../../utils/datehelpers';

interface PendingLink {
  origin: number;
  relative: number;
  type: Kinship;
  owner: number;
}
@Component({
  selector: 'app-family-add',
  imports: [
    Menucomponent,
    FamilyStateComponent,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './familyaddcomponent.html',
  styleUrl: './familyaddcomponent.css',
})
export class FamilyAddComponent {
  readonly family = inject(FamilyContextService);
  private readonly fb = inject(FormBuilder);
  private readonly health = inject(Healthprofileservice);
  private readonly edges = inject(FamilyRelationshipService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy = inject(DestroyRef);
  readonly kinds = KINSHIPS;
  readonly groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  readonly today = new Date();
  readonly mode = signal<'new' | 'existing'>('new');
  readonly busy = signal(false);
  readonly message = signal('');
  readonly pending = signal<PendingLink | null>(null);
  readonly uncertain = signal(false);
  readonly link = this.fb.group({
    origin: this.fb.control<number | null>(null, Validators.required),
    type: this.fb.nonNullable.control<Kinship>('Madre', Validators.required),
    relative: this.fb.control<number | null>(null),
  });
  readonly person = this.fb.group({
    alias: this.fb.nonNullable.control('', Validators.maxLength(80)),
    birth: this.fb.control<Date | null>(null, Validators.required),
    sex: this.fb.nonNullable.control('', Validators.required),
    blood: this.fb.nonNullable.control('', Validators.required),
    phone: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(/^\+?[0-9]( ?[0-9]){6,14}$/),
    ]),
  });
  private initialized = false;
  constructor() {
    this.family.load();
    effect(() => {
      const root = this.family.root();
      if (!root || this.initialized || this.family.phase() !== 'ready') return;
      this.initialized = true;
      const q = this.route.snapshot.queryParamMap,
        id = Number(q.get('origen'));
      this.link.patchValue({
        origin: this.family.owns(id) ? id : root.idHealthProfile,
        type: this.kinds.find((k) => k === q.get('tipo')) ?? 'Madre',
      });
    });
  }
  get candidates() {
    return this.family
      .sorted()
      .filter((p) => p.idHealthProfile !== this.link.controls.origin.value);
  }
  changeMode(mode: 'new' | 'existing'): void {
    if (this.busy() || this.pending() || (mode === 'new' && this.uncertain())) return;
    this.mode.set(mode);
    this.message.set('');
    this.link.controls.relative.reset();
  }
  save(): void {
    if (this.busy() || this.family.phase() !== 'ready') return;
    const pending = this.pending();
    if (pending) {
      this.connect(pending, true);
      return;
    }
    this.message.set('');
    const { origin, relative, type } = this.link.getRawValue(),
      owner = this.family.account()?.idUser;
    if (!owner || !origin || !this.family.owns(origin) || !this.kinds.includes(type)) {
      this.message.set('Elige un perfil de tu cuenta.');
      return;
    }
    if (this.mode() === 'existing') {
      if (!relative || !this.family.owns(relative)) {
        this.message.set('Selecciona el perfil que quieres vincular.');
        return;
      }
      const problem = relationshipProblem(this.family.links(), origin, relative, type);
      if (problem) {
        this.message.set(problem);
        return;
      }
      this.connect({ origin, relative, type, owner }, true);
      return;
    }
    if (this.uncertain()) return;
    this.person.markAllAsTouched();
    const v = this.person.getRawValue();
    if (this.person.invalid || !v.birth || v.birth > this.today) {
      this.message.set('Revisa los campos marcados.');
      return;
    }
    this.busy.set(true);
    this.health
      .insertHealthProfile({
        idOwnerUser: owner,
        idHolderUser: null,
        birthDate: toIsoDate(v.birth),
        sex: v.sex,
        bloodType: v.blood,
        phone: v.phone.trim(),
        active: true,
      })
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (p) => {
          if (!this.family.acceptCreated(p, owner, v.alias)) {
            this.recover();
            return;
          }
          const job = { origin, relative: p.idHealthProfile, type, owner };
          this.pending.set(job);
          this.connect(job, false);
        },
        error: (e) => {
          if (!e.status || e.status >= 500) {
            this.recover();
            return;
          }
          this.busy.set(false);
          this.message.set('No se creó el perfil. Revisa los datos.');
        },
      });
  }
  private recover(): void {
    this.busy.set(false);
    this.uncertain.set(true);
    this.mode.set('existing');
    this.message.set('No pudimos confirmar la creación. Revisa tus perfiles antes de crear otro.');
    this.family.load(true);
  }
  private connect(job: PendingLink, check: boolean): void {
    if (
      this.family.account()?.idUser !== job.owner ||
      !this.family.owns(job.origin) ||
      !this.family.owns(job.relative)
    ) {
      this.busy.set(false);
      return;
    }
    this.busy.set(true);
    const request = check
      ? this.edges.byProfile(job.origin).pipe(
          switchMap((rows) => {
            const same = rows.find(
              (e) =>
                e.idOriginProfile === job.origin &&
                e.idRelativeProfile === job.relative &&
                e.relationshipType === job.type,
            );
            if (same) return of(same);
            if (
              relationshipProblem(
                [...this.family.links(), ...rows],
                job.origin,
                job.relative,
                job.type,
              )
            )
              return throwError(() => new Error('Vínculo incompatible'));
            return this.edges.create(job.origin, job.relative, job.type);
          }),
        )
      : this.edges.create(job.origin, job.relative, job.type);
    request.pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: (edge) => {
        this.busy.set(false);
        if (this.family.account()?.idUser !== job.owner) return;
        this.family.acceptLink(edge);
        if (this.family.select(job.relative)) {
          this.pending.set(null);
          void this.router.navigate(['/familia']);
        }
      },
      error: () => {
        this.busy.set(false);
        this.message.set(
          this.pending()
            ? 'El perfil ya está creado. Reintenta solo el vínculo; no se creará otro perfil.'
            : 'No se pudo guardar el vínculo. Revisa el parentesco y vuelve a intentar.',
        );
      },
    });
  }
}
