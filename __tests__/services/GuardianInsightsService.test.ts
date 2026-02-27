import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CommitmentStatus } from '@/models/Commitment';
import { analyzeIntegrityInsights, buildDeterministicIntegrityInsights } from '@/services/GuardianInsightsService';

describe('GuardianInsightsService', () => {
    const now = new Date('2026-02-25T09:00:00');
    const envBackup = { ...process.env };

    beforeEach(() => {
        vi.restoreAllMocks();
        process.env = { ...envBackup };
    });

    afterEach(() => {
        process.env = { ...envBackup };
    });

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

    it('generates owner saturation insight when concentration is high', () => {
        const risk = {
            id: 'r1',
            descricao: 'Risco',
            categoria: 'PRAZO',
            statusMitigacao: 'ABERTO',
            probabilidade: 'HIGH',
            impacto: 'HIGH',
        };
        const commitments = [
            make({ id: 'a1', owner: 'Ana', hasImpedimento: true, dataEsperada: new Date('2026-02-20T00:00:00') }),
            make({ id: 'a2', owner: 'Ana', riscos: [risk] }),
            make({ id: 'a3', owner: 'Ana', renegociadoCount: 3 }),
        ];

        const result = buildDeterministicIntegrityInsights(commitments as any, now);
        expect(result.insights.some(item => item.id === 'owner-saturation:Ana')).toBe(true);
        expect(result.systemSignals.ownerSaturation[0].owner).toBe('Ana');
    });

    it('does not generate owner saturation insight for Tavares by default', () => {
        const commitments = [
            make({ id: 't1', owner: 'Tavares', hasImpedimento: true, dataEsperada: new Date('2026-02-20T00:00:00') }),
            make({ id: 't2', owner: 'Tavares', renegociadoCount: 3 }),
            make({ id: 't3', owner: 'Tavares' }),
        ];

        const result = buildDeterministicIntegrityInsights(commitments as any, now);
        expect(result.insights.some(item => item.id === 'owner-saturation:Tavares')).toBe(false);
    });

    it('generates project instability insight with multiple unstable signals', () => {
        const risk = {
            id: 'r2',
            descricao: 'Risco',
            categoria: 'DEPENDENCIA',
            statusMitigacao: 'EM_MITIGACAO',
            probabilidade: 'HIGH',
            impacto: 'HIGH',
        };
        const commitments = [
            make({ id: 'p1', projeto: 'Projeto Instavel', hasImpedimento: true }),
            make({ id: 'p2', projeto: 'Projeto Instavel', dataEsperada: new Date('2026-02-21T00:00:00'), riscos: [risk] }),
            make({ id: 'p3', projeto: 'Projeto Instavel', renegociadoCount: 2 }),
        ];

        const result = buildDeterministicIntegrityInsights(commitments as any, now);
        expect(result.insights.some(item => item.id === 'project-instability:Projeto Instavel')).toBe(true);
    });

    it('returns deterministic mode when ai feature is disabled', async () => {
        process.env.NEXT_PUBLIC_FLOW_GUARDIAN_ENABLED = 'false';
        process.env.OPENAI_API_KEY = 'x';
        const commitments = [make({ id: 'x1' }), make({ id: 'x2' })];

        const result = await analyzeIntegrityInsights(commitments as any, now);
        expect(result.status).toBe('ok');
        if (result.status === 'ok') {
            expect(result.mode).toBe('deterministic');
            expect(Array.isArray(result.result.insights)).toBe(true);
        }
    });
});
