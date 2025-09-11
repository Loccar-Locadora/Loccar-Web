import { Routes } from '@angular/router';
import { CadastroUsuarioComponent } from './features/auth/cadastro-usuario/cadastro-usuario.component';
import { LoginComponent } from './features/auth/login-usuario/login.component';

export const routes: Routes = [
  { path: 'cadastro', component: CadastroUsuarioComponent },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // redireciona para login por padrão
  { path: '**', redirectTo: 'login' } // rota inválida cai no login
];
