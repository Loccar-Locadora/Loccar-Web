import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { SidebarComponent } from '../../layouts/sidebar/sidebar.component';
import { StatsCardComponent } from '../../layouts/stats-card/stats-card.component';
import { RevenueChartComponent } from './revenue-chart.component';
import { Observable } from 'rxjs';
import { StatItem, ActivityItem } from './models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, StatsCardComponent, RevenueChartComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats$!: Observable<StatItem[]>;
  activities$!: Observable<ActivityItem[]>;
  isLoadingStats = true;
  
  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private router: Router
  ) {
    // Inicializar atividades com dados mock
    this.activities$ = new Observable<ActivityItem[]>(observer => {
      observer.next([
        { 
          id: '1',
          title: 'Novo cliente cadastrado: Ana Costa',
          subtitle: '',
          timeAgo: '2 horas atrás'
        },
        {
          id: '2',
          title: 'Veículo adicionado: Honda Civic 2024',
          subtitle: '',
          timeAgo: '4 horas atrás'
        },
        {
          id: '3',
          title: 'Nova reserva: Toyota Corolla por 5 dias',
          subtitle: '',
          timeAgo: '6 horas atrás'
        }
      ]);
    });
  }

  ngOnInit(): void {
    console.log('Dashboard ngOnInit - iniciando carregamento das estatísticas...');
    this.loadDashboardStats();
  }

  /**
   * Carregar estatísticas do dashboard da API
   */
  private loadDashboardStats(): void {
    console.log('loadDashboardStats - iniciando requisições para API...');
    this.isLoadingStats = true;
    
    // Fazer subscribe explícito para garantir que as requisições sejam feitas
    this.dashboardService.getAllStats().subscribe({
      next: (stats) => {
        console.log('Dashboard Component - estatísticas recebidas:', stats);
        
        const statsArray = [
          { 
            id: 1, 
            title: 'Frota Total', 
            value: stats.totalVehicles.toString(), 
            hint: `${stats.availableVehicles} disponíveis`, 
            icon: 'directions_car' 
          },
          { 
            id: 2, 
            title: 'Reservas Ativas', 
            value: stats.activeReservations.toString(), 
            hint: 'reservas em andamento', 
            icon: 'trending_up' 
          },
          { 
            id: 3, 
            title: 'Veículos Disponíveis', 
            value: stats.availableVehicles.toString(), 
            hint: `de ${stats.totalVehicles} total`, 
            icon: 'check_circle' 
          }
        ];
        
        // Criar novo Observable com os dados transformados
        this.stats$ = new Observable(observer => {
          observer.next(statsArray);
          observer.complete();
        });
        
        this.isLoadingStats = false;
        console.log('Dashboard Component - loading finalizado, stats$ atualizado');
      },
      error: (error) => {
        console.error('Dashboard Component - erro ao carregar estatísticas:', error);
        this.isLoadingStats = false;
        
        // Criar Observable com dados de erro
        this.stats$ = new Observable(observer => {
          observer.next([]);
          observer.complete();
        });
      }
    });
  }

  /**
   * Recarregar estatísticas
   */
  refreshStats(): void {
    console.log('Recarregando estatísticas...');
    this.loadDashboardStats();
  }

  /**
   * Navegar para página de gestão de usuários
   */
  verTodosUsuarios(): void {
    console.log('Navegando para gestão de usuários...');
    this.router.navigate(['/usuarios']);
  }

  /**
   * Navegar para página de gestão de veículos
   */
  verTodosVeiculos(): void {
    console.log('Navegando para gestão de veículos...');
    this.router.navigate(['/veiculos']);
  }

  /**
   * Abrir modal de adição de funcionário
   */
  adicionarFuncionario(): void {
    console.log('Abrindo modal para adicionar funcionário...');
    // Navegar para usuários e abrir modal de criação
    this.router.navigate(['/usuarios'], { 
      queryParams: { action: 'create' } 
    });
  }

  /**
   * Abrir modal de adição de veículo
   */
  adicionarVeiculo(): void {
    console.log('Abrindo modal para adicionar veículo...');
    // Navegar para veículos e abrir modal de criação
    this.router.navigate(['/veiculos'], { 
      queryParams: { action: 'create' } 
    });
  }

  /**
   * Método para fazer logout
   */
  logout(): void {
    if (confirm('Tem certeza que deseja sair?')) {
      this.authService.logout();
    }
  }

  /**
   * Obter usuário atual
   */
  get currentUser() {
    return this.authService.getCurrentUser();
  }
}
