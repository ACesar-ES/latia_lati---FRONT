import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Familyrelationshipservice, PerfilFamiliar } from '../../../services/familyrelationshipservice';
import { Healthprofileservice } from '../../../services/healthprofileservice';
import { FamilyrelationshipDTO } from '../../../model/FamilyrelationshipDTO';
import { HealthprofileDTO } from '../../../model/HealthprofileDTO';

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule],
  selector: 'app-familyinsertcomponent',
  styleUrls: ['../familypages.css', './familyinsertcomponent.css'],
  templateUrl: './familyinsertcomponent.html',
})
export class Familyinsertcomponent implements OnInit {
  formRelacion: any;
  mensaje: string = '';
  modo: string = 'nuevo'; // nuevo = crear su perfil | existente = elegir uno que ya existe
  miPerfil: PerfilFamiliar | null = null;
  idUsuario: number = 0;
  perfiles: PerfilFamiliar[] = [];
  hoy: string = new Date().toISOString().substring(0, 10);

  tiposRelacion: string[] = [
    'Padre', 'Madre', 'Hijo', 'Hija', 'Hermano', 'Hermana', 'Esposo', 'Esposa',
    'Abuela materna', 'Abuelo materno', 'Abuela paterna', 'Abuelo paterno',
    'Nieto', 'Nieta', 'Tío', 'Tía', 'Sobrino', 'Sobrina', 'Primo', 'Prima',
  ];
  sexos: string[] = ['Femenino', 'Masculino'];
  tiposSangre: string[] = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  // Tipos que van por encima del perfil principal en el árbol
  private ancestros: string[] = ['Padre', 'Madre', 'Abuela materna', 'Abuelo materno', 'Abuela paterna', 'Abuelo paterno', 'Tío', 'Tía'];

  constructor(
    private frS: Familyrelationshipservice,
    private hpS: Healthprofileservice,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.formRelacion = this.fb.group({
      tipo: ['', [Validators.required, Validators.maxLength(30)]],
      familiar: [''], // modo existente
      nacimiento: [''], // modo nuevo
      sexo: [''],
      sangre: [''],
      telefono: ['', Validators.pattern(/^\+?[0-9]( ?[0-9]){6,14}$/)],
    });
  }

  ngOnInit(): void {
    // El árbol puede mandar el tipo elegido: /familia/insertar?tipo=Hijo
    const tipo = this.route.snapshot.queryParamMap.get('tipo');
    if (tipo) this.formRelacion.patchValue({ tipo });

    this.frS.cargarFamilia().subscribe({
      next: (data) => {
        this.miPerfil = data.miPerfil;
        this.idUsuario = data.usuario?.idUser ?? 0;
        this.perfiles = data.perfiles.filter((p) => p.idHealthProfile !== data.miPerfil?.idHealthProfile);
        if (!this.miPerfil) this.mensaje = 'Primero crea tu propio perfil de salud en "Mi perfil".';
        this.cdr.detectChanges();
      },
      error: (err) => console.log('Error al obtener la familia', err),
    });
  }

  get tipoElegido(): string {
    return this.formRelacion.value.tipo || 'Familiar';
  }

  get esAncestro(): boolean {
    return this.ancestros.includes(this.formRelacion.value.tipo);
  }

  // HU46: crea la relación familiar (y antes el perfil de salud, si es nuevo)
  crearPerfil(): void {
    const v = this.formRelacion.value;
    const faltaNuevo = this.modo === 'nuevo' && (!v.nacimiento || !v.sexo || !v.sangre || !v.telefono);
    const faltaExistente = this.modo === 'existente' && !v.familiar;
    if (this.formRelacion.invalid || faltaNuevo || faltaExistente || !this.miPerfil) {
      this.formRelacion.markAllAsTouched();
      this.mensaje = this.miPerfil ? 'Por favor, complete todos los campos correctamente!!' : this.mensaje;
      return;
    }

    if (this.modo === 'existente') {
      this.registrarRelacion(v.familiar);
      return;
    }

    const perfil: HealthprofileDTO = {
      idHealthProfile: 0,
      idOwnerUser: this.idUsuario,
      idHolderUser: null,
      birthDate: v.nacimiento,
      sex: v.sexo,
      bloodType: v.sangre,
      phone: v.telefono,
      active: true,
    };
    this.hpS.insertHealthProfile(perfil).subscribe({
      next: (creado) => this.registrarRelacion(creado.idHealthProfile),
      error: (error) => {
        console.error(error);
        this.mensaje = error?.error?.message ?? 'Error al crear el perfil!!';
        this.cdr.detectChanges();
      },
    });
  }

  private registrarRelacion(idFamiliar: number): void {
    const dto: FamilyrelationshipDTO = {
      idFamilyRelationship: 0,
      idOriginProfile: this.miPerfil!.idHealthProfile,
      idRelativeProfile: idFamiliar,
      relationshipType: this.formRelacion.value.tipo,
    };

    this.frS.insert(dto).subscribe({
      next: () => {
        this.mensaje = 'Familiar agregado correctamente!!';
        this.cdr.detectChanges();
        this.router.navigate(['/familia/listar']);
      },
      error: (error) => {
        console.error(error);
        // El backend responde 409 si la relación ya existe (BusinessRuleException)
        this.mensaje = error?.error?.message ?? 'Error al registrar la relación!!';
        this.cdr.detectChanges();
      },
    });
  }
}
