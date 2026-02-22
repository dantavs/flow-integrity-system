'use client';

import React from 'react';
import { Commitment } from '../models/Commitment';

interface CommitmentCardProps {
    commitment: Commitment;
    index: number;
}

const CommitmentCard: React.FC<CommitmentCardProps> = ({ commitment: c, index }) => {
    const getTipoIcon = (tipo: string) => {
        switch (tipo) {
            case 'DELIVERY': return '🏁';
            case 'ALIGNMENT': return '🤝';
            case 'DECISION': return '⚖️';
            case 'OP': return '⚙️';
            default: return '📄';
        }
    };

    return (
        <div
            className="glass-card p-6 flex flex-col justify-between animate-fade-in"
            style={{ animationDelay: `${0.1 + index * 0.05}s` }}
        >
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span className={`status-badge ${c.status === 'ACTIVE' ? 'status-active' : 'status-backlog'}`}>
                        {c.status}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{c.id}</span>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>{c.titulo}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    {c.projeto} • {c.area}
                </p>

                {c.riscos && (
                    <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--accent-primary)',
                        backgroundColor: 'rgba(139, 92, 246, 0.05)',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        marginBottom: '1rem',
                        borderLeft: '2px solid var(--accent-primary)'
                    }}>
                        <strong>⚠️ Risco:</strong> {c.riscos}
                    </div>
                )}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
                    <span>Para: <strong style={{ color: 'var(--text-primary)' }}>{c.stakeholder}</strong></span>
                    <span>De: <strong style={{ color: 'var(--text-primary)' }}>{c.owner}</strong></span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <span>📅</span>
                        <span style={{ fontWeight: 500, color: 'var(--accent-secondary)' }}>
                            {new Date(c.dataEsperada).toLocaleDateString('pt-BR')}
                        </span>
                    </div>
                    <span style={{
                        fontSize: '0.7rem',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--glass-bg)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--glass-border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <span>{getTipoIcon(c.tipo)}</span>
                        {c.tipo}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CommitmentCard;
