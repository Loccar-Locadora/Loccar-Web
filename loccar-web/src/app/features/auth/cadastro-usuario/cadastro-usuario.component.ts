import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { RegisterRequest } from '../../../core/models/auth.models';

@Component({
  selector: 'app-cadastro-usuario',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './cadastro-usuario.component.html',
  styleUrls: ['./cadastro-usuario.component.css']
})
export class CadastroUsuarioComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  private subscriptions = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redireciona para o dashboard se já estiver logado
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', [Validators.required]],
      driverLicense: ['', [Validators.required, Validators.minLength(11)]],
      cellPhone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]]
    }, { 
      validators: this.passwordMatchValidator 
    });
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

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.registerForm.value;
    const registerData: RegisterRequest = {
      username: formValue.username,
      email: formValue.email,
      password: formValue.password,
      driverLicense: formValue.driverLicense,
      cellPhone: formValue.cellPhone
    };

    const registerSub = this.authService.register(registerData)
      .subscribe({
        next: (response) => {
          console.log('Cadastro bem-sucedido:', response);
          this.isLoading = false;
          
          // Navegar para login com mensagem de sucesso
          this.router.navigate(['/login'], { 
            state: { registered: true }
          });
        },
        error: (error) => {
          console.error('Erro no cadastro:', error);
          this.isLoading = false;
          this.errorMessage = error.message || 'Erro ao criar conta. Tente novamente.';
        }
      });

    this.subscriptions.add(registerSub);
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters para facilitar acesso aos controles do form
  get username() { return this.registerForm.get('username'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get driverLicense() { return this.registerForm.get('driverLicense'); }
  get cellPhone() { return this.registerForm.get('cellPhone'); }

  // Métodos para verificar erros de validação
  hasFieldError(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    switch (fieldName) {
      case 'username':
        if (errors['required']) return 'Nome é obrigatório';
        if (errors['minlength']) return 'Nome deve ter pelo menos 2 caracteres';
        break;
      case 'email':
        if (errors['required']) return 'Email é obrigatório';
        if (errors['email']) return 'Email deve ter um formato válido';
        break;
      case 'password':
        if (errors['required']) return 'Senha é obrigatória';
        if (errors['minlength']) return 'Senha deve ter pelo menos 4 caracteres';
        break;
      case 'confirmPassword':
        if (errors['required']) return 'Confirmação de senha é obrigatória';
        if (errors['passwordMismatch']) return 'Senhas não coincidem';
        break;
      case 'driverLicense':
        if (errors['required']) return 'CNH é obrigatória';
        if (errors['minlength']) return 'CNH deve ter pelo menos 11 caracteres';
        break;
      case 'cellPhone':
        if (errors['required']) return 'Celular é obrigatório';
        if (errors['pattern']) return 'Celular deve ter 10 ou 11 dígitos';
        break;
    }

    return '';
  }
}
