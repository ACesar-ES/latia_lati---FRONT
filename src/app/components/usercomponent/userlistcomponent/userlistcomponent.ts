import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Loginservice } from '../../../services/loginservice';
import { UsersResponseDTO } from '../../../model/UsersResponseDTO';
import { UsersService } from '../../../services/usuarioservice';
import { Roleservice } from '../../../services/roleservice';

@Component({
  selector: 'app-userlistcomponent',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressBarModule,
  ],
  styleUrl: './userlistcomponent.css',
  templateUrl: './userlistcomponent.html',
})
export class Userlistcomponent implements OnInit {
  usuarios: UsersResponseDTO[] = [];
  private rolesPorUsuario = new Map<number, string[]>();

  filtroEstado: string = 'todos';
  busqueda: string = '';
  pageIndex: number = 0;
  pageSize: number = 10;
  aviso: string = '';
  cargando: boolean = false;

  constructor(
    private uS: UsersService,
    private rS: Roleservice,
    private lS: Loginservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.listarUsuarios();
  }

  // Trae usuarios y roles en paralelo y agrupa los roles por usuario
  listarUsuarios(): void {
    this.aviso = '';
    this.cargando = true;

    forkJoin({ usuarios: this.uS.getUsers(), roles: this.rS.listar() }).subscribe({
      next: ({ usuarios, roles }) => {
        this.usuarios = usuarios;
        this.rolesPorUsuario = new Map();
        for (const r of roles) {
          const lista = this.rolesPorUsuario.get(r.idUser) ?? [];
          lista.push(r.rol);
          this.rolesPorUsuario.set(r.idUser, lista);
        }
        this.ajustarPagina();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al obtener los usuarios', err);
        this.usuarios = [];
        this.aviso = 'Error al obtener los usuarios!!';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  rolesDe(u: UsersResponseDTO): string[] {
    return (this.rolesPorUsuario.get(u.idUser) ?? []).map((r) =>
      r.startsWith('ROLE_') ? r.slice('ROLE_'.length) : r,
    );
  }

  iniciales(u: UsersResponseDTO): string {
    const a = (u.firstName ?? '').trim().charAt(0);
    const b = (u.lastName ?? '').trim().charAt(0);
    return (a + b).toUpperCase() || '?';
  }

  // El administrador no puede eliminar su propia cuenta desde aquí
  esUsuarioActual(u: UsersResponseDTO): boolean {
    const actual = this.lS.getEmail().trim().toLowerCase();
    return !!actual && (u.email ?? '').trim().toLowerCase() === actual;
  }

  cambiarFiltro(valor: string): void {
    this.filtroEstado = valor;
    this.pageIndex = 0;
  }

  actualizarBusqueda(valor: string): void {
    this.busqueda = valor;
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  // Filtro por estado + buscador, en orden alfabético
  get usuariosFiltrados(): UsersResponseDTO[] {
    const q = this.busqueda.trim().toLowerCase();
    return this.usuarios
      .filter(
        (u) =>
          this.filtroEstado === 'todos' ||
          (this.filtroEstado === 'activos' ? u.active : !u.active),
      )
      .filter(
        (u) =>
          !q ||
          (u.firstName ?? '').toLowerCase().includes(q) ||
          (u.lastName ?? '').toLowerCase().includes(q) ||
          (u.username ?? '').toLowerCase().includes(q) ||
          (u.email ?? '').toLowerCase().includes(q) ||
          this.rolesDe(u).some((r) => r.toLowerCase().includes(q)),
      )
      .sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
      );
  }

  // Solo las tarjetas de la página actual
  get usuariosPagina(): UsersResponseDTO[] {
    const inicio = this.pageIndex * this.pageSize;
    return this.usuariosFiltrados.slice(inicio, inicio + this.pageSize);
  }

  // Si al eliminar la última tarjeta de una página, retrocede una página
  private ajustarPagina(): void {
    const total = this.usuariosFiltrados.length;
    while (this.pageIndex > 0 && this.pageIndex * this.pageSize >= total) {
      this.pageIndex--;
    }
  }

  eliminarUsuario(u: UsersResponseDTO): void {
    if (this.esUsuarioActual(u)) return;
    if (!confirm(`¿Eliminar a ${u.firstName} ${u.lastName}?`)) return;

    this.uS.deleteUser(u.idUser).subscribe({
      next: () => {
        this.listarUsuarios();
      },
      error: (err) => {
        console.log('Ocurrió un error al eliminar el usuario', err);
        this.aviso = 'No se pudo eliminar. Si tiene perfiles o historiales asociados, desactívalo en su lugar.';
        this.cdr.detectChanges();
      },
    });
  }
}