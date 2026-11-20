import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CountfamilyrelationshipsbyprofileDTO } from '../../../model/CountfamilyrelationshipsbyprofileDTO';
import { Familyrelationshipservice } from '../../../services/familyrelationshipservice';
type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

@Component({
  imports: [BaseChartDirective],
  selector: 'app-report-count-family-relationships-by-profile',
  styleUrl: './report-count-family-relationships-by-profile.css',
  templateUrl: './report-count-family-relationships-by-profile.html',
})
export class ReportCountFamilyRelationshipsByProfile implements OnInit {
  lista: CountfamilyrelationshipsbyprofileDTO[] = [];
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
    indexAxis: 'y',
    scales: {
      x: { beginAtZero: true, ticks: { precision: 0 } },
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
    this.frS.getCountByProfile().subscribe({
      next: (data: CountfamilyrelationshipsbyprofileDTO[]) => {
        this.lista = data;
        this.total = data.length;
        this.chartData = {
          labels: data.map((item) => item.profileName),
          datasets: [
            {
              label: 'Cantidad de familiares',
              data: data.map((item) => item.totalRelatives),
              backgroundColor: '#75638E',
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
