import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Roleservice } from '../../../services/roleservice';
import { Loginservice } from '../../../services/loginservice';
import { UsersRequestDTO } from '../../../model/UsersRequestDTO';
import { UsersResponseDTO } from '../../../model/UsersResponseDTO';
import { RoleDTO } from '../../../model/RoleDTO';
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
    MatProgressBarModule,
  ],
  selector: 'app-userupdatecomponent',
  styleUrl: './userupdatecomponent.css',
  templateUrl: './userupdatecomponent.html',
})
export class Userupdatecomponent implements OnInit {
  formUser: any;
  mensaje: string = '';
  cargando: boolean = false;
  guardando: boolean = false;
  verClave: boolean = false;
  id: number = 0;

  // Datos tal como llegaron del servidor, para restablecer y para comparar roles
  original: UsersResponseDTO | null = null;
  private rolesOriginales: RoleDTO[] = [];

  // Solo estos roles tienen reglas de seguridad en el sistema
  private readonly rolesBase: string[] = ['ADMIN', 'USER'];
  rolesDisponibles: string[] = [...this.rolesBase];

  constructor(
    private uS: UsersService,
    private rS: Roleservice,
    private lS: Loginservice,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {
    this.formUser = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      username: ['', [Validators.required, Validators.pattern(/^\S+$/), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      // Opcional: si queda vacía, se mantiene la contraseña actual
      password: ['', [Validators.minLength(8), Validators.maxLength(72)]],
      confirmar: ['', [this.coincideConClave]],
      roles: [[] as string[], Validators.required],
      active: [true],
    });

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
    const clave = campo === null ? '' : campo.value || '';
    return (control.value || '') !== clave ? { noCoinciden: true } : null;
  }

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(this.id) || this.id <= 0) {
      this.router.navigate(['/usuarios']);
      return;
    }
    this.cargarUsuario();
  }

  // Un administrador no puede quitarse su propio acceso desde aquí
  get esCuentaPropia(): boolean {
    const actual = this.lS.getEmail().trim().toLowerCase();
    return actual !== '' && (this.original ? this.original.email : '').trim().toLowerCase() === actual;
  }

  private normalizar(rol: string): string {
    return rol.startsWith('ROLE_') ? rol.slice('ROLE_'.length) : rol;
  }

  // Trae el usuario y sus roles, y rellena el formulario
  cargarUsuario(): void {
    this.cargando = true;
    this.mensaje = '';

    forkJoin({ usuario: this.uS.listId(this.id), roles: this.rS.listar() }).subscribe({
      next: ({ usuario, roles }) => {
        this.original = usuario;
        this.rolesOriginales = roles.filter((r) => r.idUser === this.id);

        // Si el usuario ya tiene algún rol fuera de la lista base, también se muestra
        const actuales = this.rolesOriginales.map((r) => this.normalizar(r.rol));
        this.rolesDisponibles = [...new Set([...this.rolesBase, ...actuales])];

        this.restablecer();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al obtener el usuario', err);
        this.mensaje = 'No se pudo cargar el usuario.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  actualizarUsuario(): void {
    if (this.formUser.invalid) {
      this.formUser.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos correctamente.';
      return;
    }
    if (this.guardando) return;

    const v = this.formUser.getRawValue();
    const roles: string[] = v.roles || [];
    const teniaAdmin = this.rolesOriginales.some((r) => this.normalizar(r.rol) === 'ADMIN');

    if (this.esCuentaPropia && teniaAdmin && !roles.includes('ADMIN')) {
      this.mensaje = 'No puedes quitarte tu propio rol de administrador.';
      return;
    }

    this.guardando = true;
    this.mensaje = '';

    const dto: UsersRequestDTO = {
      idUser: this.id,
      firstName: (v.firstName || '').trim(),
      lastName: (v.lastName || '').trim(),
      username: (v.username || '').trim(),
      email: (v.email || '').trim(),
      passwordHash: v.password || '', // vacío = no cambiar (el backend debe respetarlo)
      active: v.active,
    };

    this.uS.updateUser(dto).subscribe({
      next: () => this.sincronizarRoles(roles),
      error: (error) => {
        console.error(error);
        this.guardando = false;
        this.mensaje = 'Error al actualizar el usuario. Revisa que el correo o el usuario no estén repetidos.';
        this.cdr.detectChanges();
      },
    });
  }

  // Agrega los roles marcados que no tenía y quita los desmarcados
  private sincronizarRoles(seleccionados: string[]): void {
    const actuales = this.rolesOriginales.map((r) => ({ id: r.id, nombre: this.normalizar(r.rol) }));

    const aAgregar = seleccionados.filter((s) => !actuales.some((a) => a.nombre === s));
    const aQuitar = actuales.filter((a) => !seleccionados.includes(a.nombre));

    const peticiones = [
      ...aAgregar.map((rol) => this.rS.asignar(rol, this.id)),
      ...aQuitar.map((a) => this.rS.quitar(a.id)),
    ];

    if (peticiones.length === 0) {
      this.terminar();
      return;
    }

    forkJoin(peticiones).subscribe({
      next: () => this.terminar(),
      error: (error) => {
        console.error(error);
        this.guardando = false;
        this.mensaje = 'Los datos se guardaron, pero no se pudieron actualizar todos los roles. Vuelve a abrir el usuario para revisarlos.';
        this.cdr.detectChanges();
      },
    });
  }

  private terminar(): void {
    this.guardando = false;
    this.mensaje = 'Usuario actualizado correctamente.';
    this.cdr.detectChanges();
    this.router.navigate(['/usuario']);
  }

  // Deshace los cambios y vuelve a los datos guardados
  restablecer(): void {
    if (!this.original) return;

    this.formUser.reset({
      firstName: this.original.firstName,
      lastName: this.original.lastName,
      username: this.original.username,
      email: this.original.email,
      password: '',
      confirmar: '',
      roles: this.rolesOriginales.map((r) => this.normalizar(r.rol)),
      active: this.original.active,
    });

    // Un administrador no puede desactivar su propia cuenta
    if (this.esCuentaPropia) {
      this.formUser.get('active').disable();
    } else {
      this.formUser.get('active').enable();
    }
    this.mensaje = '';
  }
}