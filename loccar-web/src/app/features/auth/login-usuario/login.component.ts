import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <-- importa FormsModule

@Component({
  selector: 'app-login',
  standalone: true, // <-- torna o componente standalone
  imports: [FormsModule], // <-- registra FormsModule aqui
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  login = {
    email: '',
    senha: ''
  };

  onSubmit() {
    console.log('Tentando login com:', this.login);
    // Aqui você pode chamar um service para autenticar na API
  }
}
