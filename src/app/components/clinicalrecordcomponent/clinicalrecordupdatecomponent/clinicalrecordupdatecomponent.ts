import { ChangeDetectorRef, Component, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FamilyContextService } from '../../../services/familycontextservice';
import { Clinicalrecordservice } from '../../../services/clinicalrecordservice';
import { ClinicalrecordDTO } from '../../../model/ClinicalrecordDTO';

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
  ],
  providers: [provideNativeDateAdapter()],
  selector: 'app-clinicalrecordupdatecomponent',
  styleUrl: './clinicalrecordupdatecomponent.css',
  templateUrl: './clinicalrecordupdatecomponent.html',
})
export class Clinicalrecordupdatecomponent {
  idClinicalRecord = 0;
  readonly loadedId = signal<number | null>(null);
  readonly saving = signal(false);
  formClinicalRecord: any;
  mensaje: string = '';
  hoy: Date = new Date(); // no permite fechas futuras

  tiposDocumento: string[] = [
    'Examen de laboratorio',
    'Receta médica',
    'Imagen e informe',
    'Resumen de consulta',
    'Orden médica',
  ];

  constructor(
    readonly family: FamilyContextService,
    private crS: Clinicalrecordservice,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    const params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
    this.family.load();
    this.formClinicalRecord = this.fb.group({
      codigo: [0],
      tipo: ['', Validators.required],
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      dia_evento: [new Date(), Validators.required],
      profesional: ['', Validators.required],
      condicion_medica: [null, [Validators.required, Validators.min(1)]],
    });
    effect((cleanup) => {
      const profile = this.family.activeId(),
        owner = this.family.account()?.idUser,
        id = Number(params().get('id'));
      this.idClinicalRecord = id;
      this.loadedId.set(null);
      this.formClinicalRecord.reset();
      this.mensaje = '';
      if (!profile || !owner || !Number.isInteger(id) || id < 1) {
        this.mensaje = 'Documento sin perfil activo o no disponible.';
        return;
      }
      const req = this.crS.forProfile(profile).subscribe({
        next: (rows) => {
          if (profile !== this.family.activeId() || owner !== this.family.account()?.idUser) return;
          const r = rows.find((i) => i.idClinicalRecord === id);
          if (!r) {
            this.mensaje = 'Este documento no está disponible en el perfil activo.';
            this.cdr.markForCheck();
            return;
          }
          this.formClinicalRecord.patchValue({
            codigo: id,
            tipo: r.recordType,
            titulo: r.title,
            descripcion: r.description,
            dia_evento: new Date(r.eventDate),
            profesional: r.professionalName,
            condicion_medica: r.idCondition,
          });
          this.loadedId.set(profile);
          this.cdr.markForCheck();
        },
        error: () => {
          this.mensaje = 'No pudimos abrir este documento.';
          this.cdr.markForCheck();
        },
      });
      cleanup(() => req.unsubscribe());
    });
  }

  actualizarHistorial(): void {
    const profile = this.family.activeId();
    if (this.saving() || !profile || profile !== this.loadedId()) {
      this.mensaje = 'Selecciona el perfil del documento.';
      return;
    }
    if (this.formClinicalRecord.invalid) {
      this.formClinicalRecord.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos correctamente!!';
      return;
    }

    const dto: ClinicalrecordDTO = {
      idClinicalRecord: this.idClinicalRecord,
      idHealthProfile: profile,
      recordType: this.formClinicalRecord.value.tipo,
      title: this.formClinicalRecord.value.titulo,
      description: this.formClinicalRecord.value.descripcion,
      eventDate: this.formClinicalRecord.value.dia_evento,
      professionalName: this.formClinicalRecord.value.profesional,
      idCondition: this.formClinicalRecord.value.condicion_medica,
    };

    this.saving.set(true);
    this.crS.updateClinicalRecord(dto).subscribe({
      next: () => {
        this.saving.set(false);
        this.mensaje = 'Actualizado correctamente!!';
        this.cdr.detectChanges();
        this.router.navigate(['/historial/listar']);
      },
      error: (error) => {
        this.saving.set(false);
        this.mensaje = 'Error al actualizar!!';
        this.cdr.detectChanges();
      },
    });
  }
}
