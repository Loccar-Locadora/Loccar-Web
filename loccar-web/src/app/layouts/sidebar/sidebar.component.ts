import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../core/models/auth.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  isLoggingOut = false;
  currentUser: User | null = null;
  private subscription = new Subscription();
  
  constructor(private authService: AuthService) {}

  /**
   * Verificar se o usuário pode acessar o dashboard
   */
  canAccessDashboard(): boolean {
    return this.authService.canAccessDashboard();
  }

  /**
   * Verificar se o usuário pode acessar gestão de usuários
   */
  canAccessUserManagement(): boolean {
    return this.authService.canAccessUserManagement();
  }

  /**
   * Verificar se o usuário pode acessar gestão de veículos
   */
  canAccessVehicleManagement(): boolean {
    return this.authService.canAccessVehicleManagement();
  }

  /**
   * Verificar se o usuário pode acessar suas reservas
   */
  canAccessReservas(): boolean {
    return this.authService.canAccessReservas();
  }

  /**
   * Obter o label para a seção de veículos baseado no role do usuário
   */
  getVehicleLabel(): string {
    const user = this.authService.getCurrentUser();
    if (user?.role === 'Cliente' || user?.role === 'CLIENT_USER') {
      return 'Veículos Disponíveis';
    }
    return 'Gestão de Veículos';
  }

  /**
   * Obter a rota para veículos baseado no role do usuário
   */
  getVehicleRoute(): string {
    const user = this.authService.getCurrentUser();
    if (user?.role === 'Cliente' || user?.role === 'CLIENT_USER') {
      return '/veiculos-disponiveis';
    }
    return '/veiculos';
  }

  ngOnInit(): void {
    // Carregar usuário atual
    this.currentUser = this.authService.getCurrentUser();
    
    // Inscrever-se nas mudanças do usuário atual
    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        console.log('Sidebar: Usuário atual atualizado:', user);
      })
    );

    // Fazer refresh dos dados do usuário se estiver logado
    if (this.currentUser && this.authService.isAuthenticated()) {
      console.log('Sidebar: Fazendo refresh dos dados do usuário...');
      this.subscription.add(
        this.authService.refreshUserData().subscribe({
          next: (userData) => {
            console.log('Sidebar: Dados do usuário atualizados com sucesso');
          },
          error: (error) => {
            console.warn('Sidebar: Erro ao atualizar dados do usuário:', error);
          }
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Método para fazer logout
   */
  onLogout(): void {
    if (confirm('Tem certeza que deseja sair?')) {
      this.isLoggingOut = true;
      
      // Usar método assíncrono para ter controle do loading
      this.authService.logoutAsync().subscribe({
        next: () => {
          console.log('Logout concluído');
        },
        error: (error) => {
          console.error('Erro no logout:', error);
          // Mesmo com erro, o logout local já foi feito
          this.isLoggingOut = false;
        },
        complete: () => {
          this.isLoggingOut = false;
        }
      });
    }
  }
}
