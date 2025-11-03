import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layouts/sidebar/sidebar.component';
import { Observable } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { UserStatistics } from '../dashboard/models';

export interface Usuario {
  id: string;
  name: string;
  email: string;
  cellphone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles: string[];
  // Campos calculados para exibição
  iniciais?: string;
  tipo?: string;
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
export class UsuariosComponent implements OnInit {
  usuarios$: Observable<Usuario[]>;
  userStats$: Observable<UserStats[]>;
  userStats: UserStatistics | null = null;
  isLoadingStats = false;
  isLoadingUsers = false;
  filtroTipo = 'todos';
  termoBusca = '';

  constructor(
    private router: Router,
    private dashboardService: DashboardService
  ) {
    // Inicializar observable vazio - dados serão carregados da API
    this.usuarios$ = new Observable<Usuario[]>(observer => {
      observer.next([]);
    });

    // Stats dos usuários serão carregados do serviço
    this.userStats$ = new Observable<UserStats[]>(observer => {
      // Inicializar com valores padrão
      observer.next([
        {
          id: 1,
          title: 'Total de Usuários',
          value: '0',
          icon: 'people',
          color: 'blue'
        },
        {
          id: 2,
          title: 'Clientes',
          value: '0',
          icon: 'person',
          color: 'green'
        },
        {
          id: 3,
          title: 'Funcionários',
          value: '0',
          icon: 'badge',
          color: 'purple'
        },
        {
          id: 4,
          title: 'Administradores',
          value: '0',
          icon: 'admin_panel_settings',
          color: 'red'
        }
      ]);
    });
  }

  ngOnInit(): void {
    this.loadUserStats();
    this.loadUsers();
  }

  private loadUserStats(): void {
    this.isLoadingStats = true;
    console.log('Carregando estatísticas de usuários da API...');
    
    this.dashboardService.getUserStatistics().subscribe({
      next: (stats) => {
        console.log('Estatísticas de usuários recebidas:', stats);
        this.userStats = stats;
        this.isLoadingStats = false;
        
        // Atualizar os cards com os dados reais da API
        this.userStats$ = new Observable<UserStats[]>(observer => {
          observer.next([
            {
              id: 1,
              title: 'Total de Usuários',
              value: stats.totalUsers.toString(),
              icon: 'people',
              color: 'blue'
            },
            {
              id: 2,
              title: 'Clientes',
              value: stats.commonUsers.toString(),
              icon: 'person',
              color: 'green'
            },
            {
              id: 3,
              title: 'Funcionários',
              value: stats.employeeUsers.toString(),
              icon: 'badge',
              color: 'purple'
            },
            {
              id: 4,
              title: 'Administradores',
              value: stats.adminUsers.toString(),
              icon: 'admin_panel_settings',
              color: 'red'
            }
          ]);
          observer.complete();
        });
      },
      error: (error) => {
        console.error('Erro ao carregar estatísticas de usuários:', error);
        this.userStats = null;
        this.isLoadingStats = false;
        
        // Manter valores padrão em caso de erro
        this.userStats$ = new Observable<UserStats[]>(observer => {
          observer.next([
            {
              id: 1,
              title: 'Total de Usuários',
              value: 'Erro',
              icon: 'people',
              color: 'blue'
            },
            {
              id: 2,
              title: 'Clientes',
              value: 'Erro',
              icon: 'person',
              color: 'green'
            },
            {
              id: 3,
              title: 'Funcionários',
              value: 'Erro',
              icon: 'badge',
              color: 'purple'
            },
            {
              id: 4,
              title: 'Administradores',
              value: 'Erro',
              icon: 'admin_panel_settings',
              color: 'red'
            }
          ]);
          observer.complete();
        });
      }
    });
  }

  getTipoColor(tipo?: string): string {
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

  getStatusColor(isActive: boolean): string {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Ativo' : 'Inativo';
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

  refreshStats(): void {
    console.log('Recarregando estatísticas de usuários...');
    this.loadUserStats();
  }

  private loadUsers(): void {
    this.isLoadingUsers = true;
    console.log('Carregando lista de usuários da API...');

    this.dashboardService.getAllUsers().subscribe({
      next: (users) => {
        console.log('Lista de usuários recebida:', users);
        this.isLoadingUsers = false;

        // Transformar os dados da API para o formato do componente
        const transformedUsers: Usuario[] = users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          cellphone: user.cellphone || '',
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          roles: user.roles || [],
          // Campos calculados
          iniciais: this.getIniciais(user.name),
          tipo: this.getTipoFromRoles(user.roles || [])
        }));

        // Atualizar o observable com os dados reais
        this.usuarios$ = new Observable<Usuario[]>(observer => {
          observer.next(transformedUsers);
          observer.complete();
        });
      },
      error: (error) => {
        console.error('Erro ao carregar lista de usuários:', error);
        this.isLoadingUsers = false;
        
        // Manter lista vazia em caso de erro
        this.usuarios$ = new Observable<Usuario[]>(observer => {
          observer.next([]);
          observer.complete();
        });
      }
    });
  }

  private getIniciais(nome: string): string {
    return nome
      .split(' ')
      .map(n => n.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  private getTipoFromRoles(roles: string[]): string {
    if (roles.includes('CLIENT_ADMIN')) {
      return 'Administrador';
    }
    if (roles.includes('CLIENT_EMPLOYEE')) {
      return 'Funcionario';
    }
    return 'Cliente';
  }

  refreshUsers(): void {
    console.log('Recarregando lista de usuários...');
    this.loadUsers();
  }
}