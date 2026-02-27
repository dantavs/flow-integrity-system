export enum CommitmentStatus {
    BACKLOG = 'BACKLOG',
    ACTIVE = 'ACTIVE',
    DONE = 'DONE',
    CANCELLED = 'CANCELLED'
}

export type CommitmentType = 'DELIVERY' | 'ALIGNMENT' | 'DECISION' | 'OP';
export type CommitmentImpact = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskCategory = 'PRAZO' | 'ESCOPO' | 'DEPENDENCIA' | 'RECURSOS' | 'QUALIDADE' | 'NEGOCIO' | 'OUTRO';
export type RiskMitigationStatus = 'ABERTO' | 'EM_MITIGACAO' | 'MITIGADO' | 'ACEITO';
export type RiskMatrixLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type AuditEventType =
    | 'CREATE'
    | 'STATUS_CHANGE'
    | 'EDIT'
    | 'RENEGOTIATION'
    | 'checklist_item_added'
    | 'checklist_item_completed'
    | 'checklist_item_removed';

export interface AuditEvent {
    id: string;
    tipo: AuditEventType;
    timestamp: Date;
    descricao: string;
    valorAnterior?: string;
    valorNovo?: string;
}

export interface CommitmentRisk {
    id: string;
    descricao: string;
    categoria: RiskCategory;
    statusMitigacao: RiskMitigationStatus;
    probabilidade: RiskMatrixLevel;
    impacto: RiskMatrixLevel;
}

export interface CommitmentChecklistItem {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;
    completedAt?: string;
}

export type PreMortemRiskLevel = 'low' | 'medium' | 'high';

export interface CommitmentPreMortem {
    riskLevel: PreMortemRiskLevel;
    causes: string[];
    criticalQuestions: string[];
    mitigations: string[];
    generatedAt: string;
}

export interface Commitment {
    id: string;
    titulo: string;
    descricao?: string;
    projeto: string;
    area: string;
    owner: string;
    stakeholder: string;
    dependencias: string[];
    dataEsperada: Date;
    tipo: CommitmentType;
    impacto: CommitmentImpact;
    status: CommitmentStatus;
    hasImpedimento: boolean;
    listaImpedimentos?: string[];
    riscos: CommitmentRisk[];
    checklist?: CommitmentChecklistItem[];
    renegociadoCount?: number;
    preMortem?: CommitmentPreMortem;
    criadoEm: Date;
    historico: AuditEvent[];
}

export function riskMatrixScore(risk: CommitmentRisk): number {
    const map: Record<RiskMatrixLevel, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };
    return map[risk.probabilidade] * map[risk.impacto];
}
