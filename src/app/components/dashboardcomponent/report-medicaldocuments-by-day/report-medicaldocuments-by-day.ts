import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Medicaldocumentsservice } from '../../../services/medicaldocumentsservice';
import { MedicaldocumentsDTO } from '../../../model/MedicaldocumentsDTO';

@Component({
  selector: 'app-report-medical-documents-by-day',
  imports: [BaseChartDirective],
  templateUrl: './report-medicaldocuments-by-day.html',
  styleUrl: './report-medicaldocuments-by-day.css',
})
export class ReportMedicalDocumentsByDay implements OnInit {
  public chartType = 'bar' as const;
  fecha = '';
  titulo = 'Documentos médicos por día';

  public chartData: ChartData<'bar'> = { labels: [], datasets: [{ data: [] }] };

  public chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: { font: { family: 'Nunito, Segoe UI, sans-serif', weight: 'bold' } },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Nunito, Segoe UI, sans-serif' } } },
      y: {
        beginAtZero: true,
        grid: { color: '#f1f2f4' },
        ticks: { precision: 0, font: { family: 'Nunito, Segoe UI, sans-serif' } },
      },
    },
  };

  private paleta: string[] = ['#b8324f', '#d98a9b', '#8c7bb0', '#5aa17f', '#e2a65b', '#9ca3af'];

  constructor(
    private mdS: Medicaldocumentsservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.obtenerReporte();
  }

  alCambiarFecha(event: Event): void {
    this.fecha = (event.target as HTMLInputElement).value; // formato yyyy-MM-dd
    this.obtenerReporte();
  }

  limpiar(): void {
    this.fecha = '';
    this.obtenerReporte();
  }

  obtenerReporte(): void {
    if (this.fecha) {
      this.mdS.searchByDate(this.fecha).subscribe({
        next: (data) => this.armarGrafico(data, (d) => d.documentType, `Documentos del ${this.fecha} por tipo`, false),
        error: (error) => console.error('Error al cargar', error),
      });
    } else {
      this.mdS.getMedicalDocument().subscribe({
        next: (data) => this.armarGrafico(data, (d) => d.documentDate, 'Cantidad de documentos por día', true),
        error: (error) => console.error('Error al cargar', error),
      });
    }
  }

  private armarGrafico(
    data: MedicaldocumentsDTO[],
    clave: (d: MedicaldocumentsDTO) => string,
    etiqueta: string,
    ordenarPorClave: boolean,
  ): void {
    const conteo = new Map<string, number>();
    data.forEach((d) => {
      const k = clave(d)?.trim() || 'Sin dato';
      conteo.set(k, (conteo.get(k) ?? 0) + 1);
    });
    const filas = [...conteo.entries()].sort((a, b) =>
      ordenarPorClave ? a[0].localeCompare(b[0]) : b[1] - a[1],
    );

    this.chartData = {
      labels: filas.map((f) => f[0]),
      datasets: [
        {
          label: etiqueta,
          data: filas.map((f) => f[1]),
          backgroundColor: filas.map((_, i) => this.paleta[i % this.paleta.length]),
          borderRadius: 8,
          borderWidth: 0,
        },
      ],
    };
    this.cdr.detectChanges();
  }
}
