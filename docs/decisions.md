# Decisões de Arquitetura (ADR)

Este arquivo registra as decisões arquiteturais significativas tomadas durante o projeto.

## [2026-02-22] 01: Escolha do Framework Web
- **Decisão:** Uso de Next.js com App Router.
- **Contexto:** Necessidade de agilidade no desenvolvimento frontend e backend integrados.
- **Consequências:** SSR disponível nativamente, roteamento otimizado.

## [2026-02-22] 02: Linguagem de Programação
- **Decisão:** TypeScript.
- **Contexto:** Garantir a integridade do código e facilitar refatorações em um sistema de fluxos complexos.
- **Consequências:** Maior segurança de tipos e melhor experiência de desenvolvimento.

## [2026-02-22] 03: Estrutura de Documentação
- **Decisão:** Documentação viva em arquivos Markdown dentro da pasta `/docs`.
- **Contexto:** Manter a documentação próxima ao código para facilitar a manutenção e versionamento.
- **Consequências:** Histórico de evolução do produto acessível via Git.

## [2026-02-22] 04: Motor de Testes
- **Decisão:** Substituição do Jest pelo **Vitest**.
- **Contexto:** Dificuldades técnicas na configuração do Jest com Next.js 15+ e TypeScript em ambientes com espaços no path. Vitest oferece melhor integração com o ecossistema moderno e é mais veloz.
- **Consequências:** Configuração simplificada, maior velocidade de execução e compatibilidade nativa com ESM.

## [2026-02-23] 05: Contrato Determinístico do Weekly Brief (VIEW-001)
- **Decisão:** Definir o Weekly Brief v1 por contrato explícito de métricas e thresholds fixos, sem interpretação por IA.
- **Contexto:** Necessidade de garantir leitura objetiva e reproduzível dos 4 blocos (Entregas da próxima semana, Em risco, Bloqueados, Reincidentes) antes da etapa de agregação (VIEW-002).
- **Consequências:** Regras transparentes e auditáveis, menor ambiguidade de implementação e base estável para evolução futura.
