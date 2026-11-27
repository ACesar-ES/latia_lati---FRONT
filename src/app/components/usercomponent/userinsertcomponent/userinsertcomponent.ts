import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Roleservice } from '../../../services/roleservice';
import { UsersRequestDTO } from '../../../model/UsersRequestDTO';
import { UsersService } from '../../../services/usuarioservice';

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
  ],
  selector: 'app-userinsertcomponent',
  styleUrl: './userinsertcomponent.css',
  templateUrl: './userinsertcomponent.html',
})
export class Userinsertcomponent {
  formUser: any;
  mensaje: string = '';
  guardando: boolean = false;
  verClave: boolean = false;

  // Solo estos roles tienen reglas de seguridad en el sistema
  rolesDisponibles: string[] = ['ADMIN', 'USER'];

  constructor(
    private uS: UsersService,
    private rS: Roleservice,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.formUser = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      username: ['', [Validators.required, Validators.pattern(/^\S+$/), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
      confirmar: ['', [Validators.required, this.coincideConClave]],
      roles: [['USER'], Validators.required],
      active: [true],
    });

    // Si cambia la contraseña, vuelve a comprobar la confirmación
    this.formUser.get('password').valueChanges.subscribe(() => {
      this.formUser.get('confirmar').updateValueAndValidity();
    });
  }

  private coincideConClave(control: AbstractControl): ValidationErrors | null {
    const padre = control.parent;
    if (padre === null) {
      return null;
    }
    const campo = padre.get('password');
    const clave = campo === null ? '' : campo.value;
    return control.value && control.value !== clave ? { noCoinciden: true } : null;
  }

  insertarUsuario(): void {
    if (this.formUser.invalid) {
      this.formUser.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos correctamente.';
      return;
    }
    if (this.guardando) return;

    this.guardando = true;
    this.mensaje = '';

    const v = this.formUser.value;
    const dto: UsersRequestDTO = {
      firstName: (v.firstName || '').trim(),
      lastName: (v.lastName || '').trim(),
      username: (v.username || '').trim(),
      email: (v.email || '').trim(),
      passwordHash: v.password, // texto plano: el backend la cifra con BCrypt
      active: v.active,
    };

    this.uS.insertUser(dto).subscribe({
      next: (usuario) => this.asignarRoles(usuario.idUser, v.roles || []),
      error: (error) => {
        console.error(error);
        this.guardando = false;
        this.mensaje = 'Error al registrar el usuario. Revisa que el correo o el usuario no estén repetidos.';
        this.cdr.detectChanges();
      },
    });
  }

  // Un POST por rol; si alguno falla, el usuario ya existe y se puede corregir al editarlo
  private asignarRoles(idUser: number, roles: string[]): void {
    if (roles.length === 0) {
      this.terminar();
      return;
    }

    forkJoin(roles.map((rol) => this.rS.asignar(rol, idUser))).subscribe({
      next: () => this.terminar(),
      error: (error) => {
        console.error(error);
        this.guardando = false;
        this.mensaje = 'El usuario se creó, pero no se pudieron asignar todos los roles. Edítalo para completarlos.';
        this.cdr.detectChanges();
      },
    });
  }

  private terminar(): void {
    this.guardando = false;
    this.mensaje = 'Usuario registrado correctamente.';
    this.cdr.detectChanges();
    this.router.navigate(['/usuarios']);
  }

  limpiar(): void {
    this.formUser.reset({ roles: ['USER'], active: true });
    this.mensaje = '';
  }
}