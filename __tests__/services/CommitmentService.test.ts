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
        riscos: [],
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
        riscos: [{
            id: 'r-1',
            descricao: 'Dependência de terceiro',
            categoria: 'DEPENDENCIA',
            statusMitigacao: 'EM_MITIGACAO',
            probabilidade: 'MEDIUM',
            impacto: 'HIGH',
        }],
    };

    test('edita título e data corretamente e cria evento de RENEGOTIATION', () => {
        const edited = editCommitment(baseCommitment, newData);
        expect(edited.titulo).toBe(newData.titulo);
        expect(edited.dataEsperada.getTime()).toBe(newData.dataEsperada.getTime());
        expect(edited.historico).toHaveLength(1);
        expect(edited.historico[0].tipo).toBe('RENEGOTIATION');
        expect(edited.renegociadoCount).toBe(1);
        expect(edited.riscos).toHaveLength(1);
    });

    test('lança erro quando título está vazio', () => {
        const badData = { ...newData, titulo: '' } as CreateCommitmentDTO;
        expect(() => editCommitment(baseCommitment, badData)).toThrow('Título é obrigatório');
    });

    test('lança erro quando dataEsperada está ausente', () => {
        const badData = { ...newData, dataEsperada: undefined as any } as CreateCommitmentDTO;
        expect(() => editCommitment(baseCommitment, badData)).toThrow('Data de entrega é obrigatória');
    });

    test('normaliza risco legado em string na criação', () => {
        const dto = { ...newData, riscos: 'Risco textual legado' as any };
        const created = createCommitment(dto, []);
        expect(created.riscos).toHaveLength(1);
        expect(created.riscos[0].descricao).toBe('Risco textual legado');
    });
});
