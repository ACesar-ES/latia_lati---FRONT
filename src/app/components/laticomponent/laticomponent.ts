import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Menucomponent } from '../menucomponent/menucomponent';
import { Familycontextservice } from '../../services/familycontextservice';

@Component({
  imports: [Menucomponent, RouterLink, MatIconModule],
  selector: 'app-laticomponent',
  styleUrl: './laticomponent.css',
  templateUrl: './laticomponent.html',
})
export class Laticomponent {
  mensaje = '';
  adjuntos: File[] = [];
  mostrarInstrucciones = false;
  mostrarMas = false;

  constructor(public contextoFamiliar: Familycontextservice) {}

  get idPerfilActivo(): number | null {
    return this.contextoFamiliar.idActivo();
  }

  get nombrePerfilActivo(): string {
    const id = this.idPerfilActivo;
    return id === null ? 'tu perfil' : this.contextoFamiliar.nombre(id);
  }

  get inicialesPerfilActivo(): string {
    const id = this.idPerfilActivo;
    return id === null ? 'LT' : this.contextoFamiliar.iniciales(id);
  }

  get parentescoPerfilActivo(): string {
    const id = this.idPerfilActivo;
    return id === null ? 'Perfil activo' : this.contextoFamiliar.parentesco(id);
  }

  actualizarMensaje(event: Event): void {
    this.mensaje = (event.target as HTMLTextAreaElement).value;
  }

  seleccionarAdjuntos(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    this.adjuntos = [...this.adjuntos, ...Array.from(input.files)];
    input.value = '';
  }

  eliminarAdjunto(indice: number): void {
    this.adjuntos = this.adjuntos.filter((_, i) => i !== indice);
  }

  limpiarBorrador(): void {
    this.mensaje = '';
    this.adjuntos = [];
    this.mostrarMas = false;
  }
}
