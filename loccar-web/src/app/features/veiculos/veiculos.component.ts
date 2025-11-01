import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layouts/sidebar/sidebar.component';
import { Observable } from 'rxjs';

export interface Veiculo {
  id: string;
  nome: string;
  marca: string;
  ano: number;
  categoria: 'Sedan' | 'SUV' | 'Economico' | 'Luxury' | 'Hatch';
  imagem: string;
  lugares: number;
  cambio: 'Automático' | 'Manual';
  combustivel: 'Flex' | 'Gasolina' | 'Diesel' | 'Elétrico';
  precoDia: number;
  status: 'Disponível' | 'Indisponível' | 'Manutenção';
  ativo: boolean;
}

export interface VehicleStats {
  id: number;
  title: string;
  value: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './veiculos.component.html',
  styleUrls: ['./veiculos.component.scss']
})
export class VeiculosComponent {
  veiculos$: Observable<Veiculo[]>;
  vehicleStats$: Observable<VehicleStats[]>;
  filtroCategoria = 'todas';
  filtroStatus = 'todos';
  termoBusca = '';

  constructor(private router: Router) {
    // Mock data para veículos
    this.veiculos$ = new Observable<Veiculo[]>(observer => {
      observer.next([
        {
          id: '1',
          nome: 'Toyota Corolla 2023',
          marca: 'Toyota',
          ano: 2023,
          categoria: 'Sedan',
          imagem: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          lugares: 5,
          cambio: 'Automático',
          combustivel: 'Flex',
          precoDia: 120,
          status: 'Disponível',
          ativo: true
        },
        {
          id: '2',
          nome: 'Honda HR-V 2023',
          marca: 'Honda',
          ano: 2023,
          categoria: 'SUV',
          imagem: 'https://images.unsplash.com/photo-1570829460005-c840387bb1ca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          lugares: 5,
          cambio: 'Automático',
          combustivel: 'Flex',
          precoDia: 150,
          status: 'Disponível',
          ativo: true
        },
        {
          id: '3',
          nome: 'Volkswagen Gol 2023',
          marca: 'Volkswagen',
          ano: 2023,
          categoria: 'Economico',
          imagem: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          lugares: 5,
          cambio: 'Manual',
          combustivel: 'Flex',
          precoDia: 80,
          status: 'Disponível',
          ativo: true
        },
        {
          id: '4',
          nome: 'BMW X3 2023',
          marca: 'BMW',
          ano: 2023,
          categoria: 'Luxury',
          imagem: 'https://images.unsplash.com/photo-1580414026060-96e2988c7d82?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          lugares: 5,
          cambio: 'Automático',
          combustivel: 'Gasolina',
          precoDia: 280,
          status: 'Indisponível',
          ativo: true
        },
        {
          id: '5',
          nome: 'Ford Ka 2023',
          marca: 'Ford',
          ano: 2023,
          categoria: 'Hatch',
          imagem: 'https://images.unsplash.com/photo-1494905998402-395d579af36f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          lugares: 4,
          cambio: 'Manual',
          combustivel: 'Flex',
          precoDia: 70,
          status: 'Disponível',
          ativo: true
        },
        {
          id: '6',
          nome: 'Hyundai Creta 2023',
          marca: 'Hyundai',
          ano: 2023,
          categoria: 'SUV',
          imagem: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          lugares: 5,
          cambio: 'Automático',
          combustivel: 'Flex',
          precoDia: 140,
          status: 'Disponível',
          ativo: true
        }
      ]);
    });

    // Stats dos veículos
    this.vehicleStats$ = new Observable<VehicleStats[]>(observer => {
      observer.next([
        {
          id: 1,
          title: 'Total de Veículos',
          value: '6',
          icon: 'directions_car',
          color: 'blue'
        },
        {
          id: 2,
          title: 'Disponíveis',
          value: '5',
          icon: 'check_circle',
          color: 'green'
        },
        {
          id: 3,
          title: 'Indisponíveis',
          value: '1',
          icon: 'warning',
          color: 'red'
        },
        {
          id: 4,
          title: 'Categorias',
          value: '5',
          icon: 'category',
          color: 'purple'
        }
      ]);
    });
  }

  getCategoriaColor(categoria: string): string {
    switch (categoria) {
      case 'Sedan':
        return 'bg-blue-100 text-blue-800';
      case 'SUV':
        return 'bg-green-100 text-green-800';
      case 'Economico':
        return 'bg-yellow-100 text-yellow-800';
      case 'Luxury':
        return 'bg-purple-100 text-purple-800';
      case 'Hatch':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Disponível':
        return 'bg-green-100 text-green-800';
      case 'Indisponível':
        return 'bg-red-100 text-red-800';
      case 'Manutenção':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  editarVeiculo(veiculo: Veiculo): void {
    console.log('Editar veículo:', veiculo);
    // Implementar navegação para edição
  }

  inativarVeiculo(veiculo: Veiculo): void {
    console.log('Inativar veículo:', veiculo);
    // Implementar inativação
  }

  excluirVeiculo(veiculo: Veiculo): void {
    console.log('Excluir veículo:', veiculo);
    // Implementar confirmação e exclusão
  }

  novoVeiculo(): void {
    console.log('Novo veículo');
    // Implementar navegação para criação
  }

  onCategoriaChange(categoria: string): void {
    this.filtroCategoria = categoria;
    // Implementar filtragem
  }

  onStatusChange(status: string): void {
    this.filtroStatus = status;
    // Implementar filtragem
  }

  onBuscaChange(termo: string): void {
    this.termoBusca = termo;
    // Implementar busca
  }
}