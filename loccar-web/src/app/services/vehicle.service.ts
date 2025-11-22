import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { VehicleFormData } from '../features/veiculos/vehicle-modal.component';

export interface ApiResponse<T> {
  success?: boolean;
  message: string;
  data: T;
  code?: string; // Para suportar o formato atual da API
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private readonly BASE_URL = 'http://localhost:8080/api/vehicle';

  constructor(private http: HttpClient) {}

  /**
   * Converter tipo string para número conforme enum do backend
   */
  private getVehicleTypeNumber(type: string): number {
    const typeMap: {[key: string]: number} = {
      'cargo': 0,      // Cargo = 0
      'motorcycle': 1, // Motorcycle = 1  
      'passenger': 2,  // Passenger = 2
      'leisure': 3     // Leisure = 3
    };
    return typeMap[type] || 0;
  }

  /**
   * Transformar dados do formulário para API (convertendo vehicleType para número)
   */
  private transformVehicleDataForAPI(vehicleData: VehicleFormData & { idVehicle?: number }): any {
    console.log('VEHICLE SERVICE - INPUT vehicleData.vehicleType:', vehicleData.vehicleType);
    console.log('VEHICLE SERVICE - Tipo do INPUT (typeof):', typeof vehicleData.vehicleType);
    
    const convertedType = this.getVehicleTypeNumber(vehicleData.vehicleType);
    console.log('VEHICLE SERVICE - Resultado da conversão:', convertedType);
    
    const transformedData = {
      ...vehicleData,
      Type: convertedType
    };
    
    console.log('VEHICLE SERVICE - Transformando dados:', {
      original: vehicleData.vehicleType,
      converted: transformedData.vehicleType,
      finalType: transformedData.vehicleType
    });
    
    return transformedData;
  }

  /**
   * Buscar todos os veículos disponíveis
   */
  getAvailableVehicles(): Observable<ApiResponse<any[]>> {
    const url = `${this.BASE_URL}/list/available`;
    console.log('🚗 VEHICLE SERVICE - Fazendo requisição para:', url);
    
    return this.http.get<ApiResponse<any[]>>(url)
      .pipe(
        catchError((error) => {
          console.error('❌ VEHICLE SERVICE - Erro na requisição de veículos disponíveis:', error);
          console.error('❌ VEHICLE SERVICE - Status:', error.status);
          console.error('❌ VEHICLE SERVICE - URL:', url);
          return this.handleError(error);
        })
      );
  }

  /**
   * Buscar um veículo por ID
   */
  getVehicle(id: string | number): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Atualizar um veículo
   */
  updateVehicle(vehicle: VehicleFormData & { idVehicle: number }): Observable<ApiResponse<any>> {
    console.log("VEHICLE SERVICE - Dados originais:", vehicle);
    const transformedVehicle = this.transformVehicleDataForAPI(vehicle);
    console.log("VEHICLE SERVICE - Dados transformados para API:", transformedVehicle);
    
    return this.http.put<ApiResponse<any>>(`${this.BASE_URL}/update`, transformedVehicle)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Excluir um veículo
   */
  deleteVehicle(id: string | number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.BASE_URL}/delete/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Definir status de reserva de um veículo (ativar/inativar)
   */
  setVehicleReserved(id: string | number, reserved: boolean): Observable<ApiResponse<boolean>> {
    console.log(`VEHICLE SERVICE - Definindo veículo ${id} como ${reserved ? 'reservado/inativo' : 'disponível/ativo'}`);
    
    return this.http.put<ApiResponse<boolean>>(`${this.BASE_URL}/reserve/${id}?reserved=${reserved}`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Manipulador de erros
   */
  private handleError(error: HttpErrorResponse) {
    console.error('Erro na API de veículos:', error);
    
    let errorMessage = 'Ocorreu um erro inesperado';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 404) {
        errorMessage = 'Veículo não encontrado';
      } else if (error.status === 400) {
        errorMessage = 'Dados inválidos';
      } else if (error.status === 500) {
        errorMessage = 'Erro interno do servidor';
      }
    }
    
    return throwError(() => ({ 
      message: errorMessage,
      status: error.status,
      error: error.error 
    }));
  }
}