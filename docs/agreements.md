# Acordos de Trabalho (Working Agreements)

Este documento estabelece as práticas e rituais que garantem a **Integridade do Fluxo** de trabalho no desenvolvimento deste projeto.

## 🛠️ Desenvolvimento e Git
- **TDD (Test Driven Development):** Adotar o ciclo Vermelho-Verde-Refatorar usando **Vitest** como motor de testes. Primeiro o teste falhando, depois o código mínimo para passar, e então a limpeza.
- **Commit por Tarefa:** Sempre realizar o commit e push imediatamente após a conclusão de uma tarefa do backlog.

## 📋 Gestão de Fluxo
- **Backlog Antecipado:** Todo novo requisito ou funcionalidade solicitada que não esteja no backlog deve ser adicionado como uma tarefa antes de ser implementado.
- **Backlog Vivo:** Toda atividade realizada deve ter sua data de início e fim devidamente registradas no `backlog.md`.
- **Rastro de Valor:** Ao final de uma sessão ou entrega importante, o `journal.md` deve ser atualizado com o que foi feito e eventuais insights.

## 📐 Qualidade e Design
- **Foco na Carga Cognitiva:** Antes de criar uma nova funcionalidade, questionar se ela simplifica ou complica o entendimento do usuário.
- **Documentação Primeiro:** Decisões arquiteturais ou mudanças de rumo devem ser registradas em `decisions.md` ou `agreements.md` antes ou durante a implementação.
