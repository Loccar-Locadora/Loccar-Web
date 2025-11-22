import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para redirecionar usuários para a página inicial apropriada baseada no seu role
 */
export const redirectGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar se o usuário está autenticado
  if (!authService.isAuthenticated()) {
    console.warn('RedirectGuard: Usuário não autenticado. Redirecionando para login...');
    return router.parseUrl('/login');
  }

  const currentUser = authService.getCurrentUser();

  // Redirecionar baseado no role do usuário
  if (currentUser?.role === 'CLIENT_USER' || currentUser?.role === 'Cliente') {
    console.log('RedirectGuard: CLIENT_USER redirecionado para veículos disponíveis');
    return router.parseUrl('/veiculos-disponiveis');
  } else if (currentUser?.role === 'Admin' || currentUser?.role === 'Funcionario') {
    console.log(`RedirectGuard: ${currentUser.role} redirecionado para dashboard`);
    return router.parseUrl('/dashboard');
  } else {
    // Role não reconhecido, redirecionar para login
    console.warn(`RedirectGuard: Role não reconhecido: ${currentUser?.role}. Redirecionando para login...`);
    return router.parseUrl('/login');
  }
};