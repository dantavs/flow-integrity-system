# Backlog do Projeto

**Legenda de Status:**
- `[ ]` Pendente
- `[/]` Em andamento
- `[~]` Aguardando Aprovação
- `[x]` Concluído

## ⚡ Em Execução

## 📋 Planejado (Aguardando Início)

### 🤖 Inteligência e Automação (Flow Guardian)
- [ ] **AI-001:** **Flow Advisor (Criação):** Analisar clareza, ambiguidade e riscos no momento do preenchimento do formulário.
- [ ] **AI-002:** **Graph Engine (Correlação):** Mapear dependências invisíveis entre compromissos e alertar sobre efeitos em cascata.
- [ ] **AI-003:** **Integrity Guardian (Insights):** Gerar relatórios de saúde do fluxo e comportamentos de risco (ex: saturação de owners).

### 🚀 Fase 2: Governança e Integridade
- [ ] **CORE-025:** **Gestão Dinâmica de Riscos:** Evoluir o campo de riscos para uma estrutura com categorias, status de mitigação e impacto na matriz de risco.
- [ ] **CORE-024:** **Score de Integridade de Fluxo:** Indicador visual da % de saúde do sistema.

### 🛠️ Manutenção & Estabilidade

### 🛠️ Evolução da Estrutura de Gestão
- [ ] **CORE-009:** **Otimização de Backlog p/ Métricas:** Refinar formato do .md para KPIs automáticos.

## ✅ Concluído

### 🚀 Fase 2: Governança e Integridade
- [x] **CORE-026:** **Visualização de Histórico de Auditoria:** Criar um botão "Ver Histórico" na UI para exibir a linha do tempo (auditoria) de cada fluxo.
  *(Início: 2022-02-22 | Fim: 2026-02-22)*
- [x] **CORE-027:** **Edição Completa do Compromisso:** Permitir que campos-chave (Data, Título, Owner, etc) sejam editados após a criação, registrando no histórico.
  *(Início: 2026-02-22 | Fim: 2026-02-22)*
- [x] **SAFE-005:** **Governança de Prazos:** Reforçar regras de negócio para impedir que datas de entrega sejam definidas ou alteradas para o passado.  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*
- [x] **SAFE-004:** **Trilha de Auditoria Universal:** Sistema de registro de eventos imutável para toda e qualquer mudança em um compromisso.  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*

### 🛠️ Manutenção & Estabilidade
- [x] **FIX-001:** **Crash de Campos Obrigatórios:** Tratar erro fatal que quebra a aplicação caso o usuário limpe manualmente/zere o campo de 'Data de Entrega' (ou outros inputs restritos) durante cadastro ou edição.
  *(Início: 2026-02-23 | Fim: 2026-02-23)*

### 📦 Fase 1: Fundação & UI Premium
- [x] **CORE-015:** **Auto-complete Inteligente:** Implementar sugestões dinâmicas para os campos `Owner`, `Stakeholder` e `Projeto` baseadas no histórico, permitindo novas entradas.  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*
- [x] **CORE-019:** **Filtros de Lista:** Implementar filtragem por Projeto, Owner, Stakeholder e Tipo de Fluxo na visualização de lista.  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*
- [x] **CORE-008:** **Feedback Visual:** Implementar sistema de notificações (toasts) premium para confirmação de ações e feedback de salvamento.  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*
- [x] **CORE-022:** **Visualização de Arquivados:** Adicionar link/atalho para visualizar compromissos Inativos (Done/Cancelled), avaliando modal vs toggle de visualização.  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*
- [x] **CORE-023:** **Resiliência do Formulário:** Garantir que os dados preenchidos não sejam apagados caso a criação do compromisso falhe por erro de validação.  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*
- [x] **CORE-020:** **Ordenação Dinâmica:** Permitir ordenar a lista por Data de Entrega (mais próxima/distante). Implementar feedback visual de urgência (Amarelo < 7 dias, Vermelho < hoje).  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*
- [x] **CORE-021:** **Status Inicial Padrão:** Garantir que todos os novos compromissos sejam criados com o status `BACKLOG` por padrão.  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*
- [x] **CORE-007:** **Gestão de Estado:** Permitir a alteração de status (Pendente -> Em Progresso -> Concluído).  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*
- [x] **CORE-006:** **Visualização de Lista:** Listar compromissos ativos em uma UI limpa.  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*
- [x] **CORE-018:** **UX de Entrada:** Limpar o formulário automaticamente após a submissão bem-sucedida de um compromisso.  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*
- [x] **CORE-017:** **Bugfix de Datas:** Corrigir erro de fuso horário que altera o dia selecionado (ex: seleciona 24 e aparece 23).  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*
- [x] **CORE-016:** **Melhoria de UI:** Melhorar a visibilidade do ícone nativo do campo `Data de Entrega` in Dark Mode.  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*
- [x] **CORE-014:** **Refinamento Estético (UI/UX):** Implementar design premium, Dark Mode nativo, Minimalismo e Glassmorphism.  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*
- [x] **CORE-013:** **Regras de Negócio do Modelo:** Implementar validações (data, obrigatoriedade) e automações (ID, criadoEm) no modelo Commitment.  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*
- [x] **CORE-005:** **Persistência Inicial:** Implementar salvamento e recuperação via `localStorage`.  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*
- [x] **CORE-004:** **Interface de Entrada:** Criar formulário básico para captura de novos compromissos.  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*
- [x] **CORE-003:** **Definição de Modelo:** Criar o modelo `Commitment` (ID, Título, Descrição, Status, Data Criada).  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*
- [x] **CORE-002:** **Estrutura de Documentação:** Criação dos arquivos base em `/docs`.  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*
- [x] **CORE-001:** **Setup do Projeto:** Inicialização com Next.js e Git.  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*
- [x] **SAFE-001:** Adicionar campos de data de entrega.  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*
- [x] **SAFE-002:** Implementar visual de "Integridade em Risco" para prazos vencidos.  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*
- [x] **SAFE-003:** Criar sistema de categorias/tags para compromissos.  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*


