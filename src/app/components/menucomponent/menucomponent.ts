import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Familycontextservice } from '../../services/familycontextservice';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
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
    RouterLinkActive,
  ],
  templateUrl: './menucomponent.html',
  styleUrl: './menucomponent.css',
})
export class Menucomponent implements OnInit, OnDestroy {
  @ViewChild('drawer') private drawer?: MatSidenav;
  pantallaChica: boolean = false; // en celular el menú se abre con un botón
  nombre: string = 'Mi cuenta';
  primerNombre: string = 'Mi cuenta';
  iniciales: string = '';
  modoOscuro = false;
  seccionActual = 'Inicio';
  private sub?: Subscription;
  private rutaSub?: Subscription;
  private pantallaSub?: Subscription;

  constructor(
    private uS: UsersService,
    private cdr: ChangeDetectorRef,
    private tema: Themeservice,
    private router: Router,
    private breakpoint: BreakpointObserver,
    public fcS: Familycontextservice,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.tema.inicializar();
    this.modoOscuro = this.tema.modoOscuro;
    this.actualizarSeccion(this.router.url);
    this.rutaSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.actualizarSeccion(event.urlAfterRedirects);
        if (this.pantallaChica) this.drawer?.close();
      });

    // Cada vez que cambie el usuario de la sesión, el menú muestra su nombre
    this.sub = this.uS.usuario$.subscribe((u) => {
      if (u) {
        this.nombre = `${u.firstName} ${u.lastName}`.trim();
        this.primerNombre = u.firstName.trim();
        this.iniciales = (
          (u.firstName?.charAt(0) ?? '') + (u.lastName?.charAt(0) ?? '')
        ).toUpperCase();
      } else {
        this.nombre = this.primerNombre = 'Mi cuenta';
        this.iniciales = '';
      }
      this.cdr.detectChanges();
    });

    if (isPlatformBrowser(this.platformId)) {
      this.pantallaSub = this.breakpoint.observe('(max-width: 720px)').subscribe((estado) => {
        this.pantallaChica = estado.matches;
        this.cdr.detectChanges();
      });
    }

    // Perfiles de la cuenta: el botón de arriba muestra el perfil elegido
    this.fcS.cargar().subscribe({
      next: () => this.cdr.detectChanges(),
      error: (err) => console.log('Ocurrió un error al cargar los perfiles', err),
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.rutaSub?.unsubscribe();
    this.pantallaSub?.unsubscribe();
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
      'cambiar-perfil': 'Cambiar perfil',
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
