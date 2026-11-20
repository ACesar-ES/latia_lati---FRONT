import { ChangeDetectorRef, Component } from '@angular/core';
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
export class ReportCountClinicalRecordsByMedicalCondition {
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
      },
    },
  };

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
              label: 'Cantidad de cultivos',
              data: data.map((item) => item.totalRecords),
              backgroundColor: [
                '#efa0a0', 
                '#e70f0f', 
                '#f83e3e', 
                '#f10303'],
              borderWidth: 1,
            },
          ],
        };
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar', error);
      },
    });
  }
}
