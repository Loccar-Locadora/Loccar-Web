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
        { 
          id: '1',
          title: 'Total Vehicles', 
          value: '24',
          hint: '+2.6% from last month',
          icon: 'car'
        },
        { 
          id: '2',
          title: 'Active Rentals', 
          value: '12',
          hint: '+1.2% from last month',
          icon: 'key'
        },
        { 
          id: '3',
          title: 'Total Customers', 
          value: '45',
          hint: '+4.1% from last month',
          icon: 'users'
        },
        { 
          id: '4',
          title: 'Revenue', 
          value: 'R$ 23.500',
          hint: '+2.4% from last month',
          icon: 'currency-dollar'
        }
      ]);
    });

    this.activities$ = new Observable<ActivityItem[]>(observer => {
      observer.next([
        { 
          id: '1',
          title: 'New Rental',
          subtitle: 'John Doe rented a Toyota Corolla',
          timeAgo: '2 hours ago'
        },
        {
          id: '2',
          title: 'Vehicle Return',
          subtitle: 'Maria Silva returned BMW X1',
          timeAgo: '5 hours ago'
        },
        {
          id: '3',
          title: 'Maintenance Alert',
          subtitle: 'Ford Fusion scheduled for service',
          timeAgo: '1 day ago'
        }
      ]);
    });
  }

  logout() {
    // this.authService.logout();
    // this.router.navigate(['/login']);
  }
}
