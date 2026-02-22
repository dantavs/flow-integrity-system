'use client';

import React, { useState } from 'react';
import { CreateCommitmentDTO } from '../services/CommitmentService';

interface CommitmentFormProps {
    onSubmit: (data: CreateCommitmentDTO) => boolean;
    suggestions?: {
        projetos: string[];
        owners: string[];
        stakeholders: string[];
    };
}

const initialState: CreateCommitmentDTO = {
    titulo: '',
    projeto: '',
    area: '',
    owner: '',
    stakeholder: '',
    dataEsperada: new Date(),
    tipo: 'DELIVERY',
    impacto: 'MEDIUM',
    riscos: '',
};

const CommitmentForm: React.FC<CommitmentFormProps> = ({ onSubmit, suggestions }) => {
    const [formData, setFormData] = useState<CreateCommitmentDTO>(initialState);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'dataEsperada') {
            // Adicionar T00:00:00 garante que a data seja interpretada no fuso horário local
            setFormData(prev => ({ ...prev, [name]: new Date(value + 'T00:00:00') }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = onSubmit(formData);
        if (success) {
            setFormData(initialState);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6 w-full animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                    <label htmlFor="titulo">Título do Compromisso</label>
                    <input
                        type="text"
                        id="titulo"
                        name="titulo"
                        placeholder="O que será entregue?"
                        value={formData.titulo}
                        onChange={handleChange}
                        className="input-field"
                        required
                    />
                </div>

                <div className="space-y-1">
                    <label htmlFor="projeto">Projeto</label>
                    <input
                        type="text"
                        id="projeto"
                        name="projeto"
                        placeholder="ex: Flow v1"
                        value={formData.projeto}
                        onChange={handleChange}
                        className="input-field"
                        list="projetos-list"
                    />
                    <datalist id="projetos-list">
                        {suggestions?.projetos.map(p => <option key={p} value={p} />)}
                    </datalist>
                </div>

                <div className="space-y-1">
                    <label htmlFor="area">Área Responsável</label>
                    <input
                        type="text"
                        id="area"
                        name="area"
                        placeholder="ex: Engenharia"
                        value={formData.area}
                        onChange={handleChange}
                        className="input-field"
                    />
                </div>

                <div className="space-y-1">
                    <label htmlFor="owner">Owner (Quem entrega)</label>
                    <input
                        type="text"
                        id="owner"
                        name="owner"
                        placeholder="Nome da pessoa"
                        value={formData.owner}
                        onChange={handleChange}
                        className="input-field"
                        required
                        list="owners-list"
                    />
                    <datalist id="owners-list">
                        {suggestions?.owners.map(o => <option key={o} value={o} />)}
                    </datalist>
                </div>

                <div className="space-y-1">
                    <label htmlFor="stakeholder">Stakeholder (Quem recebe)</label>
                    <input
                        type="text"
                        id="stakeholder"
                        name="stakeholder"
                        placeholder="ex: CEO, Time de QA"
                        value={formData.stakeholder}
                        onChange={handleChange}
                        className="input-field"
                        required
                        list="stakeholders-list"
                    />
                    <datalist id="stakeholders-list">
                        {suggestions?.stakeholders.map(s => <option key={s} value={s} />)}
                    </datalist>
                </div>

                <div className="space-y-1">
                    <label htmlFor="dataEsperada">Data de Entrega</label>
                    <input
                        type="date"
                        id="dataEsperada"
                        name="dataEsperada"
                        onChange={handleChange}
                        className="input-field"
                        min={new Date().toISOString().split('T')[0]}
                        required
                    />
                </div>

                <div className="space-y-1">
                    <label htmlFor="tipo">Tipo de Fluxo</label>
                    <select
                        id="tipo"
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleChange}
                        className="input-field"
                    >
                        <option value="DELIVERY">🏁 Delivery</option>
                        <option value="ALIGNMENT">🤝 Alignment</option>
                        <option value="DECISION">⚖️ Decision</option>
                        <option value="OP">⚙️ Operational</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label htmlFor="impacto">Impacto Sistêmico</label>
                    <select
                        id="impacto"
                        name="impacto"
                        value={formData.impacto}
                        onChange={handleChange}
                        className="input-field"
                    >
                        <option value="LOW">Low Impact</option>
                        <option value="MEDIUM">Medium Impact</option>
                        <option value="HIGH">High Impact</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                </div>
            </div>

            <div className="space-y-1">
                <label htmlFor="riscos">Riscos e Considerações</label>
                <textarea
                    id="riscos"
                    name="riscos"
                    placeholder="Algo que possa impedir a entrega?"
                    value={formData.riscos}
                    onChange={handleChange}
                    className="input-field"
                    style={{ minHeight: '100px', resize: 'vertical' }}
                />
            </div>

            <div className="pt-4">
                <button type="submit" className="btn-primary w-full">
                    Garantir Compromisso
                </button>
            </div>
        </form>
    );
};

export default CommitmentForm;
