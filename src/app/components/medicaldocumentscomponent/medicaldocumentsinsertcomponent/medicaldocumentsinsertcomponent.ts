import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { Medicaldocumentsservice } from '../../../services/medicaldocumentsservice';
import { MedicaldocumentsDTO } from '../../../model/MedicaldocumentsDTO';

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  selector: 'app-medicaldocumentsinsertcomponent',
  styleUrl: './medicaldocumentsinsertcomponent.css',
  templateUrl: './medicaldocumentsinsertcomponent.html',
})
export class Medicaldocumentsinsertcomponent {
   formDocument: any;
  mensaje: string = '';
  hoy: string = this.fechaHoy(); // 'yyyy-MM-dd' en hora local, sin fechas futuras

  tiposDocumento: string[] = ['Receta', 'Examen', 'Informe', 'Otro'];

  constructor(
    private mdS: Medicaldocumentsservice,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.formDocument = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      tipo: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      fecha: [this.hoy, Validators.required],
      perfil_salud: [null, [Validators.required, Validators.min(1)]],
    });
  }

  private fechaHoy(): string {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  }

  insertarDocumento(): void {
    if (this.formDocument.invalid) {
      this.formDocument.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos correctamente!!';
      return;
    }

    const v = this.formDocument.value;

    // Sin idMedicalDocuments: el backend lo genera
    const dto = {
      documentType: v.tipo,
      title: v.titulo,
      fileURL: v.url,
      documentDate: v.fecha,
      idHealthProfile: v.perfil_salud,
    } as MedicaldocumentsDTO;

    this.mdS.insertMedicalDocument(dto).subscribe({
      next: () => {
        this.router.navigate(['/documentos/listar']);
      },
      error: (error) => {
        console.error(error);
        this.mensaje = 'Error al registrar el documento!!';
        this.cdr.detectChanges();
      },
    });
  }

  limpiar(): void {
    this.formDocument.reset({ fecha: this.hoy });
    this.mensaje = '';
  }
}
