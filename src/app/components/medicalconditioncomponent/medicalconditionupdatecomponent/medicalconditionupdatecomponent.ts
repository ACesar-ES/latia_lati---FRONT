import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Medicalconditionservice } from '../../../services/medicalconditionservice';
import { MedicalconditionDTO } from '../../../model/MedicalconditionDTO';

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  selector: 'app-medicalconditionupdatecomponent',
  styleUrl: './medicalconditionupdatecomponent.css',
  templateUrl: './medicalconditionupdatecomponent.html',
})
export class Medicalconditionupdatecomponent implements OnInit {
  formMedicalCondition: any;
  mensaje: string = '';
  cargando: boolean = false;
  id: number = 0;
  original: MedicalconditionDTO | null = null;

  constructor(
    private mcS: Medicalconditionservice,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {
    this.formMedicalCondition = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      descripcion: ['', Validators.maxLength(500)],
    });
  }

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(this.id) || this.id <= 0) {
      this.router.navigate(['/condiciones']);
      return;
    }
    this.cargarCondicion();
  }

  // Trae la condición y rellena el formulario con sus datos
  cargarCondicion(): void {
    this.cargando = true;
    this.mensaje = '';
    this.mcS.listId(this.id).subscribe({
      next: (data) => {
        this.original = data;
        this.restablecer();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al obtener la condición médica', err);
        this.mensaje = 'No se pudo cargar la condición médica.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  actualizarCondicion(): void {
    if (this.formMedicalCondition.invalid) {
      this.formMedicalCondition.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos correctamente.';
      return;
    }

    const dto: MedicalconditionDTO = {
      idMedicalCondition: this.id,
      nameMedicalCondition: (this.formMedicalCondition.value.nombre || '').trim(),
      descriptionMedicalCondition: (this.formMedicalCondition.value.descripcion || '').trim(),
    };

    this.mcS.updateMedicalCondition(dto).subscribe({
      next: () => {
        this.mensaje = 'Condición médica actualizada correctamente.';
        this.cdr.detectChanges();
        this.router.navigate(['/condiciones']);
      },
      error: (error) => {
        console.error(error);
        this.mensaje = 'Error al actualizar la condición médica.';
        this.cdr.detectChanges();
      },
    });
  }

  // Deshace los cambios y vuelve a los datos guardados
  restablecer(): void {
    this.formMedicalCondition.reset({
      nombre: this.original ? this.original.nameMedicalCondition : '',
      descripcion: this.original ? this.original.descriptionMedicalCondition : '',
    });
    this.mensaje = '';
  }
}