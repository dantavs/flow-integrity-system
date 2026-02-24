import { CommitmentStatus } from '@/models/Commitment';
import { buildWeeklyBrief } from '@/services/WeeklyBriefService';

describe('WeeklyBriefService', () => {
    const now = new Date('2026-02-24T10:00:00');

    const make = (overrides: any = {}) => ({
        id: '1',
        titulo: 'Commit',
        projeto: 'Proj',
        area: 'Area',
        owner: 'Owner',
        stakeholder: 'Stk',
        dependencias: [],
        dataEsperada: new Date('2026-03-01T00:00:00'),
        tipo: 'DELIVERY',
        impacto: 'MEDIUM',
        status: CommitmentStatus.ACTIVE,
        hasImpedimento: false,
        riscos: [],
        renegociadoCount: 0,
        criadoEm: new Date('2026-02-20T00:00:00'),
        historico: [],
        ...overrides,
    });

    it('builds week deliveries with inclusive boundaries (D0 to D+6)', () => {
        const commitments = [
            make({ id: '1', dataEsperada: new Date('2026-02-24T00:00:00') }), // D0
            make({ id: '2', dataEsperada: new Date('2026-03-02T00:00:00') }), // D+6
            make({ id: '3', dataEsperada: new Date('2026-03-03T00:00:00') }), // D+7
            make({ id: '4', dataEsperada: new Date('2026-02-23T00:00:00') }), // D-1
        ];

        const brief = buildWeeklyBrief(commitments as any, now);
        expect(brief.blocks.NEXT_WEEK_DELIVERIES.ids).toEqual(['1', '2']);
    });

    it('computes at risk, blocked and recurrent deterministically', () => {
        const commitments = [
            make({ id: 'a', dataEsperada: new Date('2026-02-22T00:00:00') }), // overdue
            make({ id: 'b', hasImpedimento: true }), // blocked
            make({ id: 'c', renegociadoCount: 2 }), // recurrent
            make({
                id: 'd',
                riscos: [{
                    id: 'r',
                    descricao: 'Risco alto',
                    categoria: 'DEPENDENCIA',
                    statusMitigacao: 'ABERTO',
                    probabilidade: 'HIGH',
                    impacto: 'HIGH',
                }],
            }), // high risk open
            make({ id: 'e' }), // healthy
        ];

        const brief = buildWeeklyBrief(commitments as any, now);
        expect(brief.blocks.AT_RISK.ids.sort()).toEqual(['a', 'b', 'c', 'd']);
        expect(brief.blocks.BLOCKED.ids).toEqual(['b']);
        expect(brief.blocks.RECURRENT.ids).toEqual(['c']);
    });

    it('excludes archived from operational blocks', () => {
        const commitments = [
            make({ id: '1', status: CommitmentStatus.DONE, hasImpedimento: true }),
            make({ id: '2', status: CommitmentStatus.CANCELLED, renegociadoCount: 4 }),
        ];

        const brief = buildWeeklyBrief(commitments as any, now);
        expect(brief.blocks.AT_RISK.total).toBe(0);
        expect(brief.blocks.BLOCKED.total).toBe(0);
        expect(brief.blocks.RECURRENT.total).toBe(0);
        expect(brief.blocks.NEXT_WEEK_DELIVERIES.total).toBe(0);
    });

    it('computes recent completed using DONE status change event in last 7 days', () => {
        const commitments = [
            make({
                id: 'done-recent',
                status: CommitmentStatus.DONE,
                historico: [{
                    id: 'evt-1',
                    tipo: 'STATUS_CHANGE',
                    timestamp: new Date('2026-02-20T08:00:00'),
                    descricao: 'Status alterado',
                    valorAnterior: 'ACTIVE',
                    valorNovo: 'DONE',
                }],
            }),
            make({
                id: 'done-old',
                status: CommitmentStatus.DONE,
                historico: [{
                    id: 'evt-2',
                    tipo: 'STATUS_CHANGE',
                    timestamp: new Date('2026-02-10T08:00:00'),
                    descricao: 'Status alterado',
                    valorAnterior: 'ACTIVE',
                    valorNovo: 'DONE',
                }],
            }),
            make({ id: 'done-no-event', status: CommitmentStatus.DONE, historico: [] }),
        ];

        const brief = buildWeeklyBrief(commitments as any, now);
        expect(brief.blocks.RECENT_COMPLETED.ids).toEqual(['done-recent']);
    });

    it('returns empty blocks when there are no commitments', () => {
        const brief = buildWeeklyBrief([], now);
        expect(brief.blocks.NEXT_WEEK_DELIVERIES.total).toBe(0);
        expect(brief.blocks.AT_RISK.total).toBe(0);
        expect(brief.blocks.BLOCKED.total).toBe(0);
        expect(brief.blocks.RECURRENT.total).toBe(0);
        expect(brief.blocks.RECENT_COMPLETED.total).toBe(0);
    });

    it('includes done event exactly at D-7 boundary for recent completed', () => {
        const commitments = [
            make({
                id: 'done-boundary',
                status: CommitmentStatus.DONE,
                historico: [{
                    id: 'evt-3',
                    tipo: 'STATUS_CHANGE',
                    timestamp: new Date('2026-02-17T08:00:00'),
                    descricao: 'Status alterado',
                    valorAnterior: 'ACTIVE',
                    valorNovo: 'DONE',
                }],
            }),
        ];

        const brief = buildWeeklyBrief(commitments as any, now);
        expect(brief.blocks.RECENT_COMPLETED.ids).toEqual(['done-boundary']);
    });
});
