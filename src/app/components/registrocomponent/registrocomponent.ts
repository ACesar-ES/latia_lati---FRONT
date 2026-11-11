import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { UsersService } from '../../services/usuarioservice';
import { UsersRequestDTO } from '../../model/UsersRequestDTO';


@Component({
  selector: 'app-registrocomponent',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatIconModule],
  templateUrl: './registrocomponent.html',
  styleUrls: ['./registrocomponent.css']
})
export class RegistroComponent {
  formRegistro: FormGroup;
  cargando = false;
  mensaje = '';

  constructor(
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder, 
    private router: Router,
    private uS: UsersService 
  ) {
    this.formRegistro = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      username: ['', [Validators.required]], // Añadido campo obligatorio para la entidad
      email: ['', [Validators.required, Validators.email]],
      passwordHash: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  registrar() {
    if (this.formRegistro.invalid) {
  this.formRegistro.markAllAsTouched();
  this.mensaje = 'Completa todos los campos correctamente.';
  return;
}

    this.cargando = true;
    this.mensaje = '';

    // Creamos la instancia del DTO con los valores del formulario y active por defecto en true
    const nuevoUsuario = new UsersRequestDTO();
    nuevoUsuario.firstName = this.formRegistro.value.firstName;
    nuevoUsuario.lastName = this.formRegistro.value.lastName;
    nuevoUsuario.username = this.formRegistro.value.username;
    nuevoUsuario.email = this.formRegistro.value.email;
    nuevoUsuario.passwordHash = this.formRegistro.value.passwordHash;
    nuevoUsuario.active = true; 

    // Llamada real al servicio backend
    this.uS.insertUser(nuevoUsuario).subscribe({
  next: () => {
    this.cargando = false;
    this.router.navigate(['/login']);
  },
  error: (err) => {
    this.cargando = false;
    this.mensaje = err.error?.message || 'Ocurrió un error al registrar la cuenta. Inténtalo de nuevo.';
    this.cdr.detectChanges();
  }
});
  }
}