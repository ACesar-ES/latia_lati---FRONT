import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Themeservice } from '../../services/themeservice';

@Component({
  imports: [RouterLink, MatIconModule],
  selector: 'app-landingcomponent',
  styleUrl: './landingcomponent.css',
  templateUrl: './landingcomponent.html',
})
export class Landingcomponent {
  anio: number = new Date().getFullYear();

  constructor(private tema: Themeservice) {
    this.tema.inicializar();
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
