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
        tension: 0.45,
        borderColor: '#38bdf8',
        borderWidth: 3,
        pointBackgroundColor: '#38bdf8',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#38bdf8',
        pointHoverBorderWidth: 3
      }
    ]
  };

  public chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        titleColor: '#ffffff',
        bodyColor: '#38bdf8',
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 14, weight: 'bold' },
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          label: (context) => ` ${context.parsed.y}°C`
        }
      }
    },
    scales: {
      x: {
        ticks: { color: 'rgba(255, 255, 255, 0.75)', font: { size: 12 } },
        grid: { color: 'rgba(255, 255, 255, 0.08)' }
      },
      y: {
        ticks: { 
          color: 'rgba(255, 255, 255, 0.75)', 
          font: { size: 12 },
          callback: (value) => `${value}°C`
        },
        grid: { color: 'rgba(255, 255, 255, 0.08)' }
      }
    }
  };

  ngOnChanges(): void {
    this.updateChart();
  }

  private updateChart(): void {
    const data = this.forecastData();
    if (data && data.list) {
      const next24Hours = data.list.slice(0, 8);
      
      const labels = next24Hours.map((item, idx) => {
        if (idx === 0) return 'Agora';
        const date = new Date(item.dt * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      });

      const temperatures = next24Hours.map(item => Math.round(item.main.temp));

      this.chartData = {
        labels: labels,
        datasets: [
          {
            ...this.chartData.datasets[0],
            data: temperatures,
            label: 'Temperatura (°C)',
            borderColor: '#38bdf8',
            pointBackgroundColor: '#38bdf8',
            backgroundColor: (context: any) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 260);
              gradient.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
              gradient.addColorStop(0.7, 'rgba(56, 189, 248, 0.08)');
              gradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
              return gradient;
            }
          }
        ]
      };
    }
  }
}
