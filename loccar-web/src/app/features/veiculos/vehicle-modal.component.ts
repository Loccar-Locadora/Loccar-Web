import { Component, EventEmitter, Input, OnInit, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { VehicleService } from '../../services/vehicle.service';

export interface VehicleFormData {
  // ID para edição
  idVehicle?: string | number;
  
  // Dados básicos
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
  imgUrl: string;
  
  // Tipo do veículo (string no formulário, será convertido para número na API)
  vehicleType: 'cargo' | 'passenger' | 'leisure' | 'motorcycle';
  
  // Dados específicos por tipo
  cargoVehicle?: {
    cargoCapacity: number;
    cargoType: string;
    tareWeight: number;
    cargoCompartmentSize: string;
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
  
  motorcycle?: {
    tractionControl: boolean;
    absBrakes: boolean;
    cruiseControl: boolean;
  };
}

@Component({
  selector: 'app-vehicle-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">{{ isEditMode ? 'Editar Veículo' : 'Adicionar Veículo' }}</h2>
          <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
            <i class="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        <!-- Form -->
        <form [formGroup]="vehicleForm" (ngSubmit)="onSubmit()" class="p-6">
          <p class="text-gray-600 mb-6">{{ isEditMode ? 'Edite os dados do veículo' : 'Adicione um novo veículo à frota' }}</p>

          <!-- Dados Básicos -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <!-- Marca -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Marca</label>
              <input
                type="text"
                formControlName="brand"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Toyota">
            </div>

            <!-- Modelo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
              <input
                type="text"
                formControlName="model"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Corolla">
            </div>

            <!-- Ano de Fabricação -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ano de Fabricação</label>
              <input
                type="number"
                formControlName="manufacturingYear"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1900"
                max="2030">
            </div>

            <!-- Ano do Modelo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ano do Modelo</label>
              <select
                formControlName="modelYear"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Selecionar</option>
                <option *ngFor="let year of availableYears" [value]="year">{{ year }}</option>
              </select>
            </div>

            <!-- Categoria -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                formControlName="vehicleType"
                (change)="onVehicleTypeChange($event)"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Selecionar</option>
                <option value="cargo">Veículo de Carga</option>
                <option value="passenger">Veículo de Passageiros</option>
                <option value="leisure">Veículo de Lazer</option>
                <option value="motorcycle">Motocicleta</option>
              </select>
            </div>

            <!-- Preço por Dia -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Preço por Dia (R$)</label>
              <input
                type="number"
                formControlName="dailyRate"
                step="0.01"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0,00">
            </div>
          </div>

          <!-- Preços Adicionais -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <!-- Preço Mensal -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Preço Mensal (R$)</label>
              <input
                type="number"
                formControlName="monthlyRate"
                step="0.01"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0,00">
            </div>

            <!-- Preço Empresa -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Preço Empresa (R$)</label>
              <input
                type="number"
                formControlName="companyDailyRate"
                step="0.01"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0,00">
            </div>

            <!-- Preço Reduzido -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Preço Reduzido (R$)</label>
              <input
                type="number"
                formControlName="reducedDailyRate"
                step="0.01"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0,00">
            </div>
          </div>

          <!-- Dados Técnicos -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <!-- Capacidade do Tanque -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Capacidade do Tanque (L)</label>
              <input
                type="number"
                formControlName="fuelTankCapacity"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 50">
            </div>

            <!-- VIN -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">VIN</label>
              <input
                type="text"
                formControlName="vin"
                maxlength="17"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Número de chassi (17 caracteres)">
            </div>

            <!-- URL da Imagem -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
              <input
                type="url"
                formControlName="imgUrl"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://exemplo.com/imagem.jpg">
            </div>
          </div>

          <!-- Características Específicas -->
          <div *ngIf="selectedVehicleType" class="mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Características {{ getVehicleTypeLabel(selectedVehicleType) }}
            </h3>
            
            <!-- Veículo de Carga -->
            <div *ngIf="selectedVehicleType === 'cargo'" formGroupName="cargoVehicle" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Capacidade de Carga (kg)</label>
                <input
                  type="number"
                  formControlName="cargoCapacity"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Carga</label>
                <input
                  type="text"
                  formControlName="cargoType"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Seca, Refrigerada">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Peso da Tara (kg)</label>
                <input
                  type="number"
                  formControlName="tareWeight"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tamanho do Compartimento</label>
                <input
                  type="text"
                  formControlName="cargoCompartmentSize"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 2x3x1.5m">
              </div>
            </div>

            <!-- Veículo de Passageiros -->
            <div *ngIf="selectedVehicleType === 'passenger'" formGroupName="passengerVehicle" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Capacidade de Passageiros</label>
                <input
                  type="number"
                  formControlName="passengerCapacity"
                  min="1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>
              <div class="flex items-center space-x-4 pt-6">
                <label class="flex items-center space-x-2">
                  <input type="checkbox" formControlName="tv" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="text-sm text-gray-700">TV</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input type="checkbox" formControlName="airConditioning" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="text-sm text-gray-700">Ar Condicionado</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input type="checkbox" formControlName="powerSteering" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="text-sm text-gray-700">Direção Hidráulica</span>
                </label>
              </div>
            </div>

            <!-- Veículo de Lazer -->
            <div *ngIf="selectedVehicleType === 'leisure'" formGroupName="leisureVehicle" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  formControlName="category"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Selecionar</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatch">Hatch</option>
                  <option value="Conversível">Conversível</option>
                </select>
              </div>
              <div class="flex items-center space-x-4 pt-6">
                <label class="flex items-center space-x-2">
                  <input type="checkbox" formControlName="automatic" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="text-sm text-gray-700">Automático</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input type="checkbox" formControlName="powerSteering" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="text-sm text-gray-700">Direção Hidráulica</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input type="checkbox" formControlName="airConditioning" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="text-sm text-gray-700">Ar Condicionado</span>
                </label>
              </div>
            </div>

            <!-- Motocicleta -->
            <div *ngIf="selectedVehicleType === 'motorcycle'" formGroupName="motorcycle" class="grid grid-cols-1 gap-4">
              <div class="flex items-center space-x-4">
                <label class="flex items-center space-x-2">
                  <input type="checkbox" formControlName="tractionControl" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="text-sm text-gray-700">Controle de Tração</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input type="checkbox" formControlName="absBrakes" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="text-sm text-gray-700">Freios ABS</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input type="checkbox" formControlName="cruiseControl" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="text-sm text-gray-700">Piloto Automático</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {{ errorMessage }}
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage" class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
            {{ successMessage }}
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              (click)="closeModal()"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="vehicleForm.invalid || isSubmitting"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <span *ngIf="!isSubmitting">Salvar</span>
              <span *ngIf="isSubmitting" class="flex items-center">
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Salvando...
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class VehicleModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() vehicleData: VehicleFormData | null = null;
  @Input() isEditMode = false;
  @Output() closeEvent = new EventEmitter<void>();
  @Output() submitEvent = new EventEmitter<VehicleFormData>();

  vehicleForm!: FormGroup;
  selectedVehicleType: string = '';
  isSubmitting = false;
  availableYears: number[] = [];
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService
  ) {}

  ngOnInit(): void {
    this.generateAvailableYears();
    this.initializeForm();
    if (this.vehicleData && this.isEditMode) {
      this.populateForm(this.vehicleData);
    }
  }

  ngOnChanges(): void {
    // Reinicializar o formulário quando os inputs mudarem
    if (this.vehicleForm) {
      this.initializeForm();
      if (this.vehicleData && this.isEditMode) {
        this.populateForm(this.vehicleData);
      }
    }
  }

  private generateAvailableYears(): void {
    const currentYear = new Date().getFullYear();
    this.availableYears = [];
    for (let year = currentYear + 1; year >= 1990; year--) {
      this.availableYears.push(year);
    }
  }

  private initializeForm(): void {
    this.vehicleForm = this.fb.group({
      brand: ['', [Validators.required]],
      model: ['', [Validators.required]],
      manufacturingYear: ['', [Validators.required, Validators.min(1900)]],
      modelYear: ['', [Validators.required]],
      vehicleType: ['', [Validators.required]],
      dailyRate: ['', [Validators.required, Validators.min(0)]],
      monthlyRate: [''],
      companyDailyRate: [''],
      reducedDailyRate: [''],
      fuelTankCapacity: ['', [Validators.required, Validators.min(1)]],
      vin: ['', [Validators.required]],
      imgUrl: [''],

      // Grupos condicionais
      cargoVehicle: this.fb.group({
        cargoCapacity: [''],
        cargoType: [''],
        tareWeight: [''],
        cargoCompartmentSize: ['']
      }),
      passengerVehicle: this.fb.group({
        passengerCapacity: [''],
        tv: [false],
        airConditioning: [false],
        powerSteering: [false]
      }),
      leisureVehicle: this.fb.group({
        automatic: [false],
        powerSteering: [false],
        airConditioning: [false],
        category: ['']
      }),
      motorcycle: this.fb.group({
        tractionControl: [false],
        absBrakes: [false],
        cruiseControl: [false]
      })
    });
  }

  onVehicleTypeChange(event: any): void {
    this.selectedVehicleType = event.target.value;
    this.updateValidators();
  }

  private updateValidators(): void {
    // Limpar validadores dos grupos não selecionados
    const cargoGroup = this.vehicleForm.get('cargoVehicle') as FormGroup;
    const passengerGroup = this.vehicleForm.get('passengerVehicle') as FormGroup;
    const leisureGroup = this.vehicleForm.get('leisureVehicle') as FormGroup;
    const motorcycleGroup = this.vehicleForm.get('motorcycle') as FormGroup;

    // Remover validadores de todos os grupos
    this.clearGroupValidators(cargoGroup);
    this.clearGroupValidators(passengerGroup);
    this.clearGroupValidators(leisureGroup);
    this.clearGroupValidators(motorcycleGroup);

    // Adicionar validadores específicos baseado no tipo selecionado
    switch (this.selectedVehicleType) {
      case 'cargo':
        cargoGroup.get('cargoCapacity')?.setValidators([Validators.required, Validators.min(1)]);
        cargoGroup.get('cargoType')?.setValidators([Validators.required]);
        cargoGroup.get('tareWeight')?.setValidators([Validators.required, Validators.min(1)]);
        cargoGroup.get('cargoCompartmentSize')?.setValidators([Validators.required]);
        break;
      case 'passenger':
        passengerGroup.get('passengerCapacity')?.setValidators([Validators.required, Validators.min(1)]);
        break;
      case 'leisure':
        leisureGroup.get('category')?.setValidators([Validators.required]);
        break;
      case 'motorcycle':
        // Motocicletas não têm campos obrigatórios específicos além dos booleanos
        break;
    }

    // Atualizar validação
    cargoGroup.updateValueAndValidity();
    passengerGroup.updateValueAndValidity();
    leisureGroup.updateValueAndValidity();
    motorcycleGroup.updateValueAndValidity();
  }

  private clearGroupValidators(group: FormGroup): void {
    Object.keys(group.controls).forEach(key => {
      group.get(key)?.clearValidators();
      group.get(key)?.updateValueAndValidity();
    });
  }

  private populateForm(data: VehicleFormData): void {
    console.log('Populando formulário de veículo com dados:', data);
    
    // Popular campos básicos
    this.vehicleForm.patchValue({
      brand: data.brand,
      model: data.model,
      manufacturingYear: data.manufacturingYear,
      modelYear: data.modelYear,
      vehicleType: data.vehicleType,
      dailyRate: data.dailyRate,
      monthlyRate: data.monthlyRate || 0,
      companyDailyRate: data.companyDailyRate || 0,
      reducedDailyRate: data.reducedDailyRate || 0,
      fuelTankCapacity: data.fuelTankCapacity,
      vin: data.vin,
      imgUrl: data.imgUrl || ''
    });

    // Definir o tipo selecionado e popular dados específicos
    this.selectedVehicleType = data.vehicleType;
    
    // Popular dados específicos por tipo
    if (data.cargoVehicle) {
      this.vehicleForm.get('cargoVehicle')?.patchValue(data.cargoVehicle);
    }
    if (data.passengerVehicle) {
      this.vehicleForm.get('passengerVehicle')?.patchValue(data.passengerVehicle);
    }
    if (data.leisureVehicle) {
      this.vehicleForm.get('leisureVehicle')?.patchValue(data.leisureVehicle);
    }
    if (data.motorcycle) {
      this.vehicleForm.get('motorcycle')?.patchValue(data.motorcycle);
    }

    // Atualizar validadores baseado no tipo
    this.updateValidators();
    
    console.log('Valores do formulário após popular:', this.vehicleForm.value);
  }

  getVehicleTypeLabel(type: string): string {
    const labels: {[key: string]: string} = {
      cargo: 'de Carga',
      passenger: 'de Passageiros', 
      leisure: 'de Lazer',
      motorcycle: 'Motocicleta'
    };
    return labels[type] || '';
  }

  closeModal(): void {
    this.closeEvent.emit();
  }

  onSubmit(): void {
    console.log('Tentando submeter formulário de veículo...');
    console.log('Status do formulário:', {
      valid: this.vehicleForm.valid,
      invalid: this.vehicleForm.invalid,
      isEditMode: this.isEditMode,
      vehicleData: this.vehicleData
    });
    
    if (this.vehicleForm.invalid) {
      console.log('Formulário inválido:', this.getFormErrors());
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const formData = this.vehicleForm.value;
    console.log('Dados do formulário:', formData);

    const vehicleData: VehicleFormData = {
      brand: formData.brand,
      model: formData.model,
      manufacturingYear: formData.manufacturingYear,
      modelYear: formData.modelYear,
      dailyRate: formData.dailyRate,
      monthlyRate: formData.monthlyRate || 0,
      companyDailyRate: formData.companyDailyRate || 0,
      reducedDailyRate: formData.reducedDailyRate || 0,
      fuelTankCapacity: formData.fuelTankCapacity,
      vin: formData.vin,
      imgUrl: formData.imgUrl || '',
      vehicleType: formData.vehicleType
    };

    // Adicionar ID se for edição
    if (this.isEditMode && this.vehicleData?.idVehicle) {
      vehicleData.idVehicle = this.vehicleData.idVehicle;
    }

    // Adicionar dados específicos baseado no tipo
    switch (formData.vehicleType) {
      case 'cargo':
        vehicleData.cargoVehicle = formData.cargoVehicle;
        break;
      case 'passenger':
        vehicleData.passengerVehicle = formData.passengerVehicle;
        break;
      case 'leisure':
        vehicleData.leisureVehicle = formData.leisureVehicle;
        break;
      case 'motorcycle':
        vehicleData.motorcycle = formData.motorcycle;
        break;
    }

    if (this.isEditMode) {
      // Modo de edição - chamar API de update
      const updateData = {
        ...vehicleData,
        idVehicle: Number(this.vehicleData?.idVehicle)
      };

      this.vehicleService.updateVehicle(updateData).subscribe({
        next: (response) => {
          console.log('Veículo atualizado com sucesso:', response);
          this.isSubmitting = false;
          this.successMessage = 'Veículo atualizado com sucesso!';
          
          setTimeout(() => {
            this.submitEvent.emit(vehicleData);
            this.closeModal();
          }, 2000);
        },
        error: (error) => {
          console.error('Erro ao atualizar veículo:', error);
          this.isSubmitting = false;
          this.errorMessage = error.message || 'Erro ao atualizar veículo. Tente novamente.';
        }
      });
    } else {
      // Modo de criação - emitir evento como antes
      console.log('DEBUG MODAL - Emitindo dados para criação:', vehicleData);
      console.log('DEBUG MODAL - Tipo do veículo:', vehicleData.vehicleType);
      this.submitEvent.emit(vehicleData);
    }
  }

  resetForm(): void {
    this.vehicleForm.reset();
    this.selectedVehicleType = '';
    this.isSubmitting = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Método para debug - listar erros do formulário
  getFormErrors(): {field: string, errors: any}[] {
    const errors: {field: string, errors: any}[] = [];
    
    // Verificar campos principais
    Object.keys(this.vehicleForm.controls).forEach(key => {
      const control = this.vehicleForm.get(key);
      if (control && control.errors) {
        errors.push({field: key, errors: control.errors});
      }
    });

    // Verificar grupos específicos se um tipo foi selecionado
    if (this.selectedVehicleType) {
      const groupName = this.getGroupNameByType(this.selectedVehicleType);
      if (groupName) {
        const group = this.vehicleForm.get(groupName) as FormGroup;
        if (group) {
          Object.keys(group.controls).forEach(key => {
            const control = group.get(key);
            if (control && control.errors) {
              errors.push({field: `${groupName}.${key}`, errors: control.errors});
            }
          });
        }
      }
    }

    return errors;
  }

  private getGroupNameByType(type: string): string {
    const groupMap: {[key: string]: string} = {
      cargo: 'cargoVehicle',
      passenger: 'passengerVehicle',
      leisure: 'leisureVehicle',
      motorcycle: 'motorcycle'
    };
    return groupMap[type] || '';
  }
}