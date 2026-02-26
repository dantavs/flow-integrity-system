import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
    analyzeCommitmentWithAI,
    parseAdvisorOutput,
    AdvisorInput,
} from '@/services/GuardianAdvisorService';

const sampleInput: AdvisorInput = {
    titulo: 'Entregar dashboard executivo',
    descricao: 'Consolidar indicadores de fluxo com critérios claros de aceite.',
    projeto: 'Flow v2',
    owner: 'Daniel',
    stakeholder: 'Diretoria',
    dataEsperada: '2026-03-05',
    tipo: 'DELIVERY',
    impacto: 'HIGH',
    riscos: ['Dependência de dados'],
    dependencias: ['42'],
};

describe('GuardianAdvisorService', () => {
    const envBackup = { ...process.env };

    beforeEach(() => {
        vi.restoreAllMocks();
        process.env = { ...envBackup };
    });

    afterEach(() => {
        process.env = { ...envBackup };
    });

    it('parses valid advisor output', () => {
        const parsed = parseAdvisorOutput({
            qualityScore: 82,
            ambiguities: ['Título muito amplo'],
            riskHints: ['Defina critério de aceite'],
            rewriteSuggestions: ['Especificar escopo em 1 linha'],
            recommendedActions: ['Confirmar owner secundário'],
            why: 'Campo título não define fronteira de entrega.',
        });

        expect(parsed.qualityScore).toBe(82);
        expect(parsed.ambiguities).toHaveLength(1);
    });

    it('returns disabled when feature flag is off', async () => {
        process.env.NEXT_PUBLIC_FLOW_GUARDIAN_ENABLED = 'false';
        process.env.OPENAI_API_KEY = 'x';

        const result = await analyzeCommitmentWithAI(sampleInput);
        expect(result.status).toBe('disabled');
    });

    it('returns unavailable when provider payload is invalid', async () => {
        process.env.NEXT_PUBLIC_FLOW_GUARDIAN_ENABLED = 'true';
        process.env.OPENAI_API_KEY = 'x';
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                choices: [{ message: { content: '{ "qualityScore": "bad" }' } }],
            }),
        }) as any);

        const result = await analyzeCommitmentWithAI(sampleInput);
        expect(result.status).toBe('unavailable');
    });

    it('returns structured result when provider responds with valid json', async () => {
        process.env.NEXT_PUBLIC_FLOW_GUARDIAN_ENABLED = 'true';
        process.env.OPENAI_API_KEY = 'x';
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                choices: [{
                    message: {
                        content: JSON.stringify({
                            qualityScore: 74,
                            ambiguities: ['Escopo com termos genéricos'],
                            riskHints: ['Sem dependência técnica explícita'],
                            rewriteSuggestions: ['Definir entregável com KPI'],
                            recommendedActions: ['Adicionar critério de aceite'],
                            why: 'O texto atual não define evidência objetiva de conclusão.',
                        }),
                    },
                }],
            }),
        }) as any);

        const result = await analyzeCommitmentWithAI(sampleInput);
        expect(result.status).toBe('ok');
        if (result.status === 'ok') {
            expect(result.result.qualityScore).toBe(74);
            expect(result.result.why.length).toBeGreaterThan(5);
        }
    });
});
