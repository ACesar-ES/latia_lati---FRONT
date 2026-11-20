import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CountemergencycontactsbyprofileDTO } from '../../../model/CountemergencycontactsbyprofileDTO';
import { Emergencycontactservice } from '../../../services/emergencycontactservice';
type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

@Component({
  imports: [BaseChartDirective],
  selector: 'app-report-count-emergency-contacts-by-profile',
  styleUrl: './report-count-emergency-contacts-by-profile.css',
  templateUrl: './report-count-emergency-contacts-by-profile.html',
})
export class ReportCountEmergencyContactsByProfile implements OnInit {
  lista: CountemergencycontactsbyprofileDTO[] = [];
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
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } },
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
  };

  constructor(
    private ecS: Emergencycontactservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.obtenerReporte();
  }

  obtenerReporte(): void {
    this.ecS.getCountByProfile().subscribe({
      next: (data: CountemergencycontactsbyprofileDTO[]) => {
        this.lista = data;
        this.total = data.length;
        this.chartData = {
          labels: data.map((item) => item.profileName),
          datasets: [
            {
              label: 'Principales',
              data: data.map((item) => item.primaryContacts),
              backgroundColor: '#B73550',
              borderWidth: 1,
            },
            {
              label: 'Secundarios',
              data: data.map((item) => item.otherContacts),
              backgroundColor: '#E07A8F',
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
