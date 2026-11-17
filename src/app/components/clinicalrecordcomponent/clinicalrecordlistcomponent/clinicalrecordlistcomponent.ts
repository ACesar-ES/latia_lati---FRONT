import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Clinicalrecordservice } from '../../../services/clinicalrecordservice';
import { FamilyContextService } from '../../../services/familycontextservice';
import { ClinicalrecordDTO } from '../../../model/ClinicalrecordDTO';

@Component({
  imports: [DatePipe, RouterLink, MatIconModule, MatButtonModule],
  selector: 'app-clinicalrecordlistcomponent',
  styleUrl: './clinicalrecordlistcomponent.css',
  templateUrl: './clinicalrecordlistcomponent.html',
})
export class Clinicalrecordlistcomponent {
  readonly family = inject(FamilyContextService);
  private readonly records = inject(Clinicalrecordservice);
  private readonly destroy = inject(DestroyRef);
  private readonly revision = signal(0);
  private readonly result = signal<{
    owner: number;
    profile: number;
    rows: ClinicalrecordDTO[];
  } | null>(null);
  readonly loading = signal(false);
  readonly notice = signal('');
  filtroActivo = 'todos';
  busqueda = '';
  constructor() {
    this.family.load();
    effect((cleanup) => {
      this.revision();
      const profile = this.family.activeId(),
        owner = this.family.account()?.idUser;
      this.result.set(null);
      this.notice.set('');
      this.loading.set(!!profile && !!owner);
      if (!profile || !owner) return;
      const req = this.records.forProfile(profile).subscribe({
        next: (rows) => {
          if (this.family.activeId() === profile && this.family.account()?.idUser === owner) {
            this.result.set({ owner, profile, rows });
            this.loading.set(false);
          }
        },
        error: () => {
          this.loading.set(false);
          this.notice.set('No pudimos abrir este historial.');
        },
      });
      cleanup(() => req.unsubscribe());
    });
  }
  get primerNombre(): string {
    const id = this.family.activeId();
    return id ? this.family.label(id) : '';
  }
  get dataSource(): ClinicalrecordDTO[] {
    const r = this.result();
    return r && r.profile === this.family.activeId() && r.owner === this.family.account()?.idUser
      ? r.rows
      : [];
  }
  get historialesFiltrados(): ClinicalrecordDTO[] {
    const q = this.busqueda.trim().toLowerCase();
    return this.dataSource
      .filter(
        (r) =>
          this.filtroActivo === 'todos' ||
          (r.recordType ?? '').toLowerCase().includes(this.filtroActivo),
      )
      .filter(
        (r) =>
          !q ||
          [r.title, r.recordType, r.professionalName].some((v) =>
            (v ?? '').toLowerCase().includes(q),
          ),
      )
      .sort((a, b) => String(b.eventDate).localeCompare(String(a.eventDate)));
  }
  reload(): void {
    this.revision.update((n) => n + 1);
  }
  eliminarHistorial(id: number): void {
    if (
      !this.dataSource.some((r) => r.idClinicalRecord === id) ||
      !confirm('¿Eliminar este registro del perfil seleccionado?')
    )
      return;
    this.records
      .deleteClinicalRecord(id)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => this.reload(),
        error: () => this.notice.set('No pudimos eliminar el registro.'),
      });
  }
}
