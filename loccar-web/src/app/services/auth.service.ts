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
  private readonly LOGIN_URL = 'http://192.168.1.5:5290/api/auth/login';
  private readonly REGISTER_URL = 'http://192.168.1.5:5002/api/auth/register';

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
          if (response.token || response.accessToken) {
            const token = response.token || response.accessToken || '';
            this.setToken(token);
            this.setUser(response.user);
            this.updateAuthState(token, response.user);
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
    this._token.set(null);
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }

    // Atualizar estado
    this.authStateSubject.next({
      isAuthenticated: false,
      user: null,
      token: null
    });

    this.isAuthenticated$.next(false);
    this.currentUser$.next(null);

    // Redirecionar para login
    this.router.navigate(['/login']);
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
   * Verificar se o token ainda é válido (simplificado)
   */
  private hasValidToken(): boolean {
    const token = this.getTokenFromStorage();
    if (!token) return false;

    // TODO: Implementar verificação de expiração do JWT
    // Por enquanto, apenas verifica se o token existe
    try {
      // Decodificar JWT para verificar expiração
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch (error) {
      // Se não conseguir decodificar, assume que é válido
      // Em produção, implementar validação mais robusta
      return true;
    }
  }

  /**
   * Salvar token no localStorage
   */
  private setToken(token: string): void {
    this._token.set(token);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_token', token);
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