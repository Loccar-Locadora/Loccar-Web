import { Routes } from '@angular/router';
import { CadastroUsuarioComponent } from './features/auth/cadastro-usuario/cadastro-usuario.component';
import { LoginComponent } from './features/auth/login-usuario/login.component';
import { AdminDashboardComponent } from './features/dashboard/admin-dashboard.component';
import { UsuariosComponent } from './features/usuarios/usuarios.component';
import { VeiculosComponent } from './features/veiculos/veiculos.component';
import { VeiculosDisponiveisComponent } from './features/veiculos-disponiveis/veiculos-disponiveis.component';
import { MinhasReservasComponent } from './features/minhas-reservas/minhas-reservas.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { redirectGuard } from './guards/redirect.guard';

export const routes: Routes = [
  // Rotas públicas
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroUsuarioComponent },
  
  // Rotas do painel administrativo (protegidas)
  { 
    path: 'dashboard', 
    component: AdminDashboardComponent, 
    canActivate: [authGuard, roleGuard] 
  },
  { 
    path: 'usuarios', 
    component: UsuariosComponent, 
    canActivate: [authGuard, roleGuard] 
  },
  { 
    path: 'veiculos', 
    component: VeiculosComponent, 
    canActivate: [authGuard, roleGuard] 
  },
  {
    path: 'minhas-reservas',
    component: MinhasReservasComponent,
    canActivate: [authGuard]
  },
  {
    path: 'veiculos-disponiveis',
    component: VeiculosDisponiveisComponent,
    canActivate: [authGuard]
  },  // Rota padrão - redirecionar baseado no role do usuário
  { path: '', canActivate: [redirectGuard], children: [] },
  
  // Rota 404
  { path: '**', redirectTo: '/login' }
];