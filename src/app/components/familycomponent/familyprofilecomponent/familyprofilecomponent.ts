import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { Familyrelationshipservice, PerfilFamiliar } from '../../../services/familyrelationshipservice';
import { Emergencycontactservice } from '../../../services/emergencycontactservice';
import { EmergencycontactDTO } from '../../../model/EmergencycontactDTO';
import { FamilyrelationshipDTO } from '../../../model/FamilyrelationshipDTO';

@Component({
  imports: [RouterLink, MatIconModule],
  selector: 'app-familyprofilecomponent',
  styleUrls: ['../familypages.css', './familyprofilecomponent.css'],
  templateUrl: './familyprofilecomponent.html',
})
export class Familyprofilecomponent implements OnInit {
  idPerfil: number = 0;
  perfil: PerfilFamiliar | null = null;
  relacionConmigo: FamilyrelationshipDTO | null = null; // relación "yo -> este perfil"
  relacionesPerfil: FamilyrelationshipDTO[] = []; // HU73
  contactos: EmergencycontactDTO[] = [];
  mensaje: string = '';

  constructor(
    private route: ActivatedRoute,
    private frS: Familyrelationshipservice,
    private ecS: Emergencycontactservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Recuperar ID desde la URL: /familia/perfil/:id
    this.idPerfil = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.idPerfil || isNaN(this.idPerfil)) {
      this.mensaje = 'ID inválido';
      return;
    }

    forkJoin({
      familia: this.frS.cargarFamilia(),
      // HU73: relaciones familiares de este perfil
      relaciones: this.frS.listByProfile(this.idPerfil).pipe(catchError(() => of([] as FamilyrelationshipDTO[]))),
      // HU12 responde 404 si no hay contactos (CA03)
      contactos: this.ecS.list().pipe(catchError((e) => (e.status === 404 ? of([]) : throwError(() => e)))),
    }).subscribe({
      next: (data) => {
        const miId = data.familia.miPerfil?.idHealthProfile;
        this.perfil = data.familia.perfiles.find((p) => p.idHealthProfile === this.idPerfil) ?? null;
        this.relacionesPerfil = data.relaciones;
        this.relacionConmigo =
          data.relaciones.find((r) => r.idOriginProfile === miId && r.idRelativeProfile === this.idPerfil) ?? null;
        this.contactos = data.contactos.filter((c) => c.idHealthProfile === this.idPerfil);
        if (!this.perfil) this.mensaje = 'No se encontró el perfil !!!';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al obtener el perfil', err);
        this.mensaje = 'Error al obtener el perfil!!';
        this.cdr.detectChanges();
      },
    });
  }

  get primerNombre(): string {
    return (this.perfil?.nombre ?? '').split(' ')[0];
  }

  get tipo(): string {
    if (this.perfil?.principal) return 'Perfil principal';
    return this.relacionConmigo?.relationshipType ?? 'Familiar';
  }

  get contactoPrincipal(): EmergencycontactDTO | null {
    return this.contactos.find((c) => c.primaryContact) ?? this.contactos[0] ?? null;
  }

  // "Resumen PDF": abre el diálogo de impresión del navegador (Guardar como PDF)
  imprimir(): void {
    window.print();
  }
}
