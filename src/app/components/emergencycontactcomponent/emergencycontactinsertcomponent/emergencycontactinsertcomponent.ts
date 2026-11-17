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
  selector: 'app-emergencycontactinsertcomponent',
  styleUrl: './emergencycontactinsertcomponent.css',
  templateUrl: './emergencycontactinsertcomponent.html',
})
export class Emergencycontactinsertcomponent implements OnInit {
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
    // Desde el panel de Familia llega el perfil elegido: /contactos/insertar?perfil=3
    const perfil = Number(this.route.snapshot.queryParamMap.get('perfil'));
    if (perfil) this.formContacto.patchValue({ perfil });

    this.frS.cargarFamilia().subscribe({
      next: (data) => {
        this.perfiles = data.perfiles.filter((p) => data.idsFamilia.includes(p.idHealthProfile));
        this.cdr.detectChanges();
      },
      error: (err) => console.log('Error al obtener los perfiles', err),
    });
  }

  // HU11: crear contacto de emergencia
  insertarContacto(): void {
    if (this.formContacto.invalid) {
      this.formContacto.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos correctamente!!';
      return;
    }

    const dto: EmergencycontactDTO = {
      idEmergencyContact: 0,
      idHealthProfile: this.formContacto.value.perfil,
      name: this.formContacto.value.nombre,
      phone: this.formContacto.value.telefono,
      relationship: this.formContacto.value.parentesco,
      primaryContact: !!this.formContacto.value.principal,
      createdAt: null,
      updatedAt: null,
    };

    this.ecS.insertContact(dto).subscribe({
      next: () => {
        this.mensaje = 'Contacto registrado correctamente!!';
        this.cdr.detectChanges();
        this.router.navigate(['/contactos/listar']);
      },
      error: (error) => {
        console.error(error);
        this.mensaje = error?.error?.message ?? 'Error al registrar el contacto!!';
        this.cdr.detectChanges();
      },
    });
  }

  limpiar(): void {
    this.formContacto.reset({ principal: false });
    this.mensaje = '';
  }
}
