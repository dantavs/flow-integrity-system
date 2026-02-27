'use client';

import React from 'react';
import { Commitment, CommitmentStatus } from '../models/Commitment';
import CommitmentCard from './CommitmentCard';

interface CommitmentListProps {
    commitments: Commitment[];
    onStatusChange?: (id: string, newStatus: CommitmentStatus) => void;
    onEdit?: (id: string) => void;
    onViewHistory?: (id: string) => void;
    onRunPreMortem?: (id: string) => void;
    preMortemLoadingById?: Record<string, boolean>;
    onChecklistAdd?: (id: string, text: string) => void;
    onChecklistToggle?: (id: string, itemId: string) => void;
    onChecklistRemove?: (id: string, itemId: string) => void;
}

const CommitmentList: React.FC<CommitmentListProps> = ({
    commitments,
    onStatusChange,
    onEdit,
    onViewHistory,
    onRunPreMortem,
    preMortemLoadingById,
    onChecklistAdd,
    onChecklistToggle,
    onChecklistRemove,
}) => {
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
                <CommitmentCard
                    key={c.id}
                    commitment={c}
                    index={i}
                    onStatusChange={onStatusChange}
                    onEdit={onEdit}
                    onViewHistory={onViewHistory}
                    onRunPreMortem={onRunPreMortem}
                    preMortemLoading={Boolean(preMortemLoadingById?.[c.id])}
                    onChecklistAdd={onChecklistAdd}
                    onChecklistToggle={onChecklistToggle}
                    onChecklistRemove={onChecklistRemove}
                />
            ))}
        </div>
    );
};

export default CommitmentList;
