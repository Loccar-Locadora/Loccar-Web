import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // ← IMPORTANTE

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule], // ← NECESSÁRIO para *ngIf e *ngFor
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.scss']
})
export class StatsCardComponent {
  @Input() data: any;
}
