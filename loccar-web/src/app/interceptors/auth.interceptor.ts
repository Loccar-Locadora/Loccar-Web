import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const router = inject(Router);
  
  // Obter token do localStorage (usando a mesma chave do AuthService)
  const token = localStorage.getItem('auth_token');
  
  // Log para debug (pode remover depois)
  if (req.url.includes('/logout') || req.url.includes('/statistics') || req.url.includes('/user/list') || req.url.includes('/vehicle/')) {
    console.log('AuthInterceptor - Requisição:', { 
      url: req.url, 
      method: req.method,
      hasToken: !!token,
      tokenStart: token ? token.substring(0, 20) + '...' : 'null'
    });
  }
  
  // Clonar a requisição e adicionar o header Authorization se o token existir
  let authReq = req;
  if (token) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    
    if (req.url.includes('/logout') || req.url.includes('/statistics') || req.url.includes('/user/list') || req.url.includes('/vehicle/')) {
      console.log('AuthInterceptor - Token adicionado ao header Authorization para:', req.url);
      console.log('AuthInterceptor - Header Authorization:', authReq.headers.get('Authorization')?.substring(0, 30) + '...');
    }
  }
  
  // Processar a requisição e tratar erros
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token inválido ou expirado - limpar storage e redirecionar
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};