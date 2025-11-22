import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Reserva, ReservaEstatisticas, ReservaFilter } from '../core/models/reserva.models';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private reservasMockadas: Reserva[] = [
    {
      id: '1',
      veiculo: {
        id: 'v1',
        nome: 'Toyota Corolla 2023',
        modelo: 'Sedan',
        ano: 2023,
        categoria: 'Sedan',
        imagem: 'assets/images/toyota-corolla.jpg'
      },
      dataInicio: new Date('2024-01-15'),
      dataFim: new Date('2024-01-20'),
      localRetirada: 'Aeroporto Guarulhos',
      valorTotal: 600,
      diasTotal: 5,
      status: 'ativa',
      cliente: {
        id: '1',
        nome: 'João Silva',
        email: 'joao123@gmail.com'
      },
      dataCriacao: new Date('2024-01-10'),
      observacoes: 'Reserva para viagem de negócios'
    },
    {
      id: '2',
      veiculo: {
        id: 'v2',
        nome: 'Honda Civic 2022',
        modelo: 'Sedan',
        ano: 2022,
        categoria: 'Sedan',
        imagem: 'assets/images/honda-civic.jpg'
      },
      dataInicio: new Date('2023-12-01'),
      dataFim: new Date('2023-12-05'),
      localRetirada: 'Centro São Paulo',
      valorTotal: 480,
      diasTotal: 4,
      status: 'concluida',
      cliente: {
        id: '1',
        nome: 'João Silva',
        email: 'joao123@gmail.com'
      },
      dataCriacao: new Date('2023-11-25'),
      observacoes: 'Reserva para férias'
    },
    {
      id: '3',
      veiculo: {
        id: 'v3',
        nome: 'Volkswagen Jetta 2023',
        modelo: 'Sedan',
        ano: 2023,
        categoria: 'Sedan',
        imagem: 'assets/images/vw-jetta.jpg'
      },
      dataInicio: new Date('2023-11-10'),
      dataFim: new Date('2023-11-15'),
      localRetirada: 'Shopping Ibirapuera',
      valorTotal: 750,
      diasTotal: 5,
      status: 'concluida',
      cliente: {
        id: '1',
        nome: 'João Silva',
        email: 'joao123@gmail.com'
      },
      dataCriacao: new Date('2023-11-05')
    },
    {
      id: '4',
      veiculo: {
        id: 'v4',
        nome: 'Hyundai Elantra 2022',
        modelo: 'Sedan',
        ano: 2022,
        categoria: 'Sedan',
        imagem: 'assets/images/hyundai-elantra.jpg'
      },
      dataInicio: new Date('2023-10-20'),
      dataFim: new Date('2023-10-22'),
      localRetirada: 'Aeroporto Congonhas',
      valorTotal: 240,
      diasTotal: 2,
      status: 'cancelada',
      cliente: {
        id: '1',
        nome: 'João Silva',
        email: 'joao123@gmail.com'
      },
      dataCriacao: new Date('2023-10-15'),
      observacoes: 'Cancelada devido a mudança de planos'
    }
  ];

  constructor() {}

  /**
   * Buscar todas as reservas de um cliente
   */
  getReservasCliente(clienteId: string): Observable<Reserva[]> {
    const reservas = this.reservasMockadas.filter(r => r.cliente.id === clienteId);
    return of(reservas).pipe(delay(500)); // Simular latência da API
  }

  /**
   * Buscar reservas por status
   */
  getReservasPorStatus(clienteId: string, status: 'ativa' | 'concluida' | 'cancelada'): Observable<Reserva[]> {
    const reservas = this.reservasMockadas.filter(r => 
      r.cliente.id === clienteId && r.status === status
    );
    return of(reservas).pipe(delay(300));
  }

  /**
   * Buscar estatísticas das reservas
   */
  getEstatisticasReservas(clienteId: string): Observable<ReservaEstatisticas> {
    const reservasCliente = this.reservasMockadas.filter(r => r.cliente.id === clienteId);
    
    const estatisticas: ReservaEstatisticas = {
      ativas: reservasCliente.filter(r => r.status === 'ativa').length,
      concluidas: reservasCliente.filter(r => r.status === 'concluida').length,
      canceladas: reservasCliente.filter(r => r.status === 'cancelada').length
    };

    return of(estatisticas).pipe(delay(200));
  }

  /**
   * Buscar reserva por ID
   */
  getReservaPorId(id: string): Observable<Reserva | null> {
    const reserva = this.reservasMockadas.find(r => r.id === id) || null;
    return of(reserva).pipe(delay(300));
  }

  /**
   * Cancelar reserva
   */
  cancelarReserva(reservaId: string): Observable<{ success: boolean; message: string }> {
    const reserva = this.reservasMockadas.find(r => r.id === reservaId);
    
    if (reserva && reserva.status === 'ativa') {
      reserva.status = 'cancelada';
      return of({ 
        success: true, 
        message: 'Reserva cancelada com sucesso!' 
      }).pipe(delay(500));
    }

    return of({ 
      success: false, 
      message: 'Não é possível cancelar esta reserva.' 
    }).pipe(delay(500));
  }

  /**
   * Filtrar reservas
   */
  filtrarReservas(clienteId: string, filtros: ReservaFilter): Observable<Reserva[]> {
    let reservas = this.reservasMockadas.filter(r => r.cliente.id === clienteId);

    if (filtros.status && filtros.status !== 'todas') {
      reservas = reservas.filter(r => r.status === filtros.status);
    }

    if (filtros.dataInicio) {
      reservas = reservas.filter(r => new Date(r.dataInicio) >= filtros.dataInicio!);
    }

    if (filtros.dataFim) {
      reservas = reservas.filter(r => new Date(r.dataFim) <= filtros.dataFim!);
    }

    return of(reservas).pipe(delay(400));
  }
}