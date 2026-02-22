'use client';

import React, { useState } from 'react';
import { CreateCommitmentDTO } from '../services/CommitmentService';

interface CommitmentFormProps {
    onSubmit: (data: CreateCommitmentDTO) => void;
}

const CommitmentForm: React.FC<CommitmentFormProps> = ({ onSubmit }) => {
    const [formData, setFormData] = useState<CreateCommitmentDTO>({
        titulo: '',
        projeto: '',
        area: '',
        owner: '',
        stakeholder: '',
        dataEsperada: new Date(),
        tipo: 'DELIVERY',
        impacto: 'MEDIUM',
        riscos: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'dataEsperada') {
            setFormData(prev => ({ ...prev, [name]: new Date(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded shadow-md space-y-4 max-w-lg bg-white text-black">
            <div className="flex flex-col">
                <label htmlFor="titulo">Título</label>
                <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    className="border p-2 rounded"
                    required
                />
            </div>

            <div className="flex flex-col">
                <label htmlFor="projeto">Projeto</label>
                <input
                    type="text"
                    id="projeto"
                    name="projeto"
                    value={formData.projeto}
                    onChange={handleChange}
                    className="border p-2 rounded"
                />
            </div>

            <div className="flex flex-col">
                <label htmlFor="area">Área</label>
                <input
                    type="text"
                    id="area"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    className="border p-2 rounded"
                />
            </div>

            <div className="flex flex-col">
                <label htmlFor="owner">Owner</label>
                <input
                    type="text"
                    id="owner"
                    name="owner"
                    value={formData.owner}
                    onChange={handleChange}
                    className="border p-2 rounded"
                    required
                />
            </div>

            <div className="flex flex-col">
                <label htmlFor="stakeholder">Stakeholder</label>
                <input
                    type="text"
                    id="stakeholder"
                    name="stakeholder"
                    value={formData.stakeholder}
                    onChange={handleChange}
                    className="border p-2 rounded"
                    required
                />
            </div>

            <div className="flex flex-col">
                <label htmlFor="dataEsperada">Data Esperada</label>
                <input
                    type="date"
                    id="dataEsperada"
                    name="dataEsperada"
                    onChange={handleChange}
                    className="border p-2 rounded"
                    required
                />
            </div>

            <div className="flex flex-col">
                <label htmlFor="tipo">Tipo</label>
                <select
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className="border p-2 rounded"
                >
                    <option value="DELIVERY">Delivery</option>
                    <option value="ALIGNMENT">Alignment</option>
                    <option value="DECISION">Decision</option>
                    <option value="OP">Operational</option>
                </select>
            </div>

            <div className="flex flex-col">
                <label htmlFor="impacto">Impacto</label>
                <select
                    id="impacto"
                    name="impacto"
                    value={formData.impacto}
                    onChange={handleChange}
                    className="border p-2 rounded"
                >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                </select>
            </div>

            <div className="flex flex-col">
                <label htmlFor="riscos">Riscos</label>
                <textarea
                    id="riscos"
                    name="riscos"
                    value={formData.riscos}
                    onChange={handleChange}
                    className="border p-2 rounded"
                />
            </div>

            <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors">
                Criar Compromisso
            </button>
        </form>
    );
};

export default CommitmentForm;
