import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layouts/sidebar/sidebar.component';
import { Observable } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { VehicleModalComponent, VehicleFormData } from './vehicle-modal.component';

// Interfaces baseadas na API
export interface CargoVehicle {
  idVehicle: string;
  cargoCapacity: number;
  cargoType: string;
  tareWeight: number;
  cargoCompartmentSize: string;
}

export interface PassengerVehicle {
  idVehicle: string;
  passengerCapacity: number;
  tv: boolean;
  airConditioning: boolean;
  powerSteering: boolean;
}

export interface LeisureVehicle {
  idVehicle: string;
  automatic: boolean;
  powerSteering: boolean;
  airConditioning: boolean;
  category: string;
}

export interface Motorcycle {
  idVehicle: string;
  tractionControl: boolean;
  absBrakes: boolean;
  cruiseControl: boolean;
}

export interface Vehicle {
  idVehicle: string;
  brand: string;
  model: string;
  manufacturingYear: number;
  modelYear: number;
  dailyRate: number;
  monthlyRate: number;
  companyDailyRate: number;
  reducedDailyRate: number;
  fuelTankCapacity: number;
  vin: string;
  reserved: boolean;
  cargoVehicle?: CargoVehicle;
  passengerVehicle?: PassengerVehicle;
  leisureVehicle?: LeisureVehicle;
  motorcycle?: Motorcycle;
  // Campos calculados para exibição
  categoria?: string;
  imagem?: string;
  status?: string;
}

export interface VehicleStats {
  id: number;
  title: string;
  value: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [CommonModule, SidebarComponent, VehicleModalComponent],
  templateUrl: './veiculos.component.html',
  styleUrls: ['./veiculos.component.scss']
})
export class VeiculosComponent implements OnInit {
  @ViewChild(VehicleModalComponent) vehicleModal!: VehicleModalComponent;

  veiculos$: Observable<Vehicle[]>;
  vehicleStats$: Observable<VehicleStats[]>;
  isLoadingVehicles = false;
  isLoadingStats = false;
  filtroCategoria = 'todas';
  filtroStatus = 'todos';
  termoBusca = '';
  
  // Modal
  showVehicleModal = false;

  constructor(
    private router: Router,
    private dashboardService: DashboardService
  ) {
    // Inicializar observable vazio - dados serão carregados da API
    this.veiculos$ = new Observable<Vehicle[]>(observer => {
      observer.next([]);
    });

    // Stats dos veículos - inicializar com valores padrão
    this.vehicleStats$ = new Observable<VehicleStats[]>(observer => {
      observer.next([
        {
          id: 1,
          title: 'Total de Veículos',
          value: '0',
          icon: 'directions_car',
          color: 'blue'
        },
        {
          id: 2,
          title: 'Disponíveis',
          value: '0',
          icon: 'check_circle',
          color: 'green'
        },
        {
          id: 3,
          title: 'Reservados',
          value: '0',
          icon: 'warning',
          color: 'red'
        },
        {
          id: 4,
          title: 'Categorias',
          value: '0',
          icon: 'category',
          color: 'purple'
        }
      ]);
    });
  }

  ngOnInit(): void {
    this.loadVehicles();
  }

