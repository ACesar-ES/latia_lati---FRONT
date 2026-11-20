import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Emergencycontactservice } from '../../../services/emergencycontactservice';
import { Familyrelationshipservice, PerfilFamiliar } from '../../../services/familyrelationshipservice';
import { EmergencycardDTO } from '../../../model/EmergencycardDTO';

@Component({
  imports: [RouterLink, MatIconModule, MatButtonModule],
  selector: 'app-emergencycardcomponent',
  styleUrl: './emergencycardcomponent.css',
  templateUrl: './emergencycardcomponent.html',
})
export class Emergencycardcomponent implements OnInit {
  dataSource: EmergencycardDTO[] = [];
  mensaje: string = '';
  perfiles: PerfilFamiliar[] = [];

  constructor(
    private ecS: Emergencycontactservice,
    private frS: Familyrelationshipservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.listarFichas();
  }

  // HU69: ficha de emergencia de cada perfil activo con su contacto principal (consulta con JOIN)
  listarFichas(): void {
    forkJoin({
      familia: this.frS.cargarFamilia(),
      fichas: this.ecS.listFichas(),
    }).subscribe({
      next: (data) => {
        const ids = data.familia.idsFamilia;
        this.perfiles = data.familia.perfiles;
        this.dataSource = data.fichas.filter((f) => ids.includes(f.idHealthProfile));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al obtener las fichas', err);
        this.mensaje = 'Error al obtener las fichas de emergencia!!';
        this.cdr.detectChanges();
      },
    });
  }

  nombrePerfil(id: number): string {
    return this.perfiles.find((p) => p.idHealthProfile === id)?.nombre ?? `Perfil ${id}`;
  }
}
