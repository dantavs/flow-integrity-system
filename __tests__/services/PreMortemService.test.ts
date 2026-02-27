import { describe, expect, it, vi } from 'vitest';
import { CommitmentStatus } from '@/models/Commitment';
import { buildPreMortemPrompt, generatePreMortemContext, runPreMortemAnalysis } from '@/services/PreMortemService';

describe('PreMortemService', () => {
    const make = (overrides: any = {}) => ({
        id: '1',
        titulo: 'Compromisso',
        descricao: 'Descrição',
        projeto: 'Projeto A',
        area: 'Area',
        owner: 'Owner',
        stakeholder: 'Stk',
        dependencias: [],
        dataEsperada: new Date('2026-03-01T00:00:00'),
        tipo: 'DELIVERY',
        impacto: 'HIGH',
        status: CommitmentStatus.ACTIVE,
        hasImpedimento: false,
        riscos: [],
        renegociadoCount: 0,
        criadoEm: new Date('2026-02-20T00:00:00'),
        historico: [],
        ...overrides,
    });

    it('builds structured context with project summary and dependencies', () => {
        const dep = make({ id: 'dep-1', titulo: 'Dependência', status: CommitmentStatus.ACTIVE });
        const main = make({ id: 'main-1', titulo: 'Principal', dependencias: ['dep-1'], renegociadoCount: 2 });
        const other = make({ id: 'other-1', titulo: 'Outro', hasImpedimento: true });

        const context = generatePreMortemContext(main as any, [main, dep, other] as any, []);
        expect(context.commitment.id).toBe('main-1');
        expect(context.projectSummary.total).toBe(3);
        expect(context.dependencies).toHaveLength(1);
        expect(context.projectAtRiskCommitments.length).toBeGreaterThanOrEqual(1);
    });

    it('builds prompt with fixed JSON contract', () => {
        const context = generatePreMortemContext(make({ id: 'p1' }) as any, [make({ id: 'p1' })] as any, []);
        const prompt = buildPreMortemPrompt(context);
        expect(prompt).toContain('"riskLevel"');
        expect(prompt).toContain('250 e 300 palavras');
    });

    it('runs pre-mortem analysis and normalizes output', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            json: async () => ({
                status: 'ok',
                result: {
                    riskLevel: 'medium',
                    causes: ['C1', 'C2', 'C3', 'C4'],
                    criticalQuestions: ['Q1', 'Q2', 'Q3'],
                    mitigations: ['M1', 'M2', 'M3'],
                },
            }),
        }) as any);

        const context = generatePreMortemContext(make({ id: 'p2' }) as any, [make({ id: 'p2' })] as any, []);
        const result = await runPreMortemAnalysis(context);
        expect(result.riskLevel).toBe('medium');
        expect(result.causes).toHaveLength(3);
        expect(result.criticalQuestions).toHaveLength(2);
        expect(result.mitigations).toHaveLength(2);
    });
});