  getCategoriaColor(categoria?: string): string {
    switch (categoria) {
      case 'Carga':
        return 'bg-blue-100 text-blue-800';
      case 'Passageiros':
        return 'bg-green-100 text-green-800';
      case 'Lazer':
        return 'bg-yellow-100 text-yellow-800';
      case 'Motocicleta':
        return 'bg-purple-100 text-purple-800';
      case 'Outros':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusColor(status?: string): string {
    switch (status) {
      case 'Disponível':
        return 'bg-green-100 text-green-800';
      case 'Reservado':
        return 'bg-red-100 text-red-800';
      case 'Manutenção':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  private loadVehicles(): void {
    this.isLoadingVehicles = true;
    console.log('Carregando lista de veículos da API...');

    this.dashboardService.getAllVehicles().subscribe({
      next: (vehicles) => {
        console.log('Lista de veículos recebida:', vehicles);
        this.isLoadingVehicles = false;

        // Transformar os dados da API para o formato do componente
        const transformedVehicles: Vehicle[] = vehicles.map(vehicle => ({
          idVehicle: vehicle.idVehicle,
          brand: vehicle.brand,
          model: vehicle.model,
          manufacturingYear: vehicle.manufacturingYear,
          modelYear: vehicle.modelYear,
          dailyRate: vehicle.dailyRate,
          monthlyRate: vehicle.monthlyRate,
          companyDailyRate: vehicle.companyDailyRate,
          reducedDailyRate: vehicle.reducedDailyRate,
          fuelTankCapacity: vehicle.fuelTankCapacity,
          vin: vehicle.vin,
          reserved: vehicle.reserved,
          cargoVehicle: vehicle.cargoVehicle,
          passengerVehicle: vehicle.passengerVehicle,
          leisureVehicle: vehicle.leisureVehicle,
          motorcycle: vehicle.motorcycle,
          // Campos calculados
          categoria: this.getCategoriaFromType(vehicle),
          imagem: vehicle.imgUrl,
          status: vehicle.reserved ? 'Reservado' : 'Disponível'
        }));

        // Atualizar o observable com os dados reais
        this.veiculos$ = new Observable<Vehicle[]>(observer => {
          observer.next(transformedVehicles);
          observer.complete();
        });

        // Atualizar estatísticas baseadas nos dados carregados
        this.updateStats(transformedVehicles);
      },
      error: (error) => {
        console.error('Erro ao carregar lista de veículos:', error);
        this.isLoadingVehicles = false;
        
        // Manter lista vazia em caso de erro
        this.veiculos$ = new Observable<Vehicle[]>(observer => {
          observer.next([]);
          observer.complete();
        });
      }
    });
  }

  private getCategoriaFromType(vehicle: any): string {
    if (vehicle.cargoVehicle) return 'Carga';
    if (vehicle.passengerVehicle) return 'Passageiros';
    if (vehicle.leisureVehicle) return 'Lazer';
    if (vehicle.motorcycle) return 'Motocicleta';
    return 'Outros';
  }

  private updateStats(vehicles: Vehicle[]): void {
    const total = vehicles.length;
    const disponiveIs = vehicles.filter(v => !v.reserved).length;
    const reservados = vehicles.filter(v => v.reserved).length;
    const categorias = new Set(vehicles.map(v => v.categoria)).size;

    this.vehicleStats$ = new Observable<VehicleStats[]>(observer => {
      observer.next([
        {
          id: 1,
          title: 'Total de Veículos',
          value: total.toString(),
          icon: 'directions_car',
          color: 'blue'
        },
        {
          id: 2,
          title: 'Disponíveis',
          value: disponiveIs.toString(),
          icon: 'check_circle',
          color: 'green'
        },
        {
          id: 3,
          title: 'Reservados',
          value: reservados.toString(),
          icon: 'warning',
          color: 'red'
        },
        {
          id: 4,
          title: 'Categorias',
          value: categorias.toString(),
          icon: 'category',
          color: 'purple'
        }
      ]);
      observer.complete();
    });
  }

  editarVeiculo(veiculo: Vehicle): void {
    console.log('Editar veículo:', veiculo);
    // Implementar navegação para edição
  }

  inativarVeiculo(veiculo: Vehicle): void {
    console.log('Inativar veículo:', veiculo);
    // Implementar inativação
  }

  excluirVeiculo(veiculo: Vehicle): void {
    console.log('Excluir veículo:', veiculo);
    // Implementar confirmação e exclusão
  }

  novoVeiculo(): void {
    console.log('Abrir modal para novo veículo');
    this.showVehicleModal = true;
  }

  onCategoriaChange(categoria: string): void {
    this.filtroCategoria = categoria;
    // Implementar filtragem
  }

  onStatusChange(status: string): void {
    this.filtroStatus = status;
    // Implementar filtragem
  }

  onBuscaChange(termo: string): void {
    this.termoBusca = termo;
    // Implementar busca
  }

  refreshVehicles(): void {
    console.log('Recarregando lista de veículos...');
    this.loadVehicles();
  }

  getVehicleName(vehicle: Vehicle): string {
    return `${vehicle.brand} ${vehicle.model} ${vehicle.modelYear}`;
  }

  getVehicleRate(vehicle: Vehicle): number {
    return vehicle.dailyRate;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  // Métodos do Modal
  closeVehicleModal(): void {
    // Resetar o formulário quando o modal for fechado
    if (this.vehicleModal) {
      this.vehicleModal.resetForm();
    }
    this.showVehicleModal = false;
  }

  onVehicleSubmit(vehicleData: VehicleFormData): void {
    console.log('Dados do veículo para salvar:', vehicleData);
    
    this.dashboardService.createVehicle(vehicleData).subscribe({
      next: (response) => {
        console.log('Veículo criado com sucesso:', response);
        
        // Resetar o formulário do modal
        this.vehicleModal.resetForm();
        
        // Fechar o modal
        this.showVehicleModal = false;
        
        // Recarregar lista de veículos
        this.refreshVehicles();
        
        // Aqui você pode adicionar uma notificação de sucesso
        // this.notificationService.showSuccess('Veículo criado com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao criar veículo:', error);
        
        // Resetar o estado de loading do formulário
        this.vehicleModal.isSubmitting = false;
        
        // Aqui você pode adicionar uma notificação de erro
        // this.notificationService.showError('Erro ao criar veículo. Tente novamente.');
        
        // Não fechar o modal em caso de erro para permitir correção
      }
    });
  }
}