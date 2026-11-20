import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MedicaldocumentsDTO } from '../../../model/MedicaldocumentsDTO';
import { Medicaldocumentsservice } from '../../../services/medicaldocumentsservice';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
@Component({
  imports: [DatePipe, RouterLink, MatIconModule, MatButtonModule],
  selector: 'app-medicaldocumentslistcomponent',
  styleUrl: './medicaldocumentslistcomponent.css',
  templateUrl: './medicaldocumentslistcomponent.html',
})
export class Medicaldocumentslistcomponent implements OnInit {
  dataSource: MedicaldocumentsDTO[] = [];
  filtroActivo: string = 'todos';
  busqueda: string = '';
  mensaje: string = '';

  constructor(
    private mdS: Medicaldocumentsservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.listarDocumentos();
  }

  listarDocumentos(): void {
    this.mdS.getMedicalDocument().subscribe({
      next: (data) => {
        this.dataSource = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al obtener los documentos', err);
        this.mensaje = 'Error al obtener los documentos!!';
        this.cdr.detectChanges();
      },
    });
  }

  // Filtro por pestaña (tipo) + buscador, más recientes primero
  get documentosFiltrados(): MedicaldocumentsDTO[] {
    const q = this.busqueda.trim().toLowerCase();
    return this.dataSource
      .filter((d) => this.filtroActivo === 'todos' || (d.documentType ?? '').toLowerCase().includes(this.filtroActivo))
      .filter(
        (d) =>
          !q ||
          (d.title ?? '').toLowerCase().includes(q) ||
          (d.documentType ?? '').toLowerCase().includes(q),
      )
      .sort((a, b) => String(b.documentDate).localeCompare(String(a.documentDate)));
  }

  iconoDe(tipo: string): string {
    const t = (tipo ?? '').toLowerCase();
    if (t.includes('receta')) return 'medication';
    if (t.includes('examen')) return 'biotech';
    if (t.includes('informe')) return 'description';
    return 'folder';
  }

  eliminarDocumento(id: number): void {
    if (!confirm('¿Eliminar este documento?')) return;

    this.mdS.deleteMedicalDocument(id).subscribe({
      next: () => this.listarDocumentos(),
      error: (err) => {
        console.log('Ocurrió un error al eliminar el documento', err);
        this.mensaje = 'Error al eliminar!!';
        this.cdr.detectChanges();
      },
    });
  }
}
