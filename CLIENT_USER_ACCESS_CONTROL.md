# Controle de Acesso para CLIENT_USER - Implementação

## Resumo das Alterações

Este documento descreve as implementações realizadas para remover o acesso ao dashboard e à gestão de usuários para usuários com role `CLIENT_USER`.

## Arquivos Modificados

### 1. `src/app/guards/role.guard.ts`
- **Alteração**: Aprimorado o controle de acesso para CLIENT_USER
- **Funcionalidade**: 
  - CLIENT_USER só pode acessar `/veiculos`
  - Bloqueia especificamente acesso a `/dashboard` e `/usuarios`
  - Redireciona CLIENT_USER para `/veiculos` quando tenta acessar rotas não autorizadas
  - Admin e Funcionario têm acesso total
  - Roles não reconhecidos são redirecionados para login

### 2. `src/app/guards/redirect.guard.ts` (NOVO)
- **Funcionalidade**: Guard para redirecionar usuários para a página inicial apropriada
- **Lógica**:
  - CLIENT_USER → `/veiculos`
  - Admin/Funcionario → `/dashboard`
  - Usuários não autenticados → `/login`
  - Roles não reconhecidos → `/login`

### 3. `src/app/app.routes.ts`
- **Alterações**:
  - Adicionado `roleGuard` às rotas protegidas (`dashboard`, `usuarios`, `veiculos`)
  - Implementado `redirectGuard` na rota raiz (`''`) para direcionamento inteligente
  - Importado os novos guards

## Funcionalidades Implementadas

### Controle de Acesso por Rota
- **Dashboard (`/dashboard`)**: Bloqueado para CLIENT_USER
- **Gestão de Usuários (`/usuarios`)**: Bloqueado para CLIENT_USER
- **Gestão de Veículos (`/veiculos`)**: Acessível para todos os usuários autenticados

### Controle Visual (Sidebar)
- O sidebar já estava implementado corretamente usando:
  - `canAccessDashboard()`: Oculta link do dashboard para CLIENT_USER
  - `canAccessUserManagement()`: Oculta gestão de usuários para CLIENT_USER
  - `canAccessVehicleManagement()`: Mostra veículos para todos

### Redirecionamento Inteligente
- Ao acessar a URL raiz (`/`), usuários são direcionados automaticamente:
  - CLIENT_USER → `/veiculos`
  - Admin/Funcionario → `/dashboard`

## Segurança Implementada

### 1. Proteção na URL
- Mesmo digitando `/dashboard` ou `/usuarios` diretamente na URL, CLIENT_USER será redirecionado para `/veiculos`

### 2. Proteção Visual
- Links para dashboard e gestão de usuários não aparecem no sidebar para CLIENT_USER

### 3. Logs de Segurança
- Todas as tentativas de acesso são logadas no console para auditoria

## Roles Suportados
- **CLIENT_USER**: Acesso apenas a veículos
- **Admin**: Acesso total (dashboard, usuarios, veiculos)
- **Funcionario**: Acesso total (dashboard, usuarios, veiculos)

## Comportamento Esperado

### Para CLIENT_USER:
1. Login → Redirecionado para `/veiculos`
2. Acesso à URL raiz → Redirecionado para `/veiculos`
3. Tentativa de acessar `/dashboard` → Redirecionado para `/veiculos`
4. Tentativa de acessar `/usuarios` → Redirecionado para `/veiculos`
5. Sidebar mostra apenas "Gestão de Veículos"

### Para Admin/Funcionario:
1. Login → Redirecionado para `/dashboard`
2. Acesso à URL raiz → Redirecionado para `/dashboard`
3. Acesso total a todas as funcionalidades
4. Sidebar mostra todas as opções

## Validação

Para testar as implementações:

1. **Teste com CLIENT_USER**:
   - Fazer login com usuário CLIENT_USER
   - Verificar redirecionamento automático para `/veiculos`
   - Tentar acessar `/dashboard` diretamente na URL
   - Tentar acessar `/usuarios` diretamente na URL
   - Verificar que sidebar mostra apenas "Gestão de Veículos"

2. **Teste com Admin/Funcionario**:
   - Fazer login com usuário Admin ou Funcionario
   - Verificar redirecionamento automático para `/dashboard`
   - Verificar acesso total a todas as funcionalidades
   - Verificar que sidebar mostra todas as opções

## Manutenção

Para adicionar novas rotas ou modificar permissões:

1. **Nova rota restrita**: Adicionar lógica no `role.guard.ts`
2. **Nova funcionalidade no sidebar**: Criar método correspondente no `auth.service.ts`
3. **Novo role**: Atualizar lógica em `role.guard.ts` e `redirect.guard.ts`