// Mobile-optimized layout component for RestoHub
import React from 'react';
import { useMobile } from '../hooks/useMobile';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const { isMobile, isTablet } = useMobile();

  if (!isMobile && !isTablet) {
    return <>{children}</>;
  }

  return (
    <div className="mobile-layout">
      <style>{`
        .mobile-layout {
          --safe-area-top: env(safe-area-inset-top, 0px);
          --safe-area-bottom: env(safe-area-inset-bottom, 0px);
          min-height: 100vh;
          min-height: -webkit-fill-available;
          background-color: #f8fafc;
        }
        
        .mobile-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          color: white;
          padding: calc(12px + var(--safe-area-top)) 16px 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        .mobile-content {
          padding: 16px;
          padding-bottom: calc(80px + var(--safe-area-bottom));
          max-width: 100%;
        }
        
        .mobile-card {
          background: white;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }
        
        .mobile-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          background: #1e40af;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .mobile-button:active {
          transform: scale(0.98);
          opacity: 0.9;
        }
        
        .mobile-button.secondary {
          background: #e2e8f0;
          color: #1e293b;
        }
        
        .mobile-input {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 15px;
          background: white;
          transition: border-color 0.2s ease;
        }
        
        .mobile-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .mobile-title {
          font-size: 22px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
        }
        
        .mobile-subtitle {
          font-size: 14px;
          color: #64748b;
        }
        
        @media (prefers-color-scheme: dark) {
          .mobile-layout {
            background-color: #0f172a;
          }
          .mobile-card {
            background: #1e293b;
          }
          .mobile-title {
            color: #f1f5f9;
          }
          .mobile-subtitle {
            color: #94a3b8;
          }
          .mobile-input {
            background: #334155;
            border-color: #475569;
            color: #f1f5f9;
          }
        }
      `}</style>
      {children}
    </div>
  );
}

// Mobile-safe area wrapper
export function SafeArea({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`safe-area ${className}`} style={{ 
      paddingTop: 'var(--safe-area-top)',
      paddingBottom: 'var(--safe-area-bottom)'
    }}>
      {children}
    </div>
  );
}

// Mobile header component
export function MobileHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  return (
    <header className="mobile-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {onBack && (
          <button 
            onClick={onBack}
            style={{ 
              background: 'rgba(255,255,255,0.2)', 
              border: 'none', 
              borderRadius: 8, 
              padding: 8,
              cursor: 'pointer',
              display: 'flex'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        )}
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{title}</h1>
          {subtitle && <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.85 }}>{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}
