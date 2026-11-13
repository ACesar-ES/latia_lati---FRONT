import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { UsersService } from '../../services/usuarioservice';
import { Themeservice } from '../../services/themeservice';

@Component({
  selector: 'app-menucomponent',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './menucomponent.html',
  styleUrl: './menucomponent.css',
})
export class Menucomponent implements OnInit, OnDestroy {
  nombre: string = 'Mi cuenta';
  primerNombre: string = 'Mi cuenta';
  iniciales: string = '';
  modoOscuro = false;
  seccionActual = 'Inicio';
  private sub?: Subscription;
  private rutaSub?: Subscription;

  constructor(
    private uS: UsersService,
    private cdr: ChangeDetectorRef,
    private tema: Themeservice,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.tema.inicializar();
    this.modoOscuro = this.tema.modoOscuro;
    this.actualizarSeccion(this.router.url);
    this.rutaSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.actualizarSeccion(event.urlAfterRedirects));

    // Cada vez que cambie el usuario de la sesión, el menú muestra su nombre
    this.sub = this.uS.usuario$.subscribe((u) => {
      if (u) {
        this.nombre = `${u.firstName} ${u.lastName}`.trim();
        this.primerNombre = u.firstName.trim();
        this.iniciales = ((u.firstName?.charAt(0) ?? '') + (u.lastName?.charAt(0) ?? '')).toUpperCase();
        this.cdr.detectChanges();
      }
    });

    // Si hay sesión, pedimos los datos del usuario (si ya estaban cargados no vuelve a llamar al backend)
    this.uS.cargarUsuarioActual().subscribe({ error: () => {} });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.rutaSub?.unsubscribe();
  }

  toggleTheme(): void {
    this.modoOscuro = this.tema.alternar();
  }

  private actualizarSeccion(url: string): void {
    const ruta = url.split('?')[0].split('#')[0].split('/').filter(Boolean)[0] ?? '';
    const secciones: Record<string, string> = {
      inicio: 'Inicio',
      historial: 'Historial',
      familia: 'Familia',
      agenda: 'Agenda',
      medicamentos: 'Medicamentos',
      evolucion: 'Evolución',
      lati: 'Lati',
      ajustes: 'Ajustes',
      perfil: 'Perfil',
    };

    this.seccionActual = secciones[ruta] ?? 'Inicio';
  }
}
