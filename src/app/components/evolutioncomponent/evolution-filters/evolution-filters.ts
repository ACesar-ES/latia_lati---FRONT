import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DocumentPeriod } from '../../../model/DocumentPeriod';
import { fromIsoDate, toIsoDate } from '../../../utils/datehelpers';
import { defaultDocumentPeriod } from '../../../utils/evolutionhelpers';

export function validateDocumentRange(group: AbstractControl): ValidationErrors | null {
  const { start, end } = group.value;
  if (!(start instanceof Date) || !(end instanceof Date)) return null;
  if (end < start) return { reversed: true };
  const months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
  return months >= 60 ? { tooLong: true } : null;
}

@Component({
  selector: 'app-evolution-filters',
  imports: [ReactiveFormsModule, MatButtonModule, MatDatepickerModule, MatFormFieldModule, MatInputModule],
  providers: [provideNativeDateAdapter()],
  templateUrl: './evolution-filters.html',
  styleUrl: './evolution-filters.css',
})
export class EvolutionFiltersComponent implements OnChanges {
  @Input({ required: true }) period!: DocumentPeriod;
  @Output() applied = new EventEmitter<DocumentPeriod>();
  form: FormGroup;

  constructor(fb: FormBuilder) {
    this.form = fb.group({
      start: fb.control<Date | null>(null, Validators.required),
      end: fb.control<Date | null>(null, Validators.required),
      documentType: ['', Validators.maxLength(50)],
    }, { validators: validateDocumentRange });
  }

  ngOnChanges(): void {
    this.form.reset({
      start: fromIsoDate(this.period.startDate),
      end: fromIsoDate(this.period.endDate),
      documentType: this.period.documentType,
    });
  }

  apply(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { start, end, documentType } = this.form.getRawValue();
    this.applied.emit(new DocumentPeriod(toIsoDate(start), toIsoDate(end), (documentType || '').trim()));
  }

  reset(): void {
    this.applied.emit(defaultDocumentPeriod());
  }
}
