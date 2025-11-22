import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../layouts/sidebar/sidebar.component';
import { Observable } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { UserStatistics } from '../dashboard/models';
import { UserModalComponent, UserFormData } from './user-modal.component';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal.component';
import { CustomerService } from '../../services/customer.service';

export interface Usuario {
  id: string;
  name: string;
  email: string;
  cellphone: string;
  driverLicense?: string;
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
  imports: [CommonModule, SidebarComponent, UserModalComponent, ConfirmationModalComponent],
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
  isUserModalOpen = false;
  isEditMode = false;
  selectedUserData: UserFormData | null = null;
  
  // Dados para filtragem
  allUsers: Usuario[] = [];
  filteredUsers: Usuario[] = [];
  
  // Confirmation modal
  isConfirmationModalOpen = false;
  userToDelete: Usuario | null = null;
  isDeleting = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private customerService: CustomerService
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
          color: 'purple'
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
    
    // Verificar se deve abrir modal de criação
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'create') {
        console.log('Abrindo modal de criação de usuário via queryParam');
        this.novoUsuario();
        // Limpar o queryParam para evitar reabrir o modal
        this.router.navigate([], { queryParams: {} });
      }
    });
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
              color: 'purple'
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
              color: 'purple'
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
    console.log('Carregando dados do usuário para edição:', usuario);
    
    // Buscar dados completos do usuário
    this.customerService.getCustomer(usuario.id).subscribe({
      next: (customerData) => {
        console.log('Dados do usuário carregados:', customerData);
        
        // Converter dados da API para o formato do formulário
        this.selectedUserData = {
          id: usuario.id,
          username: customerData.username || usuario.name,
          email: customerData.email || usuario.email,
          driverLicense: customerData.driverLicense || usuario.driverLicense || '',
          cellPhone: customerData.cellphone || usuario.cellphone
        };
        
        console.log('Dados preparados para edição:', this.selectedUserData);
        
        this.isEditMode = true;
        this.isUserModalOpen = true;
      },
      error: (error) => {
        console.error('Erro ao carregar dados do usuário:', error);
        
        // Se falhar na API, usar dados da lista
        this.selectedUserData = {
          id: usuario.id,
          username: usuario.name,
          email: usuario.email,
          driverLicense: usuario.driverLicense || '',
          cellPhone: usuario.cellphone
        };
        
        this.isEditMode = true;
        this.isUserModalOpen = true;
      }
    });
  }

  excluirUsuario(usuario: Usuario): void {
    console.log('Preparando exclusão do usuário:', usuario);
    this.userToDelete = usuario;
    this.isConfirmationModalOpen = true;
  }

  novoUsuario(): void {
    console.log('Abrindo modal de novo usuário');
    this.selectedUserData = null;
    this.isEditMode = false;
    this.isUserModalOpen = true;
  }

  onFiltroChange(filtro: string): void {
    this.filtroTipo = filtro;
    this.applyFilters();
  }

  onBuscaChange(termo: string): void {
    this.termoBusca = termo;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.allUsers];

    // Filtro por tipo/papel
    if (this.filtroTipo !== 'todos') {
      filtered = filtered.filter(user => user.tipo === this.filtroTipo);
    }

    // Filtro por busca (nome ou email)
    if (this.termoBusca.trim()) {
      const searchTerm = this.termoBusca.toLowerCase().trim();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.cellphone.includes(searchTerm)
      );
    }

    this.filteredUsers = filtered;
    
    // Atualizar o observable com os dados filtrados
    this.usuarios$ = new Observable<Usuario[]>(observer => {
      observer.next(this.filteredUsers);
      observer.complete();
    });
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
          driverLicense: user.driverLicense || '',
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          roles: user.roles || [],
          // Campos calculados
          iniciais: this.getIniciais(user.name),
          tipo: this.getTipoFromRoles(user.roles || [])
        }));

        // Armazenar dados originais e aplicar filtros
        this.allUsers = transformedUsers;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Erro ao carregar lista de usuários:', error);
        this.isLoadingUsers = false;
        
        // Limpar dados em caso de erro
        this.allUsers = [];
        this.filteredUsers = [];
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

  resetFilters(): void {
    this.filtroTipo = 'todos';
    this.termoBusca = '';
    this.applyFilters();
  }

  onCloseUserModal(): void {
    console.log('Fechando modal de usuário');
    this.isUserModalOpen = false;
    this.isEditMode = false;
    this.selectedUserData = null;
  }

  onUserSubmit(userData: UserFormData): void {
    console.log('Usuário processado via modal:', userData);
    // Recarregar listas após cadastro/edição
    this.loadUsers();
    this.loadUserStats();
    this.isUserModalOpen = false;
    this.isEditMode = false;
    this.selectedUserData = null;
  }

  // Métodos do modal de confirmação
  onConfirmDelete(): void {
    if (!this.userToDelete) return;

    this.isDeleting = true;
    console.log('Excluindo usuário:', this.userToDelete);

    this.customerService.deleteCustomer(this.userToDelete.id).subscribe({
      next: (response) => {
        console.log('Usuário excluído com sucesso:', response);
        this.isDeleting = false;
        this.isConfirmationModalOpen = false;
        this.userToDelete = null;
        
        // Recarregar listas
        this.loadUsers();
        this.loadUserStats();
      },
      error: (error) => {
        console.error('Erro ao excluir usuário:', error);
        this.isDeleting = false;
        // Manter modal aberto para mostrar erro ou tentar novamente
      }
    });
  }

  onCancelDelete(): void {
    console.log('Cancelando exclusão');
    this.isConfirmationModalOpen = false;
    this.userToDelete = null;
    this.isDeleting = false;
  }
}