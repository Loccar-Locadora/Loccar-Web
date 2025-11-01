import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../../layouts/sidebar/sidebar.component';
import { StatsCardComponent } from '../../layouts/stats-card/stats-card.component';
import { Observable } from 'rxjs';
import { StatItem, ActivityItem } from './models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, StatsCardComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})

export class AdminDashboardComponent {
  stats$: Observable<StatItem[]>;
  activities$: Observable<ActivityItem[]>;
  
  constructor() {
    // Initialize with mock data for now
    this.stats$ = new Observable<StatItem[]>(observer => {
      observer.next([
        { id: 1, title: 'Total de Usuários', value: '156', hint: '+12% este mês', icon: 'people' },
        { id: 2, title: 'Frota Total', value: '25', hint: '+2 novos este mês', icon: 'directions_car' },
        { id: 3, title: 'Receita Mensal', value: 'R$ 45.600', hint: '+8% vs mês anterior', icon: 'attach_money' },
        { id: 4, title: 'Reservas Ativas', value: '12', hint: 'taxa de ocupação: 48%', icon: 'trending_up' }
      ]);
    });
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

  logout() {
    // this.authService.logout();
    // this.router.navigate(['/login']);
  }
}
