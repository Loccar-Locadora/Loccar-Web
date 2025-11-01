import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.scss']
})
export class StatsCardComponent {
  @Input() data!: {
    title: string;
    value: string | number;
    hint?: string;
    icon?: string; // nome do ícone do Material Icons, ex: "directions_car", "people", "attach_money"
  };

  getIcon(iconName?: string): string {
    const iconMap: { [key: string]: string } = {
      'people': 'bi bi-people',
      'directions_car': 'bi bi-car-front',
      'attach_money': 'bi bi-currency-dollar',
      'trending_up': 'bi bi-graph-up-arrow'
    };
    return iconName ? (iconMap[iconName] || 'bi bi-info-circle') : 'bi bi-info-circle';
  }
}
