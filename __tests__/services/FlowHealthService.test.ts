import { calculateFlowHealth } from '@/services/FlowHealthService';
import { CommitmentStatus } from '@/models/Commitment';

describe('FlowHealthService', () => {
    const base = {
        projeto: 'P',
        area: 'A',
        owner: 'O',
        stakeholder: 'S',
        tipo: 'DELIVERY' as const,
        impacto: 'MEDIUM' as const,
        historico: [],
        criadoEm: new Date('2026-02-23'),
    };

    it('returns 100 for empty active set', () => {
        const result = calculateFlowHealth([]);
        expect(result.score).toBe(100);
        expect(result.level).toBe('HEALTHY');
        expect(result.totalActive).toBe(0);
    });

    it('applies penalties and computes expected score', () => {
        const overdue = new Date(Date.now() - 86400000);
        const commitments = [
            {
                ...base,
                id: '1',
                titulo: 'A',
                status: CommitmentStatus.ACTIVE,
                dependencias: ['2'],
                hasImpedimento: true,
                dataEsperada: overdue,
                riscos: [{
                    id: 'r1',
                    descricao: 'Risco alto',
                    categoria: 'DEPENDENCIA' as const,
                    statusMitigacao: 'ABERTO' as const,
                    probabilidade: 'HIGH' as const,
                    impacto: 'HIGH' as const,
                }],
                renegociadoCount: 2,
            },
        ];

        const result = calculateFlowHealth(commitments as any);

        // 100 - 35 - 25 - 10 - 20 - 10 = 0
        expect(result.score).toBe(0);
        expect(result.level).toBe('CRITICAL');
        expect(result.breakdown.overdue).toBe(1);
        expect(result.breakdown.blockedByDependency).toBe(1);
        expect(result.breakdown.openRisk).toBe(1);
        expect(result.breakdown.highRisk).toBe(1);
        expect(result.breakdown.recurrent).toBe(1);
    });

    it('ignores archived commitments in score', () => {
        const commitments = [
            {
                ...base,
                id: '1',
                titulo: 'Archived',
                status: CommitmentStatus.DONE,
                dependencias: [],
                hasImpedimento: true,
                dataEsperada: new Date(Date.now() - 86400000),
                riscos: [],
                renegociadoCount: 5,
            },
        ];

        const result = calculateFlowHealth(commitments as any);
        expect(result.score).toBe(100);
        expect(result.totalActive).toBe(0);
    });
});
