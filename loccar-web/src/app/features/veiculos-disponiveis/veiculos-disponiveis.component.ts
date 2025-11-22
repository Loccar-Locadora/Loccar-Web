import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VehicleService } from '../../services/vehicle.service';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../../layouts/sidebar/sidebar.component';
import { ReservaModalComponent } from '../../shared/reserva-modal.component';
import { Subscription } from 'rxjs';

interface Veiculo {
  idVehicle: number;
  brand: string;
  model: string;
  manufacturingYear: number;
  modelYear: number;
  vin: string;
  fuelTankCapacity: number;
  dailyRate: number;
  reducedDailyRate: number;
  monthlyRate: number;
  companyDailyRate: number;
  reserved: boolean;
  imgUrl?: string;
  type: number; // 0=Cargo, 1=Motorcycle, 2=Passenger, 3=Leisure
  cargoVehicle?: {
    cargoCapacity: number;
    cargoType: string;
    tareWeight: number;
    cargoCompartmentSize: string;
  };
  motorcycle?: {
    tractionControl: boolean;
    absBrakes: boolean;
    cruiseControl: boolean;
  };
  passengerVehicle?: {
    passengerCapacity: number;
    tv: boolean;
    airConditioning: boolean;
    powerSteering: boolean;
  };
  leisureVehicle?: {
    automatic: boolean;
    powerSteering: boolean;
    airConditioning: boolean;
    category: string;
  };
}

@Component({
  selector: 'app-veiculos-disponiveis',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, ReservaModalComponent],
  templateUrl: './veiculos-disponiveis.component.html',
  styleUrls: ['./veiculos-disponiveis.component.scss']
})
export class VeiculosDisponiveisComponent implements OnInit, OnDestroy {
  veiculos: Veiculo[] = [];
  veiculosFiltrados: Veiculo[] = [];
  loading = false;
  erro = '';
  
  // Modal de reserva
  showReservaModal = false;
  selectedVeiculo: Veiculo | null = null;
  
  // Filtros
  filtroCategoria = '';
  filtroPreco = '';
  termoPesquisa = '';
  
  // Opções de filtro
  categorias = [
    { valor: '', label: 'Todas as categorias' },
    { valor: '0', label: 'Carga' },
    { valor: '1', label: 'Motocicleta' },
    { valor: '2', label: 'Passeio' },
    { valor: '3', label: 'Lazer' }
  ];
  
  faixasPreco = [
    { valor: '', label: 'Todos os preços' },
    { valor: 'ate100', label: 'Até R$ 100/dia' },
    { valor: '100a150', label: 'R$ 100 - R$ 150/dia' },
    { valor: 'acima150', label: 'Acima de R$ 150/dia' }
  ];

  private subscription = new Subscription();

