import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Clinicalrecordservice } from '../../../services/clinicalrecordservice';
import { ClinicalrecordDTO } from '../../../model/ClinicalrecordDTO';
import { Familycontextservice } from '../../../services/familycontextservice';
import { Medicalconditionservice } from '../../../services/medicalconditionservice';
import { MedicalconditionDTO } from '../../../model/MedicalconditionDTO';
import { Healthprofileservice } from '../../../services/healthprofileservice';
import { HealthprofileDTO } from '../../../model/HealthprofileDTO';
import { Loginservice } from '../../../services/loginservice';
import { UsersService } from '../../../services/usuarioservice';
import { UsersResponseDTO } from '../../../model/UsersResponseDTO';

// Perfiles agrupados por la cuenta que los administra
interface GrupoPerfiles {
  idDueno: number;
  dueno: string;
  perfiles: HealthprofileDTO[];
}

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
  ],
  providers: [provideNativeDateAdapter()],
  selector: 'app-clinicalrecordinsertcomponent',
  styleUrl: './clinicalrecordinsertcomponent.css',
  templateUrl: './clinicalrecordinsertcomponent.html',
})
export class Clinicalrecordinsertcomponent implements OnInit {
  formClinicalRecord: any;
  mensaje: string = '';
  hoy: Date = new Date();
  condiciones: MedicalconditionDTO[] = [];

  // Solo para el administrador: los perfiles activos de todos los usuarios, agrupados por cuenta
  perfiles: HealthprofileDTO[] = [];
  grupos: GrupoPerfiles[] = [];
  private usuarios = new Map<number, UsersResponseDTO>();

  tiposDocumento: string[] = [
    'Consulta',
    'Laboratorio',
    'Control',
  ];

  constructor(
    private crS: Clinicalrecordservice,
    private mcS: Medicalconditionservice,
    private hpS: Healthprofileservice,
    private uS: UsersService,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public fcS: Familycontextservice,
    private loginService: Loginservice,
  ) {
    this.formClinicalRecord = this.fb.group({
      perfil: [null],
      tipo: ['', Validators.required],
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      dia_evento: [new Date(), Validators.required],
      profesional: ['', Validators.required],
      condicion_medica: [null, Validators.required],
    });
  }

  // Igual que en la lista de riegos: el rol se consulta en el servicio de login
  get esAdmin(): boolean {
    return this.loginService.hasAnyRole(['ADMIN']);
  }

  ngOnInit(): void {
    // El administrador elige el perfil de una lista; el usuario usa el que eligió en "Cambiar perfil"
    if (this.esAdmin) {
      this.formClinicalRecord.get('perfil').setValidators(Validators.required);
      this.formClinicalRecord.get('perfil').updateValueAndValidity();
      this.cargarTodosLosPerfiles();
    }

    this.fcS.cargar().subscribe({
      next: () => {
        this.preseleccionarPerfil();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al cargar los perfiles', err);
        this.cdr.detectChanges();
      },
    });

    this.cargarCondiciones();
  }

  // El perfil no guarda nombres: se obtienen de los usuarios (dueño y titular)
  cargarTodosLosPerfiles(): void {
    forkJoin({ perfiles: this.hpS.list(), usuarios: this.uS.getUsers() }).subscribe({
      next: ({ perfiles, usuarios }) => {
        this.usuarios = new Map();
        for (const u of usuarios) {
          this.usuarios.set(u.idUser, u);
        }
        this.perfiles = perfiles.filter((p) => p.active);
        this.grupos = this.armarGrupos(this.perfiles);
        this.preseleccionarPerfil();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al cargar la lista de perfiles', err);
        this.mensaje = 'No se pudo cargar la lista de perfiles.';
        this.cdr.detectChanges();
      },
    });
  }

  private armarGrupos(perfiles: HealthprofileDTO[]): GrupoPerfiles[] {
    const porDueno = new Map<number, HealthprofileDTO[]>();
    for (const p of perfiles) {
      const lista = porDueno.get(p.idOwnerUser);
      if (lista) {
        lista.push(p);
      } else {
        porDueno.set(p.idOwnerUser, [p]);
      }
    }

    const grupos: GrupoPerfiles[] = [];
    porDueno.forEach((lista, idDueno) => {
      grupos.push({ idDueno: idDueno, dueno: this.etiquetaDueno(idDueno), perfiles: lista });
    });
    return grupos.sort((a, b) => a.dueno.localeCompare(b.dueno));
  }

  private etiquetaDueno(idUser: number): string {
    const u = this.usuarios.get(idUser);
    return u ? u.firstName + ' ' + u.lastName + ' (' + u.email + ')' : 'Usuario #' + idUser;
  }

  // Si el administrador ya tenía un perfil activo, queda marcado de inicio
  private preseleccionarPerfil(): void {
    const idActivo = this.fcS.idActivo();
    if (!this.esAdmin || !idActivo || this.formClinicalRecord.value.perfil) return;

    if (this.perfiles.some((p) => p.idHealthProfile === idActivo)) {
      this.formClinicalRecord.patchValue({ perfil: idActivo });
    }
  }

  // Titular (si tiene cuenta) + sexo + fecha de nacimiento, para distinguir perfiles parecidos
  nombrePerfil(p: HealthprofileDTO): string {
    let titular = 'Sin cuenta propia';
    if (p.idHolderUser !== null) {
      const u = this.usuarios.get(p.idHolderUser);
      titular = u ? u.firstName + ' ' + u.lastName : 'Usuario #' + p.idHolderUser;
    }
    return [titular, p.sex, p.birthDate].filter(Boolean).join(' · ');
  }

  cargarCondiciones(): void {
    this.mcS.getMedicalCondition().subscribe({
      next: (data) => {
        this.condiciones = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al cargar las condiciones médicas', err);
        this.cdr.detectChanges();
      },
    });
  }

  insertarHistorial(): void {
    const idPerfil = this.esAdmin ? this.formClinicalRecord.value.perfil : this.fcS.idActivo();
    if (!idPerfil) {
      this.formClinicalRecord.markAllAsTouched();
      this.mensaje = this.esAdmin
        ? 'Elige el perfil al que pertenece el historial.'
        : 'Elige un perfil antes de guardar.';
      return;
    }
    if (this.formClinicalRecord.invalid) {
      this.formClinicalRecord.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos correctamente.';
      return;
    }

    const dto: ClinicalrecordDTO = {
      idHealthProfile: idPerfil,
      recordType: this.formClinicalRecord.value.tipo,
      title: this.formClinicalRecord.value.titulo,
      description: this.formClinicalRecord.value.descripcion,
      eventDate: this.formClinicalRecord.value.dia_evento,
      professionalName: this.formClinicalRecord.value.profesional,
      idCondition: this.formClinicalRecord.value.condicion_medica,
    };

    this.crS.insertClinicalRecord(dto).subscribe({
      next: () => {
        this.mensaje = 'Historial registrado correctamente.';
        this.cdr.detectChanges();
        this.router.navigate(['/historial/listar']);
      },
      error: (error) => {
        console.error(error);
        this.mensaje = 'Error al registrar el historial.';
        this.cdr.detectChanges();
      },
    });
  }

  limpiar(): void {
    this.formClinicalRecord.reset({ dia_evento: new Date() });
    this.preseleccionarPerfil();
    this.mensaje = '';
  }
}