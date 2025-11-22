import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';

// Registrar componentes do Chart.js
Chart.register(...registerables);

export interface MonthlyRevenue {
  year: number;
  month: number;
  revenue: number;
  monthName?: string;
}

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full relative">
      <canvas #chartCanvas class="w-full h-full"></canvas>
      <div *ngIf="isLoading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
        <div class="flex flex-col items-center space-y-2">
          <div class="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-sm text-gray-500">Carregando dados...</span>
        </div>
      </div>
      <div *ngIf="hasError" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
        <div class="flex flex-col items-center space-y-2">
          <i class="bi bi-exclamation-triangle text-2xl text-red-500"></i>
          <span class="text-sm text-gray-500">Erro ao carregar receita</span>
          <button (click)="loadRevenueData()" class="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700">
            Tentar novamente
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
    
    .chart-container {
      position: relative;
      height: 100%;
      width: 100%;
      min-height: 300px;
    }
  `]
})
export class RevenueChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  chart?: Chart;
  isLoading = true;
  hasError = false;
  revenueData: MonthlyRevenue[] = [];
  private viewInitialized = false;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadRevenueData();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  ngAfterViewInit(): void {
    console.log('RevenueChart - ngAfterViewInit chamado');
    this.viewInitialized = true;
    
    // Se os dados já foram carregados, criar o gráfico
    if (this.revenueData.length > 0 && !this.isLoading) {
      this.createChart();
    }
    
    // Redimensionar o gráfico quando a janela for redimensionada
    window.addEventListener('resize', () => {
      if (this.chart) {
        this.chart.resize();
      }
    });
  }

  /**
   * Carregar dados de receita dos últimos 6 meses
   */
  loadRevenueData(): void {
    this.isLoading = true;
    this.hasError = false;

    // Gerar os últimos 6 meses (incluindo o atual)
    const months = this.getLast6Months();
    
    // Fazer requisições paralelas para todos os meses
    const revenueRequests = months.map(monthData => 
      this.dashboardService.getMonthlyRevenue(monthData.year, monthData.month).then(
        revenue => {
          console.log(`Receita processada para ${monthData.monthName}: R$ ${revenue}`);
          return {
            ...monthData,
            revenue: revenue || 0
          };
        },
        error => {
          console.error(`Erro ao carregar receita para ${monthData.monthName}:`, error);
          return {
            ...monthData,
            revenue: 0 // Valor padrão em caso de erro
          };
        }
      )
    );

    Promise.all(revenueRequests)
      .then(results => {
        console.log('Dados de receita carregados:', results);
        this.revenueData = results;
        this.isLoading = false;
        
        // Só criar o gráfico se a view já foi inicializada
        if (this.viewInitialized) {
          console.log('Criando gráfico após carregamento dos dados');
          this.createChart();
        } else {
          console.log('View ainda não inicializada, aguardando ngAfterViewInit');
        }
      })
      .catch(error => {
        console.error('Erro geral ao carregar dados de receita:', error);
        this.hasError = true;
        this.isLoading = false;
      });
  }

  /**
   * Gerar lista dos últimos 6 meses
   */
  private getLast6Months(): Array<{year: number, month: number, monthName: string}> {
    const months = [];
    const now = new Date();
    const monthNames = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1, // API usa mês 1-12
        monthName: monthNames[date.getMonth()]
      });
    }

    return months;
  }

  /**
   * Criar o gráfico Chart.js
   */
  private createChart(): void {
    console.log('createChart() chamado');
    console.log('Canvas element:', this.chartCanvas?.nativeElement);
    console.log('Revenue data:', this.revenueData);
    
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Não foi possível obter contexto 2D do canvas');
      return;
    }

    const labels = this.revenueData.map(data => data.monthName || '');
    const data = this.revenueData.map(data => data.revenue);
    const maxValue = Math.max(...data);
    
    console.log('Labels:', labels);
    console.log('Data:', data);
    console.log('Max value:', maxValue);

    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels: labels,
        datasets: [{
          label: 'Receita (R$)',
          data: data,
          borderColor: '#7C3AED', // purple-600
          backgroundColor: 'rgba(124, 58, 237, 0.1)', // purple-600 com transparência
          borderWidth: 3,
          fill: true,
          tension: 0.4, // Suavizar a linha
          pointBackgroundColor: '#7C3AED',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: '#7C3AED',
            borderWidth: 1,
            displayColors: false,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                return `Receita: ${this.formatCurrency(value || 0)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: maxValue > 0 ? maxValue * 1.1 : 100, // Adiciona 10% de margem no topo ou valor mínimo
            grid: {
              color: 'rgba(156, 163, 175, 0.3)' // gray-400 transparente
            },
            ticks: {
              color: '#6B7280', // gray-500
              callback: (value) => {
                return this.formatCurrency(Number(value));
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#6B7280' // gray-500
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        elements: {
          point: {
            hoverBackgroundColor: '#6D28D9' // purple-700
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
    console.log('Gráfico criado com sucesso:', this.chart);
  }

  /**
   * Formatar valor como moeda brasileira
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}