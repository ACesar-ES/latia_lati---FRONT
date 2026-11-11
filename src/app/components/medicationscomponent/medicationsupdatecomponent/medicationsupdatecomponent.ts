import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Medicationsservice } from '../../../services/medicationsservice';
import { MedicationsDTO } from '../../../model/MedicationsDTO';

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  selector: 'app-medicationsupdatecomponent',
  styleUrl: './medicationsupdatecomponent.css',
  templateUrl: './medicationsupdatecomponent.html',
})
export class Medicationsupdatecomponent implements OnInit {
  idMedications: any = null;
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
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Recuperar ID desde la URL: /medicamentos/actualizar/:id
    this.idMedications = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.idMedications || isNaN(this.idMedications)) {
      this.mensaje = 'ID inválido';
      return;
    }

    this.formMedication = this.fb.group({
      codigo: [this.idMedications],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      forma: ['', Validators.required],
      fuerza: ['', Validators.required]
    });

    this.buscarPorId();
  }

  buscarPorId(): void {
    this.mS.listId(this.idMedications).subscribe({
      next: (data: MedicationsDTO) => {
        this.formMedication.patchValue({
          codigo: data.idMedications,
          nombre: data.nameMedications,
          forma: data.dosageForm,
          fuerza: data.strength,
        });
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al buscar !!!', error);
        this.mensaje = 'No se encontró el medicamento !!!';
        this.cdr.detectChanges();
      },
    });
  }

  actualizarMedicamento(): void {
    if (this.formMedication.invalid) {
      this.formMedication.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos correctamente!!';
      return;
    }

    const dto: MedicationsDTO = {
      idMedications: this.formMedication.value.codigo,
      nameMedications: this.formMedication.value.nombre,
      dosageForm: this.formMedication.value.forma,
      strength: this.formMedication.value.fuerza,
    };

    this.mS.updateMedication(dto).subscribe({
      next: () => {
        this.mensaje = 'Actualizado correctamente!!';
        this.cdr.detectChanges();
        this.router.navigate(['/medicamentos/listar']);
      },
      error: (error) => {
        console.error(error);
        this.mensaje = 'Error al actualizar!!';
        this.cdr.detectChanges();
      },
    });
  }
}
