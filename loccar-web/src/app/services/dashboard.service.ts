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

// Interface alternativa para endpoints que retornam code/message
interface ApiResponse<T> {
  code: string;
  message: string;
  data: T;
}

// Interface para estatísticas do dashboard
export interface DashboardStats {
  totalVehicles: number;
  activeReservations: number;
  availableVehicles: number;
}

// Interface para resposta da receita mensal
export interface MonthlyRevenueResponse {
  year: number;
  month: number;
  monthName: string;
  totalRevenue: number;
  totalReservations: number;
  averageRevenuePerReservation: number;
  generatedAt: string;
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
      const response = await this.http.get<ApiResponse<MonthlyRevenueResponse>>(
        `${this.BASE_URL}/statistics/revenue/monthly/${year}/${month}`
      ).toPromise();
      
      console.log(`Receita para ${month}/${year}:`, response);
      // Extrair o totalRevenue do objeto de resposta
      return response?.data?.totalRevenue || 0;
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
    console.log('DEBUG - transformVehicleDataForAPI - vehicleData recebido:', vehicleData);
    console.log('DEBUG - vehicleType:', vehicleData.vehicleType);
    console.log('DEBUG - ANOS INPUT - manufacturingYear:', vehicleData.manufacturingYear, 'modelYear:', vehicleData.modelYear);
    
    // Mapear tipo do veículo para número (conforme enum do backend)
    const getVehicleTypeNumber = (type: string): number => {
      const typeMap: {[key: string]: number} = {
        cargo: 0,        // Cargo = 0
        motorcycle: 1,   // Motorcycle = 1
        passenger: 2,    // Passenger = 2
        leisure: 3       // Leisure = 3
      };
      const typeNumber = typeMap[type] || 0;
      console.log('DEBUG - Mapeando tipo (corrigido):', type, '-> número:', typeNumber);
      return typeNumber;
    };

    // Estrutura principal do veículo
    let apiData: any = {
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
      type: getVehicleTypeNumber(vehicleData.vehicleType),
      cargoVehicle: null,
      motorcycle: null,
      passengerVehicle: null,
      leisureVehicle: null
    };

    console.log('DEBUG - apiData antes de adicionar dados específicos:', apiData);
    
    // Adicionar dados específicos baseado no tipo
    console.log('DEBUG - Switch no vehicleType:', vehicleData.vehicleType);
    switch (vehicleData.vehicleType) {
      case 'cargo':
        console.log('DEBUG - Processando veículo de carga');
        if (vehicleData.cargoVehicle) {
          console.log('DEBUG - Criando apiData para veículo de carga');
          apiData.cargoVehicle = {
            cargoCapacity: vehicleData.cargoVehicle.cargoCapacity,
            cargoType: vehicleData.cargoVehicle.cargoType,
            tareWeight: vehicleData.cargoVehicle.tareWeight,
            cargoCompartmentSize: vehicleData.cargoVehicle.cargoCompartmentSize
          };
          console.log('DEBUG - apiData.cargoVehicle criado:', apiData.cargoVehicle);
        }
        break;

      case 'passenger':
        console.log('DEBUG - Processando veículo de passageiros');
        if (vehicleData.passengerVehicle) {
          console.log('DEBUG - Criando apiData para veículo de passageiros');
          apiData.passengerVehicle = {
            passengerCapacity: vehicleData.passengerVehicle.passengerCapacity,
            tv: vehicleData.passengerVehicle.tv,
            airConditioning: vehicleData.passengerVehicle.airConditioning,
            powerSteering: vehicleData.passengerVehicle.powerSteering
          };
          console.log('DEBUG - apiData.passengerVehicle criado:', apiData.passengerVehicle);
        }
        break;

      case 'leisure':
        console.log('DEBUG - Processando veículo de lazer');
        console.log('DEBUG - leisureVehicle data:', vehicleData.leisureVehicle);
        if (vehicleData.leisureVehicle) {
          console.log('DEBUG - Criando apiData.leisureVehicle');
          apiData.leisureVehicle = {
            automatic: vehicleData.leisureVehicle.automatic,
            powerSteering: vehicleData.leisureVehicle.powerSteering,
            airConditioning: vehicleData.leisureVehicle.airConditioning,
            category: vehicleData.leisureVehicle.category
          };
          console.log('DEBUG - apiData.leisureVehicle criado:', apiData.leisureVehicle);
        } else {
          console.log('DEBUG - ERRO: leisureVehicle não encontrado!');
        }
        break;

      case 'motorcycle':
        console.log('DEBUG - Processando motocicleta');
        if (vehicleData.motorcycle) {
          console.log('DEBUG - Criando apiData para motocicleta');
          apiData.motorcycle = {
            tractionControl: vehicleData.motorcycle.tractionControl,
            absBrakes: vehicleData.motorcycle.absBrakes,
            cruiseControl: vehicleData.motorcycle.cruiseControl
          };
          console.log('DEBUG - apiData.motorcycle criado:', apiData.motorcycle);
        }
        break;
    }

    console.log('DEBUG - Final apiData before return:', apiData);
    console.log('DEBUG - Final type value (NÚMERO):', apiData.type);
    console.log('DEBUG - ANOS - manufacturingYear:', apiData.manufacturingYear, 'modelYear:', apiData.modelYear);
    console.log('DEBUG - Original vehicleType (STRING):', vehicleData.vehicleType);
    console.log('DEBUG - CONVERSÃO: string', vehicleData.vehicleType, '-> número', apiData.type);
    console.log('DEBUG - Enviando para API com vehicleType como NÚMERO:', apiData.type);
    return apiData;
  }
}