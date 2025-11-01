import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { LoginRequest } from '../../../core/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  returnUrl: string = '/dashboard';
  
  private subscriptions = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    
    // Obter URL de retorno dos query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    
    // Verificar se já está logado
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }

    // Verificar se veio de cadastro bem-sucedido
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['registered']) {
      this.successMessage = 'Cadastro realizado com sucesso! Faça login para continuar.';
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const credentials: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    const loginSub = this.authService.login(credentials)
      .subscribe({
        next: (response) => {
          console.log('Login bem-sucedido:', response);
          this.isLoading = false;
          
          // Redirecionar para a URL de retorno ou dashboard
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          console.error('Erro no login:', error);
          this.isLoading = false;
          this.errorMessage = error.message || 'Erro ao fazer login. Tente novamente.';
        }
      });

    this.subscriptions.add(loginSub);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters para facilitar acesso aos controles do form
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  // Métodos para verificar erros de validação
  hasEmailError(): boolean {
    const emailControl = this.email;
    return !!(emailControl?.invalid && (emailControl?.dirty || emailControl?.touched));
  }

  hasPasswordError(): boolean {
    const passwordControl = this.password;
    return !!(passwordControl?.invalid && (passwordControl?.dirty || passwordControl?.touched));
  }

  getEmailErrorMessage(): string {
    if (this.email?.hasError('required')) {
      return 'Email é obrigatório';
    }
    if (this.email?.hasError('email')) {
      return 'Email deve ter um formato válido';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    if (this.password?.hasError('required')) {
      return 'Senha é obrigatória';
    }
    if (this.password?.hasError('minlength')) {
      return 'Senha deve ter pelo menos 3 caracteres';
    }
    return '';
  }
}
