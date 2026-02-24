# Plano Formal - Feed de Reflexoes (Fase 3)

## Objetivo
Definir e implementar o Feed de Reflexoes como uma camada de consciencia operacional: curto, acionavel e com regras transparentes, sem inferencia opaca.

## Escopo da v1
- Geracao de reflexoes por regras explicitas.
- Exibicao do feed com contexto minimo e CTA.
- Priorizacao e controle de ruido.
- Cobertura de testes para evitar falso positivo critico.

## Fora de escopo da v1
- Uso de LLM/agente de IA para interpretacao livre.
- Reescrita automatica de mensagem com linguagem generativa.
- Autoacao sem confirmacao do usuario.

## Dependencias da fase
- Resumo Semanal ja implementado (base de agregacao e visao executiva).
- Dados de riscos, dependencias e historico de compromissos disponiveis no modelo atual.
- Regras TDD obrigatorias (vermelho -> verde -> refatorar).

## Tarefas e resultados esperados

### VIEW-005 - Modelo de Reflexao e Taxonomia de Gatilhos
Objetivo:
Definir o contrato canonico de uma reflexao e padronizar os gatilhos da v1.

Entregaveis:
- Tipo/modelo `ReflectionItem`.
- Enumeracoes de `triggerType`, `severity` e `actionType`.
- Documento de thresholds e regras de elegibilidade.
- Testes unitarios do contrato.

Resultado esperado:
- Toda reflexao gerada no sistema segue o mesmo formato.
- Contrato estavel para consumo por motor e UI.

Criterios de aceite:
- Estrutura valida para todos os gatilhos definidos na fase.
- IDs e `dedupKey` consistentes e reproduziveis.
- Nenhum campo essencial fica opcional sem justificativa.

### VIEW-006 - Motor de Regras do Feed (v1)
Objetivo:
Implementar o motor deterministico que transforma estado operacional em reflexoes.

Entregaveis:
- Servico `ReflectionEngine` com regras transparentes:
  - Dependencia concluida.
  - Projeto com multiplos riscos.
  - Padrao de adiamento.
  - Novo compromisso em projeto instavel.
- Metadado de explicacao tecnica por reflexao (`why`).
- Testes de regra por gatilho.

Resultado esperado:
- Mesma entrada gera mesma saida (determinismo).
- Reflexoes sempre referenciam compromisso/projeto real.

Criterios de aceite:
- Regras executam sem efeitos colaterais.
- Sem reflexoes em compromissos fora do escopo (cancelados/concluidos, quando nao aplicavel).
- Motivo da reflexao explicitado no payload.

### VIEW-007 - UI do Feed de Reflexoes
Objetivo:
Entregar a camada visual do feed para leitura rapida e acao imediata.

Entregaveis:
- Componente visual do feed (cards curtos).
- Exibicao de mensagem, contexto e CTA.
- Integracao com filtros/navegacao da tela principal.
- Estados de vazio e fallback.

Resultado esperado:
- Usuario entende o alerta em segundos.
- Usuario consegue agir com um clique.

Criterios de aceite:
- Card mostra titulo/mensagem curta + contexto minimo.
- CTA direciona para o item/projeto correto.
- Sem poluicao visual que comprometa a entrada de compromissos.

### VIEW-008 - Controle de Ruido e Priorizacao Inicial
Objetivo:
Evitar fadiga de alerta e garantir ordem de relevancia no feed.

Entregaveis:
- Pipeline de priorizacao (severidade + recencia + impacto).
- Deduplicacao por `dedupKey`.
- Cooldown de repeticao.
- Limite de volume de exibicao por ciclo.

Resultado esperado:
- Feed enxuto, relevante e acionavel.
- Menos repeticao de mensagens equivalentes.

Criterios de aceite:
- Nao exibir duplicatas simultaneas.
- Repeticao respeita janela de cooldown.
- Ranking consistente sob mesmo conjunto de dados.

### VIEW-009 - Teste de Integridade das Reflexoes
Objetivo:
Blindar o comportamento do feed contra regressao funcional.

Entregaveis:
- Suite de testes de integridade por gatilho.
- Casos de borda (datas, thresholds, vazios, dados parciais).
- Testes de regressao para priorizacao e deduplicacao.

Resultado esperado:
- Confianca para evoluir regras sem quebrar comportamento validado.
- Reducao de falso positivo critico.

Criterios de aceite:
- Cobertura dos gatilhos da v1 com cenarios positivos e negativos.
- Casos limite com asserts explicitos.
- Falha de teste ao alterar regra sem atualizar contrato esperado.

## Ordem recomendada de execucao
1. VIEW-005
2. VIEW-006
3. VIEW-008
4. VIEW-007
5. VIEW-009

## Riscos e mitigacoes
- Risco: ruido alto no feed.
  Mitigacao: deduplicacao + cooldown + limite por ciclo (VIEW-008).
- Risco: reflexao sem contexto util.
  Mitigacao: contrato com campos obrigatorios de contexto e acao (VIEW-005/007).
- Risco: regressao de regras.
  Mitigacao: suite de integridade e bordas (VIEW-009).

## Definicao de pronto da fase
- Itens VIEW-005 a VIEW-009 aprovados.
- Feed operando com regras v1 sem dependencia de IA generativa.
- Testes passando para motor, priorizacao e integracao de UI.

