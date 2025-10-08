import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="text-center">
        <h1 class="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p class="text-xl text-gray-600 mb-8">Página não encontrada</p>
        <a routerLink="/" class="text-blue-600 hover:text-blue-800">Voltar para a página inicial</a>
      </div>
    </div>
  `,
})
export class NotFoundComponent {}