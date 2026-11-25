import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Themeservice } from '../../services/themeservice';
import { Loginservice } from '../../services/loginservice';

@Component({
  imports: [RouterLink, MatIconModule],
  selector: 'app-landingcomponent',
  styleUrl: './landingcomponent.css',
  templateUrl: './landingcomponent.html',
})
export class Landingcomponent {
  anio: number = new Date().getFullYear();

  constructor(
    private tema: Themeservice,
    private auth: Loginservice,
  ) {
    this.tema.inicializar();
  }

  get sesionIniciada(): boolean {
    return this.auth.isAuthenticated();
  }

  get modoOscuro(): boolean {
    return this.tema.modoOscuro;
  }

  toggleTheme(): void {
    this.tema.alternar();
  }

  // Desplazamiento suave a una sección de la misma página
  irA(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
