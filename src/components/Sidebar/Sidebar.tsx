import React, { useState } from 'react';
import { Calendar, Users, Clock, FileText, Settings, HelpCircle, ChevronLeft, ChevronRight, Search, MapPin, Star } from 'lucide-react';
import { Employee, Zone, SpecialDuty } from '../../types';

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
}

interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
  icon?: React.ReactNode; // Optional section icon
}

interface SidebarProps {
  currentPage: string;
  onNavigate: (pageId: string) => void;
  employees: Employee[];
}

export function Sidebar({ currentPage, onNavigate, employees }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'nav' | 'employees'>('nav');
  const [searchTerm, setSearchTerm] = useState('');

  // Define navigation sections
  const navigationSections = (canManageUsers: boolean, canAccessSettings: boolean): NavSection[] => [
    {
      id: 'schedule',
      title: '📅 RASPORED',
      icon: <Calendar size={14} />,
      items: [
        { id: 'schedule', icon: <Calendar size={12} />, label: 'Raspored smjena' },
        { id: 'employees', icon: <Users size={12} />, label: 'Radnici' },
        { id: 'shifts', icon: <Clock size={12} />, label: 'Smjene' },
        { id: 'duties', icon: <FileText size={12} />, label: 'Dužnosti' },
        { id: 'zones', icon: <MapPin size={12} />, label: 'Reoni' }, // New Item
        { id: 'specialDuties', icon: <Star size={12} />, label: 'Posebne Dužnosti' }, // New Item
      ],
    },
    /* 
    // Example of permissions-based sections commented out for simplicity, but structure is here
    ...(canManageUsers ? [{
      id: 'team',
      title: '👥 TIM', 
      items: [
        { id: 'users', icon: <Users size={12} />, label: 'Korisnici' },
        { id: 'permissions', icon: <Shield size={12} />, label: 'Dozvole' }
      ]
    }] : []),
    */
    {
       id: 'system',
       title: '⚙️ SISTEM',
       items: [
          { id: 'settings', icon: <Settings size={12} />, label: 'Podešavanja' },
          { id: 'help', icon: <HelpCircle size={12} />, label: 'Pomoć' }
       ]
    }
  ];

  const sections = navigationSections(true, true); // Mock permissions

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`h-full flex flex-col bg-gray-50/50 dark:bg-gray-800/50 transition-all duration-300 ${collapsed ? 'w-16' : 'w-full'}`}>
      
      {/* Search Bar - Only in expanded mode */}
      {!collapsed && (
        <div className="p-3">
          <div className="relative">
             <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
             <input 
                type="text" 
                placeholder="Pretraži..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-gray-800 border-none rounded shadow-sm text-sm focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-600 placeholder:text-gray-400"
             />
          </div>
        </div>
      )}

      {/* Tabs */}
      {!collapsed && (
         <div className="flex px-3 border-b border-gray-200 dark:border-gray-700">
            <button
               onClick={() => setActiveTab('nav')}
               className={`flex-1 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === 'nav' 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
               }`}
            >
               Navigacija
            </button>
            <button
               onClick={() => setActiveTab('employees')}
               className={`flex-1 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === 'employees' 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
               }`}
            >
               Radnici ({filteredEmployees.length})
            </button>
         </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
         {activeTab === 'nav' ? (
            <div className="space-y-6 px-3">
               {sections.map(section => (
                 <div key={section.id}>
                    {!collapsed && (
                       <div className="flex items-center gap-2 mb-1 px-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          {section.title}
                       </div>
                    )}
                    <div className="space-y-0.5">
                       {section.items.map(item => (
                          <button
                             key={item.id}
                             onClick={() => onNavigate(item.id)}
                             title={collapsed ? item.label : undefined}
                             className={`
                                w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors
                                ${currentPage === item.id 
                                   ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium' 
                                   : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                }
                                ${collapsed ? 'justify-center px-0' : ''}
                             `}
                          >
                             <span className={collapsed ? 'p-1' : ''}>{item.icon}</span>
                             {!collapsed && <span>{item.label}</span>}
                          </button>
                       ))}
                    </div>
                 </div>
               ))}
            </div>
         ) : (
            <div className="px-3 space-y-1">
               {filteredEmployees.map(emp => (
                  <div key={emp.id} className="flex items-center gap-2 p-2 hover:bg-white dark:hover:bg-gray-700 rounded-md cursor-default group transition-colors">
                     <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                        {emp.name.charAt(0)}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{emp.name}</div>
                        <div className="text-[10px] text-gray-400 truncate">{emp.role}</div>
                     </div>
                  </div>
               ))}
               {filteredEmployees.length === 0 && (
                  <div className="px-2 py-4 text-center text-xs text-gray-400">
                     Nema pronađenih radnika
                  </div>
               )}
            </div>
         )}
      </div>

    </div>
  );
}
