# Acordos de Trabalho (Working Agreements)

Este documento estabelece as práticas e rituais que garantem a **Integridade do Fluxo** de trabalho no desenvolvimento deste projeto.

## 🛠️ Desenvolvimento e Git
- **TDD (Test Driven Development):** Adotar o ciclo Vermelho-Verde-Refatorar usando **Vitest** como motor de testes. Primeiro o teste falhando, depois o código mínimo para passar, e então a limpeza.
- **Escopo do TDD:** O ciclo TDD é obrigatório para todo o projeto.
- **Commit por Tarefa:** Cada tarefa aprovada deve ser versionada em commit próprio, com mensagem clara e rastreável.
- **Regra de Granularidade:** Não implementar múltiplas regras novas em lote sem cobertura inicial. A unidade de entrega é `regra + teste correspondente`.

## 📋 Gestão de Fluxo
- **Backlog Antecipado:** Todo novo requisito ou funcionalidade solicitada que não esteja no backlog deve ser adicionado na seção `Planejado` antes de ser implementado.
- **Registro Automático de Solicitações:** Sempre que o usuário solicitar qualquer ajuste/evolução/correção, criar item no `backlog.md` mesmo sem pedido explícito de registro.
- **Granularidade de Registro:** Se uma solicitação tiver mais de uma entrega independente, desdobrar em múltiplos itens no backlog.
- **Higiene de Seções no Backlog:** Remover qualquer seção de nível `###` que fique sem itens logo abaixo, para evitar backlog com blocos vazios.
- **Início da Execução:** Antes de começar a implementação, mover o item para a seção `Em Execução` com status `[/]`.
- **Fim da Implementação:** Ao terminar tecnicamente a tarefa, manter o item no backlog com status `[~]` (`Aguardando Aprovação`).
- **Aprovação e Push:** Após aprovação explícita do usuário, realizar o `push` para o GitHub e somente então marcar como `[x]`, movendo o item para a seção `Concluído`.
- **Backlog Vivo:** Toda atividade realizada deve ter data de início e fim devidamente registradas no `backlog.md`.
- **Rastro de Valor:** Ao final de uma sessão ou entrega importante, o `journal.md` deve ser atualizado com o que foi feito e eventuais insights.

## 📐 Qualidade e Design
- **Foco na Carga Cognitiva:** Antes de criar uma nova funcionalidade, questionar se ela simplifica ou complica o entendimento do usuário.
- **Documentação Primeiro:** Decisões arquiteturais ou mudanças de rumo devem ser registradas em `decisions.md` ou `agreements.md` antes ou durante a implementação.
