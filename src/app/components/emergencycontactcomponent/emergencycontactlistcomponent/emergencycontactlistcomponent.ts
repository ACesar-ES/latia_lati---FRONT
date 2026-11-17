import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Emergencycontactservice } from '../../../services/emergencycontactservice';
import { Familyrelationshipservice, PerfilFamiliar } from '../../../services/familyrelationshipservice';
import { EmergencycontactDTO } from '../../../model/EmergencycontactDTO';

@Component({
  imports: [RouterLink, MatIconModule, MatButtonModule],
  selector: 'app-emergencycontactlistcomponent',
  styleUrl: './emergencycontactlistcomponent.css',
  templateUrl: './emergencycontactlistcomponent.html',
})
export class Emergencycontactlistcomponent implements OnInit {
  dataSource: EmergencycontactDTO[] = [];
  filtroActivo: string = 'todos'; // todos | principales
  busqueda: string = '';
  mensaje: string = '';
  perfiles: PerfilFamiliar[] = [];

  constructor(
    private ecS: Emergencycontactservice,
    private frS: Familyrelationshipservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.listarContactos('todos');
  }

  // HU12 (todos) o HU68 (solo principales), mostrando solo los perfiles del usuario con sesión
  listarContactos(filtro: string): void {
    this.filtroActivo = filtro;
    this.mensaje = '';

    // HU12 responde 404 cuando no hay contactos (CA03): se toma como lista vacía
    const contactos$: Observable<EmergencycontactDTO[]> =
      filtro === 'principales'
        ? this.ecS.listPrincipales()
        : this.ecS.list().pipe(catchError((err) => (err.status === 404 ? of([]) : throwError(() => err))));

    forkJoin({
      familia: this.frS.cargarFamilia(),
      contactos: contactos$,
    }).subscribe({
      next: (data) => {
        const ids = data.familia.idsFamilia;
        this.perfiles = data.familia.perfiles;
        this.dataSource = data.contactos.filter((c) => ids.includes(c.idHealthProfile));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al obtener los contactos', err);
        this.mensaje = 'Error al obtener los contactos de emergencia!!';
        this.cdr.detectChanges();
      },
    });
  }

  get contactosFiltrados(): EmergencycontactDTO[] {
    const q = this.busqueda.trim().toLowerCase();
    return this.dataSource
      .filter(
        (c) =>
          !q ||
          (c.name ?? '').toLowerCase().includes(q) ||
          (c.relationship ?? '').toLowerCase().includes(q) ||
          (c.phone ?? '').includes(q),
      )
      .sort((a, b) => b.idEmergencyContact - a.idEmergencyContact);
  }

  eliminarContacto(id: number): void {
    if (!confirm('¿Eliminar este contacto de emergencia?')) return;

    this.ecS.deleteContact(id).subscribe({
      next: () => {
        this.listarContactos(this.filtroActivo);
      },
      error: (err) => {
        console.log('Ocurrió un error al eliminar el contacto', err);
        this.mensaje = 'Error al eliminar!!';
        this.cdr.detectChanges();
      },
    });
  }

  nombrePerfil(id: number): string {
    return this.perfiles.find((p) => p.idHealthProfile === id)?.nombre ?? `Perfil ${id}`;
  }
}
