import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Clinicalrecordservice } from '../../../services/clinicalrecordservice';
import { UsersService } from '../../../services/usuarioservice';
import { ClinicalrecordDTO } from '../../../model/ClinicalrecordDTO';
import { Subscription } from 'rxjs';

@Component({
  imports: [DatePipe, RouterLink, MatIconModule, MatButtonModule],
  selector: 'app-clinicalrecordlistcomponent',
  styleUrl: './clinicalrecordlistcomponent.css',
  templateUrl: './clinicalrecordlistcomponent.html',
})
export class Clinicalrecordlistcomponent implements OnInit, OnDestroy {
  dataSource: ClinicalrecordDTO[] = [];
  filtroActivo: string = 'todos';
  busqueda: string = '';
  mensaje: string = '';
  primerNombre = '';
  private usuarioSub?: Subscription;
 
  constructor(
    private crS: Clinicalrecordservice,
    private usuarios: UsersService,
    private cdr: ChangeDetectorRef,
  ) {}
 
  ngOnInit(): void {
    this.usuarioSub = this.usuarios.usuario$.subscribe((usuario) => {
      this.primerNombre = usuario?.firstName?.trim() ?? '';
      this.cdr.detectChanges();
    });
    this.usuarios.cargarUsuarioActual().subscribe({
      error: (err) => console.error('No se pudo cargar el nombre del usuario', err),
    });
    this.listarHistoriales();
  }

  ngOnDestroy(): void {
    this.usuarioSub?.unsubscribe();
  }
 
  listarHistoriales(): void {
    this.crS.getClinicalRecord().subscribe({
      next: (data) => {
        this.dataSource = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al obtener los registros', err);
        this.mensaje = 'Error al obtener los registros!!';
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
        this.mensaje = 'Error al eliminar!!';
        this.cdr.detectChanges();
      },
    });
  }
}