  constructor(
    private vehicleService: VehicleService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarVeiculosDisponiveis();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Carregar veículos disponíveis da API
   */
  private carregarVeiculosDisponiveis(): void {
    this.loading = true;
    this.erro = '';
    this.veiculos = [];
    this.veiculosFiltrados = [];

    console.log('🚗 COMPONENTE - Iniciando carregamento de veículos disponíveis...');
    console.log('🔐 Token presente:', !!localStorage.getItem('auth_token'));

    this.subscription.add(
      this.vehicleService.getAvailableVehicles().subscribe({
        next: (response) => {
          console.log('✅ COMPONENTE - Resposta da API recebida:', response);
          console.log('📊 COMPONENTE - Tipo da resposta:', typeof response);
          console.log('🔍 COMPONENTE - Keys da resposta:', Object.keys(response || {}));
          
          // Verificar se a resposta é válida (tanto formato antigo quanto novo)
          const isSuccess = response.success === true || response.code === "200";
          console.log('✅ COMPONENTE - É sucesso?', isSuccess);
          console.log('📋 COMPONENTE - Tem data?', !!response.data);
          console.log('📋 COMPONENTE - Data é array?', Array.isArray(response.data));
          console.log('📋 COMPONENTE - Quantidade de itens:', response.data?.length || 0);
          
          if (isSuccess && response.data && Array.isArray(response.data)) {
            console.log('🔄 COMPONENTE - Processando veículos...');
            
            // Filtrar apenas veículos não reservados
            const veiculosDisponiveis = response.data.filter(v => !v.reserved);
            console.log(`� COMPONENTE - Veículos antes do filtro: ${response.data.length}`);
            console.log(`✅ COMPONENTE - Veículos após filtro: ${veiculosDisponiveis.length}`);
            
            this.veiculos = veiculosDisponiveis;
            this.aplicarFiltros();
            
            if (this.veiculos.length === 0) {
              this.erro = 'Todos os veículos estão reservados no momento.';
            }
          } else {
            console.warn('⚠️ COMPONENTE - Resposta da API inválida ou sem dados:', {
              isSuccess,
              hasData: !!response.data,
              isArray: Array.isArray(response.data),
              response
            });
            this.erro = response.message || 'Nenhum veículo disponível encontrado';
          }
          
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Erro ao carregar veículos disponíveis:', error);
          console.error('❌ Status do erro:', error.status);
          console.error('❌ Mensagem do erro:', error.message);
          
          let mensagemErro = 'Erro ao carregar veículos disponíveis';
          
          if (error.status === 0) {
            mensagemErro = 'Não foi possível conectar ao servidor. Verifique se o servidor está rodando na porta 8080.';
            console.warn('⚠️ Servidor não disponível. Carregando dados de exemplo...');
            this.carregarDadosExemplo();
            return;
          } else if (error.status === 404) {
            mensagemErro = 'Endpoint de veículos não encontrado.';
          } else if (error.status === 401) {
            mensagemErro = 'Acesso não autorizado. Faça login novamente.';
          } else if (error.status === 500) {
            mensagemErro = 'Erro interno do servidor.';
          } else if (error.error && error.error.message) {
            mensagemErro = error.error.message;
          } else if (error.message) {
            mensagemErro = error.message;
          }
          
          this.erro = mensagemErro;
          this.loading = false;
        }
      })
    );
  }

  /**
   * Aplicar filtros aos veículos
   */
  aplicarFiltros(): void {
    let resultado = [...this.veiculos];

    // Filtro por categoria (tipo)
    if (this.filtroCategoria && this.filtroCategoria !== '') {
      const tipoNumero = parseInt(this.filtroCategoria);
      resultado = resultado.filter(v => v.type === tipoNumero);
    }

    // Filtro por preço
    if (this.filtroPreco && this.filtroPreco !== '') {
      switch (this.filtroPreco) {
        case 'ate100':
          resultado = resultado.filter(v => v.dailyRate <= 100);
          break;
        case '100a150':
          resultado = resultado.filter(v => v.dailyRate > 100 && v.dailyRate <= 150);
          break;
        case 'acima150':
          resultado = resultado.filter(v => v.dailyRate > 150);
          break;
      }
    }

    // Filtro por pesquisa
    if (this.termoPesquisa.trim()) {
      const termoPesquisa = this.termoPesquisa.toLowerCase().trim();
      resultado = resultado.filter(v =>
        v.brand.toLowerCase().includes(termoPesquisa) ||
        v.model.toLowerCase().includes(termoPesquisa) ||
        v.vin.toLowerCase().includes(termoPesquisa) ||
        this.getTipoTexto(v.type).toLowerCase().includes(termoPesquisa)
      );
    }

    this.veiculosFiltrados = resultado;
  }

  /**
   * Limpar todos os filtros
   */
  limparFiltros(): void {
    this.filtroCategoria = '';
    this.filtroPreco = '';
    this.termoPesquisa = '';
    this.aplicarFiltros();
  }

  /**
   * Iniciar processo de reserva
   */
  reservarVeiculo(veiculo: Veiculo): void {
    if (!this.authService.isAuthenticated()) {
      alert('Você precisa estar logado para fazer uma reserva.');
      this.router.navigate(['/login']);
      return;
    }

    console.log('🚗 COMPONENTE - Iniciando reserva do veículo:', {
      id: veiculo.idVehicle,
      brand: veiculo.brand,
      model: veiculo.model,
      veiculo: veiculo
    });
    
    this.selectedVeiculo = veiculo;
    this.showReservaModal = true;
    
    // Forçar uma nova verificação após abrir o modal
    setTimeout(() => {
      console.log('🔄 COMPONENTE - Verificando veículo selecionado após abrir modal:', this.selectedVeiculo);
    }, 100);
  }

  /**
   * Fechar modal de reserva
   */
  closeReservaModal(): void {
    this.showReservaModal = false;
    this.selectedVeiculo = null;
  }

  /**
   * Reserva confirmada
   */
  onReservaConfirmada(event: any): void {
    console.log('✅ Reserva confirmada:', event);
    
    // Mostrar mensagem de sucesso
    alert(`🎉 Reserva confirmada com sucesso!\n\nVeículo: ${event.veiculo.brand} ${event.veiculo.model}\nLocal: ${event.formData.pickupLocation}\nPeríodo: ${event.formData.pickupDate} a ${event.formData.returnDate}\n\nVocê receberá um e-mail com os detalhes da reserva.`);
    
    // Recarregar a lista de veículos para atualizar disponibilidade
    this.recarregar();
  }

  /**
   * Formatar preço em Real brasileiro
   */
  formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  }

