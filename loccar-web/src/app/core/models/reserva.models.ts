export interface Reserva {
  id: string;
  veiculo: {
    id: string;
    nome: string;
    modelo: string;
    ano: number;
    categoria: string;
    imagem: string;
  };
  dataInicio: Date;
  dataFim: Date;
  localRetirada: string;
  valorTotal: number;
  diasTotal: number;
  status: 'ativa' | 'concluida' | 'cancelada';
  cliente: {
    id: string;
    nome: string;
    email: string;
  };
  dataCriacao: Date;
  observacoes?: string;
}

export interface ReservaEstatisticas {
  ativas: number;
  concluidas: number;
  canceladas: number;
}

export interface ReservaFilter {
  status?: 'ativa' | 'concluida' | 'cancelada' | 'todas';
  dataInicio?: Date;
  dataFim?: Date;
}