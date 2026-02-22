export enum CommitmentStatus {
    BACKLOG = 'BACKLOG',
    ACTIVE = 'ACTIVE',
    DONE = 'DONE',
    CANCELLED = 'CANCELLED'
}

export type CommitmentType = 'DELIVERY' | 'ALIGNMENT' | 'DECISION' | 'OP';
export type CommitmentImpact = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AuditEventType = 'CREATE' | 'STATUS_CHANGE' | 'EDIT' | 'RENEGOTIATION';

export interface AuditEvent {
    id: string;
    tipo: AuditEventType;
    timestamp: Date;
    descricao: string;
    valorAnterior?: string;
    valorNovo?: string;
}

export interface Commitment {
    id: string;
    titulo: string;
    projeto: string;
    area: string;
    owner: string;
    stakeholder: string;
    dataEsperada: Date;
    tipo: CommitmentType;
    impacto: CommitmentImpact;
    status: CommitmentStatus;
    hasImpedimento: boolean;
    listaImpedimentos?: string[];
    riscos: string;
    renegociadoCount?: number;
    criadoEm: Date;
    historico: AuditEvent[];
}
