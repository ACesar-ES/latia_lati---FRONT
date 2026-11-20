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
    MatIconModule,
  ],
  selector: 'app-medicationsupdatecomponent',
  styleUrl: './medicationsupdatecomponent.css',
  templateUrl: './medicationsupdatecomponent.html',
})
export class Medicationsupdatecomponent implements OnInit {
  idMedications: number = 0;
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
      cantidad: [null, [Validators.required, Validators.min(0.01)]],
      unidad: ['', Validators.required],
    });

    this.buscarPorId();
  }

  buscarPorId(): void {
    this.mS.listId(this.idMedications).subscribe({
      next: (data: MedicationsDTO) => {
        const { cantidad, unidad } = this.separarFuerza(data.strength);

        // Si el valor guardado no está en las listas, se agrega para que el select lo muestre
        if (data.dosageForm && !this.formaDosaje.includes(data.dosageForm)) {
          this.formaDosaje.push(data.dosageForm);
        }
        if (unidad && !this.unidades.includes(unidad)) {
          this.unidades.push(unidad);
        }

        this.formMedication.patchValue({
          codigo: data.idMedications,
          nombre: data.nameMedications,
          forma: data.dosageForm,
          cantidad: cantidad,
          unidad: unidad,
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

  // "500 mg" -> { cantidad: 500, unidad: 'mg' }
  private separarFuerza(texto: string): { cantidad: number | null; unidad: string } {
    const m = (texto ?? '').trim().match(/^([\d.,]+)\s*(.*)$/);
    if (!m) return { cantidad: null, unidad: '' };
    return { cantidad: Number(m[1].replace(',', '.')), unidad: m[2].trim() };
  }

  actualizarMedicamento(): void {
    if (this.formMedication.invalid) {
      this.formMedication.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos correctamente!!';
      return;
    }

    const v = this.formMedication.value;

    const dto: MedicationsDTO = {
      idMedications: this.idMedications, // aquí SÍ va el id real
      nameMedications: v.nombre,
      dosageForm: v.forma,
      strength: `${v.cantidad} ${v.unidad}`,
    };

    this.mS.updateMedication(dto).subscribe({
      next: () => {
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
