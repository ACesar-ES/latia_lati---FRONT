import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { UsersService } from '../../services/usuarioservice';
import { UsersRequestDTO } from '../../model/UsersRequestDTO';


@Component({
  selector: 'app-recuperarcomponent',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatIconModule],
  templateUrl: './recuperarcomponent.html',
  styleUrls: ['./recuperarcomponent.css']
})
export class RecuperarComponent {
  modo: 'recuperar' | 'cambiar' = 'recuperar';
  
  formRecuperar: FormGroup;
  formCambiar: FormGroup;
  
  cargando = false;
  mensajeRecuperar = '';
  mensajeCambiar = '';

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private uS: UsersService // Inyectamos tu servicio de usuarios
  ) {
    // Formulario opción 1: Solo pedir correo para enviar instrucciones
    this.formRecuperar = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // Formulario opción 2: Cambiar directamente (correo + nueva contraseña)
    this.formCambiar = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  cambiarModo(nuevoModo: 'recuperar' | 'cambiar') {
    this.modo = nuevoModo;
    this.mensajeRecuperar = '';
    this.mensajeCambiar = '';
  }

  enviarInstrucciones() {
    if (this.formRecuperar.invalid) {
      this.formRecuperar.markAllAsTouched();
      return;
    }
    
    this.cargando = true;
    this.mensajeRecuperar = '';
    const email = this.formRecuperar.value.email;
    
    // Simulación o llamada al endpoint de envío de correo de recuperación
    setTimeout(() => {
      this.cargando = false;
      this.mensajeRecuperar = `Se han enviado las instrucciones de recuperación a: ${email}`;
    }, 1000);
  }

  cambiarPasswordDirecto() {
    if (this.formCambiar.invalid) {
      this.formCambiar.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeCambiar = '';
    const { email, newPassword } = this.formCambiar.value;

    // 1. Buscamos al usuario en el backend por su correo electrónico usando el nuevo endpoint
    this.uS.getUserByEmail(email).subscribe({
      next: (usuarioEncontrado) => {
        // 2. Construimos el DTO con sus datos actuales y asignamos la nueva contraseña
        const userUpdate = new UsersRequestDTO();
        userUpdate.idUser = usuarioEncontrado.idUser;
        userUpdate.firstName = usuarioEncontrado.firstName;
        userUpdate.lastName = usuarioEncontrado.lastName;
        userUpdate.username = usuarioEncontrado.username;
        userUpdate.email = usuarioEncontrado.email;
        userUpdate.passwordHash = newPassword; // El backend aplicará el encoder automáticamente
        userUpdate.active = usuarioEncontrado.active;

        // 3. Ejecutamos el método updateUser para guardar los cambios
        this.uS.updateUser(userUpdate).subscribe({
          next: () => {
            this.cargando = false;
            // Redirigimos al login tras actualizar con éxito
            this.router.navigate(['/login']);
          },
          error: (err) => {
            this.cargando = false;
            this.mensajeCambiar = err.error?.message || 'Error al actualizar la contraseña.';
          }
        });
      },
      error: (err) => {
        this.cargando = false;
        // Si el correo no existe en la base de datos (404 Not Found)
        this.mensajeCambiar = 'No existe una cuenta registrada con este correo.';
      }
    });
  }
}