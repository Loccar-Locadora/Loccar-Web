import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  console.warn('Acesso negado. Redirecionando para login...');
  
  // Salvar a URL atual para redirecionar após login
  const currentUrl = router.url;
  return router.parseUrl(`/login?returnUrl=${encodeURIComponent(currentUrl)}`);
};