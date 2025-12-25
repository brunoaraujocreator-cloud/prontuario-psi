# Guia de Testes - Prontuário PSI

Este documento descreve como testar todas as funcionalidades do sistema.

## Pré-requisitos

- Frontend rodando em http://localhost:3000
- Backend rodando em http://localhost:3001
- Supabase configurado e migrations executadas
- Conta de teste criada no Supabase

## Checklist de Testes

### 1. Autenticação

#### 1.1 Registro de Usuário
- [ ] Acessar página de registro
- [ ] Preencher formulário com email e senha válidos
- [ ] Submeter formulário
- [ ] Verificar se usuário foi criado no Supabase
- [ ] Verificar se redireciona para login ou dashboard

#### 1.2 Login
- [ ] Acessar página de login
- [ ] Inserir credenciais válidas
- [ ] Verificar se login é bem-sucedido
- [ ] Verificar se token JWT é armazenado
- [ ] Verificar se redireciona para dashboard

#### 1.3 Logout
- [ ] Clicar em logout
- [ ] Verificar se token é removido
- [ ] Verificar se redireciona para login

#### 1.4 Proteção de Rotas
- [ ] Tentar acessar rota protegida sem login
- [ ] Verificar se redireciona para login
- [ ] Fazer login e verificar acesso

### 2. Dashboard

- [ ] Carregar dashboard após login
- [ ] Verificar se estatísticas são exibidas
- [ ] Verificar se gráficos são renderizados
- [ ] Verificar se dados financeiros estão corretos
- [ ] Verificar responsividade

### 3. Módulo de Pacientes

#### 3.1 Listar Pacientes
- [ ] Acessar módulo de pacientes
- [ ] Verificar se lista está vazia inicialmente
- [ ] Verificar se tabela é exibida corretamente

#### 3.2 Criar Paciente
- [ ] Clicar em "Novo Paciente"
- [ ] Preencher formulário completo
- [ ] Incluir CPF (testar criptografia)
- [ ] Salvar paciente
- [ ] Verificar se aparece na lista
- [ ] Verificar se CPF está criptografado no banco

#### 3.3 Editar Paciente
- [ ] Clicar em editar em um paciente
- [ ] Modificar dados
- [ ] Salvar alterações
- [ ] Verificar se mudanças foram salvas

#### 3.4 Excluir Paciente
- [ ] Clicar em excluir
- [ ] Confirmar exclusão
- [ ] Verificar se paciente foi removido da lista

### 4. Módulo de Sessões

#### 4.1 Listar Sessões
- [ ] Acessar módulo de sessões
- [ ] Verificar lista de sessões

#### 4.2 Criar Sessão
- [ ] Criar nova sessão
- [ ] Associar a um paciente
- [ ] Definir data, hora e valor
- [ ] Salvar sessão
- [ ] Verificar se aparece na lista

#### 4.3 Editar Sessão
- [ ] Editar sessão existente
- [ ] Alterar status (Agendada → Concluída)
- [ ] Verificar se mudanças foram salvas

#### 4.4 Excluir Sessão
- [ ] Excluir sessão
- [ ] Verificar remoção

### 5. Módulo de Grupos

- [ ] Listar grupos
- [ ] Criar novo grupo
- [ ] Editar grupo
- [ ] Excluir grupo

### 6. Módulo de Eventos

- [ ] Listar eventos
- [ ] Criar novo evento
- [ ] Editar evento
- [ ] Excluir evento

### 7. Calendário

- [ ] Visualizar calendário mensal
- [ ] Navegar entre meses
- [ ] Verificar se eventos e sessões aparecem
- [ ] Clicar em "Hoje" para voltar ao mês atual

### 8. Agenda

- [ ] Visualizar agenda semanal
- [ ] Navegar entre semanas
- [ ] Verificar se sessões aparecem nos horários corretos
- [ ] Verificar se eventos aparecem

### 9. Módulo Financeiro

#### 9.1 Recebíveis
- [ ] Listar recebíveis
- [ ] Criar novo recebível
- [ ] Marcar como pago
- [ ] Filtrar por status

#### 9.2 Despesas
- [ ] Listar despesas
- [ ] Criar nova despesa
- [ ] Editar despesa
- [ ] Excluir despesa

#### 9.3 Faturamento
- [ ] Listar notas fiscais
- [ ] Criar nova nota fiscal
- [ ] Visualizar nota fiscal

### 10. Relatórios

#### 10.1 Editor Quill
- [ ] Acessar módulo de relatórios
- [ ] Verificar se editor Quill carrega
- [ ] Testar formatação de texto
- [ ] Testar inserção de imagens
- [ ] Verificar salvamento automático

#### 10.2 Geração de PDF
- [ ] Criar conteúdo no editor
- [ ] Clicar em "Gerar PDF"
- [ ] Verificar se PDF é gerado
- [ ] Verificar se PDF abre em nova aba
- [ ] Verificar formatação do PDF

### 11. Histórico

- [ ] Acessar módulo de histórico
- [ ] Verificar se registros aparecem
- [ ] Filtrar por tipo
- [ ] Verificar ordenação por data

### 12. Pendências

- [ ] Acessar módulo de pendências
- [ ] Verificar se recebíveis pendentes aparecem
- [ ] Verificar se sessões agendadas aparecem
- [ ] Marcar recebível como pago
- [ ] Concluir sessão

### 13. Configurações

- [ ] Acessar configurações
- [ ] Alternar entre tema claro/escuro
- [ ] Alterar cor primária
- [ ] Verificar se mudanças são aplicadas

### 14. Criptografia

- [ ] Criar paciente com CPF
- [ ] Verificar no banco de dados que CPF está criptografado
- [ ] Fazer login novamente
- [ ] Verificar se CPF é descriptografado corretamente na interface

### 15. Row Level Security (RLS)

#### 15.1 Isolamento de Dados
- [ ] Criar dois usuários diferentes
- [ ] Fazer login com usuário 1
- [ ] Criar pacientes, sessões, etc.
- [ ] Fazer logout
- [ ] Fazer login com usuário 2
- [ ] Verificar que não vê dados do usuário 1

### 16. Performance

- [ ] Testar carregamento inicial
- [ ] Testar navegação entre módulos
- [ ] Verificar se não há erros no console
- [ ] Testar em diferentes navegadores (Chrome, Firefox, Safari)

### 17. Responsividade

- [ ] Testar em desktop (1920x1080)
- [ ] Testar em tablet (768x1024)
- [ ] Testar em mobile (375x667)
- [ ] Verificar se sidebar funciona em mobile

### 18. Tratamento de Erros

- [ ] Desconectar internet
- [ ] Tentar fazer requisições
- [ ] Verificar se mensagens de erro são exibidas
- [ ] Reconectar internet
- [ ] Verificar se sistema recupera

## Testes de API (Opcional)

Use ferramentas como Postman ou curl:

```bash
# Health check
curl http://localhost:3001/api/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"senha123"}'

# Listar pacientes (com token)
curl http://localhost:3001/api/patients \
  -H "Authorization: Bearer SEU_TOKEN"
```

## Relatório de Testes

Após executar todos os testes, documente:

- ✅ Funcionalidades que passaram
- ❌ Funcionalidades que falharam
- ⚠️ Problemas encontrados
- 📝 Observações

## Próximos Passos

Após testes bem-sucedidos:
1. Fazer deploy em produção
2. Configurar monitoramento
3. Documentar problemas conhecidos

