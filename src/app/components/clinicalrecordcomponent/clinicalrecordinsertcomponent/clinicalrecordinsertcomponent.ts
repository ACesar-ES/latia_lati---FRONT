import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { provideNativeDateAdapter } from '@angular/material/core';
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
  selector: 'app-clinicalrecordinsertcomponent',
  styleUrl: './clinicalrecordinsertcomponent.css',
  templateUrl: './clinicalrecordinsertcomponent.html',
})
export class Clinicalrecordinsertcomponent {
  formClinicalRecord: any;
  mensaje: string = '';
  hoy: Date = new Date(); 

  tiposDocumento: string[] = [
    'Examen de laboratorio',
    'Receta médica',
    'Imagen e informe',
    'Resumen de consulta',
    'Orden médica',
  ];

  constructor(
    private crS: Clinicalrecordservice,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.formClinicalRecord = this.fb.group({
      perfil_salud: [null, [Validators.required, Validators.min(1)]],
      tipo: ['', Validators.required],
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      dia_evento: [new Date(), Validators.required],
      profesional: ['', Validators.required],
      condicion_medica: [null, [Validators.required, Validators.min(1)]],
    });
  }

  insertarHistorial(): void {
    if (this.formClinicalRecord.invalid) {
      this.formClinicalRecord.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos correctamente!!';
      return;
    }

    const dto: ClinicalrecordDTO = {
      idHealthProfile: this.formClinicalRecord.value.perfil_salud,
      recordType: this.formClinicalRecord.value.tipo,
      title: this.formClinicalRecord.value.titulo,
      description: this.formClinicalRecord.value.descripcion,
      eventDate: this.formClinicalRecord.value.dia_evento,
      professionalName: this.formClinicalRecord.value.profesional,
      idCondition: this.formClinicalRecord.value.condicion_medica,
    };

    this.crS.insertClinicalRecord(dto).subscribe({
      next: () => {
        this.mensaje = 'Historial registrado correctamente!!';
        this.cdr.detectChanges();
        this.router.navigate(['/listar']);
      },
      error: (error) => {
        console.error(error);
        this.mensaje = 'Error al registrar el historial!!';
        this.cdr.detectChanges();
      },
    });
  }

  limpiar(): void {
    this.formClinicalRecord.reset({ dia_evento: new Date() });
    this.mensaje = '';
  }
}
