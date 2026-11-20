import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Emergencycontactservice } from '../../../services/emergencycontactservice';
import { Familyrelationshipservice, PerfilFamiliar } from '../../../services/familyrelationshipservice';
import { EmergencycontactDTO } from '../../../model/EmergencycontactDTO';

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
  ],
  selector: 'app-emergencycontactupdatecomponent',
  styleUrl: './emergencycontactupdatecomponent.css',
  templateUrl: './emergencycontactupdatecomponent.html',
})
export class Emergencycontactupdatecomponent implements OnInit {
  idContacto: number = 0;
  formContacto: any;
  mensaje: string = '';
  perfiles: PerfilFamiliar[] = []; // perfiles propios y de su familia

  parentescos: string[] = [
    'Padre', 'Madre', 'Hijo', 'Hija', 'Hermano', 'Hermana', 'Esposo', 'Esposa',
    'Abuelo', 'Abuela', 'Tio', 'Tia', 'Primo', 'Prima', 'Amigo', 'Amiga', 'Otro',
  ];

  constructor(
    private ecS: Emergencycontactservice,
    private frS: Familyrelationshipservice,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.formContacto = this.fb.group({
      perfil: ['', Validators.required],
      nombre: ['', [Validators.required, Validators.maxLength(150)]],
      // Mismo patrón que el backend: 7 a 15 dígitos, puede empezar con +
      telefono: ['', [Validators.required, Validators.pattern(/^\+?[0-9]( ?[0-9]){6,14}$/)]],
      parentesco: ['', [Validators.required, Validators.maxLength(80)]],
      principal: [false],
    });
  }

  ngOnInit(): void {
    // Recuperar ID desde la URL: /contactos/actualizar/:id
    this.idContacto = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.idContacto || isNaN(this.idContacto)) {
      this.mensaje = 'ID inválido';
      return;
    }
    this.buscarPorId();

    this.frS.cargarFamilia().subscribe({
      next: (data) => {
        this.perfiles = data.perfiles.filter((p) => data.idsFamilia.includes(p.idHealthProfile));
        this.cdr.detectChanges();
      },
      error: (err) => console.log('Error al obtener los perfiles', err),
    });
  }

  // HU13: buscar contacto por id
  buscarPorId(): void {
    this.ecS.listId(this.idContacto).subscribe({
      next: (data: EmergencycontactDTO) => {
        this.formContacto.patchValue({
          perfil: data.idHealthProfile,
          nombre: data.name,
          telefono: data.phone,
          parentesco: data.relationship,
          principal: data.primaryContact,
        });
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al buscar !!!', error);
        this.mensaje = 'No se encontró el contacto de emergencia !!!';
        this.cdr.detectChanges();
      },
    });
  }

  // HU14: actualizar contacto de emergencia
  actualizarContacto(): void {
    if (this.formContacto.invalid) {
      this.formContacto.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos correctamente!!';
      return;
    }

    const dto: EmergencycontactDTO = {
      idEmergencyContact: this.idContacto,
      idHealthProfile: this.formContacto.value.perfil,
      name: this.formContacto.value.nombre,
      phone: this.formContacto.value.telefono,
      relationship: this.formContacto.value.parentesco,
      primaryContact: !!this.formContacto.value.principal,
      createdAt: null,
      updatedAt: null,
    };

    this.ecS.updateContact(dto).subscribe({
      next: () => {
        this.mensaje = 'Actualizado correctamente!!';
        this.cdr.detectChanges();
        this.router.navigate(['/contactos/listar']);
      },
      error: (error) => {
        console.error(error);
        this.mensaje = error?.error?.message ?? 'Error al actualizar!!';
        this.cdr.detectChanges();
      },
    });
  }
}
