import { CommitmentStatus } from '@/models/Commitment';
import { buildReflectionFeed } from '@/services/ReflectionEngine';

describe('ReflectionEngine', () => {
    const now = new Date('2026-02-24T10:00:00');

    const make = (overrides: any = {}) => ({
        id: '1',
        titulo: 'Compromisso',
        projeto: 'Projeto A',
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

    it('generates dependency completed reflection', () => {
        const commitments = [
            make({
                id: 'dep-1',
                status: CommitmentStatus.DONE,
                historico: [{
                    id: 'evt-done',
                    tipo: 'STATUS_CHANGE',
                    timestamp: new Date('2026-02-22T09:00:00'),
                    descricao: 'Done',
                    valorAnterior: 'ACTIVE',
                    valorNovo: 'DONE',
                }],
            }),
            make({
                id: 'main-1',
                titulo: 'Entrega X',
                dependencias: ['dep-1'],
                status: CommitmentStatus.ACTIVE,
            }),
        ];

        const feed = buildReflectionFeed(commitments as any, now);
        expect(feed.items.some(item => item.triggerType === 'DEPENDENCY_COMPLETED' && item.relatedCommitmentIds.includes('main-1'))).toBe(true);
    });

    it('generates project risk cluster reflection when open risks exceed threshold', () => {
        const risk = {
            id: 'r1',
            descricao: 'Risco',
            categoria: 'DEPENDENCIA',
            statusMitigacao: 'ABERTO',
            probabilidade: 'HIGH',
            impacto: 'HIGH',
        };
        const commitments = [
            make({ id: 'a', projeto: 'Projeto R', riscos: [risk] }),
            make({ id: 'b', projeto: 'Projeto R', riscos: [risk] }),
            make({ id: 'c', projeto: 'Projeto R', riscos: [risk] }),
        ];

        const feed = buildReflectionFeed(commitments as any, now);
        expect(feed.items.some(item => item.triggerType === 'PROJECT_RISK_CLUSTER' && item.relatedProject === 'Projeto R')).toBe(true);
    });

    it('generates postponement pattern reflection for recurrent renegotiation', () => {
        const commitments = [make({ id: 'p1', titulo: 'Contrato Y', renegociadoCount: 3 })];
        const feed = buildReflectionFeed(commitments as any, now);
        expect(feed.items.some(item => item.triggerType === 'POSTPONEMENT_PATTERN' && item.relatedCommitmentIds.includes('p1'))).toBe(true);
    });

    it('generates new commitment on unstable project reflection', () => {
        const risk = {
            id: 'r2',
            descricao: 'Risco alto',
            categoria: 'PRAZO',
            statusMitigacao: 'ABERTO',
            probabilidade: 'HIGH',
            impacto: 'HIGH',
        };
        const commitments = [
            make({ id: 'u1', projeto: 'Projeto Instavel', dataEsperada: new Date('2026-02-20T00:00:00') }),
            make({ id: 'u2', projeto: 'Projeto Instavel', hasImpedimento: true }),
            make({ id: 'u3', projeto: 'Projeto Instavel', riscos: [risk] }),
            make({
                id: 'new-1',
                projeto: 'Projeto Instavel',
                criadoEm: new Date('2026-02-24T08:00:00'),
                titulo: 'Nova frente',
            }),
        ];

        const feed = buildReflectionFeed(commitments as any, now);
        expect(feed.items.some(item => item.triggerType === 'NEW_COMMITMENT_ON_UNSTABLE_PROJECT' && item.relatedCommitmentIds.includes('new-1'))).toBe(true);
    });

    it('deduplicates unstable-project reflection when multiple new commitments are in same project', () => {
        const risk = {
            id: 'r3',
            descricao: 'Risco alto',
            categoria: 'PRAZO',
            statusMitigacao: 'ABERTO',
            probabilidade: 'HIGH',
            impacto: 'HIGH',
        };
        const commitments = [
            make({ id: 's1', projeto: 'Projeto Unico', hasImpedimento: true }),
            make({ id: 's2', projeto: 'Projeto Unico', riscos: [risk] }),
            make({ id: 'new-a', projeto: 'Projeto Unico', criadoEm: new Date('2026-02-24T07:00:00') }),
            make({ id: 'new-b', projeto: 'Projeto Unico', criadoEm: new Date('2026-02-24T07:30:00') }),
            make({ id: 'new-c', projeto: 'Projeto Unico', criadoEm: new Date('2026-02-24T08:00:00') }),
        ];

        const feed = buildReflectionFeed(commitments as any, now);
        const unstableItems = feed.items.filter(item => item.triggerType === 'NEW_COMMITMENT_ON_UNSTABLE_PROJECT');
        expect(unstableItems).toHaveLength(1);
        expect(unstableItems[0].relatedCommitmentIds.sort()).toEqual(['new-a', 'new-b', 'new-c']);
    });

    it('applies dedup, cooldown and max items limit', () => {
        const commitments = [
            make({ id: 'p1', titulo: 'P1', renegociadoCount: 3 }),
            make({ id: 'p2', titulo: 'P2', renegociadoCount: 3 }),
            make({ id: 'p3', titulo: 'P3', renegociadoCount: 3 }),
            make({ id: 'p4', titulo: 'P4', renegociadoCount: 3 }),
        ];

        const feed = buildReflectionFeed(commitments as any, now, {
            cooldownByDedupKey: {
                'POSTPONEMENT_PATTERN:p1': new Date('2026-02-24T09:30:00').toISOString(),
            },
            maxItems: 2,
        });

        expect(feed.items.length).toBe(2);
        expect(feed.items.some(item => item.dedupKey === 'POSTPONEMENT_PATTERN:p1')).toBe(false);
    });

    it('generates checklist stalled near due reflection', () => {
        const commitments = [
            make({
                id: 'chk-1',
                titulo: 'Entrega crítica',
                dataEsperada: new Date('2026-02-25T00:00:00'),
                checklist: [{ id: 'a', text: 'Preparar release', completed: false, createdAt: new Date('2026-02-20T00:00:00').toISOString() }],
            }),
        ];
        const feed = buildReflectionFeed(commitments as any, now);
        expect(feed.items.some(item => item.triggerType === 'CHECKLIST_STALLED_NEAR_DUE')).toBe(true);
    });

    it('generates checklist completed status review reflection', () => {
        const commitments = [
            make({
                id: 'chk-2',
                status: CommitmentStatus.ACTIVE,
                checklist: [{ id: 'a', text: 'Finalizar', completed: true, createdAt: new Date('2026-02-20T00:00:00').toISOString() }],
            }),
        ];
        const feed = buildReflectionFeed(commitments as any, now);
        expect(feed.items.some(item => item.triggerType === 'CHECKLIST_COMPLETED_STATUS_REVIEW')).toBe(true);
    });
});
