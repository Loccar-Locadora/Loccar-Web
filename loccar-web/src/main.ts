// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { CadastroUsuarioComponent } from './app/features/auth/cadastro-usuario/cadastro-usuario.component';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';

bootstrapApplication(CadastroUsuarioComponent, {
  providers: [
    provideHttpClient(),        // ✅ HttpClient disponível globalmente
    importProvidersFrom(FormsModule)
  ]
});
