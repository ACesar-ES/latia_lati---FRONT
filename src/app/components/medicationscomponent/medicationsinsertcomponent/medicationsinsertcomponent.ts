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
  mensaje: string = '';

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

  unidades: string[] = ['mg', 'mcg', 'g', 'UI', 'mg/mL', '%', 'mEq'];

  constructor(
    private mS: Medicationsservice,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.formMedication = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      forma: ['', Validators.required],
      cantidad: [null, [Validators.required, Validators.min(0.01)]],
      unidad: ['', Validators.required],
    });
  }

  insertarMedicamento(): void {
    if (this.formMedication.invalid) {
      this.formMedication.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos correctamente!!';
      return;
    }

    const v = this.formMedication.value;

    const dto: MedicationsDTO = {
      nameMedications: v.nombre,
      dosageForm: v.forma,
      strength: `${v.cantidad} ${v.unidad}`, // ej: "500 mg"
    } as MedicationsDTO;

    this.mS.insertMedication(dto).subscribe({
      next: () => {
        this.router.navigate(['/medicamentos/listar']);
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
