# Regras de Negócio (Business Rules)

Este documento descreve as regras e validações lógicas aplicadas aos dados do sistema.

## 🤝 Modelo: Commitment

As regras abaixo devem ser garantidas no momento da criação ou atualização de um compromisso.

### 🆔 Identificação e Datas
- **BR-001 (ID Automático):** O identificador único do compromisso deve ser gerado automaticamente pelo sistema (incremental e único). O usuário não pode informar ou alterar o ID.
- **BR-002 (Data de Criação):** O campo `criadoEm` deve ser preenchido automaticamente com o carimbo de data/hora do momento exato da criação.
- **BR-003 (Data Esperada no Futuro):** A `dataEsperada` para a entrega de um compromisso não pode ser inferior à data atual (momento da criação).

### 📝 Campos Obrigatórios
- **BR-004 (Título Obrigatório):** O campo `titulo` é estritamente obrigatório e não pode ser vazio ou conter apenas espaços em branco.
- **BR-005 (Owner e Stakeholder):** Todo compromisso deve ter um `owner` e um `stakeholder` definidos no momento da criação.

### ⚡ Inteligência de Entrada
- **BR-006 (Auto-complete de Histórico):** Os campos `owner`, `stakeholder`, `projeto` e `area` devem sugerir valores baseados em entradas anteriores armazenadas no sistema. Caso o usuário digite um valor novo, este deve ser aceito e passar a fazer parte das sugestões futuras.
