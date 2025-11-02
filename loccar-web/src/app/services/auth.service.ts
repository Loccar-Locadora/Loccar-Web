import { Injectable, signal, computed, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  RegisterResponse, 
  User, 
  AuthState,
  ApiError 
} from '../core/models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // URLs da API baseadas nos CURLs fornecidos
  private readonly LOGIN_URL = 'http://192.168.1.108:5290/api/auth/login';
  private readonly REGISTER_URL = 'http://192.168.1.108:5290/api/auth/register';
  private readonly LOGOUT_URL = 'http://192.168.1.108:5290/api/auth/logout';

  // Estado de autenticação usando BehaviorSubject
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: this.getTokenFromStorage()
  });

  // Observables públicos
  public authState$ = this.authStateSubject.asObservable();
  public isAuthenticated$ = new BehaviorSubject<boolean>(this.hasValidToken());
  public currentUser$ = new BehaviorSubject<User | null>(this.getUserFromStorage());

  // Signals para compatibilidade
  private _token = signal<string | null>(this.getTokenFromStorage());
  isLoggedIn = computed(() => !!this._token() && this.hasValidToken());
  token = computed(() => this._token());

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Inicializar estado se já existe um token válido
    const storedToken = this.getTokenFromStorage();
    const storedUser = this.getUserFromStorage();
    
    if (storedToken && storedUser) {
      this.updateAuthState(storedToken, storedUser);
    }
  }

  /**
   * Login do usuário
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.LOGIN_URL, credentials)
      .pipe(
        tap(response => {
          // A API retorna: { code: "200", message: "...", data: "jwt_token" }
          const token = response.data; // Token está no campo 'data'
          
          if (token) {
            // Salvar o token primeiro (já foi validado pelo backend)
            this.setToken(token);
            
            // Tentar extrair dados do usuário do JWT (opcional)
            let user: User;
            try {
              // Decodificar JWT de forma mais robusta
              const parts = token.split('.');
              if (parts.length !== 3) {
                throw new Error('Token JWT não tem formato válido');
              }
              
              // Decodificar payload
              const base64Payload = parts[1];
              
              // Adicionar padding se necessário
              const paddedPayload = base64Payload + '='.repeat((4 - base64Payload.length % 4) % 4);
              
              // Decodificar usando decodeURIComponent para lidar com caracteres especiais
              const decodedBytes = atob(paddedPayload);
              const payload = JSON.parse(decodeURIComponent(escape(decodedBytes)));
              
              console.log('JWT decodificado com sucesso:', payload);
              
              // Criar objeto User a partir do payload do JWT
              user = {
                id: String(payload.id || ''),
                username: payload.name || 'Usuário',
                email: credentials.email, // Usar email do login
                driverLicense: '', // Não disponível no JWT
                cellPhone: '', // Não disponível no JWT
                role: payload.role as any || 'Cliente'
              };
              
            } catch (error) {
              console.warn('Não foi possível decodificar JWT, usando dados mínimos:', error);
              
              // Se não conseguir decodificar, criar usuário com dados mínimos
              user = {
                id: '0',
                username: 'Usuário',
                email: credentials.email,
                driverLicense: '',
                cellPhone: '',
                role: 'Cliente' as any
              };
            }
            
            this.setUser(user);
            this.updateAuthState(token, user);
            
          } else {
            throw new Error('Token não recebido da API');
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Cadastro de novo usuário
   */
  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(this.REGISTER_URL, userData)
      .pipe(
        tap(response => {
          if (response.user) {
            // Após cadastro bem-sucedido, não fazer login automático
            // O usuário deve ir para tela de login
            console.log('Usuário cadastrado com sucesso:', response.message);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Logout do usuário
   */
  logout(): void {
    console.log('Fazendo logout do usuário...');
    
    const token = this.getToken();
    
    if (token) {
      console.log('Token encontrado para logout:', token.substring(0, 20) + '...');
      
      // Fazer requisição de logout para a API
      this.http.post(this.LOGOUT_URL, {})
        .pipe(
          catchError(error => {
            console.error('Erro ao fazer logout na API:', error);
            console.error('Status:', error.status);
            console.error('Mensagem:', error.message);
            // Mesmo com erro na API, continuar com logout local
            return throwError(() => error);
          })
        )
        .subscribe({
          next: (response) => {
            console.log('Logout realizado com sucesso na API:', response);
          },
          error: (error) => {
            console.warn('Erro na API de logout, mas continuando com logout local:', error);
          },
          complete: () => {
            this.performLocalLogout();
          }
        });
    } else {
      // Se não tem token, fazer logout local direto
      this.performLocalLogout();
    }
  }

  /**
   * Realizar logout local (limpar dados e redirecionar)
   */
  private performLocalLogout(): void {
    console.log('Realizando logout local...');
    
    // Forçar limpeza completa do estado
    this.clearAllAuthData();

    console.log('Estado de autenticação limpo');

    // Redirecionar para login
    this.router.navigate(['/login']);
  }

  /**
   * Limpar todos os dados de autenticação
   */
  private clearAllAuthData(): void {
    // Limpar signal
    this._token.set(null);
    
    // Limpar localStorage de forma mais agressiva
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      // Limpar também possíveis chaves antigas
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      console.log('Todos os dados removidos do localStorage');
      
      // Verificar se foi realmente limpo
      const remainingToken = localStorage.getItem('auth_token');
      console.log('Verificação pós-limpeza - token ainda existe:', !!remainingToken);
    }

    // Atualizar todos os estados
    this.authStateSubject.next({
      isAuthenticated: false,
      user: null,
      token: null
    });

    this.isAuthenticated$.next(false);
    this.currentUser$.next(null);
    
    // Verificar estado após limpeza
    console.log('Verificação pós-limpeza:');
    console.log('- Signal token:', this._token());
    console.log('- isAuthenticated():', this.isAuthenticated());
    console.log('- getCurrentUser():', this.getCurrentUser());
  }

  /**
   * Logout silencioso (sem redirecionamento)
   */
  logoutSilent(): void {
    const token = this.getToken();
    
    if (token) {
      // Tentar fazer logout na API, mas não esperar resposta
      this.http.post(this.LOGOUT_URL, {})
        .pipe(
          catchError(error => {
            console.error('Erro ao fazer logout silencioso na API:', error);
            return throwError(() => error);
          })
        )
        .subscribe({
          next: () => console.log('Logout silencioso realizado na API'),
          error: () => console.warn('Erro no logout silencioso da API')
        });
    }
    
    // Realizar logout local imediatamente
    this.performSilentLocalLogout();
  }

  /**
   * Logout com Observable (para componentes que precisam de loading state)
   */
  logoutAsync(): Observable<any> {
    const token = this.getToken();
    
    if (!token) {
      // Se não tem token, fazer logout local e retornar observable completo
      this.performLocalLogout();
      return new Observable(observer => {
        observer.next({ success: true });
        observer.complete();
      });
    }

    // Fazer requisição para API
    return this.http.post(this.LOGOUT_URL, {})
      .pipe(
        tap(response => {
          console.log('Logout realizado com sucesso na API:', response);
        }),
        catchError(error => {
          console.error('Erro ao fazer logout na API:', error);
          // Mesmo com erro, fazer logout local
          return throwError(() => error);
        }),
        tap(() => {
          // Sempre fazer logout local após resposta da API (sucesso ou erro)
          this.performLocalLogout();
        })
      );
  }

  /**
   * Realizar logout local silencioso (sem redirecionamento)
   */
  private performSilentLocalLogout(): void {
    this.clearAllAuthData();
  }

  /**
   * Verificar se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  /**
   * Obter usuário atual
   */
  getCurrentUser(): User | null {
    return this.getUserFromStorage();
  }

  /**
   * Obter token atual
   */
  getToken(): string | null {
    return this.getTokenFromStorage();
  }

  /**
   * Forçar limpeza completa (método público para debug)
   */
  forceClearAuth(): void {
    console.log('Forçando limpeza completa de autenticação...');
    this.clearAllAuthData();
  }

  /**
   * Verificar se o token existe (backend já validou)
   */
  private hasValidToken(): boolean {
    const token = this.getTokenFromStorage();
    console.log('hasValidToken - verificando token:', {
      tokenExists: !!token,
      tokenLength: token ? token.length : 0,
      tokenStart: token ? token.substring(0, 20) + '...' : 'null'
    });
    
    // Se o token existe, considera válido (backend já validou)
    const isValid = !!token && token.trim().length > 0;
    console.log('hasValidToken resultado:', isValid);
    
    return isValid;
  }

  /**
   * Salvar token no localStorage
   */
  private setToken(token: string): void {
    console.log('setToken chamado com:', token ? token.substring(0, 20) + '...' : 'null');
    
    this._token.set(token);
    console.log('Signal _token atualizado para:', this._token());
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_token', token);
      console.log('Token salvo no localStorage');
      
      // Verificar se foi salvo corretamente
      const savedToken = localStorage.getItem('auth_token');
      console.log('Verificação - token salvo corretamente:', savedToken === token);
    } else {
      console.warn('Não está no browser, token não salvo no localStorage');
    }
  }

  /**
   * Salvar usuário no localStorage
   */
  private setUser(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
  }

  /**
   * Recuperar token do localStorage
   */
  private getTokenFromStorage(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  /**
   * Recuperar usuário do localStorage
   */
  private getUserFromStorage(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const userJson = localStorage.getItem('auth_user');
      return userJson ? JSON.parse(userJson) : null;
    }
    return null;
  }

  /**
   * Atualizar estado de autenticação
   */
  private updateAuthState(token: string, user: User): void {
    // Atualizar signal
    this._token.set(token);
    
    const authState: AuthState = {
      isAuthenticated: true,
      user,
      token
    };

    this.authStateSubject.next(authState);
    this.isAuthenticated$.next(true);
    this.currentUser$.next(user);
  }

  /**
   * Tratamento de erros HTTP
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Erro desconhecido';

    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do servidor
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        switch (error.status) {
          case 400:
            errorMessage = 'Dados inválidos';
            break;
          case 401:
            errorMessage = 'Email ou senha incorretos';
            break;
          case 403:
            errorMessage = 'Acesso negado';
            break;
          case 404:
            errorMessage = 'Serviço não encontrado';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor';
            break;
          default:
            errorMessage = `Erro: ${error.status}`;
        }
      }
    }

    console.error('Erro na requisição:', error);
    return throwError(() => new Error(errorMessage));
  };
}