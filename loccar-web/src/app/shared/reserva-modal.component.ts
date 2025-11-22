import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService, ReservaRequest } from '../services/reservation.service';

@Component({
  selector: 'app-reserva-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Modal Backdrop -->
    <div *ngIf="isOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" 
         (click)="closeModal()">
      
      <!-- Modal Content -->
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 xl:w-2/5 shadow-lg rounded-md bg-white"
           (click)="$event.stopPropagation()">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-200">
          <h3 class="text-xl font-semibold text-gray-900">
            <i class="bi bi-calendar-plus mr-2 text-purple-600"></i>
            Reservar Veículo
          </h3>
          <button (click)="closeModal()" 
                  class="text-gray-400 hover:text-gray-600 transition">
            <i class="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        <!-- Vehicle Info -->
        <div *ngIf="veiculo" class="mt-4 bg-gray-50 rounded-lg p-4">
          <div class="flex items-center space-x-4">
            <img [src]="getImagemVeiculo()" 
                 [alt]="veiculo.brand + ' ' + veiculo.model"
                 class="w-20 h-16 object-cover rounded-lg">
            <div>
              <h4 class="font-semibold text-gray-900">{{ veiculo.brand }} {{ veiculo.model }}</h4>
              <p class="text-sm text-gray-600">{{ veiculo.manufacturingYear }}/{{ veiculo.modelYear }}</p>
              <p class="text-lg font-bold text-purple-600">{{ formatarPreco(veiculo.dailyRate) }}/dia</p>
            </div>
          </div>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" #reservaForm="ngForm" class="mt-6">
          
          <!-- Dates Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <!-- Data de Retirada -->
            <div>
              <label for="pickupDate" class="block text-sm font-medium text-gray-700 mb-2">
                <i class="bi bi-calendar-event mr-1 text-purple-500"></i>
                Data de Retirada *
              </label>
              <input
                type="date"
                id="pickupDate"
                name="pickupDate"
                [(ngModel)]="formData.rentalDate"
                [min]="getMinDate()"
                (change)="onDateChange()"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
            </div>

            <!-- Data de Devolução -->
            <div>
              <label for="returnDate" class="block text-sm font-medium text-gray-700 mb-2">
                <i class="bi bi-calendar-check mr-1 text-purple-500"></i>
                Data de Devolução *
              </label>
              <input
                type="date"
                id="returnDate"
                name="returnDate"
                [(ngModel)]="formData.returnDate"
                [min]="getMinReturnDate()"
                (change)="onDateChange()"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
            </div>
          </div>

          <!-- Local de Retirada -->
          <div class="mb-4">
            <label for="pickupLocation" class="block text-sm font-medium text-gray-700 mb-2">
              Local de Retirada *
            </label>
            <select
              id="pickupLocation"
              name="pickupLocation"
              [(ngModel)]="pickupLocation"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Selecione o local</option>
              <option value="Matriz - Centro São Paulo">Matriz - Centro São Paulo</option>
              <option value="Filial - Aeroporto Guarulhos">Filial - Aeroporto Guarulhos</option>
              <option value="Filial - Aeroporto Congonhas">Filial - Aeroporto Congonhas</option>
              <option value="Filial - Shopping Ibirapuera">Filial - Shopping Ibirapuera</option>
              <option value="Filial - Vila Olímpia">Filial - Vila Olímpia</option>
            </select>
          </div>

          <!-- Observações -->
          <div class="mb-6">
            <label for="observations" class="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              id="observations"
              name="observations"
              [(ngModel)]="observations"
              rows="3"
              placeholder="Informações adicionais sobre a reserva..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"></textarea>
          </div>

          <!-- Resumo da Reserva -->
          <div *ngIf="calcularResumo().dias > 0" class="mb-6 bg-purple-50 rounded-lg p-4">
            <h4 class="font-semibold text-purple-900 mb-2">Resumo da Reserva</h4>
            <div class="space-y-1 text-sm text-purple-800">
              <div class="flex justify-between">
                <span>Período:</span>
                <span>{{ calcularResumo().dias }} {{ calcularResumo().dias === 1 ? 'dia' : 'dias' }}</span>
              </div>
              <div class="flex justify-between">
                <span>Valor por dia:</span>
                <span>{{ formatarPreco(veiculo?.dailyRate || 0) }}</span>
              </div>
              <div class="flex justify-between font-semibold text-purple-900 border-t border-purple-200 pt-1">
                <span>Total:</span>
                <span>{{ formatarPreco(calcularResumo().total) }}</span>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div class="flex items-center">
              <i class="bi bi-exclamation-triangle text-red-400 mr-2"></i>
              <span class="text-red-700 text-sm">{{ errorMessage }}</span>
            </div>
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage" class="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <div class="flex items-center">
              <i class="bi bi-check-circle text-green-400 mr-2"></i>
              <span class="text-green-700 text-sm">{{ successMessage }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-200">
            <!-- Debug Info -->
            <div class="text-xs text-gray-500">
              ID: {{ formData.idVehicle || 'Não definido' }}
            </div>
            
            <div class="flex space-x-3">
              <button
                type="button"
                (click)="debugModal()"
                class="px-3 py-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-sm">
                <i class="bi bi-bug mr-1"></i>
                Debug
              </button>
              <button
                type="button"
                (click)="closeModal()"
                [disabled]="isLoading"
                class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50">
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="!reservaForm.form.valid || isLoading || calcularResumo().dias <= 0"
                class="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
                <i *ngIf="isLoading" class="bi bi-arrow-clockwise animate-spin"></i>
                <i *ngIf="!isLoading" class="bi bi-calendar-check"></i>
                <span>{{ isLoading ? 'Processando...' : 'Confirmar Reserva' }}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ReservaModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() veiculo: any = null;
  @Output() closeEvent = new EventEmitter<void>();
  @Output() reservaConfirmada = new EventEmitter<any>();

  formData: ReservaRequest = {
    idVehicle: 0,
    rentalDate: '',
    returnDate: '',
    dailyRate: 0,
    rateType: 'DAILY'
  };

  // Campos do formulário (interface local)
  pickupLocation = '';
  observations = '';

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private reservationService: ReservationService) {}

  ngOnInit() {
    this.updateVehicleId();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['veiculo'] && changes['veiculo'].currentValue) {
      console.log('🔍 Debug Modal:', {
        isOpen: this.isOpen,
        vehicle: this.veiculo,
        formData: this.formData,
        pickupLocation: this.pickupLocation,
        observations: this.observations
      });
      this.updateVehicleId();
    }

    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      console.log('📖 MODAL - Modal aberto, forçando atualização do ID');
      this.updateVehicleId();
    }
  }

  private updateVehicleId() {
    if (this.veiculo) {
      console.log('🚗 MODAL - Atualizando ID do veículo:', this.veiculo.idVehicle);
      this.formData.idVehicle = this.veiculo.idVehicle;
      this.formData.dailyRate = this.veiculo.dailyRate;
      console.log('📋 MODAL - FormData atualizado:', this.formData);
    } else {
      console.warn('⚠️ MODAL - Nenhum veículo fornecido');
    }
  }

  closeModal() {
    if (!this.isLoading) {
      this.resetForm();
      this.closeEvent.emit();
    }
  }

  resetForm() {
    const vehicleId = this.veiculo?.idVehicle || 0;
    console.log('🔄 MODAL - Resetando form com ID do veículo:', vehicleId);
    
    this.formData = {
      idVehicle: vehicleId,
      rentalDate: '',
      returnDate: '',
      dailyRate: this.veiculo?.dailyRate || 0,
      rateType: 'DAILY'
    };

    this.pickupLocation = '';
    this.observations = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = false;
  }

  getMinDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  getMinReturnDate(): string {
    if (this.formData.rentalDate) {
      const pickupDate = new Date(this.formData.rentalDate);
      pickupDate.setDate(pickupDate.getDate() + 1); // Mínimo 1 dia após a retirada
      return pickupDate.toISOString().split('T')[0];
    }
    return this.getMinDate();
  }

  onDateChange(): void {
    // Validar se a data de devolução é posterior à data de retirada
    if (this.formData.rentalDate && this.formData.returnDate) {
      const pickup = new Date(this.formData.rentalDate);
      const returnDate = new Date(this.formData.returnDate);
      
      if (returnDate <= pickup) {
        // Auto-ajustar data de devolução para um dia após a retirada
        const nextDay = new Date(pickup);
        nextDay.setDate(nextDay.getDate() + 1);
        this.formData.returnDate = nextDay.toISOString().split('T')[0];
      }

      // Calcular quantidade de dias
      this.calculateRentalDays();
    }
  }

  private calculateRentalDays(): void {
    if (this.formData.rentalDate && this.formData.returnDate) {
      const pickup = new Date(this.formData.rentalDate);
      const returnDate = new Date(this.formData.returnDate);
      const diffTime = returnDate.getTime() - pickup.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      this.formData.rentalDays = Math.max(0, days);
    }
  }

  getImagemVeiculo(): string {
    if (this.veiculo?.imgUrl) {
      return this.veiculo.imgUrl;
    }
    
    const imagensPadrao: {[key: number]: string} = {
      0: 'assets/images/vehicle-cargo.svg',
      1: 'assets/images/vehicle-motorcycle.svg',
      2: 'assets/images/vehicle-passenger.svg',
      3: 'assets/images/vehicle-leisure.svg'
    };
    
    return imagensPadrao[this.veiculo?.type || 2] || 'assets/images/car-placeholder.svg';
  }

  formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  }

  calcularResumo() {
    if (!this.formData.rentalDate || !this.formData.returnDate || !this.veiculo) {
      return { dias: 0, total: 0 };
    }

    const dataInicio = new Date(this.formData.rentalDate);
    const dataFim = new Date(this.formData.returnDate);
    const diffTime = dataFim.getTime() - dataInicio.getTime();
    const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const total = dias > 0 ? dias * this.veiculo.dailyRate : 0;

    return { dias: Math.max(0, dias), total };
  }

  onSubmit() {
    if (this.isLoading) return;

    // Validação extra para garantir que o ID do veículo está presente
    if (!this.formData.idVehicle || this.formData.idVehicle === 0) {
      console.error('❌ MODAL - ID do veículo não encontrado!', {
        formData: this.formData,
        veiculo: this.veiculo
      });
      this.errorMessage = 'Erro interno: ID do veículo não identificado. Tente novamente.';
      return;
    }

    // Calcular dias finais antes de enviar
    this.calculateRentalDays();

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('🚗 MODAL - Enviando dados da reserva:', this.formData);
    console.log('🔍 MODAL - Veículo selecionado:', this.veiculo);
    console.log('🆔 MODAL - ID do veículo:', this.formData.idVehicle);
    console.log('📅 MODAL - Período:', this.formData.rentalDate, 'até', this.formData.returnDate);
    console.log('🔢 MODAL - Dias:', this.formData.rentalDays);

    this.reservationService.createReservation(this.formData).subscribe({
      next: (response) => {
        console.log('✅ Resposta da reserva:', response);

        const isSuccess = response?.success === true || response?.code === "200" || response?.code === "201";
        
        if (isSuccess) {
          this.successMessage = 'Reserva confirmada com sucesso!';
          
          setTimeout(() => {
            this.reservaConfirmada.emit({
              reserva: response?.data,
              veiculo: this.veiculo,
              formData: this.formData
            });
            this.closeModal();
          }, 2000);
          
        } else {
          this.errorMessage = response?.message || 'Erro ao confirmar reserva';
        }

        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('❌ Erro ao fazer reserva:', error);
        
        if (error.status === 0) {
          this.errorMessage = 'Não foi possível conectar ao servidor. Tente novamente.';
        } else if (error.status === 401) {
          this.errorMessage = 'Acesso não autorizado. Faça login novamente.';
        } else if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Dados inválidos. Verifique as informações.';
        } else if (error.status === 409) {
          this.errorMessage = 'Veículo não disponível no período selecionado.';
        } else {
          this.errorMessage = error.message || 'Erro inesperado. Tente novamente.';
        }

        this.isLoading = false;
      }
    });
  }

  /**
   * Debug do modal
   */
  debugModal() {
    const debugInfo = {
      isOpen: this.isOpen,
      veiculo: this.veiculo,
      formData: this.formData,
      vehicleIdFromVeiculo: this.veiculo?.idVehicle,
      vehicleIdFromFormData: this.formData.idVehicle,
      pickupLocation: this.pickupLocation,
      observations: this.observations
    };
    
    console.log('🐛 DEBUG MODAL:', debugInfo);
    
    alert(`🐛 DEBUG MODAL DE RESERVA:

📋 Modal Estado:
- Aberto: ${this.isOpen}
- Loading: ${this.isLoading}

🚗 Veículo:
- Presente: ${!!this.veiculo}
- ID Original: ${this.veiculo?.idVehicle || 'undefined'}
- Marca/Modelo: ${this.veiculo?.brand || ''} ${this.veiculo?.model || ''}

📝 Form Data:
- Vehicle ID: ${this.formData.idVehicle}
- Rental Date: ${this.formData.rentalDate || 'não definida'}
- Return Date: ${this.formData.returnDate || 'não definida'}
- Location: ${this.pickupLocation || 'não definida'}
- Days: ${this.formData.rentalDays || 'não calculado'}
- Daily Rate: ${this.formData.dailyRate || 'não definida'}

Verifique o console (F12) para mais detalhes.`);
  }
}