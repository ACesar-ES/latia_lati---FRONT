import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Loginservice } from '../../services/loginservice';

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatIconModule],
  selector: 'app-logincomponent',
  styleUrl: './logincomponent.css',
  templateUrl: './logincomponent.html',
})
export class Logincomponent {
  formLogin: any;
  mensaje: string = '';
  cargando: boolean = false;
 
  constructor(
    private lS: Loginservice,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.formLogin = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      clave: ['', Validators.required],
    });
  }
 
  ingresar(): void {
    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      this.mensaje = '';
      return;
    }
 
    this.cargando = true;
    this.mensaje = '';
 
    this.lS.login(this.formLogin.value.correo, this.formLogin.value.clave).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/historial']);
      },
      error: (error) => {
        console.error(error);
        this.cargando = false;
        this.mensaje = 'Correo o contraseña incorrectos.';
        this.cdr.detectChanges();
      },
    });
  }
}
