import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { DatosFamilia, Familyrelationshipservice, PerfilFamiliar } from '../../../services/familyrelationshipservice';
import { Clinicalrecordservice } from '../../../services/clinicalrecordservice';
import { Medicalconditionservice } from '../../../services/medicalconditionservice';
import { FamilyrelationshipDTO } from '../../../model/FamilyrelationshipDTO';
import { ClinicalrecordDTO } from '../../../model/ClinicalrecordDTO';
import { MedicalconditionDTO } from '../../../model/MedicalconditionDTO';

// Una fila de antecedentes: el familiar y las condiciones de su historial
interface Antecedente {
  perfil: PerfilFamiliar;
  tipo: string;
  condiciones: string[];
}

@Component({
  imports: [RouterLink, MatIconModule],
  selector: 'app-familybackgroundcomponent',
  styleUrls: ['../familypages.css', './familybackgroundcomponent.css'],
  templateUrl: './familybackgroundcomponent.html',
})
export class Familybackgroundcomponent implements OnInit {
  antecedentes: Antecedente[] = [];
  tieneAbuelos: boolean = false;
  mensaje: string = '';

  constructor(
    private frS: Familyrelationshipservice,
    private crS: Clinicalrecordservice,
    private mcS: Medicalconditionservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.frS
      .cargarFamilia()
      .pipe(
        switchMap((familia: DatosFamilia) =>
          forkJoin({
            familia: of(familia),
            // HU73: relaciones familiares del perfil principal
            relaciones: familia.miPerfil
              ? this.frS.listByProfile(familia.miPerfil.idHealthProfile)
              : of([] as FamilyrelationshipDTO[]),
            historias: this.crS.getClinicalRecord().pipe(catchError(() => of([] as ClinicalrecordDTO[]))),
            condiciones: this.mcS.getMedicalCondition().pipe(catchError(() => of([] as MedicalconditionDTO[]))),
          }),
        ),
      )
      .subscribe({
        next: (d) => {
          const yo = d.familia.miPerfil?.idHealthProfile;
          this.antecedentes = d.relaciones
            .filter((r) => r.idOriginProfile === yo)
            .map((r) => {
              const ids = d.historias.filter((h) => h.idHealthProfile === r.idRelativeProfile).map((h) => h.idCondition);
              const condiciones = d.condiciones
                .filter((c) => ids.includes(c.idMedicalCondition ?? -1))
                .map((c) => c.nameMedicalCondition);
              return {
                perfil: d.familia.perfiles.find((p) => p.idHealthProfile === r.idRelativeProfile)!,
                tipo: r.relationshipType,
                condiciones,
              };
            })
            .filter((a) => !!a.perfil);
          this.tieneAbuelos = this.antecedentes.some((a) => a.tipo.startsWith('Abuel'));
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log('Ocurrió un error al obtener los antecedentes', err);
          this.mensaje = 'Error al obtener los antecedentes!!';
          this.cdr.detectChanges();
        },
      });
  }
}
