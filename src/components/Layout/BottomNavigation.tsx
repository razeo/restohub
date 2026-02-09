// ===========================================
// Bottom Navigation for Mobile
// ===========================================

import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, Settings, Menu } from 'lucide-react';

interface BottomNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'schedule', label: 'Raspored', icon: Calendar },
  { id: 'employees', label: 'Radnici', icon: Users },
  { id: 'shifts', label: 'Smjene', icon: Clock },
  { id: 'menu', label: 'Meni', icon: Menu },
  { id: 'settings', label: 'Postavke', icon: Settings },
];

export function BottomNavigation({ currentPage, onNavigate }: BottomNavigationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide
        setIsVisible(false);
      } else {
        // Scrolling up - show
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg lg:hidden transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 20px)',
      }}
    >
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full px-2 transition-all duration-200 relative ${
                isActive
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-b-full" />
              )}
              
              {/* Icon */}
              <Icon
                size={24}
                className={`mb-1 transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}
              />
              
              {/* Label */}
              <span
                className={`text-xs font-medium transition-all duration-200 ${
                  isActive ? 'opacity-100' : 'opacity-70'
                }`}
              >
                {item.label}
              </span>

              {/* Badge */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-2 right-4 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Safe area indicator */}
      <div className="absolute bottom-full left-0 right-0 h-6 bg-gradient-to-t from-black/5 to-transparent" />
    </nav>
  );
}

/**
 * Hook to detect mobile viewport (less than 1024px)
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
