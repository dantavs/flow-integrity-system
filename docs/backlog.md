# Backlog do Projeto

**Legenda de Status:**
- `[ ]` Pendente
- `[/]` Em andamento
- `[~]` Aguardando Aprovação
- `[x]` Concluído

## ⚡ Em Execução
- [/] **CORE-022:** **Visualização de Arquivados:** Adicionar link/atalho para visualizar compromissos Inativos (Done/Cancelled), avaliando modal vs toggle de visualização.  
  *(Início: 2026-02-22 | Fim: -)*

## 📋 Planejado (Aguardando Início)

### 📦 Fase 1: Fundação
- [ ] **CORE-008:** **Feedback Visual:** Indicadores simples de que o compromisso foi salvo.  
  *(Início: - | Fim: -)*
- [ ] **CORE-009:** **Refinamento de Estrutura do Backlog:** Otimizar formato do arquivo para extração facilitada de métricas e relatórios automáticos.  
  *(Início: - | Fim: -)*
- [ ] **CORE-015:** **Auto-complete Inteligente:** Implementar sugestões dinâmicas para os campos `Owner`, `Stakeholder` e `Projeto` baseadas no histórico, permitindo novas entradas.  
  *(Início: - | Fim: -)*
- [ ] **CORE-019:** **Filtros de Lista:** Implementar filtragem por Projeto, Owner, Stakeholder e Tipo de Fluxo na visualização de lista.  
  *(Início: - | Fim: -)*

### 🚀 Fase 2: Segurança e Fluxo
- [ ] **SAFE-001:** Adicionar campos de data de entrega.
- [ ] **SAFE-002:** Implementar visual de "Integridade em Risco" para prazos vencidos.
- [ ] **SAFE-003:** Criar sistema de categorias/tags para compromissos.

## ✅ Concluído

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
- [x] **CORE-016:** **Melhoria de UI:** Melhorar a visibilidade do ícone nativo do campo `Data de Entrega` em Dark Mode.  
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
