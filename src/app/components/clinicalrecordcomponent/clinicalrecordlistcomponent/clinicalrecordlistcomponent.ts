import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Clinicalrecordservice } from '../../../services/clinicalrecordservice';
import { ClinicalrecordDTO } from '../../../model/ClinicalrecordDTO';
import { Familycontextservice } from '../../../services/familycontextservice';

@Component({
  imports: [DatePipe, RouterLink, MatIconModule, MatButtonModule],
  selector: 'app-clinicalrecordlistcomponent',
  styleUrl: './clinicalrecordlistcomponent.css',
  templateUrl: './clinicalrecordlistcomponent.html',
})
export class Clinicalrecordlistcomponent implements OnInit {
  dataSource: ClinicalrecordDTO[] = [];
  filtroActivo: string = 'todos';
  busqueda: string = '';
  aviso: string = '';
  cargando: boolean = false;
 
  constructor(
    private crS: Clinicalrecordservice,
    private cdr: ChangeDetectorRef,
    public fcS: Familycontextservice,
  ) {}
 
  ngOnInit(): void {
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

  // Solo los registros del perfil elegido
  listarHistoriales(): void {
    const idPerfil = this.fcS.idActivo();
    this.dataSource = [];
    this.aviso = '';
    if (!idPerfil) return;
    this.cargando = true;
    this.crS.getClinicalRecord().subscribe({
      next: (data) => {
        this.dataSource = data.filter((r) => r.idHealthProfile === idPerfil);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al obtener los registros', err);
        this.aviso = 'Error al obtener los registros!!';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Filtro por pestaña + buscador, más recientes primero
  get historialesFiltrados(): ClinicalrecordDTO[] {
    const q = this.busqueda.trim().toLowerCase();
    return this.dataSource
      .filter((r) => this.filtroActivo === 'todos' || (r.recordType ?? '').toLowerCase().includes(this.filtroActivo))
      .filter(
        (r) =>
          !q ||
          (r.title ?? '').toLowerCase().includes(q) ||
          (r.recordType ?? '').toLowerCase().includes(q) ||
          (r.professionalName ?? '').toLowerCase().includes(q),
      )
      .sort((a, b) => String(b.eventDate).localeCompare(String(a.eventDate)));
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
