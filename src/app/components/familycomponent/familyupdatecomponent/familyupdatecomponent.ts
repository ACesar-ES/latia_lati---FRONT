import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Familyrelationshipservice, PerfilFamiliar } from '../../../services/familyrelationshipservice';
import { FamilyrelationshipDTO } from '../../../model/FamilyrelationshipDTO';

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
  selector: 'app-familyupdatecomponent',
  styleUrl: './familyupdatecomponent.css',
  templateUrl: './familyupdatecomponent.html',
})
export class Familyupdatecomponent implements OnInit {
  idRelacion: number = 0;
  formRelacion: any;
  mensaje: string = '';
  propios: PerfilFamiliar[] = []; // perfiles de origen: los del usuario con sesión
  perfiles: PerfilFamiliar[] = []; // cualquier perfil puede ser el familiar

  tiposRelacion: string[] = [
    'Padre', 'Madre', 'Hijo', 'Hija', 'Hermano', 'Hermana', 'Esposo', 'Esposa',
    'Abuela materna', 'Abuelo materno', 'Abuela paterna', 'Abuelo paterno',
    'Nieto', 'Nieta', 'Tío', 'Tía', 'Sobrino', 'Sobrina', 'Primo', 'Prima',
  ];

  constructor(
    private frS: Familyrelationshipservice,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.formRelacion = this.fb.group({
      origen: ['', Validators.required],
      familiar: ['', Validators.required],
      tipo: ['', [Validators.required, Validators.maxLength(30)]],
    });
  }

  ngOnInit(): void {
    // Recuperar ID desde la URL: /familia/actualizar/:id
    this.idRelacion = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.idRelacion || isNaN(this.idRelacion)) {
      this.mensaje = 'ID inválido';
      return;
    }
    this.buscarPorId();

    this.frS.cargarFamilia().subscribe({
      next: (data) => {
        this.propios = data.perfiles.filter((p) => p.propio);
        this.perfiles = data.perfiles;
        this.cdr.detectChanges();
      },
      error: (err) => console.log('Error al obtener los perfiles', err),
    });
  }

  // HU48: buscar relación por id
  buscarPorId(): void {
    this.frS.listId(this.idRelacion).subscribe({
      next: (data: FamilyrelationshipDTO) => {
        this.formRelacion.patchValue({
          origen: data.idOriginProfile,
          familiar: data.idRelativeProfile,
          tipo: data.relationshipType,
        });
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al buscar !!!', error);
        this.mensaje = 'No se encontró la relación familiar !!!';
        this.cdr.detectChanges();
      },
    });
  }

  // HU49: actualizar relación familiar
  actualizarRelacion(): void {
    if (this.formRelacion.invalid) {
      this.formRelacion.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos correctamente!!';
      return;
    }
    if (this.formRelacion.value.origen === this.formRelacion.value.familiar) {
      this.mensaje = 'El perfil de origen y el del familiar deben ser distintos!!';
      return;
    }

    const dto: FamilyrelationshipDTO = {
      idFamilyRelationship: this.idRelacion,
      idOriginProfile: this.formRelacion.value.origen,
      idRelativeProfile: this.formRelacion.value.familiar,
      relationshipType: this.formRelacion.value.tipo,
    };

    this.frS.update(dto).subscribe({
      next: () => {
        this.mensaje = 'Actualizado correctamente!!';
        this.cdr.detectChanges();
        this.router.navigate(['/familia/listar']);
      },
      error: (error) => {
        console.error(error);
        this.mensaje = error?.error?.message ?? 'Error al actualizar!!';
        this.cdr.detectChanges();
      },
    });
  }
}
