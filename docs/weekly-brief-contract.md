# Contrato de Métricas — Weekly Brief (VIEW-001)

Define as regras oficiais para o Weekly Brief v1. Este contrato é determinístico e não usa interpretação de IA.

## Objetivo

Padronizar a leitura semanal do fluxo em 5 blocos:
- Entregas da próxima semana
- Em risco
- Bloqueados
- Reincidentes
- Concluídos nos últimos 7 dias

## Escopo de Dados

### Itens elegíveis (base operacional)
- Apenas compromissos com status `BACKLOG` ou `ACTIVE`.
- Compromissos `DONE` e `CANCELLED` são excluídos de todos os blocos do Weekly Brief.

### Datas
- Todas as comparações usam a data local normalizada para `00:00:00`.
- Janela da próxima semana: `D+1` até `D+7` (inclusive), onde `D` é o dia atual.

## Blocos do Weekly Brief

### 1) Entregas da próxima semana
Critério de inclusão:
- Item elegível pela base (ativo)
- `dataEsperada` entre `D+1` e `D+7` (inclusive)

Ordenação recomendada:
- `dataEsperada` ascendente
- Em empate, `id` ascendente

### 2) Em risco
Critério de inclusão:
- Item elegível pela base (ativo)
- E pelo menos uma condição abaixo:
1. `dataEsperada < D` (vencido)
2. `hasImpedimento = true`
3. Existe risco aberto (`ABERTO` ou `EM_MITIGACAO`) com score de matriz `>= 6`
4. `renegociadoCount >= 2`

Observação:
- O score de matriz de risco é `probabilidade x impacto` com mapeamento `LOW=1`, `MEDIUM=2`, `HIGH=3`.

### 3) Bloqueados
Critério de inclusão:
- Item elegível pela base (ativo)
- E `hasImpedimento = true`

Observação:
- No estado atual do produto, `hasImpedimento` já incorpora impacto básico de dependências pendentes.

### 4) Reincidentes
Critério de inclusão:
- Item elegível pela base (ativo)
- E `renegociadoCount >= 2`

### 5) Concluídos nos últimos 7 dias (progresso)
Critério de inclusão:
- Compromisso com status `DONE`
- `dataConclusao` (fallback: último evento `STATUS_CHANGE` para `DONE`) entre `D-7` e `D` (inclusive)

Observação:
- Este bloco é exclusivamente de progresso e não participa de risco/saúde do fluxo.

## Regras Gerais

- Um mesmo compromisso pode aparecer em múltiplos blocos.
- O contrato define critérios de inclusão e não impõe deduplicação entre blocos.
- Quando um campo opcional não existir, usar fallback seguro:
  - `renegociadoCount` ausente => `0`
  - `riscos` ausente => `[]`
  - `hasImpedimento` ausente => `false`
- Se não houver timestamp confiável de conclusão, o item não entra no bloco de concluídos recentes.

## Saída Esperada (VIEW-002)

O agregador deverá produzir, para cada bloco:
- `total`
- `ids`
- `items` ordenados

Sem texto opinativo, sem inferência não rastreável.
