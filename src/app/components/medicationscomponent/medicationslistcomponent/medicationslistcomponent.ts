import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Medicationsservice } from '../../../services/medicationsservice';
import { MedicationsDTO } from '../../../model/MedicationsDTO';

@Component({
  // Nota: Quité DatePipe porque tus medicamentos no usan fechas
  imports: [RouterLink, MatIconModule, MatButtonModule],
  selector: 'app-medicationslistcomponent',
  styleUrl: './medicationslistcomponent.css',
  templateUrl: './medicationslistcomponent.html',
})
export class Medicationslistcomponent implements OnInit {
  dataSource: MedicationsDTO[] = [];
  filtroActivo: string = 'todos';
  busqueda: string = '';
  mensaje: string = '';

  constructor(
    private mS: Medicationsservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.listarMedicamentos();
  }

  listarMedicamentos(): void {
    // Asegúrate de que el método en tu servicio se llame 'list' o 'getMedications' según como lo hayas nombrado
    this.mS.getMedication().subscribe({
      next: (data) => {
        this.dataSource = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al obtener los registros', err);
        this.mensaje = 'Error al obtener los medicamentos!!';
        this.cdr.detectChanges();
      },
    });
  }

  // Filtro por pestaña (forma de dosaje) + buscador de texto, ordenado por ID más reciente
  get medicamentosFiltrados(): MedicationsDTO[] {
    const q = this.busqueda.trim().toLowerCase();
    return this.dataSource
      .filter((m) => this.filtroActivo === 'todos' || (m.dosageForm ?? '').toLowerCase().includes(this.filtroActivo))
      .filter(
        (m) =>
          !q ||
          (m.nameMedications ?? '').toLowerCase().includes(q) ||
          (m.dosageForm ?? '').toLowerCase().includes(q) ||
          (m.strength ?? '').toLowerCase().includes(q)
      )
      .sort((a, b) => (b.idMedications ?? 0) - (a.idMedications ?? 0));
  }

  eliminarMedicamento(id: number): void {
    if (!confirm('¿Eliminar este medicamento?')) return;

    // Asegúrate de que el método en tu servicio se llame 'deleteMedication' o similar
    this.mS.deleteMedication(id).subscribe({
      next: () => {
        this.listarMedicamentos();
      },
      error: (err) => {
        console.log('Ocurrió un error al eliminar el medicamento', err);
        this.mensaje = 'Error al eliminar!!';
        this.cdr.detectChanges();
      },
    });
  }
}
