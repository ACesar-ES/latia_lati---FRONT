import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { Medicationsservice } from '../../../services/medicationsservice';
import { MedicationsDTO } from '../../../model/MedicationsDTO';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-report-medications-by-name',
  imports: [BaseChartDirective],
  templateUrl: './report-medications-by-name.html',
  styleUrl: './report-medications-by-name.css',
})
export class ReportMedicationsByName implements OnInit {
  public chartType = 'bar' as const;

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
    private mS: Medicationsservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.obtenerReporte();
  }

  obtenerReporte(): void {
    this.mS.getMedication().subscribe({
      next: (data: MedicationsDTO[]) => {
        const conteo = new Map<string, number>();
        data.forEach((m) => {
          const clave = m.nameMedications?.trim() || 'Sin nombre';
          conteo.set(clave, (conteo.get(clave) ?? 0) + 1);
        });
        const filas = [...conteo.entries()].sort((a, b) => b[1] - a[1]);

        this.chartData = {
          labels: filas.map((f) => f[0]),
          datasets: [
            {
              label: 'Cantidad de medicamentos por nombre',
              data: filas.map((f) => f[1]),
              backgroundColor: filas.map((_, i) => this.paleta[i % this.paleta.length]),
              borderRadius: 8,
              borderWidth: 0,
            },
          ],
        };
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error al cargar', error),
    });
  }
}
