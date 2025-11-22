import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RedirectService } from '../../../services/redirect.service';
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
  returnUrl: string = '';
  
  private subscriptions = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private redirectService: RedirectService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    
    // Obter URL de retorno dos query params ou usar redirecionamento inteligente
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
    
    // Verificar se já está logado (com pequeno delay para garantir que logout foi processado)
    setTimeout(() => {
      console.log('Login ngOnInit - verificando autenticação:', this.authService.isAuthenticated());
      console.log('Login ngOnInit - token existe:', !!this.authService.getToken());
      
      if (this.authService.isAuthenticated()) {
        const redirectUrl = this.getRedirectUrl();
        console.log('Usuário já logado, redirecionando para:', redirectUrl);
        this.router.navigate([redirectUrl]);
      }
    }, 100);

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
          console.log('Login concluído com sucesso:', response);
          
          // Aguardar um ciclo para garantir que todos os dados foram persistidos
          setTimeout(() => {
            console.log('Verificando autenticação após login...');
            console.log('- isAuthenticated():', this.authService.isAuthenticated());
            console.log('- getCurrentUser():', this.authService.getCurrentUser());
            console.log('- getToken():', !!this.authService.getToken());
            
            const currentUser = this.authService.getCurrentUser();
            
            if (currentUser && this.authService.isAuthenticated()) {
              console.log('✅ Login concluído, iniciando redirecionamento...');
              this.isLoading = false;
              
              // Usar o serviço de redirecionamento dedicado
              this.redirectService.redirectAfterLogin();
            } else {
              console.error('❌ Dados de autenticação não estão disponíveis após login');
              console.error('- currentUser:', currentUser);
              console.error('- isAuthenticated:', this.authService.isAuthenticated());
              this.isLoading = false;
              this.errorMessage = 'Erro interno. Tente fazer login novamente.';
            }
          }, 100); // Pequeno delay para garantir persistência
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

  /**
   * Determina a URL de redirecionamento baseada no role do usuário
   */
  private getRedirectUrl(): string {
    // Se foi especificada uma URL de retorno nos query params, usar ela
    if (this.returnUrl) {
      console.log('Usando returnUrl dos query params:', this.returnUrl);
      return this.returnUrl;
    }

    // Caso contrário, usar lógica baseada no role
    const currentUser = this.authService.getCurrentUser();
    console.log('Determinando redirect baseado no usuário:', currentUser);
    
    if (currentUser?.role === 'CLIENT_USER') {
      console.log('✅ CLIENT_USER detectado - redirecionando para /veiculos');
      return '/veiculos';
    } else if (currentUser?.role === 'Admin' || currentUser?.role === 'Funcionario') {
      console.log(`✅ ${currentUser.role} detectado - redirecionando para /dashboard`);
      return '/dashboard';
    } else {
      // Fallback para veículos se role não for reconhecido (mais seguro para CLIENT_USER)
      console.log('⚠️ Role não reconhecido:', currentUser?.role, '- redirecionando para /veiculos como fallback');
      return '/veiculos';
    }
  }

  /**
   * Tenta redirecionar com diferentes estratégias
   */
  private attemptRedirect(url: string): void {
    console.log('🔄 Tentativa 1: router.navigate()');
    
    this.router.navigate([url]).then(success => {
      if (success) {
        console.log('✅ Redirecionamento bem-sucedido via navigate()');
      } else {
        console.log('❌ router.navigate() falhou, tentando navigateByUrl()');
        this.router.navigateByUrl(url).then(success2 => {
          if (success2) {
            console.log('✅ Redirecionamento bem-sucedido via navigateByUrl()');
          } else {
            console.log('❌ navigateByUrl() também falhou, tentando window.location');
            // Último recurso: usar window.location
            setTimeout(() => {
              console.log('🔄 Tentativa 3: window.location.href');
              window.location.href = url;
            }, 100);
          }
        });
      }
    }).catch(error => {
      console.error('❌ Erro no redirecionamento:', error);
      // Fallback para window.location
      console.log('🔄 Fallback: usando window.location');
      window.location.href = url;
    });
  }
}