  /**
   * Converter número do tipo para texto
   */
  getTipoTexto(tipo: number): string {
    const tipos: {[key: number]: string} = {
      0: 'Carga',
      1: 'Motocicleta', 
      2: 'Passeio',
      3: 'Lazer'
    };
    return tipos[tipo] || 'Desconhecido';
  }

  /**
   * Obter URL da imagem do veículo
   */
  getImagemVeiculo(veiculo: Veiculo): string {
    // Se tiver imagem específica da API, usar ela
    if (veiculo.imgUrl) {
      return veiculo.imgUrl;
    }
    
    // Senão, usar imagem padrão baseada no tipo
    const imagensPadrao: {[key: number]: string} = {
      0: 'assets/images/vehicle-cargo.svg',
      1: 'assets/images/vehicle-motorcycle.svg',
      2: 'assets/images/vehicle-passenger.svg',
      3: 'assets/images/vehicle-leisure.svg'
    };
    
    return imagensPadrao[veiculo.type] || 'assets/images/car-placeholder.svg';
  }

  /**
   * Carregar dados de exemplo quando a API não estiver disponível
   */
  private carregarDadosExemplo(): void {
    console.log('📝 Carregando dados de exemplo devido à falha na API...');
    
    this.veiculos = [
      {
        idVehicle: 1,
        brand: 'Toyota',
        model: 'Corolla XEi 2.0',
        manufacturingYear: 2023,
        modelYear: 2023,
        vin: 'ABC123456789',
        fuelTankCapacity: 55,
        dailyRate: 180.00,
        reducedDailyRate: 150.00,
        monthlyRate: 3200.00,
        companyDailyRate: 160.00,
        reserved: false,
        imgUrl: 'https://revistacarro.com.br/wp-content/uploads/2019/12/Toyota-Corolla-XEi_4.jpg',
        type: 2,
        passengerVehicle: {
          passengerCapacity: 5,
          tv: false,
          airConditioning: true,
          powerSteering: true
        }
      },
      {
        idVehicle: 2,
        brand: 'Honda',
        model: 'CB 600F Hornet',
        manufacturingYear: 2022,
        modelYear: 2023,
        vin: 'DEF987654321',
        fuelTankCapacity: 19,
        dailyRate: 120.00,
        reducedDailyRate: 100.00,
        monthlyRate: 2400.00,
        companyDailyRate: 110.00,
        reserved: false,
        type: 1,
        motorcycle: {
          tractionControl: true,
          absBrakes: true,
          cruiseControl: false
        }
      },
      {
        idVehicle: 3,
        brand: 'Ford',
        model: 'Transit Cargo Van',
        manufacturingYear: 2022,
        modelYear: 2022,
        vin: 'GHI456789123',
        fuelTankCapacity: 80,
        dailyRate: 220.00,
        reducedDailyRate: 200.00,
        monthlyRate: 4800.00,
        companyDailyRate: 210.00,
        reserved: false,
        type: 0,
        cargoVehicle: {
          cargoCapacity: 1200,
          cargoType: 'Geral',
          tareWeight: 2500,
          cargoCompartmentSize: '2.5x1.8x1.4m'
        }
      },
      {
        idVehicle: 4,
        brand: 'Jeep',
        model: 'Wrangler Sport',
        manufacturingYear: 2023,
        modelYear: 2023,
        vin: 'JKL987123456',
        fuelTankCapacity: 70,
        dailyRate: 280.00,
        reducedDailyRate: 250.00,
        monthlyRate: 6000.00,
        companyDailyRate: 260.00,
        reserved: false,
        type: 3,
        leisureVehicle: {
          automatic: true,
          powerSteering: true,
          airConditioning: true,
          category: 'SUV Off-Road'
        }
      }
    ];
    
    this.aplicarFiltros();
    this.loading = false;
    
    // Mostrar aviso discreto que está usando dados de exemplo
    console.warn('⚠️ Exibindo dados de exemplo - API não disponível');
    this.erro = 'Servidor temporariamente indisponível. Exibindo dados de exemplo.';
    
    // Limpar o erro após alguns segundos para não confundir o usuário
    setTimeout(() => {
      this.erro = '';
    }, 5000);
  }

