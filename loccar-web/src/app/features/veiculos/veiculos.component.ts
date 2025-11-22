import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../layouts/sidebar/sidebar.component';
import { Observable } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { VehicleModalComponent, VehicleFormData } from './vehicle-modal.component';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal.component';
import { VehicleService } from '../../services/vehicle.service';

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
  imports: [CommonModule, SidebarComponent, VehicleModalComponent, ConfirmationModalComponent],
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
  
  // Modal de veículo
  showVehicleModal = false;
  isEditMode = false;
  selectedVehicleData: VehicleFormData | null = null;
  
  // Modal de confirmação
  isConfirmationModalOpen = false;
  vehicleToDelete: Vehicle | null = null;
  isDeleting = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private vehicleService: VehicleService
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
          color: 'purple'
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
    
    // Verificar se deve abrir modal de criação
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'create') {
        console.log('Abrindo modal de criação de veículo via queryParam');
        this.novoVeiculo();
        // Limpar o queryParam para evitar reabrir o modal
        this.router.navigate([], { queryParams: {} });
      }
    });
  }

  getCategoriaColor(categoria?: string): string {
    switch (categoria) {
      case 'Carga':
        return 'bg-purple-100 text-purple-800';
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

        // Log para debug - verificar estrutura dos dados da API
        console.log('Exemplo de veículo da API:', vehicles[0]);
        
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

        // Aplicar filtros aos dados transformados
        const filteredVehicles = this.applyFilters(transformedVehicles);

        // Atualizar o observable com os dados filtrados
        this.veiculos$ = new Observable<Vehicle[]>(observer => {
          observer.next(filteredVehicles);
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

  private applyFilters(vehicles: Vehicle[]): Vehicle[] {
    let filteredVehicles = [...vehicles];

    // Aplicar filtro de status
    if (this.filtroStatus && this.filtroStatus !== 'todos') {
      console.log('Aplicando filtro de status:', this.filtroStatus);
      
      switch (this.filtroStatus) {
        case 'Disponível':
          filteredVehicles = filteredVehicles.filter(v => !v.reserved);
          break;
        case 'Indisponível':
          filteredVehicles = filteredVehicles.filter(v => v.reserved);
          break;
      }
    }

    // Aplicar filtro de categoria se existir
    if (this.filtroCategoria && this.filtroCategoria !== 'todas') {
      console.log('Aplicando filtro de categoria:', this.filtroCategoria);
      filteredVehicles = filteredVehicles.filter(v => v.categoria === this.filtroCategoria);
    }

    // Aplicar busca por termo se existir
    if (this.termoBusca && this.termoBusca.trim() !== '') {
      console.log('Aplicando busca por termo:', this.termoBusca);
      const termo = this.termoBusca.toLowerCase().trim();
      filteredVehicles = filteredVehicles.filter(v => 
        v.brand?.toLowerCase().includes(termo) ||
        v.model?.toLowerCase().includes(termo) ||
        v.categoria?.toLowerCase().includes(termo) ||
        v.vin?.toLowerCase().includes(termo)
      );
    }

    console.log(`Filtros aplicados: ${vehicles.length} -> ${filteredVehicles.length} veículos`);
    console.log('Estado dos filtros:', {
      status: this.filtroStatus,
      categoria: this.filtroCategoria,
      busca: this.termoBusca
    });
    return filteredVehicles;
  }

  private getCategoriaFromType(vehicle: any): string {
    // Primeiro, tentar usar o campo 'type' numérico da API (conforme enum do backend)
    if (vehicle.type !== undefined && vehicle.type !== null) {
      const typeMap: {[key: number]: string} = {
        0: 'Carga',        // Cargo = 0
        1: 'Motocicleta',  // Motorcycle = 1
        2: 'Passageiros',  // Passenger = 2
        3: 'Lazer'         // Leisure = 3
      };
      return typeMap[vehicle.type] || 'Outros';
    }
    
    // Fallback: verificar existência dos objetos específicos
    if (vehicle.cargoVehicle) return 'Carga';
    if (vehicle.passengerVehicle) return 'Passageiros';
    if (vehicle.leisureVehicle) return 'Lazer';
    if (vehicle.motorcycle) return 'Motocicleta';
    return 'Outros';
  }

  private getVehicleTypeFromData(vehicle: any): 'cargo' | 'passenger' | 'leisure' | 'motorcycle' {
    console.log('DEBUG EDIT - getVehicleTypeFromData input:', vehicle);
    console.log('DEBUG EDIT - vehicle.type:', vehicle.type);
    
    // Primeiro, tentar usar o campo 'type' numérico da API (conforme enum do backend)
    if (vehicle.type !== undefined && vehicle.type !== null) {
      const typeMap: {[key: number]: 'cargo' | 'passenger' | 'leisure' | 'motorcycle'} = {
        0: 'cargo',       // Cargo = 0
        1: 'motorcycle',  // Motorcycle = 1
        2: 'passenger',   // Passenger = 2
        3: 'leisure'      // Leisure = 3
      };
      const result = typeMap[vehicle.type] || 'cargo';
      console.log('DEBUG EDIT - Mapeamento type:', vehicle.type, '-> string:', result);
      return result;
    }
    
    // Fallback: verificar existência dos objetos específicos
    if (vehicle.cargoVehicle) return 'cargo';
    if (vehicle.passengerVehicle) return 'passenger';
    if (vehicle.leisureVehicle) return 'leisure';
    if (vehicle.motorcycle) return 'motorcycle';
    return 'cargo'; // default
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
          color: 'purple'
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
    console.log('Carregando dados do veículo para edição:', veiculo);
    
    // Buscar dados completos do veículo
    this.vehicleService.getVehicle(veiculo.idVehicle).subscribe({
      next: (vehicleData) => {
        console.log('Dados do veículo carregados:', vehicleData);
        
        // Converter dados da API para o formato do formulário
        const detectedVehicleType = this.getVehicleTypeFromData(veiculo);
        console.log('DEBUG EDIT - Tipo detectado para edição:', detectedVehicleType);
        
        this.selectedVehicleData = {
          idVehicle: veiculo.idVehicle,
          brand: vehicleData.brand || veiculo.brand,
          model: vehicleData.model || veiculo.model,
          manufacturingYear: vehicleData.manufacturingYear || veiculo.manufacturingYear,
          modelYear: vehicleData.modelYear || veiculo.modelYear,
          dailyRate: vehicleData.dailyRate || veiculo.dailyRate,
          monthlyRate: vehicleData.monthlyRate || veiculo.monthlyRate,
          companyDailyRate: vehicleData.companyDailyRate || veiculo.companyDailyRate,
          reducedDailyRate: vehicleData.reducedDailyRate || veiculo.reducedDailyRate,
          fuelTankCapacity: vehicleData.fuelTankCapacity || veiculo.fuelTankCapacity,
          vin: vehicleData.vin || veiculo.vin,
          imgUrl: vehicleData.imgUrl || veiculo.imagem || '',
          vehicleType: detectedVehicleType,
          cargoVehicle: veiculo.cargoVehicle,
          passengerVehicle: veiculo.passengerVehicle,
          leisureVehicle: veiculo.leisureVehicle,
          motorcycle: veiculo.motorcycle
        };
        
        console.log('DEBUG EDIT - selectedVehicleData final (success):', this.selectedVehicleData);
        console.log('DEBUG EDIT - vehicleType no selectedVehicleData (success):', this.selectedVehicleData.vehicleType);
        
        this.isEditMode = true;
        this.showVehicleModal = true;
      },
      error: (error) => {
        console.error('Erro ao carregar dados do veículo:', error);
        
        // Se falhar na API, usar dados da lista
        const fallbackVehicleType = this.getVehicleTypeFromData(veiculo);
        console.log('DEBUG EDIT - Tipo detectado (fallback):', fallbackVehicleType);
        
        this.selectedVehicleData = {
          idVehicle: veiculo.idVehicle,
          brand: veiculo.brand,
          model: veiculo.model,
          manufacturingYear: veiculo.manufacturingYear,
          modelYear: veiculo.modelYear,
          dailyRate: veiculo.dailyRate,
          monthlyRate: veiculo.monthlyRate,
          companyDailyRate: veiculo.companyDailyRate,
          reducedDailyRate: veiculo.reducedDailyRate,
          fuelTankCapacity: veiculo.fuelTankCapacity,
          vin: veiculo.vin,
          imgUrl: veiculo.imagem || '',
          vehicleType: fallbackVehicleType,
          cargoVehicle: veiculo.cargoVehicle,
          passengerVehicle: veiculo.passengerVehicle,
          leisureVehicle: veiculo.leisureVehicle,
          motorcycle: veiculo.motorcycle
        };
        
        console.log('DEBUG EDIT - selectedVehicleData final (error):', this.selectedVehicleData);
        console.log('DEBUG EDIT - vehicleType no selectedVehicleData (error):', this.selectedVehicleData.vehicleType);
        
        this.isEditMode = true;
        this.showVehicleModal = true;
      }
    });
  }

  inativarVeiculo(veiculo: Vehicle): void {
    console.log('Alterando status do veículo:', veiculo);
    
    // Determinar novo status (inverter o atual)
    const novoStatusReservado = !veiculo.reserved;
    const acao = novoStatusReservado ? 'inativar' : 'ativar';
    
    console.log(`Tentando ${acao} veículo ID: ${veiculo.idVehicle}`);
    
    this.vehicleService.setVehicleReserved(veiculo.idVehicle, novoStatusReservado).subscribe({
      next: (response) => {
        console.log(`Veículo ${acao}do com sucesso:`, response);
        
        // Atualizar o status local do veículo
        veiculo.reserved = novoStatusReservado;
        veiculo.status = novoStatusReservado ? 'Reservado' : 'Disponível';
        
        // Recarregar lista de veículos para garantir sincronização
        this.refreshVehicles();
        
        // Mostrar feedback visual (opcional)
        console.log(`Veículo ${veiculo.model} ${acao}do com sucesso!`);
      },
      error: (error) => {
        console.error(`Erro ao ${acao} veículo:`, error);
        alert(`Erro ao ${acao} veículo: ${error.message || 'Tente novamente.'}`);
      }
    });
  }

  excluirVeiculo(veiculo: Vehicle): void {
    console.log('Preparando exclusão do veículo:', veiculo);
    this.vehicleToDelete = veiculo;
    this.isConfirmationModalOpen = true;
  }

  novoVeiculo(): void {
    console.log('Abrir modal para novo veículo');
    this.selectedVehicleData = null;
    this.isEditMode = false;
    this.showVehicleModal = true;
  }

  onCategoriaChange(categoria: string): void {
    console.log('Filtro de categoria alterado para:', categoria);
    this.filtroCategoria = categoria;
    this.refreshVehicles(); // Recarregar com filtro aplicado
  }

  onStatusChange(status: string): void {
    console.log('Filtro de status alterado para:', status);
    this.filtroStatus = status;
    this.refreshVehicles(); // Recarregar com filtro aplicado
  }

  onBuscaChange(termo: string): void {
    console.log('Termo de busca alterado para:', termo);
    this.termoBusca = termo;
    this.refreshVehicles(); // Recarregar com filtro aplicado
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
    this.isEditMode = false;
    this.selectedVehicleData = null;
  }

  onVehicleSubmit(vehicleData: VehicleFormData): void {
    console.log('DEBUG VEICULOS - Veículo processado via modal:', vehicleData);
    console.log('DEBUG VEICULOS - Tipo recebido:', vehicleData.vehicleType);
    console.log('DEBUG VEICULOS - isEditMode:', this.isEditMode);
    
    if (this.isEditMode) {
      // Modo de edição - já foi processado no modal
      // Resetar o formulário do modal
      if (this.vehicleModal) {
        this.vehicleModal.resetForm();
      }
      
      // Fechar o modal
      this.showVehicleModal = false;
      this.isEditMode = false;
      this.selectedVehicleData = null;
      
      // Recarregar lista de veículos
      this.refreshVehicles();
    } else {
      // Modo de criação
      console.log('DEBUG VEICULOS - Chamando createVehicle com:', vehicleData);
      this.dashboardService.createVehicle(vehicleData).subscribe({
        next: (response) => {
          console.log('Veículo criado com sucesso:', response);
          
          // Resetar o formulário do modal
          if (this.vehicleModal) {
            this.vehicleModal.resetForm();
          }
          
          // Fechar o modal
          this.showVehicleModal = false;
          
          // Recarregar lista de veículos
          this.refreshVehicles();
        },
        error: (error) => {
          console.error('Erro ao criar veículo:', error);
          
          // Resetar o estado de loading do formulário
          if (this.vehicleModal) {
            this.vehicleModal.isSubmitting = false;
          }
        }
      });
    }
  }

  // Métodos do modal de confirmação
  onConfirmDelete(): void {
    if (!this.vehicleToDelete) return;

    this.isDeleting = true;
    console.log('Excluindo veículo:', this.vehicleToDelete);

    this.vehicleService.deleteVehicle(this.vehicleToDelete.idVehicle).subscribe({
      next: (response) => {
        console.log('Veículo excluído com sucesso:', response);
        this.isDeleting = false;
        this.isConfirmationModalOpen = false;
        this.vehicleToDelete = null;
        
        // Recarregar lista
        this.refreshVehicles();
      },
      error: (error) => {
        console.error('Erro ao excluir veículo:', error);
        this.isDeleting = false;
        // Manter modal aberto para mostrar erro ou tentar novamente
      }
    });
  }

  onCancelDelete(): void {
    console.log('Cancelando exclusão');
    this.isConfirmationModalOpen = false;
    this.vehicleToDelete = null;
    this.isDeleting = false;
  }
}