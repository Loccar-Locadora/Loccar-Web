import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  login = {
    email: '',
    senha: ''
  };
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.errorMessage = ''; // Limpa mensagens de erro anteriores
    
    this.authService.login(this.login.email, this.login.senha)
      .subscribe({
        next: () => {
          console.log('Login bem sucedido, redirecionando para dashboard...');
          this.router.navigate(['/dashboard']).then(() => {
            console.log('Redirecionamento concluído');
          }).catch(err => {
            console.error('Erro no redirecionamento:', err);
          });
        },
        error: (error) => {
          console.error('Erro no login:', error);
          this.errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';
          if (error.status === 401) {
            this.errorMessage = 'Email ou senha inválidos.';
          } else if (error.status === 0) {
            this.errorMessage = 'Erro de conexão com o servidor.';
          }
        }
      });
  }
}
