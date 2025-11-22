import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Reserva, ReservaEstatisticas } from '../../core/models/reserva.models';
import { ReservaService } from '../../services/reserva.service';
import { ReservationService, UserReservationSummary, ReservationDetail } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../../layouts/sidebar/sidebar.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-minhas-reservas',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './minhas-reservas.component.html',
  styleUrls: ['./minhas-reservas.component.scss']
})
export class MinhasReservasComponent implements OnInit, OnDestroy {
  reservasAtivas: ReservationDetail[] = [];
  reservasConcluidas: ReservationDetail[] = [];
  reservasCanceladas: ReservationDetail[] = [];
  estatisticas = { ativas: 0, concluidas: 0, canceladas: 0 };
  loading = true;
  error: string | null = null;
  
  private subscriptions = new Subscription();

  constructor(
    private reservaService: ReservaService,
    private reservationService: ReservationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarReservas();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private carregarReservas(): void {
    this.loading = true;
    this.error = null;

    console.log('📊 Carregando resumo de reservas...');

    // Carregar resumo completo de reservas usando o novo endpoint
    const resumoSub = this.reservationService.getMyReservationSummary()
      .subscribe({
        next: (response) => {
          console.log('✅ Resumo de reservas carregado:', response);
          
          if (response.data) {
            const summary = response.data;
            
            // Atualizar estatísticas
            this.estatisticas = {
              ativas: summary.activeCount,
              concluidas: summary.completedCount,
              canceladas: summary.cancelledCount
            };
            
            // Atualizar listas de reservas
            this.reservasAtivas = summary.activeReservations || [];
            this.reservasConcluidas = summary.completedReservations || [];
            this.reservasCanceladas = summary.cancelledReservations || [];
            
            console.log('📊 Estatísticas:', this.estatisticas);
            console.log('🟢 Ativas:', this.reservasAtivas.length);
            console.log('🔵 Concluídas:', this.reservasConcluidas.length);
            console.log('🔴 Canceladas:', this.reservasCanceladas.length);
          } else {
            console.warn('⚠️ Resposta sem dados');
            this.error = 'Nenhum dado de reserva encontrado';
          }
          
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Erro ao carregar resumo de reservas:', error);
          this.error = error.message || 'Erro ao carregar reservas. Tente novamente.';
          this.loading = false;
        }
      });

    this.subscriptions.add(resumoSub);
  }

  /**
   * Formatar data para exibição
   */
  formatarData(data: string | Date): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  /**
   * Calcular dias entre datas
   */
  calcularDias(dataInicio: string | Date, dataFim: string | Date): number {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Obter nome completo do veículo
   */
  getNomeVeiculo(reserva: ReservationDetail): string {
    return `${reserva.vehicleBrand} ${reserva.vehicleModel}`;
  }

  /**
   * Obter status em português
   */
  getStatusPortugues(status: string): string {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'Ativa';
      case 'COMPLETED':
        return 'Concluída';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status;
    }
  }

  /**
   * Obter classe CSS para o status
   */
  getStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Formatar valor monetário
   */
  formatarValor(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  /**
   * Recarregar reservas
   */
  recarregar(): void {
    this.carregarReservas();
  }

  /**
   * Navegar para a página de nova reserva (catálogo de veículos)
   */
  novaReserva(): void {
    console.log('🚗 Redirecionando para catálogo de veículos...');
    this.router.navigate(['/veiculos']);
  }
}