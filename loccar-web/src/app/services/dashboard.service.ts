import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of } from 'rxjs';

// Interface para resposta padrão da API
interface BaseReturn<T> {
  success: boolean;
  message: string;
  data: T;
}

// Interface para estatísticas do dashboard
export interface DashboardStats {
  totalVehicles: number;
  activeReservations: number;
  availableVehicles: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // URL base da API (usando a mesma base do AuthService)
  private readonly BASE_URL = 'http://192.168.1.108:8080/api';

  constructor(private http: HttpClient) {}

  /**
   * Obter total de veículos cadastrados
   */
  getTotalVehiclesCount(): Observable<number> {
    console.log('Fazendo requisição para total de veículos...');
    return this.http.get<BaseReturn<number>>(`${this.BASE_URL}/statistics/vehicles/count`)
      .pipe(
        map(response => {
          console.log('Resposta total de veículos:', response);
          return response.data || 0;
        }),
        catchError(error => {
          console.error('Erro ao buscar total de veículos:', error);
          console.error('Status:', error.status);
          console.error('Mensagem:', error.message);
          return of(0); // Retorna 0 em caso de erro
        })
      );
  }

  /**
   * Obter total de reservas ativas
   */
  getActiveReservationsCount(): Observable<number> {
    console.log('Fazendo requisição para reservas ativas...');
    return this.http.get<BaseReturn<number>>(`${this.BASE_URL}/statistics/reservations/active/count`)
      .pipe(
        map(response => {
          console.log('Resposta reservas ativas:', response);
          return response.data || 0;
        }),
        catchError(error => {
          console.error('Erro ao buscar reservas ativas:', error);
          console.error('Status:', error.status);
          console.error('Mensagem:', error.message);
          return of(0);
        })
      );
  }

  /**
   * Obter total de veículos disponíveis
   */
  getAvailableVehiclesCount(): Observable<number> {
    console.log('Fazendo requisição para veículos disponíveis...');
    return this.http.get<BaseReturn<number>>(`${this.BASE_URL}/statistics/vehicles/available/count`)
      .pipe(
        map(response => {
          console.log('Resposta veículos disponíveis:', response);
          return response.data || 0;
        }),
        catchError(error => {
          console.error('Erro ao buscar veículos disponíveis:', error);
          console.error('Status:', error.status);
          console.error('Mensagem:', error.message);
          return of(0);
        })
      );
  }

  /**
   * Obter todas as estatísticas em uma única chamada
   */
  getAllStats(): Observable<DashboardStats> {
    console.log('getAllStats - iniciando forkJoin para buscar todas as estatísticas...');
    
    return forkJoin({
      totalVehicles: this.getTotalVehiclesCount(),
      activeReservations: this.getActiveReservationsCount(),
      availableVehicles: this.getAvailableVehiclesCount()
    }).pipe(
      map(result => {
        console.log('getAllStats - todas as respostas recebidas:', result);
        return result;
      }),
      catchError(error => {
        console.error('Erro geral ao buscar estatísticas:', error);
        // Retornar valores padrão em caso de erro
        return of({
          totalVehicles: 0,
          activeReservations: 0,
          availableVehicles: 0
        });
      })
    );
  }

  /**
   * Obter receita mensal para um ano/mês específico
   * @param year Ano (ex: 2024)
   * @param month Mês (1-12)
   * @returns Promise com o valor da receita
   */
  async getMonthlyRevenue(year: number, month: number): Promise<number> {
    console.log(`Buscando receita para ${month}/${year}...`);
    
    try {
      const response = await this.http.get<BaseReturn<number>>(
        `${this.BASE_URL}/statistics/revenue/monthly/${year}/${month}`
      ).toPromise();
      
      console.log(`Receita para ${month}/${year}:`, response);
      return response?.data || 0;
    } catch (error) {
      console.error(`Erro ao buscar receita para ${month}/${year}:`, error);
      return 0; // Retorna 0 em caso de erro
    }
  }
}