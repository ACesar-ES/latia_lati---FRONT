import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CountemergencycontactsbyrelationshipDTO } from '../../../model/CountemergencycontactsbyrelationshipDTO';
import { Emergencycontactservice } from '../../../services/emergencycontactservice';
type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';
const COLORES = ['#B73550', '#E07A8F', '#75638E', '#397562', '#D9A441', '#4F7CAC', '#F2B8C6', '#24303A'];

@Component({
  imports: [BaseChartDirective],
  selector: 'app-report-count-emergency-contacts-by-relationship',
  styleUrl: './report-count-emergency-contacts-by-relationship.css',
  templateUrl: './report-count-emergency-contacts-by-relationship.html',
})
export class ReportCountEmergencyContactsByRelationship implements OnInit {
  lista: CountemergencycontactsbyrelationshipDTO[] = [];
  total: number = 0;
  cargado: boolean = false;

  public chartType: TipoGrafico = 'doughnut';

  public chartData: ChartData<TipoGrafico> = {
    labels: [],
    datasets: [],
  };

  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
    this.ecS.getCountByRelationship().subscribe({
      next: (data: CountemergencycontactsbyrelationshipDTO[]) => {
        this.lista = data;
        this.total = data.reduce((suma, item) => suma + item.totalContacts, 0);
        this.chartData = {
          labels: data.map((item) => item.relationship),
          datasets: [
            {
              label: 'Cantidad de contactos',
              data: data.map((item) => item.totalContacts),
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
