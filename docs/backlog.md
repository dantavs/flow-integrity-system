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

### 🛠️ Manutenção & Estabilidade
- [ ] **CORE-033:** **Implementação Operacional de Release DEV -> PROD:** Implementar automações/checagens do processo de release descrito em `docs/release-process.md`.

### 🛠️ Evolução da Estrutura de Gestão
- [ ] **CORE-009:** **Otimização de Backlog p/ Métricas:** Refinar formato do .md para KPIs automáticos.

## ✅ Concluído

### 👁️ Fase 3: Visão Executiva (VIEW)
- [x] **VIEW-009:** **Teste de Integridade das Reflexões** ([doc](feed-reflexoes-plan.md#view-009---teste-de-integridade-das-reflexoes))
  *(Início: 2026-02-24 | Fim: 2026-02-24)*
- [x] **VIEW-008:** **Controle de Ruído e Priorização Inicial** ([doc](feed-reflexoes-plan.md#view-008---controle-de-ruido-e-priorizacao-inicial))
  *(Início: 2026-02-24 | Fim: 2026-02-24)*
- [x] **VIEW-007:** **UI do Feed de Reflexões** ([doc](feed-reflexoes-plan.md#view-007---ui-do-feed-de-reflexoes))
  *(Início: 2026-02-24 | Fim: 2026-02-24)*
- [x] **VIEW-006:** **Motor de Regras do Feed (v1)** ([doc](feed-reflexoes-plan.md#view-006---motor-de-regras-do-feed-v1))
  *(Início: 2026-02-24 | Fim: 2026-02-24)*
- [x] **VIEW-005:** **Modelo de Reflexão e Taxonomia de Gatilhos** ([doc](feed-reflexoes-plan.md#view-005---modelo-de-reflexao-e-taxonomia-de-gatilhos))
  *(Início: 2026-02-24 | Fim: 2026-02-24)*
- [x] **VIEW-004:** **Hardening de Testes do Brief:** Expandir cobertura de borda e regressão após MVP (sem dados, datas no limite da semana, bloqueios e reincidência).
  *(Início: 2026-02-24 | Fim: 2026-02-24)*
- [x] **VIEW-003:** **UI do Resumo Semanal (v1):** Construir o bloco visual com os 4 indicadores estruturais, contagem e navegação para a lista filtrada correspondente.
  *(Início: 2026-02-24 | Fim: 2026-02-24)*
- [x] **VIEW-002:** **Camada de Agregação do Brief:** Implementar selectors/serviço que consolide os compromissos em um resumo semanal determinístico, sem opinião e sem inferência.
  *(Início: 2026-02-24 | Fim: 2026-02-24)*
- [x] **VIEW-001A:** **Regra de Execução TDD (Resumo Semanal):** Para cada regra nova do brief, criar primeiro teste falhando (vermelho), depois implementar (verde) e por fim refatorar.
  *(Início: 2026-02-24 | Fim: 2026-02-24)*
- [x] **VIEW-001:** **Definição do Resumo Semanal (Contrato de Métricas):** Formalizar regras de cálculo e critérios de inclusão para os blocos de Entregas da semana, Em risco, Bloqueados, Reincidentes e Concluídos recentes.
  *(Início: 2026-02-23 | Fim: 2026-02-23)*

### 🚀 Fase 2: Governança e Integridade
- [x] **CORE-024:** **Score de Integridade de Fluxo:** Indicador visual da % de saúde do sistema.
  *(Início: 2026-02-23 | Fim: 2026-02-23)*
- [x] **CORE-028:** **Sistema de Dependências entre Compromissos:** Permitir vínculo explícito de dependência entre compromissos (quem depende de quem), com visualização e impacto básico.
  *(Início: 2026-02-23 | Fim: 2026-02-23)*
- [x] **CORE-025:** **Gestão Dinâmica de Riscos:** Evoluir o campo de riscos para uma estrutura com categorias, status de mitigação e impacto na matriz de risco.
  *(Início: 2026-02-23 | Fim: 2026-02-23)*
- [x] **CORE-026:** **Visualização de Histórico de Auditoria:** Criar um botão "Ver Histórico" na UI para exibir a linha do tempo (auditoria) de cada fluxo.
  *(Início: 2022-02-22 | Fim: 2026-02-22)*
- [x] **CORE-027:** **Edição Completa do Compromisso:** Permitir que campos-chave (Data, Título, Owner, etc) sejam editados após a criação, registrando no histórico.
  *(Início: 2026-02-22 | Fim: 2026-02-22)*
- [x] **SAFE-005:** **Governança de Prazos:** Reforçar regras de negócio para impedir que datas de entrega sejam definidas ou alteradas para o passado.  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*
- [x] **SAFE-004:** **Trilha de Auditoria Universal:** Sistema de registro de eventos imutável para toda e qualquer mudança em um compromisso.  
  *(Início: 2026-02-22 | Fim: 2026-02-22)*

### 🛠️ Manutenção & Estabilidade
- [x] **CORE-032:** **Processo de Release DEV -> PROD:** Definir checklist e gatilhos de release para validar em DEV antes de disponibilizar em PROD.
  *(Início: 2026-02-24 | Fim: 2026-02-24)*
- [x] **CORE-030:** **Segregação de Ambientes (DEV/PROD):** Isolar dados por ambiente (`localStorage` por chave), com fallback de migração e sinalização visual do ambiente ativo.
  *(Início: 2026-02-24 | Fim: 2026-02-24)*
- [x] **CORE-031:** **Ferramentas de Base em DEV:** Adicionar ação explícita para limpar base local no ambiente de desenvolvimento sem impactar produção.
  *(Início: 2026-02-24 | Fim: 2026-02-24)*
- [x] **FIX-001:** **Crash de Campos Obrigatórios:** Tratar erro fatal que quebra a aplicação caso o usuário limpe manualmente/zere o campo de 'Data de Entrega' (ou outros inputs restritos) durante cadastro ou edição.
  *(Início: 2026-02-23 | Fim: 2026-02-23)*
- [x] **CORE-029:** **Entrada Progressiva (Riscos/Dependências):** Tornar blocos avançados colapsáveis para reduzir fricção no cadastro, abrindo apenas quando necessário.
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



