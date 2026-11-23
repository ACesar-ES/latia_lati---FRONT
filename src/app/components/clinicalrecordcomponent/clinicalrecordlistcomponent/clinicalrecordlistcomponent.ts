import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Clinicalrecordservice } from '../../../services/clinicalrecordservice';
import { ClinicalrecordDTO } from '../../../model/ClinicalrecordDTO';
import { Familycontextservice } from '../../../services/familycontextservice';

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
export class Clinicalrecordlistcomponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];
  dataSource = new MatTableDataSource<ClinicalrecordDTO>([]);

  private registrosPerfil: ClinicalrecordDTO[] = [];
  filtroActivo: string = 'todos';
  busqueda: string = '';
  aviso: string = '';
  cargando: boolean = false;

  @ViewChild(MatPaginator) paginator?: MatPaginator;

  constructor(
    private crS: Clinicalrecordservice,
    private cdr: ChangeDetectorRef,
    public fcS: Familycontextservice,
  ) {}

  ngOnInit(): void {
    this.cargarPerfiles();
  }

  ngAfterViewInit(): void {
    this.aplicarFiltrosYPaginacion();
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

  // Solo los registros del perfil elegido
  listarHistoriales(): void {
    const idPerfil = this.fcS.idActivo();
    this.registrosPerfil = [];
    this.dataSource.data = [];
    this.aviso = '';

    if (!idPerfil) {
      this.cdr.detectChanges();
      return;
    }

    this.cargando = true;
    this.crS.getClinicalRecord().subscribe({
      next: (data) => {
        this.registrosPerfil = data.filter((r) => r.idHealthProfile === idPerfil);
        this.cargando = false;
        this.aplicarFiltrosYPaginacion();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al obtener los registros', err);
        this.aviso = 'Error al obtener los registros!!';
        this.cargando = false;
        this.aplicarFiltrosYPaginacion();
        this.cdr.detectChanges();
      },
    });
  }

  cambiarFiltro(filtro: string): void {
    this.filtroActivo = filtro;
    this.resetearPagina();
    this.aplicarFiltrosYPaginacion();
  }

  actualizarBusqueda(valor: string): void {
    this.busqueda = valor;
    this.resetearPagina();
    this.aplicarFiltrosYPaginacion();
  }

  onPageChange(_event: PageEvent): void {
    this.aplicarFiltrosYPaginacion();
  }

  // Filtro por pestaña + buscador, más recientes primero
  get historialesFiltrados(): ClinicalrecordDTO[] {
    const q = this.busqueda.trim().toLowerCase();
    return this.registrosPerfil
      .filter(
        (r) =>
          this.filtroActivo === 'todos' ||
          (r.recordType ?? '').toLowerCase().includes(this.filtroActivo),
      )
      .filter(
        (r) =>
          !q ||
          (r.title ?? '').toLowerCase().includes(q) ||
          (r.recordType ?? '').toLowerCase().includes(q) ||
          (r.professionalName ?? '').toLowerCase().includes(q) ||
          (r.description ?? '').toLowerCase().includes(q),
      )
      .sort((a, b) => String(b.eventDate).localeCompare(String(a.eventDate)));
  }

  private aplicarFiltrosYPaginacion(): void {
    const filtrados = this.historialesFiltrados;
    const pageIndex = this.paginator?.pageIndex ?? 0;
    const pageSize = this.paginator?.pageSize ?? 5;
    const inicio = pageIndex * pageSize;

    this.dataSource.data = filtrados.slice(inicio, inicio + pageSize);
    this.cdr.detectChanges();
  }

  private resetearPagina(): void {
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
  }

  eliminarHistorial(id: number): void {
    if (!confirm('¿Eliminar este historial?')) return;
    this.crS.deleteClinicalRecord(id).subscribe({
      next: () => {
        this.listarHistoriales();
      },
      error: (err) => {
        console.log('Ocurrió un error al eliminar el registro', err);
        this.aviso = 'Error al eliminar!!';
        this.cdr.detectChanges();
      },
    });
  }
}