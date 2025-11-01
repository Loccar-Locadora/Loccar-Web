import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layouts/sidebar/sidebar.component';
import { Observable } from 'rxjs';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  tipo: 'Cliente' | 'Funcionario' | 'Administrador';
  avatar?: string;
  iniciais: string;
}

export interface UserStats {
  id: number;
  title: string;
  value: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent {
  usuarios$: Observable<Usuario[]>;
  userStats$: Observable<UserStats[]>;
  filtroTipo = 'todos';
  termoBusca = '';

  constructor(private router: Router) {
    // Mock data para usuários
    this.usuarios$ = new Observable<Usuario[]>(observer => {
      observer.next([
        {
          id: '1',
          nome: 'João Silva',
          email: 'joao@cliente.com',
          telefone: '(11) 99999-9999',
          tipo: 'Cliente',
          iniciais: 'JS'
        },
        {
          id: '2',
          nome: 'Maria Santos',
          email: 'maria@funcionario.com',
          telefone: '(11) 88888-8888',
          tipo: 'Funcionario',
          iniciais: 'MS'
        },
        {
          id: '3',
          nome: 'Carlos Admin',
          email: 'carlos@admin.com',
          telefone: '(11) 77777-7777',
          tipo: 'Administrador',
          iniciais: 'CA'
        }
      ]);
    });

    // Stats dos usuários
    this.userStats$ = new Observable<UserStats[]>(observer => {
      observer.next([
        {
          id: 1,
          title: 'Total de Usuários',
          value: '3',
          icon: 'people',
          color: 'blue'
        },
        {
          id: 2,
          title: 'Clientes',
          value: '1',
          icon: 'person',
          color: 'green'
        },
        {
          id: 3,
          title: 'Funcionários',
          value: '1',
          icon: 'badge',
          color: 'purple'
        },
        {
          id: 4,
          title: 'Administradores',
          value: '1',
          icon: 'admin_panel_settings',
          color: 'red'
        }
      ]);
    });
  }

  getTipoColor(tipo: string): string {
    switch (tipo) {
      case 'Cliente':
        return 'bg-blue-100 text-blue-800';
      case 'Funcionario':
        return 'bg-gray-100 text-gray-800';
      case 'Administrador':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  editarUsuario(usuario: Usuario): void {
    console.log('Editar usuário:', usuario);
    // Implementar navegação para edição
  }

  excluirUsuario(usuario: Usuario): void {
    console.log('Excluir usuário:', usuario);
    // Implementar confirmação e exclusão
  }

  novoUsuario(): void {
    console.log('Novo usuário');
    // Implementar navegação para criação
  }

  onFiltroChange(filtro: string): void {
    this.filtroTipo = filtro;
    // Implementar filtragem
  }

  onBuscaChange(termo: string): void {
    this.termoBusca = termo;
    // Implementar busca
  }
}