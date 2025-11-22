import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar se o usuário está autenticado
  if (!authService.isAuthenticated()) {
    console.warn('Usuário não autenticado. Redirecionando para login...');
    return router.parseUrl('/login');
  }

  const currentUser = authService.getCurrentUser();
  const routePath = route.routeConfig?.path;

  console.log('🔒 RoleGuard:', currentUser?.role, '→', routePath);

  // CONTROLE DE ACESSO PARA CLIENT_USER/Cliente
  // CLIENT_USER (ou 'Cliente') só pode acessar veículos disponíveis e minhas reservas
  if (currentUser?.role === 'CLIENT_USER' || currentUser?.role === 'Cliente') {
    // Permitir acesso aos veículos disponíveis e minhas reservas
    if (routePath === 'veiculos-disponiveis' || routePath === 'minhas-reservas') {
      console.log(`✅ Cliente acessando ${routePath} - permitido`);
      return true;
    }
    
    // Bloquear especificamente dashboard, gestão de usuários e gestão de veículos (admin)
    if (routePath === 'dashboard' || routePath === 'usuarios' || routePath === 'veiculos') {
      console.warn(`❌ Cliente tentando acessar ${routePath} - ACESSO NEGADO. Redirecionando para veículos disponíveis...`);
      return router.parseUrl('/veiculos-disponiveis');
    }
    
    // Bloquear qualquer outra rota não autorizada
    console.warn(`❌ Cliente tentando acessar ${routePath} - não autorizado. Redirecionando para veículos disponíveis...`);
    return router.parseUrl('/veiculos-disponiveis');
  }

  // CONTROLE DE ACESSO PARA OUTROS ROLES
  // Admin e Funcionario podem acessar todas as funcionalidades
  if (currentUser?.role === 'Admin' || currentUser?.role === 'Funcionario') {
    console.log(`${currentUser.role} acessando ${routePath} - permitido`);
    return true;
  }

  // Para roles não reconhecidos, redirecionar para login
  console.warn(`Role não reconhecido: ${currentUser?.role}. Redirecionando para login...`);
  return router.parseUrl('/login');
};