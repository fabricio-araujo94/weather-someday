import { Component, input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';
import { ForecastData } from '../../core/interfaces/forecast';

Chart.register(...registerables);

@Component({
  selector: 'app-hourly-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './hourly-chart.html',
  styleUrls: ['./hourly-chart.scss']
})
export class HourlyChartComponent implements OnChanges {
  forecastData = input<ForecastData | null>(null);

  public chartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Temperatura (°C)',
        fill: true,
        tension: 0.4,
        borderColor: '#ffffff',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#3b82f6'
      }
    ]
  };

  public chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#ffffff'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        ticks: { color: '#ffffff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: {
        ticks: { color: '#ffffff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    }
  };

  ngOnChanges(): void {
    const data = this.forecastData();
    if (data && data.list) {
      // Pegar as próximas 24 horas (8 previsões de 3 em 3 horas)
      const next24Hours = data.list.slice(0, 8);
      
      const labels = next24Hours.map(item => {
        const date = new Date(item.dt * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      });

      const temperatures = next24Hours.map(item => item.main.temp);
      const weatherIcons = next24Hours.map(item => item.weather[0].main);

      const pointColors = weatherIcons.map(w => (w === 'Clear' || w === 'Clouds' ? '#facc15' : '#3b82f6'));
      const borderColors = weatherIcons.map(w => (w === 'Rain' || w === 'Drizzle' ? '#60a5fa' : '#facc15'));

      this.chartData = {
        ...this.chartData,
        labels: labels,
        datasets: [
          {
            ...this.chartData.datasets[0],
            data: temperatures,
            pointBackgroundColor: pointColors,
            borderColor: borderColors[0],
            backgroundColor: (context: any) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 300);
              gradient.addColorStop(0, borderColors[0] + '80');
              gradient.addColorStop(1, borderColors[0] + '20');
              return gradient;
            }
          }
        ]
      };
    }
  }
}
