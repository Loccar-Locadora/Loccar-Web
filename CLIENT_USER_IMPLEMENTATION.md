# Implementação de Controle de Acesso para CLIENT_USER

## Resumo
Foi implementado um sistema de controle de acesso baseado em roles para usuários do tipo CLIENT_USER, onde estes usuários têm acesso apenas à tela de gestão de veículos.

## Alterações Realizadas

### 1. Modelos de Autenticação (`auth.models.ts`)
- Adicionado o role `CLIENT_USER` à interface `User`
- Tipo de role expandido para: `'Admin' | 'Cliente' | 'Funcionario' | 'CLIENT_USER'`

### 2. Serviço de Autenticação (`auth.service.ts`)
- **Método `normalizeRole()`**: Atualizado para reconhecer e mapear o role `CLIENT_USER`
- **Novos métodos de verificação de permissões**:
  - `canAccessDashboard()`: Retorna `false` para CLIENT_USER
  - `canAccessUserManagement()`: Retorna `true` apenas para Admin e Funcionario
  - `canAccessVehicleManagement()`: Retorna `true` para todos os tipos de usuário
  - `isClientUser()`: Verifica se o usuário atual é CLIENT_USER
  - `getDefaultRouteForUser()`: Retorna a rota padrão baseada no role do usuário

### 3. Componente Sidebar (`sidebar.component.ts` e `.html`)
- **Adicionados métodos de verificação de permissão** no componente TypeScript
- **Template atualizado** com diretivas `*ngIf` para mostrar/ocultar itens do menu baseado nas permissões:
  - Dashboard: Oculto para CLIENT_USER
  - Gestão de Usuários: Apenas para Admin e Funcionario
  - Gestão de Veículos: Visível para todos

### 4. Guard de Roles (`role.guard.ts`)
- **Novo guard criado** para controlar acesso às rotas baseado no role do usuário
- **Lógica específica para CLIENT_USER**: Redireciona automaticamente para `/veiculos` se tentar acessar outras páginas
- **Validação de permissões** para cada rota específica

### 5. Rotas (`app.routes.ts`)
- **Adicionado `roleGuard`** às rotas protegidas
- **Rota padrão atualizada** para `/dashboard` (que será redirecionada pelo guard se necessário)

### 6. Componente de Login (`login.component.ts`)
- **Redirecionamento inteligente**: Usuários CLIENT_USER são automaticamente redirecionados para `/veiculos` após login
- **Verificação de usuário logado**: Usa a rota padrão apropriada baseada no role

## Comportamento do Sistema

### Para usuários CLIENT_USER:
1. **Login**: Redirecionados automaticamente para `/veiculos`
2. **Sidebar**: Apenas o item "Gestão de Veículos" é visível
3. **Acesso direto a outras rotas**: Automaticamente redirecionados para `/veiculos`
4. **Navegação**: Limitada apenas à gestão de veículos

### Para outros usuários (Admin, Funcionario, Cliente):
1. **Login**: Redirecionados para `/dashboard`
2. **Sidebar**: Itens visíveis baseados nas permissões específicas do role
3. **Acesso às rotas**: Controlado pelas permissões específicas de cada role

## Fluxo de Funcionamento

1. **Login**: Usuário faz login → AuthService normaliza o role → Redirecionamento baseado no role
2. **Navegação**: Guards verificam permissões → Redirecionamento se necessário
3. **Interface**: Sidebar mostra apenas itens permitidos para o role do usuário
4. **Segurança**: Tentativas de acesso não autorizado são automaticamente redirecionadas

## Teste da Implementação

Para testar, faça login com um usuário que tenha o role `CLIENT_USER` na API. O sistema deve:
- Redirecionar automaticamente para `/veiculos` após login
- Mostrar apenas "Gestão de Veículos" na sidebar
- Redirecionar para `/veiculos` se tentar acessar `/dashboard` ou `/usuarios` diretamente