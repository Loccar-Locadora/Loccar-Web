import { Injectable } from '@angular/core';
import { 
  HttpInterceptor, 
  HttpRequest, 
  HttpHandler, 
  HttpEvent,
  HttpErrorResponse 
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<any>, 
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    
    // Obter token do AuthService
    const token = this.authService.getToken();

    // Clonar a requisição e adicionar o header de autorização se o token existir
    let authRequest = request;
    
    if (token) {
      authRequest = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${token}`)
      });
    }

    // Adicionar headers padrão
    authRequest = authRequest.clone({
      headers: authRequest.headers.set('Content-Type', 'application/json')
    });

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        
        // Se receber erro 401 (Unauthorized), fazer logout automático
        if (error.status === 401) {
          console.warn('Token expirado ou inválido. Fazendo logout...');
          this.authService.logout();
        }

        return throwError(() => error);
      })
    );
  }
}