import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [RouterLink, MatIconModule],
  selector: 'app-landingcomponent',
  styleUrl: './landingcomponent.css',
  templateUrl: './landingcomponent.html',
})
export class Landingcomponent {
  anio: number = new Date().getFullYear();
 
  // Desplazamiento suave a una sección de la misma página
  irA(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
