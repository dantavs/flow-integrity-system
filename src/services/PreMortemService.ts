import { AuditEvent, Commitment, CommitmentStatus, PreMortemRiskLevel, riskMatrixScore } from '../models/Commitment';

export interface PreMortemProjectSummary {
    projeto: string;
    total: number;
    active: number;
    done: number;
    cancelled: number;
}

export interface PreMortemAtRiskCommitment {
    id: string;
    titulo: string;
    owner: string;
    dueDate: string;
    signals: string[];
}

export interface PreMortemDependencySnapshot {
    id: string;
    titulo: string;
    status: CommitmentStatus;
    dueDate: string;
    atRisk: boolean;
}

export interface PreMortemHistorySummary {
    renegotiationCount: number;
    lastRenegotiations: string[];
}

export interface PreMortemContext {
    commitment: {
        id: string;
        titulo: string;
        descricao?: string;
        projeto: string;
        owner: string;
        stakeholder: string;
        tipo: string;
        impacto: string;
        status: CommitmentStatus;
        dueDate: string;
        hasImpedimento: boolean;
    };
    projectSummary: PreMortemProjectSummary;
    projectWip: number;
    projectAtRiskCommitments: PreMortemAtRiskCommitment[];
    dependencies: PreMortemDependencySnapshot[];
    postponementHistory: PreMortemHistorySummary;
}

export interface PreMortemOutput {
    riskLevel: PreMortemRiskLevel;
    causes: string[];
    criticalQuestions: string[];
    mitigations: string[];
}

const isActive = (commitment: Commitment): boolean =>
    commitment.status === CommitmentStatus.BACKLOG || commitment.status === CommitmentStatus.ACTIVE;

const hasOpenHighRisk = (commitment: Commitment): boolean =>
    (commitment.riscos || []).some(risk =>
        (risk.statusMitigacao === 'ABERTO' || risk.statusMitigacao === 'EM_MITIGACAO')
        && riskMatrixScore(risk) >= 6,
    );

const toDateKey = (value: Date | string): string => new Date(value).toISOString().slice(0, 10);

function getRiskSignals(commitment: Commitment, today: Date): string[] {
    const signals: string[] = [];
    const due = new Date(commitment.dataEsperada);
    if (new Date(due.getFullYear(), due.getMonth(), due.getDate()) < today) signals.push('vencido');
    if (commitment.hasImpedimento) signals.push('bloqueado');
    if ((commitment.renegociadoCount || 0) >= 2) signals.push('reincidente');
    if (hasOpenHighRisk(commitment)) signals.push('risco_alto_aberto');
    return signals;
}

export function generatePreMortemContext(
    commitment: Commitment,
    allCommitments: Commitment[],
    events: AuditEvent[] = [],
): PreMortemContext {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sameProject = allCommitments.filter(item => item.projeto === commitment.projeto);
    const activeInProject = sameProject.filter(isActive);
    const atRisk = activeInProject
        .filter(item => item.id !== commitment.id)
        .map(item => ({ item, signals: getRiskSignals(item, today) }))
        .filter(item => item.signals.length > 0)
        .map(item => ({
            id: item.item.id,
            titulo: item.item.titulo,
            owner: item.item.owner,
            dueDate: toDateKey(item.item.dataEsperada),
            signals: item.signals,
        }))
        .slice(0, 5);

    const byId = new Map(allCommitments.map(item => [item.id, item]));
    const dependencies = (commitment.dependencias || [])
        .map(depId => byId.get(depId))
        .filter((dep): dep is Commitment => Boolean(dep))
        .map(dep => ({
            id: dep.id,
            titulo: dep.titulo,
            status: dep.status,
            dueDate: toDateKey(dep.dataEsperada),
            atRisk: getRiskSignals(dep, today).length > 0,
        }));

    const baseEvents = [...(commitment.historico || []), ...events];
    const renegotiationEvents = baseEvents
        .filter(event => event.tipo === 'RENEGOTIATION')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
        commitment: {
            id: commitment.id,
            titulo: commitment.titulo,
            descricao: commitment.descricao || '',
            projeto: commitment.projeto,
            owner: commitment.owner,
            stakeholder: commitment.stakeholder,
            tipo: commitment.tipo,
            impacto: commitment.impacto,
            status: commitment.status,
            dueDate: toDateKey(commitment.dataEsperada),
            hasImpedimento: commitment.hasImpedimento,
        },
        projectSummary: {
            projeto: commitment.projeto,
            total: sameProject.length,
            active: sameProject.filter(item => item.status === CommitmentStatus.ACTIVE).length,
            done: sameProject.filter(item => item.status === CommitmentStatus.DONE).length,
            cancelled: sameProject.filter(item => item.status === CommitmentStatus.CANCELLED).length,
        },
        projectWip: activeInProject.length,
        projectAtRiskCommitments: atRisk,
        dependencies,
        postponementHistory: {
            renegotiationCount: commitment.renegociadoCount || renegotiationEvents.length,
            lastRenegotiations: renegotiationEvents.slice(0, 3).map(event => `${toDateKey(event.timestamp)}: ${event.descricao}`),
        },
    };
}

function normalizeOutput(raw: unknown): PreMortemOutput {
    if (!raw || typeof raw !== 'object') {
        throw new Error('Saída inválida do pre-mortem');
    }
    const data = raw as Record<string, unknown>;
    const riskLevel = String(data.riskLevel || '').toLowerCase();
    if (riskLevel !== 'low' && riskLevel !== 'medium' && riskLevel !== 'high') {
        throw new Error('riskLevel inválido');
    }

    const toArray = (value: unknown, max: number): string[] => {
        if (!Array.isArray(value)) return [];
        return value.map(item => String(item).trim()).filter(Boolean).slice(0, max);
    };

    return {
        riskLevel: riskLevel as PreMortemRiskLevel,
        causes: toArray(data.causes, 3),
        criticalQuestions: toArray(data.criticalQuestions, 2),
        mitigations: toArray(data.mitigations, 2),
    };
}

export function buildPreMortemPrompt(context: PreMortemContext): string {
    return [
        'Você é um analista de Pre-Mortem para execução de compromissos.',
        'Assuma que o compromisso falhou e explique os fatores estruturais mais prováveis.',
        'Responda SOMENTE em JSON no formato:',
        '{"riskLevel":"low|medium|high","causes":[...],"criticalQuestions":[...],"mitigations":[...]}',
        'Regras: até 3 causes, até 2 criticalQuestions, até 2 mitigations, resposta total entre 250 e 300 palavras.',
        'Use linguagem objetiva e orientada a ação, sem markdown.',
        `Contexto: ${JSON.stringify(context)}`,
    ].join('\n');
}

export async function runPreMortemAnalysis(context: PreMortemContext): Promise<PreMortemOutput> {
    const prompt = buildPreMortemPrompt(context);
    const response = await fetch('/api/guardian/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            analysisType: 'pre_mortem',
            context,
            prompt,
        }),
    });

    const payload = await response.json() as any;
    if (payload?.status !== 'ok' || !payload?.result) {
        throw new Error(payload?.reason || 'Pre-Mortem indisponível no momento.');
    }

    return normalizeOutput(payload.result);
}
