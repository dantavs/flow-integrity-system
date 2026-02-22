'use client';

import React, { useState } from 'react';
import CommitmentForm from '../components/CommitmentForm';
import { createCommitment, CreateCommitmentDTO } from '../services/CommitmentService';
import { Commitment } from '../models/Commitment';

export default function Home() {
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const handleCreateCommitment = (data: CreateCommitmentDTO) => {
    try {
      const existingIds = commitments.map(c => c.id);
      const newCommitment = createCommitment(data, existingIds);
      setCommitments(prev => [...prev, newCommitment]);
      setMessage('Compromisso criado com sucesso!');
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: '#f4f7f6'
    }}>
      <header style={{ maxWidth: '800px', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#1a202c' }}>
          Flow Integrity System
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#4a5568' }}>
          Gestão de Compromissos com Foco em Integridade
        </p>
      </header>

      <main style={{ width: '100%', maxWidth: '600px' }}>
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#2d3748' }}>
            Novo Compromisso
          </h2>
          <CommitmentForm onSubmit={handleCreateCommitment} />
          {message && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#c6f6d5',
              color: '#22543d',
              borderRadius: '0.375rem'
            }}>
              {message}
            </div>
          )}
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#2d3748' }}>
            Compromissos Ativos ({commitments.length})
          </h2>
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {commitments.length === 0 ? (
              <p style={{ color: '#718096', textAlign: 'center' }}>Nenhum compromisso criado ainda.</p>
            ) : (
              commitments.map(c => (
                <div key={c.id} style={{
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{c.titulo}</div>
                  <div style={{ fontSize: '0.9rem', color: '#718096' }}>
                    {c.projeto} | {c.area} | Stakeholder: {c.stakeholder}
                  </div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      backgroundColor: '#edf2f7',
                      borderRadius: '0.25rem',
                      fontSize: '0.8rem'
                    }}>
                      {c.status}
                    </span>
                    <span style={{ fontSize: '0.8rem' }}>
                      Expira em: {new Date(c.dataEsperada).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <footer style={{ marginTop: '5rem', color: '#a0aec0' }}>
        <p>&copy; 2026 Flow Integrity System. Built with Next.js.</p>
      </footer>
    </div>
  );
}
