import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { UsersService } from '../../services/usuarioservice';

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
  iniciales: string = '';
  private sub?: Subscription;

  constructor(
    private uS: UsersService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Cada vez que cambie el usuario de la sesión, el menú muestra su nombre
    this.sub = this.uS.usuario$.subscribe((u) => {
      if (u) {
        this.nombre = `${u.firstName} ${u.lastName}`.trim();
        this.iniciales = ((u.firstName?.charAt(0) ?? '') + (u.lastName?.charAt(0) ?? '')).toUpperCase();
        this.cdr.detectChanges();
      }
    });

    // Si hay sesión, pedimos los datos del usuario (si ya estaban cargados no vuelve a llamar al backend)
    this.uS.cargarUsuarioActual().subscribe({ error: () => {} });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
