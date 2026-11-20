import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Menucomponent } from '../../menucomponent/menucomponent';
import { Familystatecomponent } from '../familystatecomponent';
import { Familycontextservice, PARENTESCOS } from '../../../services/familycontextservice';
import { Familyrelationshipservice } from '../../../services/familyrelationshipservice';
import { Healthprofileservice } from '../../../services/healthprofileservice';
import { FamilyrelationshipDTO } from '../../../model/FamilyrelationshipDTO';
import { HealthprofileDTO } from '../../../model/HealthprofileDTO';
import { toIsoDate } from '../../../utils/datehelpers';

// Vínculo que falta guardar (por ejemplo, si se creó el perfil pero falló la relación)
interface VinculoPendiente {
  origen: number;
  familiar: number;
  tipo: string;
  idDueno: number;
}

@Component({
  selector: 'app-familyaddcomponent',
  imports: [
    Menucomponent,
    Familystatecomponent,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './familyaddcomponent.html',
  styleUrl: './familyaddcomponent.css',
})
export class Familyaddcomponent implements OnInit {
  parentescos: string[] = PARENTESCOS;
  gruposSangre: string[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  hoy: Date = new Date();
  modo: 'nuevo' | 'existente' = 'nuevo';
  ocupado: boolean = false;
  mensaje: string = '';
  pendiente: VinculoPendiente | null = null;
  incierto: boolean = false; // no se sabe si el perfil llegó a crearse
  formVinculo: FormGroup;
  formPersona: FormGroup;

  constructor(
    public fcS: Familycontextservice,
    private frS: Familyrelationshipservice,
    private hpS: Healthprofileservice,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {
    this.formVinculo = this.fb.group({
      origen: [null, Validators.required],
      tipo: ['Madre', Validators.required],
      familiar: [null],
    });
    this.formPersona = this.fb.group({
      alias: ['', Validators.maxLength(80)],
      nacimiento: [null, Validators.required],
      sexo: ['', Validators.required],
      sangre: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^\+?[0-9]( ?[0-9]){6,14}$/)]],
    });
  }

  ngOnInit(): void {
    this.cargarPerfiles();
  }

  cargarPerfiles(forzar: boolean = false): void {
    this.fcS.cargar(forzar).subscribe({
      next: () => {
        this.iniciarFormulario();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al cargar los perfiles', err);
        this.cdr.detectChanges();
      },
    });
  }

  recargar(): void {
    this.cargarPerfiles(true);
  }

  // El árbol puede mandar el perfil de origen y el tipo: /familia/agregar?origen=3&tipo=Hijo
  private iniciarFormulario(): void {
    const raiz = this.fcS.raiz();
    if (!raiz) return;
    const params = this.route.snapshot.queryParamMap;
    const idOrigen = Number(params.get('origen'));
    const tipo = params.get('tipo');
    this.formVinculo.patchValue({
      origen: this.fcS.esPropio(idOrigen) ? idOrigen : raiz.idHealthProfile,
      tipo: tipo && this.parentescos.includes(tipo) ? tipo : 'Madre',
    });
  }

  // Perfiles que se pueden vincular (todos menos el de origen)
  get candidatos(): HealthprofileDTO[] {
    return this.fcS.ordenados().filter((p) => p.idHealthProfile !== this.formVinculo.value.origen);
  }

  cambiarModo(modo: 'nuevo' | 'existente'): void {
    if (this.ocupado || this.pendiente || (modo === 'nuevo' && this.incierto)) return;
    this.modo = modo;
    this.mensaje = '';
    this.formVinculo.controls['familiar'].reset();
  }

  guardar(): void {
    if (this.ocupado || this.fcS.fase !== 'listo') return;
    // Si el perfil ya se creó, solo se reintenta el vínculo
    if (this.pendiente) {
      this.registrarVinculo(this.pendiente, true);
      return;
    }
    this.mensaje = '';
    const { origen, familiar, tipo } = this.formVinculo.value;
    const idDueno = this.fcS.cuenta?.idUser;
    if (!idDueno || !origen || !this.fcS.esPropio(origen) || !this.parentescos.includes(tipo)) {
      this.mensaje = 'Elige un perfil de tu cuenta.';
      return;
    }

    // Vincular un perfil que ya existe
    if (this.modo === 'existente') {
      if (!familiar || !this.fcS.esPropio(familiar)) {
        this.mensaje = 'Selecciona el perfil que quieres vincular.';
        return;
      }
      const problema = this.fcS.problemaVinculo(origen, familiar, tipo);
      if (problema) {
        this.mensaje = problema;
        return;
      }
      this.registrarVinculo({ origen, familiar, tipo, idDueno }, true);
      return;
    }

    // Crear un perfil nuevo y luego el vínculo
    if (this.incierto) return;
    this.formPersona.markAllAsTouched();
    const v = this.formPersona.value;
    if (this.formPersona.invalid || !v.nacimiento || v.nacimiento > this.hoy) {
      this.mensaje = 'Revisa los campos marcados.';
      return;
    }
    const perfil: HealthprofileDTO = {
      idHealthProfile: 0,
      idOwnerUser: idDueno,
      idHolderUser: null,
      birthDate: toIsoDate(v.nacimiento),
      sex: v.sexo,
      bloodType: v.sangre,
      phone: v.telefono.trim(),
      active: true,
    };
    this.ocupado = true;
    this.hpS.insertHealthProfile(perfil).subscribe({
      next: (creado) => {
        if (!this.fcS.agregarPerfil(creado, idDueno, v.alias)) {
          this.recuperar();
          return;
        }
        this.pendiente = { origen, familiar: creado.idHealthProfile, tipo, idDueno };
        this.registrarVinculo(this.pendiente, false);
      },
      error: (err) => {
        console.log('Ocurrió un error al crear el perfil', err);
        // Sin respuesta o error del servidor: no se sabe si el perfil se creó
        if (!err.status || err.status >= 500) {
          this.recuperar();
          return;
        }
        this.ocupado = false;
        this.mensaje = 'No se creó el perfil. Revisa los datos.';
        this.cdr.detectChanges();
      },
    });
  }

  // Pasa a "vincular existente" para no crear el mismo perfil dos veces
  private recuperar(): void {
    this.ocupado = false;
    this.incierto = true;
    this.modo = 'existente';
    this.mensaje = 'No pudimos confirmar la creación. Revisa tus perfiles antes de crear otro.';
    this.cargarPerfiles(true);
  }

  // revisar = true: antes de crear, mira si el vínculo ya existe en el backend
  private registrarVinculo(v: VinculoPendiente, revisar: boolean): void {
    if (this.fcS.cuenta?.idUser !== v.idDueno || !this.fcS.esPropio(v.origen) || !this.fcS.esPropio(v.familiar)) {
      this.ocupado = false;
      return;
    }
    this.ocupado = true;
    if (!revisar) {
      this.crearVinculo(v);
      return;
    }
    this.frS.listByProfile(v.origen).subscribe({
      next: (lista) => {
        const igual = lista.find(
          (x) => x.idOriginProfile === v.origen && x.idRelativeProfile === v.familiar && x.relationshipType === v.tipo,
        );
        if (igual) {
          this.vinculoGuardado(igual, v);
          return;
        }
        if (this.fcS.problemaVinculo(v.origen, v.familiar, v.tipo, [...this.fcS.vinculos, ...lista])) {
          this.errorVinculo('Vínculo incompatible');
          return;
        }
        this.crearVinculo(v);
      },
      error: (err) => this.errorVinculo(err),
    });
  }

  private crearVinculo(v: VinculoPendiente): void {
    const fr: FamilyrelationshipDTO = {
      idFamilyRelationship: 0,
      idOriginProfile: v.origen,
      idRelativeProfile: v.familiar,
      relationshipType: v.tipo,
    };
    this.frS.insert(fr).subscribe({
      next: (creado) => this.vinculoGuardado(creado, v),
      error: (err) => this.errorVinculo(err),
    });
  }

  private vinculoGuardado(creado: FamilyrelationshipDTO, v: VinculoPendiente): void {
    this.ocupado = false;
    if (this.fcS.cuenta?.idUser !== v.idDueno) return;
    this.fcS.agregarVinculo(creado);
    if (this.fcS.seleccionar(v.familiar)) {
      this.pendiente = null;
      this.router.navigate(['/familia']);
    }
    this.cdr.detectChanges();
  }

  private errorVinculo(err: unknown): void {
    console.log('Ocurrió un error al guardar el vínculo', err);
    this.ocupado = false;
    this.mensaje = this.pendiente
      ? 'El perfil ya está creado. Reintenta solo el vínculo; no se creará otro perfil.'
      : 'No se pudo guardar el vínculo. Revisa el parentesco y vuelve a intentar.';
    this.cdr.detectChanges();
  }
}
