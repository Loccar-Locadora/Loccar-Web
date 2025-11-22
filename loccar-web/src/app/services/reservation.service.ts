import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ReservaRequest {
  idCustomer?: number;
  idVehicle: number;
  rentalDate: string;
  returnDate: string;
  rentalDays?: number;
  dailyRate?: number;
  rateType?: string;
  insuranceVehicle?: number;
  insuranceThirdParty?: number;
  taxAmount?: number;
  damageDescription?: string;
  imgUrl?: string;
}

export interface ReservaResponse {
  reservationnumber?: number;
  idCustomer: number;
  idVehicle: number;
  rentalDate: string;
  returnDate: string;
  rentalDays?: number;
  dailyRate?: number;
  rateType?: string;
  insuranceVehicle?: number;
  insuranceThirdParty?: number;
  taxAmount?: number;
  damageDescription?: string;
  imgUrl?: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  code?: string;
  message: string;
  data?: T;
}

export interface UserReservationSummary {
  activeCount: number;
  completedCount: number;
  cancelledCount: number;
  activeReservations: ReservationDetail[];
  completedReservations: ReservationDetail[];
  cancelledReservations: ReservationDetail[];
}

export interface ReservationDetail {
  reservationnumber: number;
  idVehicle: number;
  vehicleBrand: string;
  vehicleModel: string;
  rentalDate: string;
  returnDate: string;
  rentalDays: number;
  dailyRate: number;
  rateType: string;
  insuranceVehicle?: number | null;
  insuranceThirdParty?: number | null;
  taxAmount?: number | null;
  damageDescription?: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  totalCost: number;
  imgUrl?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private readonly BASE_URL = 'http://localhost:8080/api/reservation';

  constructor(private http: HttpClient) {}

  /**
   * Criar uma nova reserva
   */
  createReservation(reservaData: ReservaRequest): Observable<ApiResponse<ReservaResponse>> {
    console.log('🚗 RESERVATION SERVICE - Criando reserva:', reservaData);
    
    return this.http.post<ApiResponse<ReservaResponse>>(`${this.BASE_URL}/register`, reservaData)
      .pipe(
        catchError((error) => {
          console.error('❌ RESERVATION SERVICE - Erro ao criar reserva:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Buscar reservas do usuário
   */
  getUserReservations(): Observable<ApiResponse<ReservaResponse[]>> {
    return this.http.get<ApiResponse<ReservaResponse[]>>(`${this.BASE_URL}/user`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Buscar uma reserva por ID
   */
  getReservation(id: number): Observable<ApiResponse<ReservaResponse>> {
    return this.http.get<ApiResponse<ReservaResponse>>(`${this.BASE_URL}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Cancelar uma reserva
   */
  cancelReservation(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.BASE_URL}/cancel/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Buscar resumo de reservas do usuário logado
   */
  getMyReservationSummary(): Observable<ApiResponse<UserReservationSummary>> {
    console.log('📊 RESERVATION SERVICE - Buscando resumo de reservas do usuário');
    
    return this.http.get<ApiResponse<UserReservationSummary>>(`${this.BASE_URL}/summary`)
      .pipe(
        catchError((error) => {
          console.error('❌ RESERVATION SERVICE - Erro ao buscar resumo:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Manipulador de erros
   */
  private handleError(error: HttpErrorResponse) {
    console.error('Erro na API de reservas:', error);
    
    let errorMessage = 'Ocorreu um erro inesperado';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 404) {
        errorMessage = 'Reserva não encontrada';
      } else if (error.status === 400) {
        errorMessage = 'Dados da reserva inválidos';
      } else if (error.status === 401) {
        errorMessage = 'Acesso não autorizado. Faça login novamente';
      } else if (error.status === 409) {
        errorMessage = 'Conflito: Veículo não disponível no período selecionado';
      } else if (error.status === 500) {
        errorMessage = 'Erro interno do servidor';
      } else if (error.status === 0) {
        errorMessage = 'Não foi possível conectar ao servidor';
      }
    }
    
    return throwError(() => ({ 
      message: errorMessage,
      status: error.status,
      error: error.error 
    }));
  }
}