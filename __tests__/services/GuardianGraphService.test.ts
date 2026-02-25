import { describe, expect, it } from 'vitest';
import { CommitmentStatus } from '@/models/Commitment';
import { analyzeCommitmentGraph, buildDeterministicGraph } from '@/services/GuardianGraphService';

describe('GuardianGraphService', () => {
    const now = new Date('2026-02-25T09:00:00');

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

    it('builds explicit dependency edges', () => {
        const commitments = [
            make({ id: 'dep-1', titulo: 'Fundação' }),
            make({ id: 'main-1', titulo: 'Entrega final', dependencias: ['dep-1'] }),
        ];

        const graph = buildDeterministicGraph(commitments as any, now);
        expect(graph.edges.some(edge => edge.sourceId === 'dep-1' && edge.targetId === 'main-1' && edge.kind === 'EXPLICIT_DEPENDENCY')).toBe(true);
    });

    it('builds implicit correlation edges by project/owner/date proximity', () => {
        const commitments = [
            make({ id: 'a', projeto: 'Projeto C', owner: 'Ana', dataEsperada: new Date('2026-02-28T00:00:00') }),
            make({ id: 'b', projeto: 'Projeto C', owner: 'Ana', dataEsperada: new Date('2026-03-01T00:00:00') }),
        ];

        const graph = buildDeterministicGraph(commitments as any, now);
        const edge = graph.edges.find(item => item.kind === 'IMPLICIT_CORRELATION');
        expect(edge).toBeDefined();
        expect(edge!.confidence).toBeGreaterThanOrEqual(0.55);
    });

    it('builds cascade cluster for unstable projects', () => {
        const risk = {
            id: 'r1',
            descricao: 'Risco',
            categoria: 'PRAZO',
            statusMitigacao: 'ABERTO',
            probabilidade: 'HIGH',
            impacto: 'HIGH',
        };
        const commitments = [
            make({ id: 'p1', projeto: 'Projeto Instavel', hasImpedimento: true }),
            make({ id: 'p2', projeto: 'Projeto Instavel', riscos: [risk], dataEsperada: new Date('2026-02-20T00:00:00') }),
            make({ id: 'p3', projeto: 'Projeto Instavel', renegociadoCount: 2 }),
        ];

        const graph = buildDeterministicGraph(commitments as any, now);
        expect(graph.clusters.some(cluster => cluster.projeto === 'Projeto Instavel')).toBe(true);
    });

    it('returns deterministic mode when graph ai is disabled', async () => {
        process.env.NEXT_PUBLIC_FLOW_GUARDIAN_ENABLED = 'false';
        const commitments = [make({ id: 'x1' }), make({ id: 'x2' })];
        const result = await analyzeCommitmentGraph(commitments as any, now);
        expect(result.status).toBe('ok');
        if (result.status === 'ok') {
            expect(result.mode).toBe('deterministic');
        }
    });
});
