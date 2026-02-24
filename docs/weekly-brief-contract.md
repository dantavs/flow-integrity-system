# Contrato de Metricas - Resumo Semanal (VIEW-001)

Define as regras oficiais para o Resumo Semanal v1. Este contrato e deterministico e nao usa interpretacao de IA.

## Objetivo

Padronizar a leitura semanal do fluxo em 5 blocos:
- Entregas da semana
- Em risco
- Bloqueados
- Reincidentes
- Concluidos nos ultimos 7 dias

## Escopo de Dados

### Itens elegiveis (base operacional)
- Apenas compromissos com status `BACKLOG` ou `ACTIVE`.
- Compromissos `DONE` e `CANCELLED` sao excluidos de todos os blocos do Resumo Semanal.

### Datas
- Todas as comparacoes usam a data local normalizada para `00:00:00`.
- Janela da semana: `D0` ate `D+6` (inclusive), onde `D` e o dia atual.

## Blocos do Resumo Semanal

### 1) Entregas da semana
Criterio de inclusao:
- Item elegivel pela base (ativo)
- `dataEsperada` entre `D0` e `D+6` (inclusive)

Ordenacao recomendada:
- `dataEsperada` ascendente
- Em empate, `id` ascendente

### 2) Em risco
Criterio de inclusao:
- Item elegivel pela base (ativo)
- E pelo menos uma condicao abaixo:
1. `dataEsperada < D` (vencido)
2. `hasImpedimento = true`
3. Existe risco aberto (`ABERTO` ou `EM_MITIGACAO`) com score de matriz `>= 6`
4. `renegociadoCount >= 2`

Observacao:
- O score de matriz de risco e `probabilidade x impacto` com mapeamento `LOW=1`, `MEDIUM=2`, `HIGH=3`.

### 3) Bloqueados
Criterio de inclusao:
- Item elegivel pela base (ativo)
- E `hasImpedimento = true`

Observacao:
- No estado atual do produto, `hasImpedimento` ja incorpora impacto basico de dependencias pendentes.

### 4) Reincidentes
Criterio de inclusao:
- Item elegivel pela base (ativo)
- E `renegociadoCount >= 2`

### 5) Concluidos nos ultimos 7 dias (progresso)
Criterio de inclusao:
- Compromisso com status `DONE`
- `dataConclusao` (fallback: ultimo evento `STATUS_CHANGE` para `DONE`) entre `D-7` e `D` (inclusive)

Observacao:
- Este bloco e exclusivamente de progresso e nao participa de risco/saude do fluxo.

## Regras Gerais

- Um mesmo compromisso pode aparecer em multiplos blocos.
- O contrato define criterios de inclusao e nao impoe deduplicacao entre blocos.
- Quando um campo opcional nao existir, usar fallback seguro:
  - `renegociadoCount` ausente => `0`
  - `riscos` ausente => `[]`
  - `hasImpedimento` ausente => `false`
- Se nao houver timestamp confiavel de conclusao, o item nao entra no bloco de concluidos recentes.

## Saida Esperada (VIEW-002)

O agregador devera produzir, para cada bloco:
- `total`
- `ids`
- `items` ordenados

Sem texto opinativo, sem inferencia nao rastreavel.
