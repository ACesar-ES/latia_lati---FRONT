import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Medicaldocumentsservice } from '../../../services/medicaldocumentsservice';
import { MedicaldocumentsDTO } from '../../../model/MedicaldocumentsDTO';

@Component({
  selector: 'app-report-medical-documents-by-profile',
  imports: [BaseChartDirective],
  templateUrl: './report-medicaldocuments-by-profile.html',
  styleUrl: './report-medicaldocuments-by-profile.css',
})
export class ReportMedicalDocumentsByProfile implements OnInit {
  public chartType = 'bar' as const;
  userId: number | null = null;

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

  alCambiarUsuario(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.userId = valor ? Number(valor) : null;
    this.obtenerReporte();
  }

  limpiar(): void {
    this.userId = null;
    this.obtenerReporte();
  }

  obtenerReporte(): void {
    if (this.userId !== null) {
      this.mdS.searchByUser(this.userId).subscribe({
        next: (data) =>
          this.armarGrafico(data, (d) => d.documentType, `Documentos del usuario ${this.userId} por tipo`),
        error: (error) => console.error('Error al cargar', error),
      });
    } else {
      this.mdS.getMedicalDocument().subscribe({
        next: (data) =>
          this.armarGrafico(data, (d) => `Perfil ${d.idHealthProfile}`, 'Cantidad de documentos por perfil de salud'),
        error: (error) => console.error('Error al cargar', error),
      });
    }
  }

  private armarGrafico(
    data: MedicaldocumentsDTO[],
    clave: (d: MedicaldocumentsDTO) => string,
    etiqueta: string,
  ): void {
    const conteo = new Map<string, number>();
    data.forEach((d) => {
      const k = clave(d)?.trim() || 'Sin dato';
      conteo.set(k, (conteo.get(k) ?? 0) + 1);
    });
    const filas = [...conteo.entries()].sort((a, b) => b[1] - a[1]);

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
