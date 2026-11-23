import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Clinicalrecordservice } from '../../../services/clinicalrecordservice';
import { Familycontextservice } from '../../../services/familycontextservice';
import { ClinicalrecordDTO } from '../../../model/ClinicalrecordDTO';
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
  selector: 'app-clinicalrecordupdatecomponent',
  styleUrl: './clinicalrecordupdatecomponent.css',
  templateUrl: './clinicalrecordupdatecomponent.html',
})
export class Clinicalrecordupdatecomponent implements OnInit {
  idClinicalRecord: any = null;
  formClinicalRecord: any;
  mensaje: string = '';
  hoy: Date = new Date(); // no permite fechas futuras
  perfilCargado: number | null = null; // perfil al que pertenece el historial
  guardando: boolean = false;
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
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public fcS: Familycontextservice,
  ) {}

  ngOnInit(): void {
    // Recuperar ID desde la URL: /historial/editar/:id
    this.idClinicalRecord = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.idClinicalRecord || isNaN(this.idClinicalRecord)) {
      this.mensaje = 'ID inválido';
      return;
    }

    this.formClinicalRecord = this.fb.group({
      codigo: [this.idClinicalRecord],
      tipo: ['', Validators.required],
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      dia_evento: [new Date(), Validators.required],
      profesional: ['', Validators.required],
      condicion_medica: [null, Validators.required],
    });

    this.cargarCondiciones();

    // Primero se cargan los perfiles para saber cuál está elegido
    this.fcS.cargar().subscribe({
      next: () => this.buscarPorId(),
      error: (err) => {
        console.log('Ocurrió un error al cargar los perfiles', err);
        this.mensaje = 'No se pudieron cargar los perfiles!!';
        this.cdr.detectChanges();
      },
    });
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

  buscarPorId(): void {
    this.crS.listId(this.idClinicalRecord).subscribe({
      next: (data: ClinicalrecordDTO) => {
        // Solo se edita si el historial es del perfil elegido
        if (data.idHealthProfile !== this.fcS.idActivo()) {
          this.mensaje = 'Este documento no está disponible en el perfil activo.';
          this.cdr.detectChanges();
          return;
        }
        this.perfilCargado = data.idHealthProfile;
        this.formClinicalRecord.patchValue({
          codigo: data.idClinicalRecord,
          tipo: data.recordType,
          titulo: data.title,
          descripcion: data.description,
          dia_evento: new Date(data.eventDate),
          profesional: data.professionalName,
          condicion_medica: data.idCondition,
        });
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al buscar !!!', error);
        this.mensaje = 'No se encontró el historial !!!';
        this.cdr.detectChanges();
      },
    });
  }

  actualizarHistorial(): void {
    if (this.formClinicalRecord.invalid) {
      this.formClinicalRecord.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos correctamente!!';
      return;
    }

    const dto: ClinicalrecordDTO = {
      idClinicalRecord: this.formClinicalRecord.value.codigo,
      idHealthProfile: this.perfilCargado!,
      recordType: this.formClinicalRecord.value.tipo,
      title: this.formClinicalRecord.value.titulo,
      description: this.formClinicalRecord.value.descripcion,
      eventDate: this.formClinicalRecord.value.dia_evento,
      professionalName: this.formClinicalRecord.value.profesional,
      idCondition: this.formClinicalRecord.value.condicion_medica,
    };

    this.guardando = true;
    this.crS.updateClinicalRecord(dto).subscribe({
      next: () => {
        this.guardando = false;
        this.mensaje = 'Actualizado correctamente!!';
        this.cdr.detectChanges();
        this.router.navigate(['/historial/listar']);
      },
      error: (error) => {
        console.error(error);
        this.guardando = false;
        this.mensaje = 'Error al actualizar!!';
        this.cdr.detectChanges();
      },
    });
  }
}