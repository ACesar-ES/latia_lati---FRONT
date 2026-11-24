import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Loginservice } from '../../services/loginservice';

@Component({
  selector: 'app-logincomponent',
  imports: [ReactiveFormsModule, RouterLink, MatIconModule],
  templateUrl: './logincomponent.html',
  styleUrl: './logincomponent.css',
})
export class Logincomponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Loginservice);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  errorMessage = '';
  submitting = false;
  mostrarPassword = false;

  alternarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.submitting = true;

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.submitting = false;

        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const destination =
          returnUrl?.startsWith('/') && !returnUrl.startsWith('//') && returnUrl !== '/'
            ? returnUrl
            : '/historial';

        void this.router.navigateByUrl(destination);
      },
      error: () => {
        this.submitting = false;
        this.errorMessage = 'Correo o contraseña incorrectos.';
      },
    });
  }
}