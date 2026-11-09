import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Clinicalrecordservice } from '../../../services/clinicalrecordservice';
import { ClinicalrecordDTO } from '../../../model/ClinicalrecordDTO';

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
  mensaje: string = '';
 
  constructor(
    private crS: Clinicalrecordservice,
    private cdr: ChangeDetectorRef,
  ) {}
 
  ngOnInit(): void {
    this.listarHistoriales();
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
