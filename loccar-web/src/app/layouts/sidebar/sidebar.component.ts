import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  isLoggingOut = false;
  
  constructor(private authService: AuthService) {}

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

  /**
   * Obter nome do usuário atual
   */
  get currentUser() {
    return this.authService.getCurrentUser();
  }
}
