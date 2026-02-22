'use client';

import React, { useEffect, useState } from 'react';

export type ToastType = 'SUCCESS' | 'ERROR' | 'INFO';

interface ToastProps {
    message: string;
    type: ToastType;
    duration?: number;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, duration = 3000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade-out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'SUCCESS': return '✨';
            case 'ERROR': return '❌';
            case 'INFO': return 'ℹ️';
        }
    };

    const getColor = () => {
        switch (type) {
            case 'SUCCESS': return '#10b981';
            case 'ERROR': return '#ef4444';
            case 'INFO': return 'var(--accent-primary)';
        }
    };

    return (
        <div
            className={`glass-card ${isVisible ? 'animate-fade-in' : 'animate-fade-out'}`}
            style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                padding: '1rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                zIndex: 9999,
                minWidth: '300px',
                borderLeft: `4px solid ${getColor()}`,
                background: 'rgba(20, 20, 25, 0.9)',
            }}
        >
            <span style={{ fontSize: '1.25rem' }}>{getIcon()}</span>
            <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {message}
                </p>
            </div>
            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '4px'
                }}
            >
                ✕
            </button>

            {/* Progress bar */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '2px',
                background: getColor(),
                width: '100%',
                transformOrigin: 'left',
                animation: `toast-progress ${duration}ms linear forwards`,
                opacity: 0.6
            }} />
        </div>
    );
};

export default Toast;
