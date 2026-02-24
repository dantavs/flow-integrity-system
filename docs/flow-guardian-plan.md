# Plano de Implementacao - Flow Guardian

## Objetivo
Implementar a camada de IA do produto com foco em decisao operacional, sem perder rastreabilidade.
O Flow Guardian sera dividido em tres entregas:
- AI-001: Flow Advisor (criacao)
- AI-002: Graph Engine (correlacao)
- AI-003: Integrity Guardian (insights)

## Escopo da v1
- IA como assistente de decisao, nao como motor autonomo de mudanca.
- Saida estruturada em JSON (sem texto livre como contrato principal).
- Transparencia: toda resposta precisa trazer `why` (explicacao tecnica curta).
- Degradacao segura: se IA falhar, o sistema continua operando com regras deterministicas ja existentes.

## Fora de escopo da v1
- Acionamento automatico sem validacao humana.
- Treino de modelo proprio.
- Persistencia server-side completa (enquanto o produto ainda opera com base local).

## Estado atual e premissas
- App atual: Next.js, dados principais em `localStorage`, segregados por `NEXT_PUBLIC_APP_ENV` (`dev`/`prod`).
- Ja existem camadas deterministicas de score, risco, dependencias, resumo semanal e feed de reflexoes.
- TDD e obrigatorio para todo o projeto.

## Arquitetura de execucao da IA

### Diretriz principal
Nao chamar provedor de IA diretamente no client.
Toda chamada passa por rota server-side do Next para proteger chave e aplicar validacao.

### Componentes tecnicos
1. `src/services/GuardianPromptBuilder.ts`
- Monta prompts com contexto minimo necessario.

2. `src/services/GuardianOutputSchema.ts`
- Valida resposta em JSON com schema estrito (ex.: Zod).

3. `src/services/GuardianProvider.ts`
- Adaptador de provedor (OpenAI inicialmente), com timeout, retry e idempotencia.

4. Rotas de API (server):
- `POST /api/guardian/advisor`
- `POST /api/guardian/graph`
- `POST /api/guardian/insights`

5. Persistencia auxiliar local (opcional na v1):
- cache curto de respostas e cooldown por chave.
- feedback do usuario para avaliacao futura.

### Fluxo de execucao (padrao)
1. UI prepara payload enxuto.
2. Rota server valida entrada.
3. Server monta prompt + schema esperado.
4. Provedor responde.
5. Server valida JSON de saida.
6. UI recebe resultado estruturado e exibe CTA.

### Fallback operacional
Se a IA falhar (timeout, schema invalido, limite de custo):
- retornar status controlado (`guardian_unavailable`).
- manter regras deterministicas ativas.
- nao bloquear fluxo principal do usuario.

## Configuracao (dev e prod)

### Variaveis recomendadas
- `NEXT_PUBLIC_APP_ENV=dev|prod` (ja existente)
- `NEXT_PUBLIC_FLOW_GUARDIAN_ENABLED=true|false`
- `FLOW_GUARDIAN_PROVIDER=openai`
- `FLOW_GUARDIAN_TIMEOUT_MS=15000`
- `FLOW_GUARDIAN_MAX_RETRIES=1`
- `FLOW_GUARDIAN_DAILY_BUDGET_USD=5`
- `FLOW_GUARDIAN_MODEL_ADVISOR=<modelo_rapido>`
- `FLOW_GUARDIAN_MODEL_GRAPH=<modelo_analitico>`
- `FLOW_GUARDIAN_MODEL_INSIGHTS=<modelo_analitico>`
- `OPENAI_API_KEY=<secret>`

Observacao:
- `OPENAI_API_KEY` deve existir apenas no servidor. Nunca usar prefixo `NEXT_PUBLIC_`.

### Exemplo de `.env.local` (desenvolvimento)
```env
NEXT_PUBLIC_APP_ENV=dev
NEXT_PUBLIC_FLOW_GUARDIAN_ENABLED=true
FLOW_GUARDIAN_PROVIDER=openai
FLOW_GUARDIAN_TIMEOUT_MS=15000
FLOW_GUARDIAN_MAX_RETRIES=1
FLOW_GUARDIAN_DAILY_BUDGET_USD=5
FLOW_GUARDIAN_MODEL_ADVISOR=model_fast
FLOW_GUARDIAN_MODEL_GRAPH=model_reasoning
FLOW_GUARDIAN_MODEL_INSIGHTS=model_reasoning
OPENAI_API_KEY=xxxx
```

