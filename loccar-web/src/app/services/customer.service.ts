import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Customer {
  idCustomer?: number;
  username?: string;
  email?: string;
  cellphone?: string;
  driverLicense?: string;
  created?: string;
  authenticated?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly BASE_URL = environment.mainApiUrl + 'api/user';

  constructor(private http: HttpClient) {}

  /**
   * Buscar um cliente por ID
   */
  getCustomer(id: string | number): Observable<Customer> {
    return this.http.get<Customer>(`${this.BASE_URL}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Atualizar um cliente
   */
  updateCustomer(customer: Customer): Observable<ApiResponse<Customer>> {
    // Enviar apenas as informações necessárias
    const updateData = {
      username: customer.username,
      email: customer.email,
      cellphone: customer.cellphone,
      driverLicense: customer.driverLicense
    };
    
    return this.http.put<ApiResponse<Customer>>(`${this.BASE_URL}/update/${customer.idCustomer}`, updateData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Excluir um cliente
   */
  deleteCustomer(id: string | number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.BASE_URL}/delete/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Manipulador de erros
   */
  private handleError(error: HttpErrorResponse) {
    console.error('Erro na API:', error);
    
    let errorMessage = 'Ocorreu um erro inesperado';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 404) {
        errorMessage = 'Usuário não encontrado';
      } else if (error.status === 400) {
        errorMessage = 'Dados inválidos';
      } else if (error.status === 500) {
        errorMessage = 'Erro interno do servidor';
      }
    }
    
    return throwError(() => ({ 
      message: errorMessage,
      status: error.status,
      error: error.error 
    }));
  }
}