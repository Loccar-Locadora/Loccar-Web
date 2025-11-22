import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();
  console.log('🛡️ AuthGuard:', isAuthenticated ? 'PERMITIDO' : 'NEGADO', '- URL:', router.url);

  if (isAuthenticated) {
    return true;
  }

  console.warn('❌ AuthGuard - Redirecionando para login...');
  
  // Salvar a URL atual para redirecionar após login
  const currentUrl = router.url;
  return router.parseUrl(`/login?returnUrl=${encodeURIComponent(currentUrl)}`);
};