### Setup operacional
1. Configurar variaveis no ambiente local.
2. Configurar mesmas variaveis no ambiente de deploy (sem expor segredo no client).
3. Subir app e validar rota `advisor` com payload de smoke test.
4. Ativar o recurso por feature flag.

## AI-001 - Flow Advisor (Criacao)

### Objetivo
Analisar qualidade de compromisso durante criacao/edicao: clareza, ambiguidade e risco de formulacao.

### Trigger
- Manual: botao "Analisar com IA" no formulario.
- Opcional: auto-analise apos debounce quando campos obrigatorios estiverem validos.

### Entrada
- `titulo`, `projeto`, `owner`, `stakeholder`, `dataEsperada`, `tipo`, `impacto`, `riscos`, `dependencias`.

### Saida esperada (JSON)
- `qualityScore` (0..100)
- `ambiguities[]`
- `riskHints[]`
- `rewriteSuggestions[]`
- `recommendedActions[]`
- `why`

### Resultado esperado
- Melhor qualidade de escrita e menor ambiguidade antes de salvar.
- Sugestoes acionaveis, sem alterar automaticamente o compromisso.

### Criterios de aceite
- Resposta validada por schema.
- UI exibe sugestoes sem travar formulario.
- Falha de IA nao impede cadastro.

## AI-002 - Graph Engine (Correlacao)

### Objetivo
Mapear dependencias implicitas e possivel efeito em cascata entre compromissos.

### Estrategia v1 (hibrida)
1. Base deterministica: grafo explicito por `dependencias`.
2. Candidatos implicitos: heuristicas por projeto/owner/stakeholder/tipo/prazo.
3. IA valida e prioriza correlacoes candidatas.

### Entrada
- Snapshot de compromissos ativos.

### Saida esperada (JSON)
- `edges[]` com `sourceId`, `targetId`, `confidence`, `reason`.
- `clusters[]` de risco de cascata.
- `why`

### Resultado esperado
- Alertas de correlacoes que hoje nao estao explicitas no cadastro.

### Criterios de aceite
- Nenhum edge sem `reason`.
- Threshold de confianca configuravel.
- Possibilidade de ignorar/rejeitar sugestao na UI.

## AI-003 - Integrity Guardian (Insights)

### Objetivo
Gerar leitura executiva de comportamento sistemico (risco concentrado, saturacao, reincidencia).

### Modo de execucao
- On-demand via botao "Gerar Insights".
- Opcional em producao: agendamento (cron) para sumario periodico.

### Entrada
- Snapshot agregado do sistema (ativos, arquivados recentes, riscos, renegociacoes, owners/projetos).

### Saida esperada (JSON)
- `insights[]` com `severity`, `headline`, `evidence`, `recommendedAction`, `why`.
- `systemSignals` (ex.: saturacao por owner, risco por projeto).

### Resultado esperado
- Relatorio acionavel para lideranca sem burocracia.

### Criterios de aceite
- Cada insight contem evidencia objetiva.
- Sem recomendacoes vagas sem vinculo com dados.

## Seguranca e privacidade
- Chave de IA somente no servidor.
- Sanitizar payload (evitar enviar texto desnecessario).
- Logs sem dados sensiveis em claro.
- Timeout e retry limitados para evitar bloqueio.
- Controle de custo diario por ambiente.

## Observabilidade e custo
- Metricas minimas:
  - latencia p50/p95 por endpoint
  - taxa de erro por endpoint
  - custo estimado por chamada e por dia
  - taxa de aceite das sugestoes
- Alertas:
  - estouro de budget diario
  - aumento de schema invalid response

## Estrategia de testes (TDD)
- Unit:
  - prompt builder
  - output parser/schema
  - ranking/priorizacao
- Integracao:
  - endpoint com provider mockado
  - fallback quando provider falha
- E2E:
  - fluxo completo de analise no formulario
  - geracao de insight com dataset de referencia

## Roadmap de implementacao
1. AI-001 (MVP) - maior retorno imediato no momento de criacao.
2. AI-002 (MVP) - correlacao com validacao assistida.
3. AI-003 (MVP) - insights executivos com evidencia.
4. Hardening - observabilidade, budget e refinamento de prompts.

## Definicao de pronto (Flow Guardian v1)
- AI-001, AI-002 e AI-003 implementados e aprovados.
- Feature flags por ambiente funcionando.
- Testes automatizados verdes.
- Fallback operacional validado.
- Processo de release DEV -> PROD seguido com smoke test.
