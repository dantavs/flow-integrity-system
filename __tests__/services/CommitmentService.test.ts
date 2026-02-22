// __tests__/services/CommitmentService.test.ts
import { editCommitment, createCommitment, CreateCommitmentDTO } from '../../src/services/CommitmentService';
import { Commitment, CommitmentStatus, CommitmentType, CommitmentImpact } from '../../src/models/Commitment';

describe('CommitmentService - editCommitment', () => {
    const baseCommitment: Commitment = {
        id: 'c1',
        titulo: 'Entregar API',
        projeto: 'Flow',
        area: 'Backend',
        owner: 'Alice',
        stakeholder: 'Bob',
        dataEsperada: new Date('2026-03-15'),
        tipo: 'DELIVERY' as CommitmentType,
        impacto: 'MEDIUM' as CommitmentImpact,
        status: CommitmentStatus.ACTIVE,
        hasImpedimento: false,
        riscos: '',
        renegociadoCount: 0,
        criadoEm: new Date(),
        historico: [],
    };

    const newData: CreateCommitmentDTO = {
        titulo: 'Entregar API v2',
        projeto: 'Flow',
        area: 'Backend',
        owner: 'Alice',
        stakeholder: 'Bob',
        dataEsperada: new Date('2026-04-01'),
        tipo: 'DELIVERY',
        impacto: 'MEDIUM',
        riscos: '',
    };

    test('edita título e data corretamente, cria eventos de EDIT e RENEGOTIATION', () => {
        const edited = editCommitment(baseCommitment, newData);
        expect(edited.titulo).toBe(newData.titulo);
        expect(edited.dataEsperada.getTime()).toBe(newData.dataEsperada.getTime());
        // deve ter dois eventos no histórico
        expect(edited.historico).toHaveLength(2);
        const tipos = edited.historico.map(e => e.tipo);
        expect(tipos).toContain('EDIT');
        expect(tipos).toContain('RENEGOTIATION');
        // contador de renegociações incrementado
        expect(edited.renegociadoCount).toBe(1);
    });

    test('lança erro quando título está vazio', () => {
        const badData = { ...newData, titulo: '' } as CreateCommitmentDTO;
        expect(() => editCommitment(baseCommitment, badData)).toThrow('Título é obrigatório');
    });

    test('lança erro quando dataEsperada está ausente', () => {
        const badData = { ...newData, dataEsperada: undefined as any } as CreateCommitmentDTO;
        expect(() => editCommitment(baseCommitment, badData)).toThrow('Data de entrega é obrigatória');
    });
});
