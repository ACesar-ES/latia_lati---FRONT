import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UsersResponseDTO } from '../../../model/UsersResponseDTO';
import { HealthprofileDTO } from '../../../model/HealthprofileDTO';
import { EmergencycontactDTO } from '../../../model/EmergencycontactDTO';
import { Healthprofileservice } from '../../../services/healthprofileservice';
import { Emergencycontactservice } from '../../../services/emergencycontactservice';
import { UsersService } from '../../../services/usuarioservice';

@Component({
  selector: 'app-healthprofilelistcomponent',
  imports: [DatePipe, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './healthprofilelistcomponent.html',
  styleUrl: './healthprofilelistcomponent.css',
})
export class Healthprofilelistcomponent implements OnInit {
  usuario: UsersResponseDTO | null = null;
  perfil: HealthprofileDTO | null = null;
  contactos: EmergencycontactDTO[] = [];
  cargando: boolean = true;
  mensaje: string = '';

  constructor(
    private uS: UsersService,
    private hpS: Healthprofileservice,
    private ecS: Emergencycontactservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  // Usuario del login -> su perfil de salud -> sus contactos de emergencia
  cargarDatos(): void {
    this.cargando = true;
    this.mensaje = '';

    this.uS
      .cargarUsuarioActual()
      .pipe(
        switchMap((u) => {
          this.usuario = u;
          // si todavía no tiene perfil de salud, el backend puede responder 404: lo tomamos como "sin perfil"
          return this.hpS.getByOwner(u.idUser).pipe(catchError(() => of(null)));
        }),
        switchMap((p) => {
          this.perfil = p;
          return p
            ? this.ecS.getByProfile(p.idHealthProfile).pipe(catchError(() => of([] as EmergencycontactDTO[])))
            : of([] as EmergencycontactDTO[]);
        }),
      )
      .subscribe({
        next: (contactos) => {
          this.contactos = contactos;
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.cargando = false;
          this.mensaje = 'No se pudo cargar tu información.';
          this.cdr.detectChanges();
        },
      });
  }

  // ---------- Datos para mostrar ----------
  get nombreCompleto(): string {
    return this.usuario ? `${this.usuario.firstName} ${this.usuario.lastName}`.trim() : '';
  }

  get iniciales(): string {
    if (!this.usuario) return '';
    return ((this.usuario.firstName?.charAt(0) ?? '') + (this.usuario.lastName?.charAt(0) ?? '')).toUpperCase();
  }

  get grupoSanguineo(): string {
    return this.perfil?.bloodType ? this.perfil.bloodType : 'Pendiente de registrar';
  }

  get contactoEmergencia(): string {
    const c = this.contactos.find((x) => x.primaryContact) ?? this.contactos[0];
    return c ? `${c.name} · ${c.relationship}` : 'Sin contacto registrado';
  }

  // La fecha más reciente entre el usuario y sus contactos
  get ultimaActualizacion(): string | null {
    const fechas = [this.usuario?.updatedAt, ...this.contactos.map((c) => c.updatedAt)].filter(
      (f): f is string => !!f,
    );
    return fechas.length > 0 ? fechas.sort().reverse()[0] : null;
  }

  imprimirResumen(): void {
    window.print();
  }
}
