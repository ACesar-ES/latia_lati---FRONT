import { Component } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Themeservice } from '../../services/themeservice';

type Recordatorio = 'medicamentos' | 'citas' | 'historial';

interface PreferenciasRecordatorios {
  medicamentos: boolean;
  citas: boolean;
  historial: boolean;
}

@Component({
  imports: [Menucomponent, RouterLink, MatIconModule],
  selector: 'app-settingscomponent',
  styleUrl: './settingscomponent.css',
  templateUrl: './settingscomponent.html',
})
export class Settingscomponent {
  modoOscuro = false;
  guardado = false;
  mensaje = '';
  recordatorios: PreferenciasRecordatorios = {
    medicamentos: true,
    citas: true,
    historial: true,
  };

  private readonly storageKey = 'latia-notification-preferences';

  constructor(
    private tema: Themeservice,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.tema.inicializar();
    this.modoOscuro = this.tema.modoOscuro;
    this.cargarPreferencias();
  }

  seleccionarApariencia(modoOscuro: boolean): void {
    this.modoOscuro = modoOscuro;
    this.tema.establecerModoOscuro(modoOscuro);
    this.guardado = false;
    this.mensaje = '';
  }

  cambiarRecordatorio(tipo: Recordatorio, event: Event): void {
    const control = event.target;
    if (!(control instanceof HTMLInputElement)) return;

    this.recordatorios[tipo] = control.checked;
    this.guardado = false;
    this.mensaje = '';
  }

  guardarPreferencias(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.recordatorios));
      this.guardado = true;
      this.mensaje = 'Preferencias guardadas.';
    } catch (error) {
      console.error('No se pudieron guardar las preferencias', error);
      this.guardado = false;
      this.mensaje = 'No se pudieron guardar las preferencias. Inténtalo de nuevo.';
    }
  }

  private cargarPreferencias(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const guardadas = localStorage.getItem(this.storageKey);
    if (!guardadas) return;

    try {
      const preferencias: unknown = JSON.parse(guardadas);
      if (!preferencias || typeof preferencias !== 'object') {
        throw new Error('El formato de preferencias no es válido');
      }

      const valores = preferencias as Partial<PreferenciasRecordatorios>;
      this.recordatorios = {
        medicamentos: typeof valores.medicamentos === 'boolean' ? valores.medicamentos : true,
        citas: typeof valores.citas === 'boolean' ? valores.citas : true,
        historial: typeof valores.historial === 'boolean' ? valores.historial : true,
      };
    } catch (error) {
      console.error('No se pudieron leer las preferencias guardadas', error);
      this.mensaje = 'No se pudieron cargar las preferencias guardadas.';
    }
  }
}
