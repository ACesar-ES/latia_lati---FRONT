import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CountfamilyrelationshipsbytypeDTO } from '../../../model/CountfamilyrelationshipsbytypeDTO';
import { Familyrelationshipservice } from '../../../services/familyrelationshipservice';
type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';
const COLORES = ['#B73550', '#E07A8F', '#75638E', '#397562', '#D9A441', '#4F7CAC', '#F2B8C6', '#24303A'];

@Component({
  imports: [BaseChartDirective],
  selector: 'app-report-count-family-relationships-by-type',
  styleUrl: './report-count-family-relationships-by-type.css',
  templateUrl: './report-count-family-relationships-by-type.html',
})
export class ReportCountFamilyRelationshipsByType implements OnInit {
  lista: CountfamilyrelationshipsbytypeDTO[] = [];
  total: number = 0;
  cargado: boolean = false;

  public chartType: TipoGrafico = 'bar';

  public chartData: ChartData<TipoGrafico> = {
    labels: [],
    datasets: [],
  };

  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
  };

  constructor(
    private frS: Familyrelationshipservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.obtenerReporte();
  }

  obtenerReporte(): void {
    this.frS.getCountByType().subscribe({
      next: (data: CountfamilyrelationshipsbytypeDTO[]) => {
        this.lista = data;
        this.total = data.reduce((suma, item) => suma + item.totalRelationships, 0);
        this.chartData = {
          labels: data.map((item) => item.relationshipType),
          datasets: [
            {
              label: 'Cantidad de relaciones',
              data: data.map((item) => item.totalRelationships),
              backgroundColor: COLORES,
              borderWidth: 1,
            },
          ],
        };
        this.cargado = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar el reporte', error);
        this.cargado = true;
        this.cdr.detectChanges();
      },
    });
  }
}
