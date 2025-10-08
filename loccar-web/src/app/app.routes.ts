import { Routes } from '@angular/router';
import { CadastroUsuarioComponent } from './features/auth/cadastro-usuario/cadastro-usuario.component';
import { LoginComponent } from './features/auth/login-usuario/login.component';

export const routes: Routes = [
  // Rotas públicas
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroUsuarioComponent },
  
  // Rota padrão
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  
  // Rota 404
  { path: '**', redirectTo: '/login' }
];