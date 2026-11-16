import { ChangeDetectorRef, Component } from '@angular/core';
import { Medicationsservice } from '../../../services/medicationsservice';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MedicationsDTO } from '../../../model/MedicationsDTO';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  selector: 'app-medicationsinsertcomponent',
  styleUrl: './medicationsinsertcomponent.css',
  templateUrl: './medicationsinsertcomponent.html',
})
export class Medicationsinsertcomponent {
  formMedication: any;
  mensaje: string='';
  hoy: Date = new Date();

  formaDosaje: string[] = [
    'Tableta',
    'Capsula',
    'Jarabe',
    'Suspension',
    'Inyectable',
    'Crema',
    'Gel',
    'Aerosol',
    'Gotas',
  ];

  fuerza: string[]= [
    'mg',
    'mcg',
    'g',
    'UI',
    'mg/mL',
    '%',
    'mEq',
  ];

  constructor(
    private mS: Medicationsservice,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.formMedication=this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      forma: ['', Validators.required],
      fuerza: ['', Validators.required]
    });
  }

  insertarMedicamento(): void {
    if (this.formMedication.invalid) {
      this.formMedication.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos correctamente!!';
      return;
    }

    const dto: MedicationsDTO = {
      idMedications: 0,
      nameMedications: this.formMedication.value.nombre,
      dosageForm: this.formMedication.value.forma,
      strength: this.formMedication.value.fuerza,
    };

    this.mS.insertMedication(dto).subscribe({
      next: () => {
        this.mensaje = 'Medicamento registrado correctamente!!';
        this.cdr.detectChanges();
        this.router.navigate(['/listar']);
      },
      error: (error) => {
        console.error(error);
        this.mensaje = 'Error al registrar el medicamento!!';
        this.cdr.detectChanges();
      },
    });
  }

  limpiar(): void {
    this.formMedication.reset();
    this.mensaje = '';
  }
}
