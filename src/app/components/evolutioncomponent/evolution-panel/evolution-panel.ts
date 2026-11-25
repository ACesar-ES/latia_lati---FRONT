import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { DocumentPeriod } from '../../../model/DocumentPeriod';
import { MonthlyDocumentCountDTO } from '../../../model/MonthlyDocumentCountDTO';
import { MedicaldocumentsDTO } from '../../../model/MedicaldocumentsDTO';
import { Familycontextservice } from '../../../services/familycontextservice';
import { Medicaldocumentsservice } from '../../../services/medicaldocumentsservice';
import { defaultDocumentPeriod } from '../../../utils/evolutionhelpers';
import { EvolutionFiltersComponent } from '../evolution-filters/evolution-filters';
import { DocumentTimelineComponent } from '../document-timeline/document-timeline';
import { ReportDocumentsByMonth } from '../../dashboardcomponent/report-documents-by-month/report-documents-by-month';

@Component({
  selector: 'app-evolution-panel',
  imports: [RouterLink, MatButtonModule, MatFormFieldModule, MatSelectModule,
    EvolutionFiltersComponent, DocumentTimelineComponent, ReportDocumentsByMonth],
  templateUrl: './evolution-panel.html',
  styleUrl: './evolution-panel.css',
})
export class EvolutionPanelComponent implements OnInit, OnChanges, OnDestroy {
  @Input() showTimeline = true;
  @Input() refreshVersion = 0;
  period = defaultDocumentPeriod();
  documents: MedicaldocumentsDTO[] = [];
  months: MonthlyDocumentCountDTO[] = [];
  loadingTimeline = false;
  loadingReport = false;
  timelineError = '';
  reportError = '';
  private contextRequest?: Subscription;
  private requests = new Subscription();

  constructor(public family: Familycontextservice, private documentsService: Medicaldocumentsservice,
              private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadProfiles();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshVersion'] && !changes['refreshVersion'].firstChange && this.family.fase === 'listo') {
      this.refresh();
    }
  }

  loadProfiles(retry = false): void {
    this.contextRequest?.unsubscribe();
    this.contextRequest = this.family.cargar(retry).subscribe({
      next: () => { this.refresh(); this.cdr.markForCheck(); },
      error: () => this.cdr.markForCheck(),
    });
  }

  selectProfile(id: number): void {
    if (this.family.seleccionar(id)) this.refresh();
  }

  applyFilters(period: DocumentPeriod): void {
    this.period = period;
    this.refresh();
  }

  refresh(): void {
    // Al cambiar de familiar, descarta solicitudes anteriores y sus resultados visibles.
    this.requests.unsubscribe();
    this.requests = new Subscription();
    this.documents = [];
    this.months = [];
    this.timelineError = '';
    this.reportError = '';
    const id = this.family.idActivo();
    this.loadingTimeline = !!id && this.showTimeline;
    this.loadingReport = !!id;
    if (id === null) return;

    this.requests.add(this.documentsService.getMonthlyReport(id, this.period).subscribe({
      next: (rows) => { this.months = rows; this.loadingReport = false; this.cdr.detectChanges(); },
      error: () => {
        this.loadingReport = false;
        this.reportError = 'No se pudo cargar el reporte mensual.';
        this.cdr.detectChanges();
      },
    }));
    if (this.showTimeline) {
      this.requests.add(this.documentsService.getTimeline(id, this.period).subscribe({
        next: (rows) => { this.documents = rows; this.loadingTimeline = false; this.cdr.detectChanges(); },
        error: () => {
          this.loadingTimeline = false;
          this.timelineError = 'No se pudo cargar la línea de tiempo.';
          this.cdr.detectChanges();
        },
      }));
    }
  }

  ngOnDestroy(): void {
    this.contextRequest?.unsubscribe();
    this.requests.unsubscribe();
  }
}
