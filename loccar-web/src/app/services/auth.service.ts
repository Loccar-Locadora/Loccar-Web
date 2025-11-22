import { Injectable, signal, computed, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
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
  private readonly LOGIN_URL = 'http://localhost:5290/api/auth/login';
  private readonly REGISTER_URL = 'http://localhost:5290/api/auth/register';
  private readonly LOGOUT_URL = 'http://localhost:5290/api/auth/logout';
  private readonly USER_BY_EMAIL_URL = 'http://localhost:8080/api/user/find/email';

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
    
    console.log('AuthService - Inicialização:');
    console.log('- Token armazenado:', !!storedToken);
    console.log('- Usuário armazenado:', storedUser);
    
    if (storedToken && storedUser) {
      this.updateAuthState(storedToken, storedUser);
      console.log('- Estado de autenticação restaurado com sucesso');
    } else {
      console.log('- Nenhum estado de autenticação encontrado no localStorage');
    }
  }

  /**
   * Login do usuário
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.LOGIN_URL, credentials)
      .pipe(
        switchMap(response => {
          // A API retorna: { code: "200", message: "...", data: "jwt_token" }
          const token = response.data; // Token está no campo 'data'
          
          if (token) {
            // Salvar o token primeiro (já foi validado pelo backend)
            this.setToken(token);
            
            // Buscar dados completos do usuário usando o endpoint /find/email
            console.log('Login bem-sucedido, buscando dados completos do usuário...');
            return this.getUserByEmail(credentials.email).pipe(
              map(userData => {
                console.log('Dados completos do usuário obtidos:', userData);
                
                // Usar os dados completos do usuário retornados pela API
                const user: User = {
                  id: String(userData.id || '0'),
                  username: userData.username || 'Usuário',
                  email: userData.email || credentials.email,
                  driverLicense: userData.driverLicense || '',
                  cellPhone: userData.cellPhone || '',
                  role: userData.role || 'Cliente'
                };
                
                this.setUser(user);
                this.updateAuthState(token, user);
                console.log('Estado de autenticação atualizado com dados completos');
                
                // Retornar a resposta original do login
                return response;
              }),
              catchError(error => {
                console.error('Erro ao buscar dados do usuário, usando dados mínimos:', error);
                
                // Se falhar, usar dados mínimos
                const user: User = {
                  id: '0',
                  username: 'Usuário',
                  email: credentials.email,
                  driverLicense: '',
                  cellPhone: '',
                  role: 'Cliente'
                };
                
                this.setUser(user);
                this.updateAuthState(token, user);
                console.log('Estado de autenticação atualizado com dados mínimos');
                
                // Mesmo com erro ao buscar dados, o login foi bem-sucedido
                return of(response);
              })
            );
            
          } else {
            throw new Error('Login ou senha incorretos');
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
   * Verificar se o usuário tem acesso ao dashboard
   */
  canAccessDashboard(): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.role) return false;
    
    // CLIENT_USER/Cliente não tem acesso ao dashboard
    return user.role !== 'CLIENT_USER' && user.role !== 'Cliente';
  }

  /**
   * Verificar se o usuário tem acesso à gestão de usuários
   */
  canAccessUserManagement(): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.role) return false;
    
    // Apenas Admin e Funcionario têm acesso
    return user.role === 'Admin' || user.role === 'Funcionario';
  }

  /**
   * Verificar se o usuário tem acesso à gestão de veículos
   */
  canAccessVehicleManagement(): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.role) return false;
    
    // Todos os tipos de usuário têm acesso aos veículos
    return true;
  }

  /**
   * Verificar se o usuário é CLIENT_USER/Cliente
   */
  isClientUser(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'CLIENT_USER' || user?.role === 'Cliente';
  }

  /**
   * Verificar se o usuário pode acessar suas reservas
   */
  canAccessReservas(): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.role) return false;
    
    // Todos os usuários autenticados podem ver suas próprias reservas
    return true;
  }

  /**
   * Obter a rota padrão baseada no role do usuário
   */
  getDefaultRouteForUser(): string {
    const user = this.getCurrentUser();
    
    if (!user || !user.role) {
      return '/dashboard';
    }

    switch (user.role) {
      case 'CLIENT_USER':
        return '/veiculos';
      case 'Admin':
      case 'Funcionario':
      case 'Cliente':
      default:
        return '/dashboard';
    }
  }

  /**
   * Forçar limpeza completa (método público para debug)
   */
  forceClearAuth(): void {
    console.log('Forçando limpeza completa de autenticação...');
    this.clearAllAuthData();
  }

  /**
   * Atualizar dados do usuário atual buscando informações completas da API
   */
  refreshUserData(): Observable<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser || !currentUser.email) {
      return throwError(() => new Error('Nenhum usuário logado encontrado'));
    }

    console.log('Atualizando dados do usuário:', currentUser.email);
    
    return this.getUserByEmail(currentUser.email).pipe(
      tap(userData => {
        console.log('Dados atualizados do usuário:', userData);
        
        const updatedUser: User = {
          id: String(userData.id || currentUser.id),
          username: userData.username || currentUser.username,
          email: userData.email || currentUser.email,
          driverLicense: userData.driverLicense || currentUser.driverLicense,
          cellPhone: userData.cellPhone || currentUser.cellPhone,
          role: userData.role || currentUser.role
        };
        
        this.setUser(updatedUser);
        this.currentUser$.next(updatedUser);
        console.log('Dados do usuário atualizados na sidebar');
      }),
      catchError(error => {
        console.error('Erro ao atualizar dados do usuário:', error);
        return throwError(() => error);
      })
    );
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
    console.log('getTokenFromStorage - verificando localStorage...');
    console.log('- isPlatformBrowser:', isPlatformBrowser(this.platformId));
    
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('auth_token');
      console.log('- token do localStorage:', token ? token.substring(0, 20) + '...' : 'null');
      return token;
    }
    
    console.log('- não é browser, retornando null');
    return null;
  }

  /**
   * Buscar dados completos do usuário por email
   */
  private getUserByEmail(email: string): Observable<User> {
    console.log('Fazendo requisição GET para:', `${this.USER_BY_EMAIL_URL}?email=${encodeURIComponent(email)}`);
    
    return this.http.get<any>(`${this.USER_BY_EMAIL_URL}?email=${encodeURIComponent(email)}`)
      .pipe(
        tap(response => {
          console.log('=== RESPOSTA COMPLETA DA API getUserByEmail ===');
          console.log('Tipo da resposta:', typeof response);
          console.log('Resposta completa:', JSON.stringify(response, null, 2));
          console.log('Propriedades da resposta:', Object.keys(response));
          
          if (response.data) {
            console.log('=== DADOS DO USUÁRIO (response.data) ===');
            console.log('Tipo de data:', typeof response.data);
            console.log('Data completa:', JSON.stringify(response.data, null, 2));
            console.log('Propriedades de data:', Object.keys(response.data));
          }
        }),
        map(response => {
          // Verificar diferentes estruturas possíveis de resposta
          let userData = null;
          
          if (response.data) {
            userData = response.data;
          } else if (response.user) {
            userData = response.user;
          } else if (response.result) {
            userData = response.result;
          } else {
            // Se não tem wrapper, talvez a resposta seja diretamente o usuário
            userData = response;
          }
          
          console.log('=== DADOS EXTRAÍDOS PARA MAPEAMENTO ===');
          console.log('userData:', JSON.stringify(userData, null, 2));
          
          if (!userData) {
            throw new Error('Dados do usuário não encontrados na resposta');
          }
          
          // Criar objeto User mapeando os campos da resposta real
          const mappedUser: User = {
            id: String(userData.id || '0'),
            username: userData.name || userData.username || userData.userName || userData.fullName || 'Usuário',
            email: userData.email || email,
            driverLicense: userData.driverLicense || '',
            cellPhone: userData.cellphone || userData.cellPhone || '',
            role: this.mapRoleFromArray(userData.roles) || 'Cliente'
          };
          
          console.log('=== USUÁRIO MAPEADO FINAL ===');
          console.log('mappedUser:', JSON.stringify(mappedUser, null, 2));
          
          return mappedUser;
        }),
        catchError(error => {
          console.error('=== ERRO ao buscar usuário por email ===');
          console.error('Status:', error.status);
          console.error('Mensagem:', error.message);
          console.error('Corpo do erro:', error.error);
          console.error('Erro completo:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Recuperar usuário do localStorage
   */
  private getUserFromStorage(): User | null {
    console.log('getUserFromStorage - verificando localStorage...');
    console.log('- isPlatformBrowser:', isPlatformBrowser(this.platformId));
    
    if (isPlatformBrowser(this.platformId)) {
      const userJson = localStorage.getItem('auth_user');
      console.log('- userJson do localStorage:', userJson);
      
      const user = userJson ? JSON.parse(userJson) : null;
      console.log('- usuário parseado:', user);
      
      return user;
    }
    
    console.log('- não é browser, retornando null');
    return null;
  }

  /**
   * Atualizar estado de autenticação
   */
  private updateAuthState(token: string, user: User): void {
    console.log('AuthService - updateAuthState chamado:', user);
    
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
    
    console.log('AuthService - Estado atualizado. Usuário emitido para currentUser$:', user);
  }

  /**
   * Mapear array de roles da API para role única do sistema
   */
  private mapRoleFromArray(roles: string[]): 'Admin' | 'Cliente' | 'Funcionario' {
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return 'Cliente';
    }
    
    console.log('Mapeando roles do array:', roles);
    
    // Verificar se tem role de admin (prioridade mais alta)
    if (roles.some(role => 
      role.toLowerCase().includes('admin') || 
      role.toLowerCase().includes('client_admin') ||
      role.toLowerCase().includes('administrator')
    )) {
      console.log('Role mapeada para: Admin');
      return 'Admin';
    }
    
    // Verificar se tem role de funcionário
    if (roles.some(role => 
      role.toLowerCase().includes('funcionario') || 
      role.toLowerCase().includes('employee') || 
      role.toLowerCase().includes('staff') ||
      role.toLowerCase().includes('worker')
    )) {
      console.log('Role mapeada para: Funcionario');
      return 'Funcionario';
    }
    
    // Por padrão, considerar cliente
    console.log('Role mapeada para: Cliente');
    return 'Cliente';
  }

  /**
   * Normalizar role do usuário para os valores aceitos
   */
  private normalizeRole(role: any): 'Admin' | 'Cliente' | 'Funcionario' | 'CLIENT_USER' {
    if (!role) return 'Cliente';
    
    // Se for um array, pegar o primeiro elemento
    let roleStr = Array.isArray(role) ? role[0] : role;
    roleStr = String(roleStr).toLowerCase();
    
    console.log('Normalizando role:', role, '->', roleStr);
    
    if (roleStr.includes('admin') || roleStr.includes('administrator') || roleStr.includes('gerente')) {
      return 'Admin';
    } else if (roleStr.includes('funcionario') || roleStr.includes('employee') || roleStr.includes('staff') || roleStr.includes('worker')) {
      return 'Funcionario';
    } else if (roleStr.includes('client_user') || roleStr === 'client_user') {
      return 'CLIENT_USER';
    } else {
      return 'Cliente';
    }
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