import Image from "next/image";

export default function Home() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <header className="animate-fade-in" style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>
          Welcome to <span className="gradient-text">Flow Integrity System</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
          Ensuring the seamless flow of data, logic, and performance across your entire stack. 
          The ultimate foundation for modern, robust digital experiences.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="glass" style={{
            padding: '1rem 2.5rem',
            borderRadius: 'var(--radius-xl)',
            fontWeight: '600',
            fontSize: '1rem',
            color: 'var(--text-primary)',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2))',
            border: '1px solid var(--glass-border)'
          }}>
            Explore System
          </button>
          <button className="glass" style={{
             padding: '1rem 2.5rem',
             borderRadius: 'var(--radius-xl)',
             fontWeight: '600',
             fontSize: '1rem',
             color: 'var(--text-primary)'
          }}>
            Documentation
          </button>
        </div>
      </header>

      <section style={{
        marginTop: '6rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        width: '100%',
        maxWidth: '1200px'
      }}>
        {[
          { title: 'Data Integrity', desc: 'Real-time validation and consistency checks across all distributed nodes.' },
          { title: 'Performance Flow', desc: 'Predictive analytics to maintain sub-100ms response times at any scale.' },
          { title: 'Security Shield', desc: 'Automated threat detection and seamless encryption for every byte of data.' }
        ].map((feature, i) => (
          <div key={i} className="glass animate-fade-in" style={{
            padding: '2.5rem',
            borderRadius: 'var(--radius-2xl)',
            textAlign: 'left',
            animationDelay: `${0.2 + i * 0.1}s`,
            transition: 'transform 0.3s ease'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>{feature.title}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
          </div>
        ))}
      </section>

      <footer style={{ marginTop: '8rem', color: 'var(--text-muted)' }}>
        <p>&copy; 2026 Flow Integrity System. Built with Next.js.</p>
      </footer>
    </div>
  );
}
