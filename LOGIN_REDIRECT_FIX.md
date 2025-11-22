# Correção do Redirecionamento Após Login - CLIENT_USER

## Problema Identificado
O usuário estava sendo logado com sucesso (retornando 200), mas não era redirecionado para lugar nenhum, voltando para a tela de login.

## Causa Raiz
1. **Operação Assíncrona Não Aguardada**: O método `login()` no `AuthService` estava fazendo uma chamada assíncrona interna para buscar dados do usuário (`getUserByEmail`), mas o Observable principal completava antes dessa operação terminar.

2. **Redirecionamento Inadequado**: O login component estava sempre tentando redirecionar para `/dashboard`, independente do role do usuário.

## Correções Implementadas

### 1. AuthService (`auth.service.ts`)
**Problema**: Observable de login completava antes dos dados do usuário serem salvos.

**Solução**: Refatorado o método `login()` para usar `switchMap` em vez de `tap`, garantindo que o Observable só complete quando todos os dados do usuário estiverem prontos.

```typescript
// ANTES: tap() - operação assíncrona interna
login(credentials: LoginRequest): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(this.LOGIN_URL, credentials)
    .pipe(
      tap(response => {
        // getUserByEmail() executava assincronamente
        this.getUserByEmail(credentials.email).subscribe(...)
      })
    );
}

// DEPOIS: switchMap() - aguarda operação interna
login(credentials: LoginRequest): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(this.LOGIN_URL, credentials)
    .pipe(
      switchMap(response => {
        // Aguarda getUserByEmail() completar antes de finalizar
        return this.getUserByEmail(credentials.email).pipe(...)
      })
    );
}
```

### 2. Login Component (`login.component.ts`)
**Problema**: Sempre redirecionava para `/dashboard`.

**Solução**: Implementado método `getRedirectUrl()` que redireciona baseado no role:
- `CLIENT_USER` → `/veiculos`
- `Admin/Funcionario` → `/dashboard`

```typescript
private getRedirectUrl(): string {
  const currentUser = this.authService.getCurrentUser();
  
  if (currentUser?.role === 'CLIENT_USER') {
    return '/veiculos';
  } else if (currentUser?.role === 'Admin' || currentUser?.role === 'Funcionario') {
    return '/dashboard';
  } else {
    return '/dashboard'; // fallback
  }
}
```

### 3. Imports RxJS
Adicionados os operadores necessários:
```typescript
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
```

## Fluxo Corrigido

### Para CLIENT_USER:
1. ✅ **Login**: Usuário faz login
2. ✅ **Autenticação**: Token salvo e dados do usuário carregados
3. ✅ **Redirecionamento**: Direcionado para `/veiculos`
4. ✅ **Proteção**: Guards bloqueiam acesso a `/dashboard` e `/usuarios`

### Para Admin/Funcionario:
1. ✅ **Login**: Usuário faz login
2. ✅ **Autenticação**: Token salvo e dados do usuário carregados
3. ✅ **Redirecionamento**: Direcionado para `/dashboard`
4. ✅ **Acesso Total**: Podem acessar todas as funcionalidades

## Validação
- ✅ **Compilação**: Projeto compila sem erros
- ✅ **Sincronização**: Login só completa quando dados do usuário estão prontos
- ✅ **Redirecionamento**: Baseado no role do usuário
- ✅ **Logs**: Console logs para debugging

## Teste Recomendado
1. Fazer login com usuário CLIENT_USER
2. Verificar se é redirecionado para `/veiculos`
3. Tentar acessar `/dashboard` ou `/usuarios` diretamente na URL
4. Confirmar que é redirecionado de volta para `/veiculos`

A correção garante que usuários CLIENT_USER sejam sempre direcionados para a gestão de veículos após o login bem-sucedido.