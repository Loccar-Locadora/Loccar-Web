import { Routes } from '@angular/router';
import { CadastroUsuarioComponent } from './features/auth/cadastro-usuario/cadastro-usuario.component';
import { LoginComponent } from './features/auth/login-usuario/login.component';
import { AdminDashboardComponent } from './features/dashboard/admin-dashboard.component';
import { UsuariosComponent } from './features/usuarios/usuarios.component';
import { VeiculosComponent } from './features/veiculos/veiculos.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Rotas públicas
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroUsuarioComponent },
  
  // Rotas do painel administrativo (protegidas)
  { 
    path: 'dashboard', 
    component: AdminDashboardComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'usuarios', 
    component: UsuariosComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'veiculos', 
    component: VeiculosComponent, 
    canActivate: [authGuard] 
  },
  
  // Rota padrão
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  
  // Rota 404
  { path: '**', redirectTo: '/login' }
];