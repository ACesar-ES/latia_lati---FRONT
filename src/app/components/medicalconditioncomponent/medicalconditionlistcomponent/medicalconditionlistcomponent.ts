import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Medicalconditionservice } from '../../../services/medicalconditionservice';
import { MedicalconditionDTO } from '../../../model/MedicalconditionDTO';

@Component({
  selector: 'app-medicalconditionlistcomponent',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
  ],
  styleUrl: './medicalconditionlistcomponent.css',
  templateUrl: './medicalconditionlistcomponent.html',
})
export class Medicalconditionlistcomponent implements OnInit {
  dataSource: MedicalconditionDTO[] = [];
  busqueda: string = '';
  aviso: string = '';
  cargando: boolean = false;

  constructor(
    private mcS: Medicalconditionservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.listarCondiciones();
  }

  listarCondiciones(): void {
    this.aviso = '';
    this.cargando = true;
    this.mcS.getMedicalCondition().subscribe({
      next: (data) => {
        this.dataSource = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al obtener las condiciones médicas', err);
        this.dataSource = [];
        this.aviso = 'Error al obtener las condiciones médicas!!';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Buscador por nombre y descripción, en orden alfabético
  get condicionesFiltradas(): MedicalconditionDTO[] {
    const q = this.busqueda.trim().toLowerCase();
    return this.dataSource
      .filter(
        (c) =>
          !q ||
          (c.nameMedicalCondition ?? '').toLowerCase().includes(q) ||
          (c.descriptionMedicalCondition ?? '').toLowerCase().includes(q),
      )
      .sort((a, b) => a.nameMedicalCondition.localeCompare(b.nameMedicalCondition));
  }

  eliminarCondicion(id: number): void {
    if (!confirm('¿Eliminar esta condición médica?')) return;
    this.mcS.deleteMedicalCondition(id).subscribe({
      next: () => {
        this.listarCondiciones();
      },
      error: (err) => {
        console.log('Ocurrió un error al eliminar la condición', err);
        this.aviso = 'Error al eliminar!!';
        this.cdr.detectChanges();
      },
    });
  }
}