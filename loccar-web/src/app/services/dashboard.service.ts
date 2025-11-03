import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of } from 'rxjs';
import { UserStatistics } from '../features/dashboard/models';

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
  private readonly BASE_URL = 'http://localhost:8080/api';

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

  /**
   * Obter estatísticas de usuários
   */
  getUserStatistics(): Observable<UserStatistics> {
    console.log('DashboardService - Fazendo requisição para estatísticas de usuários...');
    console.log('DashboardService - URL:', `${this.BASE_URL}/statistics/users`);
    
    // Verificar se o token existe no localStorage
    const token = localStorage.getItem('auth_token');
    console.log('DashboardService - Token presente:', !!token);
    
    return this.http.get<BaseReturn<UserStatistics>>(`${this.BASE_URL}/statistics/users`)
      .pipe(
        map(response => {
          console.log('DashboardService - Resposta estatísticas de usuários:', response);
          return response.data;
        }),
        catchError(error => {
          console.error('DashboardService - Erro ao buscar estatísticas de usuários:', error);
          console.error('DashboardService - Status do erro:', error.status);
          console.error('DashboardService - Mensagem do erro:', error.message);
          if (error.status === 401) {
            console.error('DashboardService - Erro 401: Token inválido ou ausente');
          }
          // Retornar valores padrão em caso de erro
          return of({
            totalUsers: 0,
            activeUsers: 0,
            inactiveUsers: 0,
            adminUsers: 0,
            employeeUsers: 0,
            commonUsers: 0,
            generatedAt: new Date().toISOString()
          });
        })
      );
  }

  /**
   * Obter lista de todos os usuários
   */
  getAllUsers(): Observable<any[]> {
    console.log('DashboardService - Fazendo requisição para lista de usuários...');
    console.log('DashboardService - URL:', `${this.BASE_URL}/user/list/all`);
    
    // Verificar se o token existe no localStorage
    const token = localStorage.getItem('auth_token');
    console.log('DashboardService - Token presente:', !!token);
    
    return this.http.get<BaseReturn<any[]>>(`${this.BASE_URL}/user/list/all`)
      .pipe(
        map(response => {
          console.log('DashboardService - Resposta lista de usuários:', response);
          return response.data || [];
        }),
        catchError(error => {
          console.error('DashboardService - Erro ao buscar lista de usuários:', error);
          console.error('DashboardService - Status do erro:', error.status);
          console.error('DashboardService - Mensagem do erro:', error.message);
          if (error.status === 401) {
            console.error('DashboardService - Erro 401: Token inválido ou ausente');
          }
          return of([]);
        })
      );
  }

  /**
   * Obter lista de todos os veículos
   */
  getAllVehicles(): Observable<any[]> {
    console.log('DashboardService - Fazendo requisição para lista de veículos...');
    console.log('DashboardService - URL:', `${this.BASE_URL}/vehicle/list/all`);
    
    // Verificar se o token existe no localStorage
    const token = localStorage.getItem('auth_token');
    console.log('DashboardService - Token presente:', !!token);
    
    return this.http.get<BaseReturn<any[]>>(`${this.BASE_URL}/vehicle/list/all`)
      .pipe(
        map(response => {
          console.log('DashboardService - Resposta lista de veículos:', response);
          return response.data || [];
        }),
        catchError(error => {
          console.error('DashboardService - Erro ao buscar lista de veículos:', error);
          console.error('DashboardService - Status do erro:', error.status);
          console.error('DashboardService - Mensagem do erro:', error.message);
          if (error.status === 401) {
            console.error('DashboardService - Erro 401: Token inválido ou ausente');
          }
          return of([]);
        })
      );
  }

  /**
   * Criar novo veículo
   */
  createVehicle(vehicleData: any): Observable<any> {
    console.log('DashboardService - Criando novo veículo...');
    console.log('DashboardService - Dados do veículo:', vehicleData);
    
    // Verificar se o token existe no localStorage
    const token = localStorage.getItem('auth_token');
    console.log('DashboardService - Token presente para criação de veículo:', !!token);
    console.log('DashboardService - URL da requisição:', `${this.BASE_URL}/vehicle/register`);
    
    // Transformar os dados do formulário para o formato esperado pela API
    const apiData = this.transformVehicleDataForAPI(vehicleData);
    console.log('DashboardService - Dados transformados para API:', apiData);
    
    return this.http.post<BaseReturn<any>>(`${this.BASE_URL}/vehicle/register`, apiData)
      .pipe(
        map(response => {
          console.log('DashboardService - Resposta criação de veículo:', response);
          return response.data;
        }),
        catchError(error => {
          console.error('DashboardService - Erro ao criar veículo:', error);
          console.error('DashboardService - Status do erro:', error.status);
          console.error('DashboardService - Mensagem do erro:', error.message);
          throw error;
        })
      );
  }

  /**
   * Transformar dados do formulário para o formato da API
   */
  private transformVehicleDataForAPI(vehicleData: any): any {
    // Mapear tipo do veículo para número
    const getTypeNumber = (type: string): number => {
      const typeMap: {[key: string]: number} = {
        cargo: 0,
        passenger: 1,
        leisure: 2,
        motorcycle: 3
      };
      return typeMap[type] || 0;
    };

    // Estrutura principal do veículo
    const apiData: any = {
      idVehicle: 0,
      brand: vehicleData.brand,
      model: vehicleData.model,
      manufacturingYear: vehicleData.manufacturingYear,
      modelYear: vehicleData.modelYear,
      vin: vehicleData.vin,
      fuelTankCapacity: vehicleData.fuelTankCapacity,
      dailyRate: vehicleData.dailyRate,
      reducedDailyRate: vehicleData.reducedDailyRate || 0,
      monthlyRate: vehicleData.monthlyRate || 0,
      companyDailyRate: vehicleData.companyDailyRate || 0,
      reserved: false,
      imgUrl: vehicleData.imgUrl || '',
      type: getTypeNumber(vehicleData.vehicleType),
      cargoVehicle: null,
      motorcycle: null,
      passengerVehicle: null,
      leisureVehicle: null
    };

    // Adicionar dados específicos baseado no tipo
    switch (vehicleData.vehicleType) {
      case 'cargo':
        if (vehicleData.cargoVehicle) {
          apiData.cargoVehicle = {
            idVehicle: 0,
            brand: vehicleData.brand,
            model: vehicleData.model,
            manufacturingYear: vehicleData.manufacturingYear,
            modelYear: vehicleData.modelYear,
            vin: vehicleData.vin,
            fuelTankCapacity: vehicleData.fuelTankCapacity,
            dailyRate: vehicleData.dailyRate,
            reducedDailyRate: vehicleData.reducedDailyRate || 0,
            monthlyRate: vehicleData.monthlyRate || 0,
            companyDailyRate: vehicleData.companyDailyRate || 0,
            reserved: false,
            imgUrl: vehicleData.imgUrl || '',
            type: 0,
            cargoVehicle: null,
            motorcycle: null,
            passengerVehicle: null,
            leisureVehicle: null,
            cargoCapacity: vehicleData.cargoVehicle.cargoCapacity,
            cargoType: vehicleData.cargoVehicle.cargoType,
            tareWeight: vehicleData.cargoVehicle.tareWeight,
            cargoCompartmentSize: vehicleData.cargoVehicle.cargoCompartmentSize
          };
        }
        break;

      case 'passenger':
        if (vehicleData.passengerVehicle) {
          apiData.passengerVehicle = {
            idVehicle: 0,
            brand: vehicleData.brand,
            model: vehicleData.model,
            manufacturingYear: vehicleData.manufacturingYear,
            modelYear: vehicleData.modelYear,
            vin: vehicleData.vin,
            fuelTankCapacity: vehicleData.fuelTankCapacity,
            dailyRate: vehicleData.dailyRate,
            reducedDailyRate: vehicleData.reducedDailyRate || 0,
            monthlyRate: vehicleData.monthlyRate || 0,
            companyDailyRate: vehicleData.companyDailyRate || 0,
            reserved: false,
            imgUrl: vehicleData.imgUrl || '',
            type: 1,
            cargoVehicle: null,
            motorcycle: null,
            passengerVehicle: null,
            leisureVehicle: null,
            passengerCapacity: vehicleData.passengerVehicle.passengerCapacity,
            tv: vehicleData.passengerVehicle.tv,
            airConditioning: vehicleData.passengerVehicle.airConditioning,
            powerSteering: vehicleData.passengerVehicle.powerSteering
          };
        }
        break;

      case 'leisure':
        if (vehicleData.leisureVehicle) {
          apiData.leisureVehicle = {
            idVehicle: 0,
            brand: vehicleData.brand,
            model: vehicleData.model,
            manufacturingYear: vehicleData.manufacturingYear,
            modelYear: vehicleData.modelYear,
            vin: vehicleData.vin,
            fuelTankCapacity: vehicleData.fuelTankCapacity,
            dailyRate: vehicleData.dailyRate,
            reducedDailyRate: vehicleData.reducedDailyRate || 0,
            monthlyRate: vehicleData.monthlyRate || 0,
            companyDailyRate: vehicleData.companyDailyRate || 0,
            reserved: false,
            imgUrl: vehicleData.imgUrl || '',
            type: 2,
            cargoVehicle: null,
            motorcycle: null,
            passengerVehicle: null,
            leisureVehicle: null,
            automatic: vehicleData.leisureVehicle.automatic,
            powerSteering: vehicleData.leisureVehicle.powerSteering,
            airConditioning: vehicleData.leisureVehicle.airConditioning,
            category: vehicleData.leisureVehicle.category
          };
        }
        break;

      case 'motorcycle':
        if (vehicleData.motorcycle) {
          apiData.motorcycle = {
            idVehicle: 0,
            brand: vehicleData.brand,
            model: vehicleData.model,
            manufacturingYear: vehicleData.manufacturingYear,
            modelYear: vehicleData.modelYear,
            vin: vehicleData.vin,
            fuelTankCapacity: vehicleData.fuelTankCapacity,
            dailyRate: vehicleData.dailyRate,
            reducedDailyRate: vehicleData.reducedDailyRate || 0,
            monthlyRate: vehicleData.monthlyRate || 0,
            companyDailyRate: vehicleData.companyDailyRate || 0,
            reserved: false,
            imgUrl: vehicleData.imgUrl || '',
            type: 3,
            cargoVehicle: null,
            motorcycle: null,
            passengerVehicle: null,
            leisureVehicle: null,
            tractionControl: vehicleData.motorcycle.tractionControl,
            absBrakes: vehicleData.motorcycle.absBrakes,
            cruiseControl: vehicleData.motorcycle.cruiseControl
          };
        }
        break;
    }

    return apiData;
  }
}