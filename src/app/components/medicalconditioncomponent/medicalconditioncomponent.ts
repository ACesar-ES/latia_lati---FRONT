import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Medicalconditionservice } from '../../services/medicalconditionservice';
import { ActivatedRoute } from '@angular/router';
import { MedicalconditionDTO } from '../../model/MedicalconditionDTO';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-medicalconditioncomponent',
  styleUrl: './medicalconditioncomponent.css',
  templateUrl: './medicalconditioncomponent.html',
})
export class Medicalconditioncomponent {
  idIrrigation: any = null;
  formMedicalCondition: any;
  mensaje: string = '';

  constructor(
    private mcS: Medicalconditionservice,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Recuperar ID desde la URL
    this.idIrrigation = Number(this.route.snapshot.paramMap.get('id'));

    console.log('ID recibido:', this.idIrrigation);

    if (!this.idIrrigation || isNaN(this.idIrrigation)) {
      this.mensaje = 'ID inválido';
      return;
    }

    this.formMedicalCondition = this.fb.group({
      codigo: [this.idIrrigation],
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
    });

    this.buscarPorId();
  }

  buscarPorId(): void {
    this.mcS.listId(this.idIrrigation).subscribe({
      next: (data: MedicalconditionDTO) => {
        console.log('encontrado:', data);

        this.formMedicalCondition.patchValue({
          codigo: data.idMedicalCondition,
          nombre: data.nameMedicalCondition,
          descripcion: data.descriptionMedicalCondition
        });
      },

      error: (error) => {
        console.error('Error al buscar !!!', error);
        this.mensaje = 'No se encontró !!!';
      },
    });
  }

  actualizarInvernadero(): void {
    const dto = {
      idMedicalCondition: this.formMedicalCondition.value.codigo,
      nameMedicalCondition: this.formMedicalCondition.value.nombre,
      descriptionMedicalCondition: this.formMedicalCondition.value.descripcion
    };

    this.mcS.updateMedicalCondition(dto).subscribe({
      next: () => {
        this.mensaje = 'Actualizado correctamente!!';
        this.cdr.detectChanges();
        this.formMedicalCondition.reset();
      },

      error: (error) => {
        console.error(error);
        this.mensaje = 'Error al actualizar!!';
      },
    });
  }
}
