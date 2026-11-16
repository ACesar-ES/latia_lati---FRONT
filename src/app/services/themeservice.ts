import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Themeservice {
  private oscuro = false;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  get modoOscuro(): boolean {
    return this.oscuro;
  }

  inicializar(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.oscuro = localStorage.getItem('latia-theme') === 'dark';
    }

    this.aplicar();
  }

  alternar(): boolean {
    this.establecerModoOscuro(!this.oscuro);
    return this.oscuro;
  }

  establecerModoOscuro(oscuro: boolean): void {
    this.oscuro = oscuro;
    this.aplicar();

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('latia-theme', this.oscuro ? 'dark' : 'light');
    }
  }

  private aplicar(): void {
    this.document.documentElement.classList.toggle('dark-theme', this.oscuro);
  }
}
