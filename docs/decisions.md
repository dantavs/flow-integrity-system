# DecisÃµes de Arquitetura (ADR)

Este arquivo registra as decisÃµes arquiteturais significativas tomadas durante o projeto.

## [2026-02-22] 01: Escolha do Framework Web
- **DecisÃ£o:** Uso de Next.js com App Router.
- **Contexto:** Necessidade de agilidade no desenvolvimento frontend e backend integrados.
- **ConsequÃªncias:** SSR disponÃ­vel nativamente, roteamento otimizado.

## [2026-02-22] 02: Linguagem de ProgramaÃ§Ã£o
- **DecisÃ£o:** TypeScript.
- **Contexto:** Garantir a integridade do cÃ³digo e facilitar refatoraÃ§Ãµes em um sistema de fluxos complexos.
- **ConsequÃªncias:** Maior seguranÃ§a de tipos e melhor experiÃªncia de desenvolvimento.

## [2026-02-22] 03: Estrutura de DocumentaÃ§Ã£o
- **DecisÃ£o:** DocumentaÃ§Ã£o viva em arquivos Markdown dentro da pasta `/docs`.
- **Contexto:** Manter a documentaÃ§Ã£o prÃ³xima ao cÃ³digo para facilitar a manutenÃ§Ã£o e versionamento.
- **ConsequÃªncias:** HistÃ³rico de evoluÃ§Ã£o do produto acessÃ­vel via Git.

## [2026-02-22] 04: Motor de Testes
- **DecisÃ£o:** SubstituiÃ§Ã£o do Jest pelo **Vitest**.
- **Contexto:** Dificuldades tÃ©cnicas na configuraÃ§Ã£o do Jest com Next.js 15+ e TypeScript em ambientes com espaÃ§os no path. Vitest oferece melhor integraÃ§Ã£o com o ecossistema moderno e Ã© mais veloz.
- **ConsequÃªncias:** ConfiguraÃ§Ã£o simplificada, maior velocidade de execuÃ§Ã£o e compatibilidade nativa com ESM.

## [2026-02-23] 05: Contrato DeterminÃ­stico do Resumo Semanal (VIEW-001)
- **DecisÃ£o:** Definir o Resumo Semanal v1 por contrato explÃ­cito de mÃ©tricas e thresholds fixos, sem interpretaÃ§Ã£o por IA.
- **Contexto:** Necessidade de garantir leitura objetiva e reproduzÃ­vel dos 4 blocos (Entregas da prÃ³xima semana, Em risco, Bloqueados, Reincidentes) antes da etapa de agregaÃ§Ã£o (VIEW-002).
- **ConsequÃªncias:** Regras transparentes e auditÃ¡veis, menor ambiguidade de implementaÃ§Ã£o e base estÃ¡vel para evoluÃ§Ã£o futura.


