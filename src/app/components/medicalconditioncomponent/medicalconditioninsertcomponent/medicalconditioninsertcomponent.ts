import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
  ],
  selector: 'app-medicalconditioninsertcomponent',
  styleUrl: './medicalconditioninsertcomponent.css',
  templateUrl: './medicalconditioninsertcomponent.html',
})
export class Medicalconditioninsertcomponent {
  formMedicalCondition: any;
  mensaje: string = '';

  constructor(
    private mcS: Medicalconditionservice,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.formMedicalCondition = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      descripcion: ['', Validators.maxLength(500)],
    });
  }

  insertarCondicion(): void {
    if (this.formMedicalCondition.invalid) {
      this.formMedicalCondition.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos correctamente!!';
      return;
    }

    const dto: MedicalconditionDTO = {
      nameMedicalCondition: (this.formMedicalCondition.value.nombre ?? '').trim(),
      descriptionMedicalCondition: (this.formMedicalCondition.value.descripcion ?? '').trim(),
    };

    this.mcS.insertMedicalCondition(dto).subscribe({
      next: () => {
        this.mensaje = 'Condición médica registrada correctamente!!';
        this.cdr.detectChanges();
        this.router.navigate(['/condiciones']);
      },
      error: (error) => {
        console.error(error);
        this.mensaje = 'Error al registrar la condición médica!!';
        this.cdr.detectChanges();
      },
    });
  }

  limpiar(): void {
    this.formMedicalCondition.reset();
    this.mensaje = '';
  }
}