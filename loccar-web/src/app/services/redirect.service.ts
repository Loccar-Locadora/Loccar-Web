import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RedirectService {
  
  constructor(private router: Router, private authService: AuthService) {}

  /**
   * Redireciona o usuário para a página apropriada após login
   */
  redirectAfterLogin(): void {
    const currentUser = this.authService.getCurrentUser();
    console.log('🎯 RedirectService - usuário:', currentUser);

    if (!currentUser) {
      console.error('❌ Nenhum usuário encontrado para redirecionamento');
      this.router.navigate(['/login']);
      return;
    }

    let targetUrl = '/minhas-reservas'; // Default para clientes

    if (currentUser.role === 'CLIENT_USER' || currentUser.role === 'Cliente') {
      targetUrl = '/minhas-reservas';
      console.log('✅ Cliente → /minhas-reservas');
    } else if (currentUser.role === 'Admin' || currentUser.role === 'Funcionario') {
      targetUrl = '/dashboard';
      console.log(`✅ ${currentUser.role} → /dashboard`);
    }

    console.log('🚀 Redirecionando para:', targetUrl);
    
    // Usar setTimeout para garantir que o ciclo de detecção de mudanças termine
    setTimeout(() => {
      this.router.navigateByUrl(targetUrl).then(success => {
        if (success) {
          console.log('✅ Redirecionamento concluído com sucesso!');
          return Promise.resolve(true);
        } else {
          console.warn('⚠️ Router retornou false, tentando navigate()...');
          return this.router.navigate([targetUrl]);
        }
      }).then(success2 => {
        if (success2 === false) {
          console.error('❌ Ambos os métodos falharam, usando window.location');
          window.location.href = targetUrl;
        }
      }).catch(error => {
        console.error('❌ Erro no redirecionamento:', error);
        console.log('🔄 Usando window.location como fallback');
        window.location.href = targetUrl;
      });
    }, 100); // Aumentar tempo para 100ms
  }
}