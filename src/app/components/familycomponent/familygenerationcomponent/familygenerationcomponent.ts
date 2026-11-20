import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { DatosFamilia, Familyrelationshipservice, PerfilFamiliar } from '../../../services/familyrelationshipservice';

@Component({
  imports: [RouterLink, MatIconModule],
  selector: 'app-familygenerationcomponent',
  styleUrls: ['../familypages.css', './familygenerationcomponent.css'],
  templateUrl: './familygenerationcomponent.html',
})
export class Familygenerationcomponent implements OnInit {
  datos: DatosFamilia | null = null;
  mensaje: string = '';

  // Cada rama: dos abuelos arriba y uno de los padres abajo
  ramas = [
    { abuelos: ['Abuela materna', 'Abuelo materno'], padre: 'Madre' },
    { abuelos: ['Abuela paterna', 'Abuelo paterno'], padre: 'Padre' },
  ];

  constructor(
    private frS: Familyrelationshipservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.frS.cargarFamilia().subscribe({
      next: (data) => {
        this.datos = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al obtener la familia', err);
        this.mensaje = 'Error al obtener tu árbol!!';
        this.cdr.detectChanges();
      },
    });
  }

  // Perfil que ocupa un lugar del árbol (relación "yo -> familiar" con ese tipo), o null si está libre
  ocupante(tipo: string): PerfilFamiliar | null {
    const yo = this.datos?.miPerfil;
    const r = this.datos?.relaciones.find(
      (x) => x.idOriginProfile === yo?.idHealthProfile && x.relationshipType === tipo,
    );
    return r ? (this.datos?.perfiles.find((p) => p.idHealthProfile === r.idRelativeProfile) ?? null) : null;
  }
}
