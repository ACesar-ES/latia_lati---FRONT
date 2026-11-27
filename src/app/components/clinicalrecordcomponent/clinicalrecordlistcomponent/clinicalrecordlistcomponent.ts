import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Clinicalrecordservice } from '../../../services/clinicalrecordservice';
import { ClinicalrecordDTO } from '../../../model/ClinicalrecordDTO';
import { Familycontextservice } from '../../../services/familycontextservice';
import { Loginservice } from '../../../services/loginservice';

@Component({
  selector: 'app-clinicalrecordlistcomponent',
  imports: [
    DatePipe,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
  ],
  templateUrl: './clinicalrecordlistcomponent.html',
  styleUrl: './clinicalrecordlistcomponent.css',
})
export class Clinicalrecordlistcomponent implements OnInit {
  private columnasUsuario: string[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];
  private columnasAdmin: string[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7'];

  // Igual que en la lista de riegos: el rol se consulta en el servicio de login
  get esAdmin(): boolean {
    return this.loginService.hasAnyRole(['ADMIN']);
  }

  get displayedColumns(): string[] {
    return this.esAdmin ? this.columnasAdmin : this.columnasUsuario;
  }

  // Filas de la página actual (la tabla necesita un arreglo estable, no un getter)
  dataSource: ClinicalrecordDTO[] = [];

  private registros: ClinicalrecordDTO[] = [];
  filtroActivo: string = 'todos';
  busqueda: string = '';
  pageIndex: number = 0;
  pageSize: number = 5;
  aviso: string = '';
  cargando: boolean = false;

  constructor(
    private crS: Clinicalrecordservice,
    private cdr: ChangeDetectorRef,
    public fcS: Familycontextservice,
    private loginService: Loginservice,
  ) {}

  ngOnInit(): void {
    if (this.esAdmin) {
      // El administrador ve todos los historiales, con una columna extra de perfil
      this.listarHistoriales();
      // Los perfiles se cargan solo para poder usar "Crear historial"
      this.fcS.cargar().subscribe({
        next: () => this.cdr.detectChanges(),
        error: (err) => console.log('Ocurrió un error al cargar los perfiles', err),
      });
      return;
    }

    this.cargarPerfiles();
  }

  // Primero se cargan los perfiles para saber cuál está elegido
  cargarPerfiles(forzar: boolean = false): void {
    this.fcS.cargar(forzar).subscribe({
      next: () => {
        this.cdr.detectChanges();
        this.listarHistoriales();
      },
      error: (err) => {
        console.log('Ocurrió un error al cargar los perfiles', err);
        this.cdr.detectChanges();
      },
    });
  }

  recargar(): void {
    this.cargarPerfiles(true);
  }

  // Nombre del perfil elegido, para el título
  get primerNombre(): string {
    const id = this.fcS.idActivo();
    return id ? this.fcS.nombre(id) : '';
  }

  get titulo(): string {
    if (this.esAdmin) {
      return 'Todos los historiales';
    }
    return this.primerNombre ? 'La historia de ' + this.primerNombre + ', en un lugar' : 'Historial clínico';
  }

  // Administrador: todos los registros. Usuario: solo los del perfil elegido
  listarHistoriales(): void {
    const idPerfil = this.fcS.idActivo();
    this.registros = [];
    this.dataSource = [];
    this.aviso = '';

    if (!this.esAdmin && !idPerfil) {
      this.cdr.detectChanges();
      return;
    }

    this.cargando = true;
    this.crS.getClinicalRecord().subscribe({
      next: (data) => {
        this.registros = this.esAdmin ? data : data.filter((r) => r.idHealthProfile === idPerfil);
        this.cargando = false;
        this.ajustarPagina();
        this.actualizarTabla();
      },
      error: (err) => {
        console.log('Ocurrió un error al obtener los registros', err);
        this.aviso = 'Error al obtener los registros.';
        this.cargando = false;
        this.actualizarTabla();
      },
    });
  }

  cambiarFiltro(filtro: string): void {
    this.filtroActivo = filtro;
    this.pageIndex = 0;
    this.actualizarTabla();
  }

  actualizarBusqueda(valor: string): void {
    this.busqueda = valor;
    this.pageIndex = 0;
    this.actualizarTabla();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.actualizarTabla();
  }

  // Filtro por pestaña + buscador, más recientes primero
  get historialesFiltrados(): ClinicalrecordDTO[] {
    const q = this.busqueda.trim().toLowerCase();
    return this.registros
      .filter(
        (r) =>
          this.filtroActivo === 'todos' ||
          (r.recordType || '').toLowerCase().includes(this.filtroActivo),
      )
      .filter(
        (r) =>
          !q ||
          (r.title || '').toLowerCase().includes(q) ||
          (r.recordType || '').toLowerCase().includes(q) ||
          (r.professionalName || '').toLowerCase().includes(q) ||
          (r.description || '').toLowerCase().includes(q),
      )
      .sort((a, b) => String(b.eventDate).localeCompare(String(a.eventDate)));
  }

  // Solo las filas de la página actual
  private actualizarTabla(): void {
    const inicio = this.pageIndex * this.pageSize;
    this.dataSource = this.historialesFiltrados.slice(inicio, inicio + this.pageSize);
    this.cdr.detectChanges();
  }

  // Si al eliminar la última fila de una página no quedan registros en ella, retrocede una página
  private ajustarPagina(): void {
    const total = this.historialesFiltrados.length;
    while (this.pageIndex > 0 && this.pageIndex * this.pageSize >= total) {
      this.pageIndex--;
    }
  }

  eliminarHistorial(id?: number): void {
    if (id === undefined) return;
    if (!confirm('¿Eliminar este historial?')) return;
    this.crS.deleteClinicalRecord(id).subscribe({
      next: () => {
        this.listarHistoriales();
      },
      error: (err) => {
        console.log('Ocurrió un error al eliminar el registro', err);
        this.aviso = 'Error al eliminar.';
        this.cdr.detectChanges();
      },
    });
  }
}
