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
}
