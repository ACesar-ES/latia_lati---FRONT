import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Medicaldocumentsservice } from '../../../services/medicaldocumentsservice';
import { Familycontextservice } from '../../../services/familycontextservice';
import { MedicaldocumentsDTO } from '../../../model/MedicaldocumentsDTO';
import { toIsoDate } from '../../../utils/datehelpers';

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule],
  selector: 'app-medicaldocumentsinsertcomponent',
  styleUrl: './medicaldocumentsinsertcomponent.css',
  templateUrl: './medicaldocumentsinsertcomponent.html',
})
export class Medicaldocumentsinsertcomponent implements OnInit, OnDestroy {
  formDocument: FormGroup;
  mensaje = '';
  hoy = toIsoDate(new Date());
  tiposDocumento = ['Receta', 'Examen', 'Informe', 'Estudio de imagen', 'Otro'];
  returnPath: string;
  saving = false;
  private requests = new Subscription();

  constructor(
    private mdS: Medicaldocumentsservice, fb: FormBuilder, private router: Router,
    private cdr: ChangeDetectorRef, public family: Familycontextservice, route: ActivatedRoute,
  ) {
    this.returnPath = route.snapshot.queryParamMap.get('volver') === 'evolucion'
      ? '/evolucion' : '/documentos/listar';
    this.formDocument = fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      tipo: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/), Validators.maxLength(200)]],
      fecha: [this.hoy, Validators.required],
      perfil_salud: [null, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    this.loadProfiles();
  }

  loadProfiles(retry = false): void {
    this.requests.add(this.family.cargar(retry).subscribe({
      next: () => {
        this.formDocument.patchValue({ perfil_salud: this.family.idActivo() });
        this.cdr.markForCheck();
      },
      error: () => this.cdr.markForCheck(),
    }));
  }

  insertarDocumento(): void {
    if (this.saving) return;
    const v = this.formDocument.getRawValue();
    if (this.formDocument.invalid || v.fecha > this.hoy || !this.family.esPropio(v.perfil_salud)) {
      this.formDocument.markAllAsTouched();
      this.mensaje = 'Revisa el perfil, el enlace y la fecha del documento.';
      return;
    }
    const dto = {
      documentType: v.tipo, title: v.titulo.trim(), fileURL: v.url.trim(),
      documentDate: v.fecha, idHealthProfile: v.perfil_salud,
    } as MedicaldocumentsDTO;

    this.saving = true;
    this.mensaje = '';
    this.requests.add(this.mdS.insertMedicalDocument(dto).subscribe({
      next: () => {
        if (this.returnPath === '/evolucion') this.family.seleccionar(v.perfil_salud);
        this.router.navigate([this.returnPath]);
      },
      error: () => {
        this.saving = false;
        this.mensaje = 'No se pudo registrar el documento. Tus datos siguen en el formulario.';
        this.cdr.detectChanges();
      },
    }));
  }

  limpiar(): void {
    this.formDocument.reset({ fecha: this.hoy, perfil_salud: this.family.idActivo() });
    this.mensaje = '';
  }

  ngOnDestroy(): void {
    this.requests.unsubscribe();
  }
}
