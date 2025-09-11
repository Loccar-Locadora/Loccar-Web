import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.authService.register(this.usuario).subscribe({
      next: (res) => {
        console.log('Usuário registrado com sucesso:', res);
        alert('Usuário registrado com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao registrar usuário:', err);
        alert('Erro ao registrar usuário. Verifique os dados e tente novamente.');
      }
    });
  }
}
