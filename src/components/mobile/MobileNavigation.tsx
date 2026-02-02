// Mobile bottom tab navigation for RestoHub

export type TabType = 'schedule' | 'notifications' | 'profile' | 'settings';

interface MobileNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  notificationCount?: number;
}

export function MobileNavigation({ activeTab, onTabChange, notificationCount = 0 }: MobileNavigationProps) {
  const tabs: { id: TabType; label: string; icon: string; badge?: number }[] = [
    { 
      id: 'schedule', 
      label: 'Raspored', 
      icon: 'calendar',
    },
    { 
      id: 'notifications', 
      label: 'Obavijesti', 
      icon: 'bell',
      badge: notificationCount > 0 ? notificationCount : undefined,
    },
    { 
      id: 'profile', 
      label: 'Profil', 
      icon: 'user',
    },
    { 
      id: 'settings', 
      label: 'Postavke', 
      icon: 'settings',
    },
  ];

  const getIcon = (iconName: string, active: boolean) => {
    const color = active ? '#1e40af' : '#64748b';
    const size = 24;

    switch (iconName) {
      case 'calendar':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        );
      case 'bell':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        );
      case 'user':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        );
      case 'settings':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        .mobile-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          display: flex;
          justify-content: space-around;
          padding: 8px 0 calc(8px + env(safe-area-inset-bottom, 0px));
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
          z-index: 100;
        }
        
        .mobile-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 16px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 12px;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .mobile-nav-item:active {
          background: #f1f5f9;
        }
        
        .mobile-nav-item.active {
          background: #eff6ff;
        }
        
        .mobile-nav-label {
          font-size: 11px;
          font-weight: 500;
          color: #64748b;
        }
        
        .mobile-nav-item.active .mobile-nav-label {
          color: #1e40af;
        }
        
        .mobile-nav-badge {
          position: absolute;
          top: 4px;
          right: 8px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: 600;
          min-width: 16px;
          height: 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }
        
        @media (prefers-color-scheme: dark) {
          .mobile-nav {
            background: #1e293b;
          }
          .mobile-nav-item:active {
            background: #334155;
          }
          .mobile-nav-item.active {
            background: #1e3a8a;
          }
          .mobile-nav-label {
            color: #94a3b8;
          }
          .mobile-nav-item.active .mobile-nav-label {
            color: #60a5fa;
          }
        }
      `}</style>
      <nav className="mobile-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`mobile-nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {getIcon(tab.icon, activeTab === tab.id)}
            <span className="mobile-nav-label">{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="mobile-nav-badge">{tab.badge > 99 ? '99+' : tab.badge}</span>
            )}
          </button>
        ))}
      </nav>
    </>
  );
}
