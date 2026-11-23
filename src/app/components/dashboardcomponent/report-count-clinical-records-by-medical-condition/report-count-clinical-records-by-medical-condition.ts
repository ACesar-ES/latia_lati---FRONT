import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CountclinicalrecordsbymedicalconditionDTO } from '../../../model/CountclinicalrecordsbymedicalconditionDTO';
import { Clinicalrecordservice } from '../../../services/clinicalrecordservice';
type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

@Component({
  imports: [BaseChartDirective],
  selector: 'app-report-count-clinical-records-by-medical-condition',
  styleUrl: './report-count-clinical-records-by-medical-condition.css',
  templateUrl: './report-count-clinical-records-by-medical-condition.html',
})
export class ReportCountClinicalRecordsByMedicalCondition implements OnInit {
  // Avisa al dashboard cuando llegan los datos (para sus tarjetas de resumen)
  @Output() cargado = new EventEmitter<CountclinicalrecordsbymedicalconditionDTO[]>();

  lista: CountclinicalrecordsbymedicalconditionDTO[] = [];

  public chartType: TipoGrafico = 'bar';

  public chartData: ChartData<TipoGrafico> = {
    labels: [],
    datasets: [
      {
        label: 'Pendiente 1',
        data: [],
        borderWidth: 1,
      },
    ],
  };

  public chartOptions: ChartOptions = {
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

  // Colores de la paleta de Latia (se repiten si hay más condiciones que colores)
  private paleta: string[] = ['#b8324f', '#d98a9b', '#8c7bb0', '#5aa17f', '#e2a65b', '#9ca3af'];

  constructor(
    private crS: Clinicalrecordservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.obtenerTotal();
  }

  obtenerTotal(): void {
    this.crS.getcountbycondition().subscribe({
      next: (data: CountclinicalrecordsbymedicalconditionDTO[]) => {
        this.lista = data;

        this.chartData = {
          labels: data.map((item) => item.conditionName),
          datasets: [
            {
              label: 'Cantidad de historiales clínicos',
              data: data.map((item) => item.totalRecords),
              backgroundColor: data.map((_, i) => this.paleta[i % this.paleta.length]),
              borderRadius: 8,
              borderWidth: 0,
            },
          ],
        };
        this.cargado.emit(data);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar', error);
      },
    });
  }
}