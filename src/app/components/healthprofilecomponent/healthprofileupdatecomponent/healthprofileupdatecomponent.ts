import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of, switchMap } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideNativeDateAdapter } from '@angular/material/core';
import { UsersResponseDTO } from '../../../model/UsersResponseDTO';
import { HealthprofileDTO } from '../../../model/HealthprofileDTO';
import { EmergencycontactDTO } from '../../../model/EmergencycontactDTO';
import { UsersService } from '../../../services/usuarioservice';
import { Healthprofileservice } from '../../../services/healthprofileservice';
import { Emergencycontactservice } from '../../../services/emergencycontactservice';
import { fromIsoDate, toIsoDate } from '../../../utils/datehelpers';

@Component({
  selector: 'app-healthprofileupdatecomponent',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './healthprofileupdatecomponent.html',
  styleUrl: './healthprofileupdatecomponent.css',
})
export class Healthprofileupdatecomponent implements OnInit {
  formPerfil: any;
  usuario: UsersResponseDTO | null = null;
  perfil: HealthprofileDTO | null = null;
  contacto: EmergencycontactDTO | null = null;
  mensaje: string = '';
  hoy: Date = new Date();

  sexos: string[] = ['Femenino', 'Masculino', 'Otro'];
  gruposSanguineos: string[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  constructor(
    private uS: UsersService,
    private hpS: Healthprofileservice,
    private ecS: Emergencycontactservice,
    private fb: FormBuilder,
    private router: Router,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.formPerfil = this.fb.group({
      fecha_nacimiento: [null, Validators.required],
      sexo: ['', Validators.required],
      grupo_sanguineo: ['', Validators.required],
      telefono: ['', Validators.required],
      contacto_nombre: ['', Validators.maxLength(150)],
      contacto_telefono: ['', Validators.pattern(/^\+?[0-9]( ?[0-9]){6,14}$/)],
      contacto_parentesco: ['', Validators.maxLength(80)],
    });

    this.cargarDatos();
  }

  // Carga lo que el usuario ya tiene registrado para prellenar el formulario
  cargarDatos(): void {
    this.uS
      .cargarUsuarioActual()
      .pipe(
        switchMap((u) => {
          this.usuario = u;
          return this.hpS.getByOwner(u.idUser).pipe(catchError(() => of(null)));
        }),
        switchMap((p) => {
          this.perfil = p;
          return p
            ? this.ecS.getByProfile(p.idHealthProfile).pipe(catchError(() => of([] as EmergencycontactDTO[])))
            : of([] as EmergencycontactDTO[]);
        }),
      )
      .subscribe({
        next: (contactos) => {
          this.contacto = contactos.find((c) => c.primaryContact) ?? contactos[0] ?? null;

          this.formPerfil.patchValue({
            fecha_nacimiento: this.perfil ? fromIsoDate(this.perfil.birthDate) : null,
            sexo: this.perfil?.sex ?? '',
            grupo_sanguineo: this.perfil?.bloodType ?? '',
            telefono: this.perfil?.phone ?? '',
            contacto_nombre: this.contacto?.name ?? '',
            contacto_telefono: this.contacto?.phone ?? '',
            contacto_parentesco: this.contacto?.relationship ?? '',
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.mensaje = 'No se pudo cargar tu información.';
          this.cdr.detectChanges();
        },
      });
  }

  guardar(): void {
    if (this.formPerfil.invalid || !this.usuario) {
      this.formPerfil.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos correctamente!!';
      return;
    }

    const v = this.formPerfil.value;

    // El contacto es opcional, pero si empiezas a llenarlo debe estar completo
    const hayContacto = !!(v.contacto_nombre || v.contacto_telefono || v.contacto_parentesco);
    if (hayContacto && !(v.contacto_nombre && v.contacto_telefono && v.contacto_parentesco)) {
      this.mensaje = 'Completa nombre, teléfono y parentesco del contacto de emergencia.';
      return;
    }

    const perfilDto: HealthprofileDTO = {
      idHealthProfile: this.perfil?.idHealthProfile ?? 0,
      idOwnerUser: this.usuario.idUser,
      idHolderUser: this.perfil?.idHolderUser ?? null,
      birthDate: toIsoDate(v.fecha_nacimiento), // LocalDate -> "yyyy-MM-dd"
      sex: v.sexo,
      bloodType: v.grupo_sanguineo,
      phone: v.telefono,
      active: true,
    };

    const guardarPerfil$ = this.perfil
      ? this.hpS.updateHealthProfile(perfilDto)
      : this.hpS.insertHealthProfile(perfilDto);

    guardarPerfil$
      .pipe(
        switchMap((p) => {
          if (!hayContacto) return of(null);

          const contactoDto: EmergencycontactDTO = {
            idEmergencyContact: this.contacto?.idEmergencyContact ?? 0,
            idHealthProfile: p.idHealthProfile,
            name: v.contacto_nombre,
            phone: v.contacto_telefono,
            relationship: v.contacto_parentesco,
            primaryContact: true,
            createdAt: null,
            updatedAt: null,
          };

          return this.contacto ? this.ecS.updateContact(contactoDto) : this.ecS.insertContact(contactoDto);
        }),
      )
      .subscribe({
        next: () => {
          this.uS.refrescar();
          this.snack.open('Información actualizada correctamente!!', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/perfil/ver']);
        },
        error: (error) => {
          console.error(error);
          this.mensaje = 'Error al guardar la información!!';
          this.cdr.detectChanges();
        },
      });
  }
}
