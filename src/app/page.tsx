'use client';

import React, { useState, useEffect } from 'react';
import CommitmentForm from '../components/CommitmentForm';
import CommitmentList from '../components/CommitmentList';
import { createCommitment, CreateCommitmentDTO } from '../services/CommitmentService';
import { loadCommitments, saveCommitments } from '../services/PersistenceService';
import { Commitment, CommitmentStatus } from '../models/Commitment';

export default function Home() {
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    const data = loadCommitments();
    setCommitments(data);
  }, []);

  // Salvar sempre que a lista mudar
  useEffect(() => {
    if (commitments.length > 0) {
      saveCommitments(commitments);
    }
  }, [commitments]);

  const handleCreateCommitment = (data: CreateCommitmentDTO) => {
    try {
      const existingIds = commitments.map(c => c.id);
      const newCommitment = createCommitment(data, existingIds);
      setCommitments(prev => [...prev, newCommitment]);
      setMessage('Fluxo de integridade iniciado com sucesso!');
      setTimeout(() => setMessage(null), 3000);
      return true;
    } catch (error: any) {
      alert(error.message);
      return false;
    }
  };

  const handleStatusUpdate = (id: string, newStatus: CommitmentStatus) => {
    setCommitments(prev => prev.map(c =>
      c.id === id ? { ...c, status: newStatus } : c
    ));
    setMessage(`Status do compromisso #${id} atualizado.`);
    setTimeout(() => setMessage(null), 3000);
  };

  const activeCommitments = commitments
    .filter(c => c.status === CommitmentStatus.ACTIVE || c.status === CommitmentStatus.BACKLOG)
    .sort((a, b) => new Date(a.dataEsperada).getTime() - new Date(b.dataEsperada).getTime());

  return (
    <div style={{
      minHeight: '100vh',
      padding: '4rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Background Decor */}
      <div style={{
        position: 'fixed',
        top: '-10%',
        right: '-5%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
        zIndex: -1,
      }} />
      <div style={{
        position: 'fixed',
        bottom: '5%',
        left: '-5%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
        zIndex: -1,
      }} />

      <header style={{ width: '100%', maxWidth: '800px', textAlign: 'center', marginBottom: '5rem' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 700, marginBottom: '1rem' }}>
          Flow <span className="premium-gradient">Integrity</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
          Sua central de compromissos inabaláveis. Onde a palavra empenhada se torna integridade processual.
        </p>
      </header>

      <main style={{ width: '100%', maxWidth: '1000px', display: 'grid', gridTemplateColumns: '1fr', gap: '4rem' }}>
        {/* Section: Formulaio */}
        <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Registrar Novo Compromisso</h2>
            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
          </div>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <CommitmentForm onSubmit={handleCreateCommitment} />
            {message && (
              <div className="animate-fade-in" style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                borderRadius: '8px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                textAlign: 'center',
                fontWeight: 500
              }}>
                {message}
              </div>
            )}
          </div>
        </section>

        {/* Section: Listagem */}
        <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                Compromissos Ativos ({activeCommitments.length})
              </h2>
              <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
            </div>
            <button
              onClick={() => alert('Visualização de arquivados será implementada em breve!')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-primary)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline'
              }}
            >
              Ver itens arquivados
            </button>
          </div>

          <CommitmentList
            commitments={activeCommitments}
            onStatusChange={handleStatusUpdate}
          />
        </section>
      </main>

      <footer style={{ marginTop: '8rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <p>&copy; 2026 Flow Integrity System. A cultura de compromisso levada a sério.</p>
      </footer>
    </div>
  );
}
