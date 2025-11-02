// Interfaces para autenticação e usuários

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  driverLicense: string;
  cellPhone: string;
}

export interface User {
  id?: string;
  username: string;
  email: string;
  driverLicense: string;
  cellPhone: string;
  role?: 'Admin' | 'Cliente' | 'Funcionario';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  code: string;
  message: string;
  data: string; // JWT token
}

export interface ApiError {
  message: string;
  error?: string;
  statusCode?: number;
  status?: string;
}

// Interface para armazenar dados do usuário logado
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

// Interface para resposta de cadastro
export interface RegisterResponse {
  message: string;
  user: User;
  success?: boolean;
}