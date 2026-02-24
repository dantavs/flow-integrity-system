# Processo de Release (DEV -> PROD)

Este documento define como promover mudanças com segurança do ambiente de desenvolvimento (`dev`) para produção (`prod`).

## Objetivo

- Garantir validação funcional em `dev` antes de liberar para `prod`.
- Evitar mistura de dados entre ambientes.
- Padronizar critérios de entrada e saída de release.

## Ambientes

- `dev`: uso para desenvolvimento, testes e validação.
- `prod`: uso real com dados operacionais.

Variável de ambiente:
- `NEXT_PUBLIC_APP_ENV=dev`
- `NEXT_PUBLIC_APP_ENV=prod`

Chaves locais separadas:
- `flow_integrity_commitments_dev`
- `flow_integrity_commitments_prod`

## Critérios de Entrada (para abrir release)

Antes de preparar um release, confirmar:
- Item de backlog em `[~] Aguardando Aprovação`.
- Testes automatizados passando (`npm run test`).
- Build de produção passando (`npm run build`).
- Sem erros críticos de runtime/hydration no `localhost:3000`.

## Checklist de Validação em DEV

1. Rodar a aplicação em `dev`.
2. Executar fluxo principal de ponta a ponta:
   - cadastrar compromisso
   - editar compromisso
   - atualizar status
   - validar riscos/dependências
3. Validar regras de negócio críticas:
   - data não pode ir para o passado
   - dependências e impedimentos consistentes
   - score de saúde coerente
4. Confirmar UX mínima:
   - sem travamentos
   - mensagens de erro claras
   - dados persistindo corretamente

## Processo de Promoção para PROD

1. Aprovação explícita do item pelo usuário.
2. Commit e push para `main`.
3. Atualizar backlog para `[x] Concluído`.
4. Configurar ambiente para `prod` (`NEXT_PUBLIC_APP_ENV=prod`).
5. Reiniciar aplicação e executar smoke test em `prod`:
   - abrir app
   - criar/editar 1 compromisso
   - verificar persistência na chave `prod`

## Rollback Operacional

Se identificar problema após promoção:
1. Reverter commit no repositório (`git revert`).
2. Publicar correção/hotfix em `main`.
3. Registrar incidente e decisão em `docs/journal.md` e/ou `docs/decisions.md`.

## Rastreabilidade

Toda release deve registrar:
- hash do commit
- itens de backlog incluídos
- data/hora da promoção
- resultado do smoke test
