import { Injectable, signal, computed, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'https://localhost:44392/api/auth';

  // 🔹 Signals para estado de auth
  private _token = signal<string | null>(this.getTokenFromStorage());
  isLoggedIn = computed(() => !!this._token());
  token = computed(() => this._token());

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /** Login com usuário e senha */
  login(email: string, password: string) {
    return this.http.post<{ token: string }>(`${this.API_URL}/login`, { email, password })
      .pipe(
        tap(response => {
          this.setToken(response.token);
        })
      );
  }

  register(locatario: { nome: string; email: string; senha: string }) {
    return this.http.post<{ token: string }>(`${this.API_URL}/register`, {
      nome: locatario.nome,
      email: locatario.email,
      senha: locatario.senha
    }).pipe(
      tap(res => {
        if (res.token) {
          this.setToken(res.token);
        }
      })
    );
  }

  /** Logout */
  logout() {
    this._token.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
    }
  }

  /** Salva o token */
  private setToken(token: string) {
    this._token.set(token);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_token', token);
    }
  }

  /** Recupera token do storage ao iniciar */
  private getTokenFromStorage(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }
}