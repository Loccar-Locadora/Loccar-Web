// src/app/shared/stats-card/stats-card.component.ts
import { Component, Input } from '@angular/core';
import { StatItem } from '../../features/dashboard/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.scss']
})
export class StatsCardComponent {
  @Input() data!: StatItem;
}
