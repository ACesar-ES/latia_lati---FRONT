import { Component, Input, OnChanges } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DocumentPeriod } from '../../../model/DocumentPeriod';
import { MonthlyDocumentCountDTO } from '../../../model/MonthlyDocumentCountDTO';
import { buildMonthlySeries } from '../../../utils/evolutionhelpers';

@Component({
  selector: 'app-report-documents-by-month',
  imports: [BaseChartDirective],
  templateUrl: './report-documents-by-month.html',
  styleUrl: './report-documents-by-month.css',
})
export class ReportDocumentsByMonth implements OnChanges {
  @Input({ required: true }) rows: MonthlyDocumentCountDTO[] = [];
  @Input({ required: true }) period!: DocumentPeriod;
  series: { key: number; label: string; total: number }[] = [];
  total = 0;
  chartData: ChartData<'bar'> = { labels: [], datasets: [] };
  chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { maxRotation: 0, maxTicksLimit: 12 } },
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  ngOnChanges(): void {
    this.series = buildMonthlySeries(this.period, this.rows);
    this.total = this.series.reduce((sum, month) => sum + month.total, 0);
    this.chartData = {
      labels: this.series.map((m) => m.label),
      datasets: [{
        label: 'Documentos',
        data: this.series.map((m) => m.total),
        backgroundColor: '#bf4e6d',
        borderRadius: 5,
        maxBarThickness: 38,
      }],
    };
  }
}
