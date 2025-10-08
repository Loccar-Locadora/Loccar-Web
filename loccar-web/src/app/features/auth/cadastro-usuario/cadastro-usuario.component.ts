import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-cadastro-usuario',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './cadastro-usuario.component.html',
  styleUrls: ['./cadastro-usuario.component.css']
})
export class CadastroUsuarioComponent {
  usuario = { nome: '', email: '', senha: '' };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Redireciona para o dashboard se já estiver logado
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit() {
    this.authService.register(this.usuario).subscribe({
      next: () => {
        // Após o registro bem-sucedido, navega para o dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Erro ao registrar usuário:', err);
        alert('Erro ao registrar usuário. Verifique os dados e tente novamente.');
      }
    });
  }
}
