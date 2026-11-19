import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Familycontextservice } from '../../services/familycontextservice';

// Mensaje que se muestra mientras no hay perfiles listos (cargando, sin sesión, error o sin perfil propio)
@Component({
  selector: 'app-familystatecomponent',
  imports: [RouterLink],
  template: ` <section class="panel empty" aria-live="polite">
    @switch (fcS.fase) {
      @case ('sinSesion') {
        <h2>Inicia sesión para ver tu familia</h2>
        <p>Cada cuenta tiene su propio espacio de cuidado.</p>
        <a class="primary" routerLink="/login">Iniciar sesión</a>
      }
      @case ('error') {
        <h2>No pudimos abrir tu familia</h2>
        <p>Revisa tu conexión o vuelve a iniciar sesión.</p>
        <button class="secondary" (click)="reintentar.emit()">Volver a intentar</button>
      }
      @case ('listo') {
        <h2>Tu árbol empieza contigo</h2>
        <p>Completa tu ficha de salud para agregar a tus padres o hijos.</p>
        <a class="primary" routerLink="/perfil/actualizar">Completar mi perfil</a>
      }
      @default {
        <p role="status">Cargando tus perfiles…</p>
      }
    }
  </section>`,
})
export class Familystatecomponent {
  @Output() reintentar = new EventEmitter<void>();

  constructor(public fcS: Familycontextservice) {}
}
