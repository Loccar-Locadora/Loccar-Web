import { Component, EventEmitter, Input, OnInit, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../core/models/auth.models';
import { CustomerService, Customer } from '../../services/customer.service';

export interface UserFormData {
  id?: string;
  username: string;
  email: string;
  password?: string;
  driverLicense: string;
  cellPhone: string;
}

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-auto">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">{{ isEditMode ? 'Editar Usuário' : 'Adicionar Usuário' }}</h2>
          <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
            <i class="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        <!-- Form -->
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="p-6">
          <p class="text-gray-600 mb-6">{{ isEditMode ? 'Edite os dados do usuário' : 'Adicione um novo usuário ao sistema' }}</p>

          <!-- Dados do Usuário -->
          <div class="space-y-4">
            <!-- Nome de Usuário -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome de Usuário</label>
              <input
                type="text"
                formControlName="username"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="userForm.get('username')?.invalid && userForm.get('username')?.touched"
                placeholder="Ex: João Silva">
              <div *ngIf="userForm.get('username')?.invalid && userForm.get('username')?.touched" class="mt-1 text-sm text-red-600">
                <div *ngIf="userForm.get('username')?.errors?.['required']">Nome de usuário é obrigatório</div>
                <div *ngIf="userForm.get('username')?.errors?.['minlength']">Nome deve ter pelo menos 2 caracteres</div>
              </div>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                formControlName="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="userForm.get('email')?.invalid && userForm.get('email')?.touched"
                placeholder="Ex: joao@email.com">
              <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" class="mt-1 text-sm text-red-600">
                <div *ngIf="userForm.get('email')?.errors?.['required']">Email é obrigatório</div>
                <div *ngIf="userForm.get('email')?.errors?.['email']">Email deve ter formato válido</div>
              </div>
            </div>

            <!-- Senha -->
            <div *ngIf="!isEditMode">
              <label class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <div class="relative">
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  [class.border-red-500]="userForm.get('password')?.invalid && userForm.get('password')?.touched"
                  placeholder="Digite a senha">
                <button
                  type="button"
                  (click)="togglePasswordVisibility()"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                  <i [class]="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
              <div *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched" class="mt-1 text-sm text-red-600">
                <div *ngIf="userForm.get('password')?.errors?.['required']">Senha é obrigatória</div>
                <div *ngIf="userForm.get('password')?.errors?.['minlength']">Senha deve ter pelo menos 4 caracteres</div>
              </div>
            </div>

            <!-- Confirmar Senha -->
            <div *ngIf="!isEditMode">
              <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
              <div class="relative">
                <input
                  [type]="showConfirmPassword ? 'text' : 'password'"
                  formControlName="confirmPassword"
                  class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  [class.border-red-500]="userForm.get('confirmPassword')?.invalid && userForm.get('confirmPassword')?.touched"
                  placeholder="Confirme a senha">
                <button
                  type="button"
                  (click)="toggleConfirmPasswordVisibility()"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                  <i [class]="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
              <div *ngIf="userForm.get('confirmPassword')?.invalid && userForm.get('confirmPassword')?.touched" class="mt-1 text-sm text-red-600">
                <div *ngIf="userForm.get('confirmPassword')?.errors?.['required']">Confirmação de senha é obrigatória</div>
                <div *ngIf="userForm.get('confirmPassword')?.errors?.['passwordMismatch']">Senhas não conferem</div>
              </div>
            </div>

            <!-- CNH -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">CNH</label>
              <input
                type="text"
                formControlName="driverLicense"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="userForm.get('driverLicense')?.invalid && userForm.get('driverLicense')?.touched"
                placeholder="Ex: 12345678901"
                maxlength="11">
              <div *ngIf="userForm.get('driverLicense')?.invalid && userForm.get('driverLicense')?.touched" class="mt-1 text-sm text-red-600">
                <div *ngIf="userForm.get('driverLicense')?.errors?.['required']">CNH é obrigatória</div>
                <div *ngIf="userForm.get('driverLicense')?.errors?.['minlength']">CNH deve ter 11 dígitos</div>
              </div>
            </div>

            <!-- Celular -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Celular</label>
              <input
                type="text"
                formControlName="cellPhone"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="userForm.get('cellPhone')?.invalid && userForm.get('cellPhone')?.touched"
                placeholder="Ex: 11999888777"
                maxlength="11">
              <div *ngIf="userForm.get('cellPhone')?.invalid && userForm.get('cellPhone')?.touched" class="mt-1 text-sm text-red-600">
                <div *ngIf="userForm.get('cellPhone')?.errors?.['required']">Celular é obrigatório</div>
                <div *ngIf="userForm.get('cellPhone')?.errors?.['pattern']">Celular deve ter 10 ou 11 dígitos</div>
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
              [disabled]="userForm.invalid || isSubmitting"
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
export class UserModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() userData: UserFormData | null = null;
  @Input() isEditMode = false;
  @Output() closeEvent = new EventEmitter<void>();
  @Output() submitEvent = new EventEmitter<UserFormData>();

  userForm!: FormGroup;
  isSubmitting = false;
  showPassword = false;
  showConfirmPassword = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    if (this.userData && this.isEditMode) {
      this.populateForm(this.userData);
    }
  }

  ngOnChanges(): void {
    // Reinicializar o formulário quando os inputs mudarem
    if (this.userForm) {
      this.initializeForm();
      if (this.userData && this.isEditMode) {
        this.populateForm(this.userData);
      }
    }
  }

  private initializeForm(): void {
    const passwordValidators = this.isEditMode ? [] : [Validators.required, Validators.minLength(4)];
    const confirmPasswordValidators = this.isEditMode ? [] : [Validators.required];

    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', passwordValidators],
      confirmPassword: ['', confirmPasswordValidators],
      driverLicense: ['', [Validators.required, Validators.minLength(11)]],
      cellPhone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]]
    }, { 
      validators: this.isEditMode ? null : this.passwordMatchValidator 
    });
  }

  private populateForm(data: UserFormData): void {
    console.log('Populando formulário com dados:', data);
    this.userForm.patchValue({
      username: data.username,
      email: data.email,
      driverLicense: data.driverLicense,
      cellPhone: data.cellPhone
    });
    console.log('Valores do formulário após popular:', this.userForm.value);
  }

  // Validador customizado para confirmar senha
  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword?.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    
    return null;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  closeModal(): void {
    this.resetForm();
    this.closeEvent.emit();
  }

  onSubmit(): void {
    console.log('Tentando submeter formulário...');
    console.log('Status do formulário:', {
      valid: this.userForm.valid,
      invalid: this.userForm.invalid,
      isEditMode: this.isEditMode,
      userData: this.userData
    });
    
    if (this.userForm.invalid) {
      console.log('Formulário inválido:', this.getFormErrors());
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.userForm.value;
    console.log('Dados do formulário:', formValue);

    if (this.isEditMode) {
      // Modo de edição
      const customerData: Customer = {
        idCustomer: Number(this.userData?.id),
        username: formValue.username,
        email: formValue.email,
        cellphone: formValue.cellPhone,
        driverLicense: formValue.driverLicense
      };

      this.customerService.updateCustomer(customerData).subscribe({
        next: (response) => {
          console.log('Usuário atualizado com sucesso:', response);
          this.isSubmitting = false;
          this.successMessage = 'Usuário atualizado com sucesso!';
          
          const userData: UserFormData = {
            id: this.userData?.id,
            username: formValue.username,
            email: formValue.email,
            driverLicense: formValue.driverLicense,
            cellPhone: formValue.cellPhone
          };
          
          this.submitEvent.emit(userData);
          
          setTimeout(() => {
            this.closeModal();
          }, 2000);
        },
        error: (error) => {
          console.error('Erro ao atualizar usuário:', error);
          this.isSubmitting = false;
          this.errorMessage = error.message || 'Erro ao atualizar usuário. Tente novamente.';
        }
      });
    } else {
      // Modo de cadastro
      const registerData: RegisterRequest = {
        username: formValue.username,
        email: formValue.email,
        password: formValue.password,
        driverLicense: formValue.driverLicense,
        cellPhone: formValue.cellPhone
      };

      this.authService.register(registerData).subscribe({
        next: (response) => {
          console.log('Usuário cadastrado com sucesso:', response);
          this.isSubmitting = false;
          this.successMessage = 'Usuário cadastrado com sucesso!';
          
          const userData: UserFormData = {
            username: formValue.username,
            email: formValue.email,
            password: formValue.password,
            driverLicense: formValue.driverLicense,
            cellPhone: formValue.cellPhone
          };
          
          this.submitEvent.emit(userData);
          
          setTimeout(() => {
            this.closeModal();
          }, 2000);
        },
        error: (error) => {
          console.error('Erro ao cadastrar usuário:', error);
          this.isSubmitting = false;
          
          if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else if (error.message) {
            this.errorMessage = error.message;
          } else {
            this.errorMessage = 'Erro ao cadastrar usuário. Tente novamente.';
          }
        }
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  resetForm(): void {
    this.userForm.reset();
    this.isSubmitting = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.showPassword = false;
    this.showConfirmPassword = false;
  }

  // Método para debug - mostrar erros do formulário
  getFormErrors(): any {
    const formErrors: any = {};
    Object.keys(this.userForm.controls).forEach(key => {
      const controlErrors = this.userForm.get(key)?.errors;
      if (controlErrors) {
        formErrors[key] = controlErrors;
      }
    });
    return formErrors;
  }
}