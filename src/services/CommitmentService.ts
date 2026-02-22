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
        renegociadoCount: 0,
        historico: [{
            id: `evt-${Date.now()}`,
            tipo: 'CREATE',
            timestamp: now,
            descricao: 'Compromisso criado com status BACKLOG'
        }]
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
        valorNovo: newStatus
    };

    return {
        ...commitment,
        status: newStatus,
        historico: [...(commitment.historico || []), event]
    };
}

export function editCommitment(commitment: Commitment, data: CreateCommitmentDTO): Commitment {
    if (!data.titulo || data.titulo.trim() === '') {
        throw new Error('Título é obrigatório');
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const expectedDate = new Date(data.dataEsperada.getFullYear(), data.dataEsperada.getMonth(), data.dataEsperada.getDate());

    // Se estiver mudando a data para uma diferente da que já tinha,
    // garantimos que não é pro passado (a antiga podia estar no passado e não tem problema se não mexer nela)
    const oldExpectedDate = new Date(commitment.dataEsperada.getFullYear(), commitment.dataEsperada.getMonth(), commitment.dataEsperada.getDate());

    if (expectedDate.getTime() !== oldExpectedDate.getTime() && expectedDate < today) {
        throw new Error('Ao alterar a data, ela não pode ser transferida para o passado');
    }

    const isRenegotiation = expectedDate.getTime() !== oldExpectedDate.getTime();

    // Identificar mudanças para salvar na descrição 
    const changes: string[] = [];
    if (commitment.titulo !== data.titulo) changes.push(`Título: ${commitment.titulo} -> ${data.titulo}`);
    if (commitment.projeto !== data.projeto) changes.push(`Projeto: ${commitment.projeto} -> ${data.projeto}`);
    if (commitment.owner !== data.owner) changes.push(`Owner: ${commitment.owner} -> ${data.owner}`);
    if (commitment.stakeholder !== data.stakeholder) changes.push(`Stakeholder: ${commitment.stakeholder} -> ${data.stakeholder}`);
    if (commitment.tipo !== data.tipo) changes.push(`Tipo: ${commitment.tipo} -> ${data.tipo}`);
    if (commitment.impacto !== data.impacto) changes.push(`Impacto: ${commitment.impacto} -> ${data.impacto}`);
    if (isRenegotiation) changes.push(`Data: ${oldExpectedDate.toLocaleDateString()} -> ${expectedDate.toLocaleDateString()}`);

    if (changes.length === 0 && commitment.riscos === data.riscos && commitment.area === data.area) {
        return commitment; // Nada mudou de fato
    }

    const eventDesc = changes.length > 0 ? `Campos editados:\n${changes.join('\n')}` : 'Compromisso editado (detalhes ou riscos)';

    const event = {
        id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        tipo: isRenegotiation ? 'RENEGOTIATION' as const : 'EDIT' as const,
        timestamp: now,
        descricao: eventDesc
    };

    return {
        ...commitment,
        ...data,
        renegociadoCount: isRenegotiation ? (commitment.renegociadoCount || 0) + 1 : commitment.renegociadoCount,
        historico: [...(commitment.historico || []), event]
    };
}