  /**
   * Obter quantidade de veículos por tipo
   */
  getVeiculosPorTipo(tipo: number): number {
    return this.veiculos.filter(v => v.type === tipo).length;
  }

  /**
   * Testar reserva com o primeiro veículo disponível
   */
  testarReserva(): void {
    if (this.veiculosFiltrados.length > 0) {
      this.reservarVeiculo(this.veiculosFiltrados[0]);
    } else {
      alert('Nenhum veículo disponível para teste');
    }
  }

  /**
   * Mostrar informações de debug
   */
  mostrarInfoDebug(): void {
    const debugInfo = {
      loading: this.loading,
      erro: this.erro,
      totalVeiculos: this.veiculos.length,
      veiculosFiltrados: this.veiculosFiltrados.length,
      filtros: {
        categoria: this.filtroCategoria,
        preco: this.filtroPreco,
        pesquisa: this.termoPesquisa
      },
      temToken: !!localStorage.getItem('auth_token'),
      urlApi: 'http://localhost:8080/api/vehicle/list/available'
    };
    
    console.log('🐛 DEBUG INFO:', debugInfo);
    
    alert(`🐛 INFORMAÇÕES DE DEBUG:

📊 Estado do Componente:
- Loading: ${debugInfo.loading}
- Erro: ${debugInfo.erro || 'Nenhum'}
- Total de veículos: ${debugInfo.totalVeiculos}
- Veículos filtrados: ${debugInfo.veiculosFiltrados}

🔍 Filtros Ativos:
- Categoria: ${debugInfo.filtros.categoria || 'Todas'}
- Preço: ${debugInfo.filtros.preco || 'Todos'}
- Pesquisa: ${debugInfo.filtros.pesquisa || 'Nenhuma'}

🔐 Autenticação:
- Token presente: ${debugInfo.temToken ? 'Sim' : 'Não'}

🌐 API:
- URL: ${debugInfo.urlApi}

Verifique o console (F12) para mais detalhes.`);
  }

  /**
   * Recarregar veículos
   */
  recarregar(): void {
    this.carregarVeiculosDisponiveis();
  }
}