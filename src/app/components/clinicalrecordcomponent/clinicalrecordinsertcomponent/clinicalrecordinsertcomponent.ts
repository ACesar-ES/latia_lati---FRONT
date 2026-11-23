import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
import { Familycontextservice } from '../../../services/familycontextservice';
import { Medicalconditionservice } from '../../../services/medicalconditionservice';
import { MedicalconditionDTO } from '../../../model/MedicalconditionDTO';

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
export class Clinicalrecordinsertcomponent implements OnInit {
  formClinicalRecord: any;
  mensaje: string = '';
  hoy: Date = new Date();
  condiciones: MedicalconditionDTO[] = [];

  tiposDocumento: string[] = [
    'Examen de laboratorio',
    'Receta médica',
    'Imagen e informe',
    'Resumen de consulta',
    'Orden médica',
  ];

  constructor(
    private crS: Clinicalrecordservice,
    private mcS: Medicalconditionservice,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public fcS: Familycontextservice,
  ) {
    this.formClinicalRecord = this.fb.group({
      tipo: ['', Validators.required],
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      dia_evento: [new Date(), Validators.required],
      profesional: ['', Validators.required],
      condicion_medica: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    // El historial se guarda en el perfil elegido en "Cambiar perfil"
    this.fcS.cargar().subscribe({
      next: () => this.cdr.detectChanges(),
      error: (err) => {
        console.log('Ocurrió un error al cargar los perfiles', err);
        this.cdr.detectChanges();
      },
    });

    this.cargarCondiciones();
  }

  cargarCondiciones(): void {
    this.mcS.getMedicalCondition().subscribe({
      next: (data) => {
        this.condiciones = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al cargar las condiciones médicas', err);
        this.cdr.detectChanges();
      },
    });
  }

  insertarHistorial(): void {
    const idPerfil = this.fcS.idActivo();
    if (!idPerfil) {
      this.mensaje = 'Elige un perfil antes de guardar.';
      return;
    }
    if (this.formClinicalRecord.invalid) {
      this.formClinicalRecord.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos correctamente!!';
      return;
    }

    const dto: ClinicalrecordDTO = {
      idHealthProfile: idPerfil,
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
        this.router.navigate(['/historial/listar']);
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