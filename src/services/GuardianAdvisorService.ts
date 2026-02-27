import { CommitmentImpact, CommitmentType } from '../models/Commitment';

export interface AdvisorInput {
    titulo: string;
    descricao: string;
    projeto: string;
    owner: string;
    stakeholder: string;
    dataEsperada: string;
    tipo: CommitmentType;
    impacto: CommitmentImpact;
    riscos: string[];
    dependencias: string[];
    dependencyContext?: Array<{
        id: string;
        titulo: string;
        projeto?: string;
        status?: string;
    }>;
}

export interface AdvisorOutput {
    qualityScore: number;
    ambiguities: string[];
    riskHints: string[];
    rewriteSuggestions: string[];
    recommendedActions: string[];
    why: string;
}

export interface PreMortemInput {
    context: unknown;
    prompt?: string;
}

export interface PreMortemOutput {
    riskLevel: 'low' | 'medium' | 'high';
    causes: string[];
    criticalQuestions: string[];
    mitigations: string[];
}

export type AdvisorResult =
    | { status: 'ok'; result: AdvisorOutput }
    | { status: 'disabled'; reason: string }
    | { status: 'unavailable'; reason: string };

const SYSTEM_PROMPT = `
Você é o Flow Advisor, um analista de qualidade de compromissos.
Retorne SOMENTE JSON válido no formato:
{
  "qualityScore": number(0..100),
  "ambiguities": string[],
  "riskHints": string[],
  "rewriteSuggestions": string[],
  "recommendedActions": string[],
  "why": string
}
Sem markdown.
`;

const PRE_MORTEM_SYSTEM_PROMPT = `
Você é um analista de Pre-Mortem para execução de compromissos.
Assuma que o compromisso falhou e retorne SOMENTE JSON válido no formato:
{
  "riskLevel": "low" | "medium" | "high",
  "causes": string[],
  "criticalQuestions": string[],
  "mitigations": string[]
}
Restrições:
- Máximo de 3 causas.
- Máximo de 2 perguntas críticas.
- Máximo de 2 mitigações.
- Texto total entre 250 e 300 palavras.
Sem markdown.
`;

function toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.map(item => String(item)).filter(item => item.trim() !== '');
}

function isNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

export function parseAdvisorOutput(raw: unknown): AdvisorOutput {
    if (!raw || typeof raw !== 'object') {
        throw new Error('Saída inválida do advisor');
    }

    const data = raw as Record<string, unknown>;
    const qualityScore = Number(data.qualityScore);

    if (!isNumber(qualityScore)) {
        throw new Error('qualityScore inválido');
    }
    if (qualityScore < 0 || qualityScore > 100) {
        throw new Error('qualityScore fora do intervalo');
    }

    const why = String(data.why || '').trim();
    if (!why) {
        throw new Error('Campo why obrigatório');
    }

    return {
        qualityScore,
        ambiguities: toStringArray(data.ambiguities),
        riskHints: toStringArray(data.riskHints),
        rewriteSuggestions: toStringArray(data.rewriteSuggestions),
        recommendedActions: toStringArray(data.recommendedActions),
        why,
    };
}

export function parsePreMortemOutput(raw: unknown): PreMortemOutput {
    if (!raw || typeof raw !== 'object') {
        throw new Error('Saída inválida do pre-mortem');
    }

    const data = raw as Record<string, unknown>;
    const riskLevel = String(data.riskLevel || '').toLowerCase();
    if (riskLevel !== 'low' && riskLevel !== 'medium' && riskLevel !== 'high') {
        throw new Error('riskLevel inválido');
    }

    return {
        riskLevel: riskLevel as 'low' | 'medium' | 'high',
        causes: toStringArray(data.causes).slice(0, 3),
        criticalQuestions: toStringArray(data.criticalQuestions).slice(0, 2),
        mitigations: toStringArray(data.mitigations).slice(0, 2),
    };
}

function isGuardianEnabled(): boolean {
    return process.env.NEXT_PUBLIC_FLOW_GUARDIAN_ENABLED === 'true';
}

export async function analyzeCommitmentWithAI(input: AdvisorInput): Promise<AdvisorResult> {
    if (!isGuardianEnabled()) {
        return { status: 'disabled', reason: 'Flow Guardian desabilitado por feature flag.' };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return { status: 'disabled', reason: 'OPENAI_API_KEY não configurada.' };
    }

    const model = process.env.FLOW_GUARDIAN_MODEL_ADVISOR || 'gpt-4o-mini';
    const timeoutMs = Number(process.env.FLOW_GUARDIAN_TIMEOUT_MS || '15000');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            signal: controller.signal,
            body: JSON.stringify({
                model,
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: JSON.stringify(input) },
                ],
                temperature: 0.2,
            }),
        });

        if (!response.ok) {
            return { status: 'unavailable', reason: `Provider error: ${response.status}` };
        }

        const payload = await response.json() as any;
        const content = payload?.choices?.[0]?.message?.content;
        if (!content || typeof content !== 'string') {
            return { status: 'unavailable', reason: 'Resposta sem conteúdo estruturado.' };
        }

        const parsed = parseAdvisorOutput(JSON.parse(content));
        return { status: 'ok', result: parsed };
    } catch {
        return { status: 'unavailable', reason: 'Falha na chamada do provedor de IA.' };
    } finally {
        clearTimeout(timeout);
    }
}

export async function analyzePreMortemWithAI(input: PreMortemInput): Promise<AdvisorResult | { status: 'ok'; result: PreMortemOutput }> {
    if (!isGuardianEnabled()) {
        return { status: 'disabled', reason: 'Flow Guardian desabilitado por feature flag.' };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return { status: 'disabled', reason: 'OPENAI_API_KEY não configurada.' };
    }

    const model = process.env.FLOW_GUARDIAN_MODEL_ADVISOR || 'gpt-4o-mini';
    const timeoutMs = Number(process.env.FLOW_GUARDIAN_TIMEOUT_MS || '15000');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            signal: controller.signal,
            body: JSON.stringify({
                model,
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: PRE_MORTEM_SYSTEM_PROMPT },
                    { role: 'user', content: String(input.prompt || JSON.stringify(input.context)) },
                ],
                temperature: 0.2,
            }),
        });

        if (!response.ok) {
            return { status: 'unavailable', reason: `Provider error: ${response.status}` };
        }

        const payload = await response.json() as any;
        const content = payload?.choices?.[0]?.message?.content;
        if (!content || typeof content !== 'string') {
            return { status: 'unavailable', reason: 'Resposta sem conteúdo estruturado.' };
        }

        const parsed = parsePreMortemOutput(JSON.parse(content));
        return { status: 'ok', result: parsed };
    } catch {
        return { status: 'unavailable', reason: 'Falha na chamada do provedor de IA.' };
    } finally {
        clearTimeout(timeout);
    }
}
