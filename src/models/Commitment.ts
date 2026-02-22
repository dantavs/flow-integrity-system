export enum CommitmentStatus {
    BACKLOG = 'BACKLOG',
    ACTIVE = 'ACTIVE',
    DONE = 'DONE'
}

export type CommitmentType = 'DELIVERY' | 'ALIGNMENT' | 'DECISION' | 'OP';
export type CommitmentImpact = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

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
    listaImpedimentos?: string[]; // Opcional para não burocratizar agora
    riscos: string;
    renegociadoCount?: number; // Para rastrear se houve renegociação
    criadoEm: Date;
}
