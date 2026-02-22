'use client';

import React from 'react';
import { Commitment, CommitmentStatus } from '../models/Commitment';
import CommitmentCard from './CommitmentCard';

interface CommitmentListProps {
    commitments: Commitment[];
    onStatusChange?: (id: string, newStatus: CommitmentStatus) => void;
}

const CommitmentList: React.FC<CommitmentListProps> = ({ commitments, onStatusChange }) => {
    if (commitments.length === 0) {
        return (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', width: '100%' }}>
                <p>Nenhum fluxo de integridade monitorado no momento.</p>
            </div>
        );
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
            width: '100%'
        }}>
            {commitments.map((c, i) => (
                <CommitmentCard key={c.id} commitment={c} index={i} onStatusChange={onStatusChange} />
            ))}
        </div>
    );
};

export default CommitmentList;
