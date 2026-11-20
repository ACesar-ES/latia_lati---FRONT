import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  selector: 'app-medicaldocumentsupdatecomponent',
  styleUrl: './medicaldocumentsupdatecomponent.css',
  templateUrl: './medicaldocumentsupdatecomponent.html',
})
export class Medicaldocumentsupdatecomponent implements OnInit {
  idMedicalDocuments: number = 0;
  formDocument: any;
  mensaje: string = '';
  hoy: string = this.fechaHoy();

  tiposDocumento: string[] = ['Receta', 'Examen', 'Informe', 'Otro'];

  constructor(
    private mdS: Medicaldocumentsservice,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  private fechaHoy(): string {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  }

  ngOnInit(): void {
    // Recuperar ID desde la URL: /documentos/actualizar/:id
    this.idMedicalDocuments = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.idMedicalDocuments || isNaN(this.idMedicalDocuments)) {
      this.mensaje = 'ID inválido';
      return;
    }

    this.formDocument = this.fb.group({
      codigo: [this.idMedicalDocuments],
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      tipo: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      fecha: ['', Validators.required],
      perfil_salud: [null, [Validators.required, Validators.min(1)]],
    });

    this.buscarPorId();
  }

  buscarPorId(): void {
    this.mdS.listId(this.idMedicalDocuments).subscribe({
      next: (data: MedicaldocumentsDTO) => {
        // Si el tipo guardado no está en la lista, se agrega para que el select lo muestre
        if (data.documentType && !this.tiposDocumento.includes(data.documentType)) {
          this.tiposDocumento.push(data.documentType);
        }

        this.formDocument.patchValue({
          codigo: data.idMedicalDocuments,
          titulo: data.title,
          tipo: data.documentType,
          url: data.fileURL,
          fecha: data.documentDate,
          perfil_salud: data.idHealthProfile,
        });
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al buscar !!!', error);
        this.mensaje = 'No se encontró el documento !!!';
        this.cdr.detectChanges();
      },
    });
  }

  actualizarDocumento(): void {
    if (this.formDocument.invalid) {
      this.formDocument.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos correctamente!!';
      return;
    }

    const v = this.formDocument.value;

    const dto: MedicaldocumentsDTO = {
      idMedicalDocuments: this.idMedicalDocuments, // aquí SÍ va el id real
      documentType: v.tipo,
      title: v.titulo,
      fileURL: v.url,
      documentDate: v.fecha,
      idHealthProfile: v.perfil_salud,
    };

    this.mdS.updateMedicalDocument(dto).subscribe({
      next: () => {
        this.router.navigate(['/documentos/listar']);
      },
      error: (error) => {
        console.error(error);
        this.mensaje = 'Error al actualizar!!';
        this.cdr.detectChanges();
      },
    });
  }
}
