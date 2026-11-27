import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Clinicalrecordservice } from '../../../services/clinicalrecordservice';
import { Familycontextservice } from '../../../services/familycontextservice';
import { ClinicalrecordDTO } from '../../../model/ClinicalrecordDTO';
import { Medicalconditionservice } from '../../../services/medicalconditionservice';
import { MedicalconditionDTO } from '../../../model/MedicalconditionDTO';
import { Loginservice } from '../../../services/loginservice';
import { Healthprofileservice } from '../../../services/healthprofileservice';
import { UsersService } from '../../../services/usuarioservice';

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
  selector: 'app-clinicalrecordupdatecomponent',
  styleUrl: './clinicalrecordupdatecomponent.css',
  templateUrl: './clinicalrecordupdatecomponent.html',
})
export class Clinicalrecordupdatecomponent implements OnInit {
  idClinicalRecord: any = null;
  formClinicalRecord: any;
  mensaje: string = '';
  hoy: Date = new Date(); // no permite fechas futuras
  perfilCargado: number | null = null; // perfil al que pertenece el historial
  nombrePerfilAdmin: string = ''; // nombre de la persona dueña del historial (solo administrador)
  guardando: boolean = false;
  condiciones: MedicalconditionDTO[] = [];

  tiposDocumento: string[] = [
    'Consulta',
    'Laboratorio',
    'Control'
  ];

  constructor(
    private crS: Clinicalrecordservice,
    private mcS: Medicalconditionservice,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public fcS: Familycontextservice,
    private loginService: Loginservice,
    private hpS: Healthprofileservice,
    private uS: UsersService,
  ) {}

  // Igual que en la lista de riegos: el rol se consulta en el servicio de login
  get esAdmin(): boolean {
    return this.loginService.hasAnyRole(['ADMIN']);
  }

  // Perfil al que pertenece el historial. El administrador ve el nombre de la persona dueña del historial.
  get nombrePerfil(): string {
    const id = this.perfilCargado;
    if (id === null) {
      return '';
    }
    if (this.esAdmin) {
      return this.nombrePerfilAdmin || 'Perfil #' + id;
    }
    return this.fcS.nombre(id);
  }

  ngOnInit(): void {
    // Recuperar ID desde la URL: /historial/editar/:id
    this.idClinicalRecord = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.idClinicalRecord || isNaN(this.idClinicalRecord)) {
      this.mensaje = 'ID inválido';
      return;
    }

    this.formClinicalRecord = this.fb.group({
      codigo: [this.idClinicalRecord],
      tipo: ['', Validators.required],
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      dia_evento: [new Date(), Validators.required],
      profesional: ['', Validators.required],
      condicion_medica: [null, Validators.required],
    });

    this.cargarCondiciones();

    // El administrador puede editar cualquier historial, sin depender del perfil elegido
    if (this.esAdmin) {
      this.buscarPorId();
      return;
    }

    // Primero se cargan los perfiles para saber cuál está elegido
    this.fcS.cargar().subscribe({
      next: () => this.buscarPorId(),
      error: (err) => {
        console.log('Ocurrió un error al cargar los perfiles', err);
        this.mensaje = 'No se pudieron cargar los perfiles.';
        this.cdr.detectChanges();
      },
    });
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

  buscarPorId(): void {
    this.crS.listId(this.idClinicalRecord).subscribe({
      next: (data: ClinicalrecordDTO) => {
        // El usuario solo edita historiales del perfil elegido; el administrador, cualquiera
        if (!this.esAdmin && data.idHealthProfile !== this.fcS.idActivo()) {
          this.mensaje = 'Este documento no está disponible en el perfil activo.';
          this.cdr.detectChanges();
          return;
        }
        this.perfilCargado = data.idHealthProfile;
        if (this.esAdmin) {
          this.cargarNombrePerfil(data.idHealthProfile);
        }
        this.formClinicalRecord.patchValue({
          codigo: data.idClinicalRecord,
          tipo: data.recordType,
          titulo: data.title,
          descripcion: data.description,
          dia_evento: new Date(data.eventDate),
          profesional: data.professionalName,
          condicion_medica: data.idCondition,
        });
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al buscar el historial', error);
        this.mensaje = 'No se encontró el historial.';
        this.cdr.detectChanges();
      },
    });
  }

  // El perfil no guarda nombres: se toma el del titular (o, si no tiene cuenta, el del dueño del perfil)
  private cargarNombrePerfil(idPerfil: number): void {
    this.hpS.list().subscribe({
      next: (perfiles) => {
        const perfil = perfiles.find((p) => p.idHealthProfile === idPerfil);
        if (perfil === undefined) {
          return;
        }
        const tieneTitular = perfil.idHolderUser !== null;
        const idUsuario = perfil.idHolderUser !== null ? perfil.idHolderUser : perfil.idOwnerUser;
        this.cargarNombreUsuario(idUsuario, tieneTitular);
      },
      error: (err) => {
        console.log('Ocurrió un error al buscar el perfil del historial', err);
      },
    });
  }

  private cargarNombreUsuario(idUsuario: number, tieneTitular: boolean): void {
    this.uS.listId(idUsuario).subscribe({
      next: (usuario) => {
        const nombre = usuario.firstName + ' ' + usuario.lastName;
        this.nombrePerfilAdmin = tieneTitular ? nombre : 'Perfil de ' + nombre;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al buscar el nombre del usuario', err);
      },
    });
  }

  actualizarHistorial(): void {
    const idPerfil = this.perfilCargado;
    if (idPerfil === null) {
      this.mensaje = 'El historial todavía no se ha cargado.';
      return;
    }
    if (this.formClinicalRecord.invalid) {
      this.formClinicalRecord.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos correctamente.';
      return;
    }

    // El historial conserva el perfil al que ya pertenecía, también cuando lo edita el administrador
    const dto: ClinicalrecordDTO = {
      idClinicalRecord: this.formClinicalRecord.value.codigo,
      idHealthProfile: idPerfil,
      recordType: this.formClinicalRecord.value.tipo,
      title: this.formClinicalRecord.value.titulo,
      description: this.formClinicalRecord.value.descripcion,
      eventDate: this.formClinicalRecord.value.dia_evento,
      professionalName: this.formClinicalRecord.value.profesional,
      idCondition: this.formClinicalRecord.value.condicion_medica,
    };

    this.guardando = true;
    this.crS.updateClinicalRecord(dto).subscribe({
      next: () => {
        this.guardando = false;
        this.mensaje = 'Actualizado correctamente.';
        this.cdr.detectChanges();
        this.router.navigate(['/historial/listar']);
      },
      error: (error) => {
        console.error(error);
        this.guardando = false;
        this.mensaje = 'Error al actualizar.';
        this.cdr.detectChanges();
      },
    });
  }
}