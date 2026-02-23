import {
    Commitment,
    CommitmentStatus,
    CommitmentType,
    CommitmentImpact,
    CommitmentRisk,
    RiskCategory,
    RiskMitigationStatus,
    RiskMatrixLevel,
} from '../models/Commitment';

export interface CreateCommitmentDTO {
    titulo: string;
    projeto: string;
    area: string;
    owner: string;
    stakeholder: string;
    dependencias: string[];
    dataEsperada: Date;
    tipo: CommitmentType;
    impacto: CommitmentImpact;
    riscos: CommitmentRisk[];
}

const defaultRisk = (descricao: string): CommitmentRisk => ({
    id: `risk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    descricao,
    categoria: 'OUTRO',
    statusMitigacao: 'ABERTO',
    probabilidade: 'MEDIUM',
    impacto: 'MEDIUM',
});

function normalizeRiskCategory(value: unknown): RiskCategory {
    const allowed: RiskCategory[] = ['PRAZO', 'ESCOPO', 'DEPENDENCIA', 'RECURSOS', 'QUALIDADE', 'NEGOCIO', 'OUTRO'];
    return allowed.includes(value as RiskCategory) ? (value as RiskCategory) : 'OUTRO';
}

function normalizeRiskStatus(value: unknown): RiskMitigationStatus {
    const allowed: RiskMitigationStatus[] = ['ABERTO', 'EM_MITIGACAO', 'MITIGADO', 'ACEITO'];
    return allowed.includes(value as RiskMitigationStatus) ? (value as RiskMitigationStatus) : 'ABERTO';
}

function normalizeMatrixLevel(value: unknown): RiskMatrixLevel {
    const allowed: RiskMatrixLevel[] = ['LOW', 'MEDIUM', 'HIGH'];
    return allowed.includes(value as RiskMatrixLevel) ? (value as RiskMatrixLevel) : 'MEDIUM';
}

function sanitizeRisks(riscos: unknown): CommitmentRisk[] {
    if (typeof riscos === 'string') {
        const text = riscos.trim();
        return text ? [defaultRisk(text)] : [];
    }

    if (!Array.isArray(riscos)) {
        return [];
    }

    return riscos
        .map((risk): CommitmentRisk | null => {
            if (!risk || typeof risk !== 'object') return null;
            const descricao = String((risk as any).descricao ?? '').trim();
            if (!descricao) return null;

            return {
                id: String((risk as any).id || `risk-${Date.now()}-${Math.floor(Math.random() * 1000)}`),
                descricao,
                categoria: normalizeRiskCategory((risk as any).categoria),
                statusMitigacao: normalizeRiskStatus((risk as any).statusMitigacao),
                probabilidade: normalizeMatrixLevel((risk as any).probabilidade),
                impacto: normalizeMatrixLevel((risk as any).impacto),
            };
        })
        .filter((risk): risk is CommitmentRisk => risk !== null);
}

function risksChanged(a: CommitmentRisk[], b: CommitmentRisk[]): boolean {
    if (a.length !== b.length) return true;

    const toComparable = (risk: CommitmentRisk) => ({
        descricao: risk.descricao,
        categoria: risk.categoria,
        statusMitigacao: risk.statusMitigacao,
        probabilidade: risk.probabilidade,
        impacto: risk.impacto,
    });

    const normalizedA = a.map(toComparable);
    const normalizedB = b.map(toComparable);
    return JSON.stringify(normalizedA) !== JSON.stringify(normalizedB);
}

function sanitizeDependencyIds(dependencias: unknown): string[] {
    if (!Array.isArray(dependencias)) return [];
    return Array.from(
        new Set(
            dependencias
                .map(dep => String(dep).trim())
                .filter(dep => dep !== '')
        )
    );
}

export function createCommitment(data: CreateCommitmentDTO, existingIds: string[]): Commitment {
    if (!data.titulo || data.titulo.trim() === '') {
        throw new Error('Título é obrigatório');
    }

    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const expectedDate = new Date(data.dataEsperada.getFullYear(), data.dataEsperada.getMonth(), data.dataEsperada.getDate());

    if (expectedDate < today) {
        throw new Error('A data esperada não pode estar no passado');
    }

    const nextId = existingIds.length > 0
        ? (Math.max(...existingIds.map(id => parseInt(id, 10))) + 1).toString()
        : '1';

    return {
        ...data,
        riscos: sanitizeRisks(data.riscos),
        dependencias: sanitizeDependencyIds(data.dependencias).filter(dep => dep !== nextId),
        id: nextId,
        status: CommitmentStatus.BACKLOG,
        hasImpedimento: false,
        criadoEm: now,
        renegociadoCount: 0,
        historico: [{
            id: `evt-${Date.now()}`,
            tipo: 'CREATE',
            timestamp: now,
            descricao: 'Compromisso criado com status BACKLOG',
        }],
    };
}

export function changeCommitmentStatus(commitment: Commitment, newStatus: CommitmentStatus): Commitment {
    if (commitment.status === newStatus) return commitment;

    const event = {
        id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        tipo: 'STATUS_CHANGE' as const,
        timestamp: new Date(),
        descricao: `Status alterado de ${commitment.status} para ${newStatus}`,
        valorAnterior: commitment.status,
        valorNovo: newStatus,
    };

    return {
        ...commitment,
        status: newStatus,
        historico: [...(commitment.historico || []), event],
    };
}

export function editCommitment(commitment: Commitment, data: CreateCommitmentDTO): Commitment {
    if (!data.titulo || data.titulo.trim() === '') {
        throw new Error('Título é obrigatório');
    }
    if (!data.dataEsperada) {
        throw new Error('Data de entrega é obrigatória');
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const expectedDate = new Date(
        data.dataEsperada.getFullYear ? data.dataEsperada.getFullYear() : new Date(data.dataEsperada).getFullYear(),
        data.dataEsperada.getMonth ? data.dataEsperada.getMonth() : new Date(data.dataEsperada).getMonth(),
        data.dataEsperada.getDate ? data.dataEsperada.getDate() : new Date(data.dataEsperada).getDate(),
    );

    const oldExpectedDate = new Date(commitment.dataEsperada.getFullYear(), commitment.dataEsperada.getMonth(), commitment.dataEsperada.getDate());

    if (expectedDate.getTime() !== oldExpectedDate.getTime() && expectedDate < today) {
        throw new Error('Ao alterar a data, ela não pode ser transferida para o passado');
    }

    const isRenegotiation = expectedDate.getTime() !== oldExpectedDate.getTime();
    const normalizedRisks = sanitizeRisks(data.riscos);
    const previousRisks = sanitizeRisks(commitment.riscos);
    const normalizedDependencies = sanitizeDependencyIds(data.dependencias).filter(dep => dep !== commitment.id);
    const previousDependencies = sanitizeDependencyIds(commitment.dependencias);

    const changes: string[] = [];
    if (commitment.titulo !== data.titulo) changes.push(`Título: ${commitment.titulo} -> ${data.titulo}`);
    if (commitment.projeto !== data.projeto) changes.push(`Projeto: ${commitment.projeto} -> ${data.projeto}`);
    if (commitment.owner !== data.owner) changes.push(`Owner: ${commitment.owner} -> ${data.owner}`);
    if (commitment.stakeholder !== data.stakeholder) changes.push(`Stakeholder: ${commitment.stakeholder} -> ${data.stakeholder}`);
    if (commitment.tipo !== data.tipo) changes.push(`Tipo: ${commitment.tipo} -> ${data.tipo}`);
    if (commitment.impacto !== data.impacto) changes.push(`Impacto: ${commitment.impacto} -> ${data.impacto}`);
    if (isRenegotiation) changes.push(`Data: ${oldExpectedDate.toLocaleDateString()} -> ${expectedDate.toLocaleDateString()}`);
    if (risksChanged(previousRisks, normalizedRisks)) changes.push(`Riscos: ${previousRisks.length} -> ${normalizedRisks.length}`);
    if (JSON.stringify(previousDependencies) !== JSON.stringify(normalizedDependencies)) changes.push(`Dependências: ${previousDependencies.length} -> ${normalizedDependencies.length}`);

    if (changes.length === 0 && commitment.area === data.area) {
        return commitment;
    }

    const eventDesc = changes.length > 0 ? `Campos editados:\n${changes.join('\n')}` : 'Compromisso editado';

    const event = {
        id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        tipo: isRenegotiation ? 'RENEGOTIATION' as const : 'EDIT' as const,
        timestamp: now,
        descricao: eventDesc,
    };

    return {
        ...commitment,
        ...data,
        riscos: normalizedRisks,
        dependencias: normalizedDependencies,
        renegociadoCount: isRenegotiation ? (commitment.renegociadoCount || 0) + 1 : commitment.renegociadoCount,
        historico: [...(commitment.historico || []), event],
    };
}
