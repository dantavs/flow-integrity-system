# Diário de Atividades (Journal)

Registro cronológico do desenvolvimento, decisões rápidas e progresso do sistema.

## [2026-02-22] - Setup Inicial e Definição de Visão
- **Atividade:** Inicialização do repositório Git e configuração do projeto Next.js.
- **Atividade:** Criação da estrutura de documentação (`/docs`).
- **Atividade:** Definição da Visão, Princípios do Produto, Roadmap e Backlog inicial.
- **Insight:** O foco em "Compromissos" (Commitments) em vez de "Tarefas" (Tasks) será o diferencial competitivo do modelo mental do app.
- **Status:** Infraestrutura de documentação pronta.
- **Mudança Técnica:** Substituição do Jest pelo Vitest para garantir estabilidade e velocidade nos testes automatizados.
- **Atividade:** Implementação das Regras de Negócio (CORE-013) com validações de data, campos obrigatórios e automação de IDs no `CommitmentService`.
- **Atividade:** Criação da Interface de Entrada (CORE-004) com o componente `CommitmentForm` e integração na Home page, seguindo TDD.
- **Atividade:** Refinamento Estético e Aprovação (CORE-014). Design Premium Dark e Glassmorphism aprovados. Novos acordos de "Aprovação Necessária" estabelecidos.
- **Atividade:** Implementação da Persistência Local (CORE-005) usando `localStorage` e integrando ao ciclo de vida da página inicial com React Hooks.
- **Correções & UX:** Resolvido bug de fuso horário (CORE-017), melhorada visibilidade do ícone de data (CORE-016) e implementado reset de formulário (CORE-018). Ciclo aprovado pelo usuário e enviado ao repositório.
- **Arquitetura & UI:** Início da CORE-006. Modularização da listagem de compromissos em componentes específicos (`CommitmentList`, `CommitmentCard`) com melhorias na exibição de riscos e tipos de fluxo.
- **Funcionalidade:** Implementação da Gestão de Estado (CORE-007). Adicionado controle interativo nos cards para transição de status com persistência automática. Implementada lógica de "Arquivamento Automático": compromissos marcados como DONE ou CANCELLED deixam de ser exibidos na lista ativa para manter o foco no fluxo de trabalho.
- **Regra de Negócio:** Implementação da CORE-021. Novos compromissos agora são criados com o status `BACKLOG` por padrão, garantindo que todo fluxo inicie na fase de planejamento.
- **UX & Inteligência:** Implementação da CORE-020. Introduzida ordenação automática por Data de Entrega (mais próximos primeiro) e indicadores visuais de urgência: Datas em **Vermelho** para atrasos e **Amarelo** para entregas nos próximos 6 dias. Adicionado link para futura visualização de itens arquivados.
- **Resiliência:** Implementação da CORE-023. O formulário agora preserva os dados digitados em caso de falha na validação, resetando apenas após uma submissão bem-sucedida. Testes automatizados adicionados para garantir este comportamento.
- **Sincronização:** Git push realizado com as implementações de Ordenação Dinâmica (CORE-020) e Resiliência (CORE-023). Início da CORE-022 para visualização de arquivados.
- **Funcionalidade:** Implementação da CORE-022. Adicionada seção "Gestão de Fluxos" com abas interativas para alternar entre "Ativos" e "Arquivados" (Done/Cancelled). A interface agora permite visualizar o histórico de compromissos sem poluir a visão principal de trabalho.
- **Feedback & UX:** Início da CORE-008 para aprimorar a experiência de confirmação de ações com um sistema de notificações mais robusto e elegante.
- **Inteligência de Dados:** Implementação da CORE-019 (Filtros Dinâmicos). Adicionada barra de filtros que permite segmentar a lista por Projeto, Owner, Stakeholder e Tipo. Os filtros são populados automaticamente com base nos valores existentes no sistema, facilitando a localização de compromissos em bases de dados maiores.
- **UX e Agilidade:** Conclusão da CORE-015 (Auto-complete Inteligente). O formulário de registro agora sugere valores para Projeto, Owner e Stakeholder baseados nos lançamentos anteriores, reduzindo a carga cognitiva e erros de digitação, enquanto mantém a flexibilidade para novos nomes.
- **Estratégia e Governança:** Revisão completa do Backlog. Identificamos que a Fase 1 foi concluída com sucesso e que os itens iniciais da Fase 2 (Datas e Sensores de Risco) já foram absorvidos. Novas prioridades definidas focadas em Integridade Arrojada: Trilha de Auditoria Universal (SAFE-004), Governança de Prazos retroativos (SAFE-005) e Score de Saúde do Fluxo (CORE-024). Também foi adicionada a trilha de Inteligência Artificial para análise preditiva e de risco.
- **Auditoria e Histórico:** Conclusão da SAFE-004 (Trilha de Auditoria Universal). O modelo de dados e os serviços agora suportam gravação de eventos imutáveis. Toda mudança de status gera um `AuditEvent` no histórico do compromisso. Definimos os próximos passos CORE-026 (Visualização do Histórico) e CORE-027 (Edição Completa de Campos) baseados nesse alicerce.
