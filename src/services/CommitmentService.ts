import { Commitment, CommitmentStatus, CommitmentType, CommitmentImpact } from '../models/Commitment';

export interface CreateCommitmentDTO {
    titulo: string;
    projeto: string;
    area: string;
    owner: string;
    stakeholder: string;
    dataEsperada: Date;
    tipo: CommitmentType;
    impacto: CommitmentImpact;
    riscos: string;
}

export function createCommitment(data: CreateCommitmentDTO, existingIds: string[]): Commitment {
    if (!data.titulo || data.titulo.trim() === '') {
        throw new Error('Título é obrigatório');
    }

    const now = new Date();

    // Normalizar datas para comparação (apenas dia, mês, ano para evitar problemas de ms)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const expectedDate = new Date(data.dataEsperada.getFullYear(), data.dataEsperada.getMonth(), data.dataEsperada.getDate());

    if (expectedDate < today) {
        throw new Error('A data esperada não pode estar no passado');
    }

    // Geração de ID incremental simples
    const nextId = existingIds.length > 0
        ? (Math.max(...existingIds.map(id => parseInt(id))) + 1).toString()
        : '1';

    return {
        ...data,
        id: nextId,
        status: CommitmentStatus.BACKLOG,
        hasImpedimento: false,
        criadoEm: now,
        renegociadoCount: 0
    };
}
