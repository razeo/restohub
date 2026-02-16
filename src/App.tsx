// ===========================================
// Main App Component
// RestoHub - Restaurant Management System
// ===========================================

import {
  Employee,
  Shift,
  Assignment,
  Duty,
  ChatMessage,
} from './types/index';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Layout/Header';
import { ScheduleGrid } from './components/Schedule';
import { ChatInterface } from './components/Chat';
import { DailyReport } from './components/DailyReport';
import { ShiftHandover } from './components/ShiftHandover';
import { OutOfStock } from './components/OutOfStock';
import { ResponsibilityPlan } from './components/ResponsibilityPlan';
import { RoomService } from './components/RoomService';
import { WasteList } from './components/WasteList';
import { DailyMenu } from './components/DailyMenu';
import { AllergenGuide } from './components/AllergenGuide';
import { MenuCard } from './components/MenuCard';
import { EmployeesPage } from './components/Employees';
import { ShiftsPage } from './components/Shifts';
import { Login } from './components/Auth/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PermissionsProvider, usePermissionCheck } from './contexts/PermissionsContext';
import { UserManagement, PermissionsEditor } from './components/Admin';
import { processScheduleRequest, isAiConfigured } from './services/ai';
import { useNotifications } from './hooks/useNotifications';
import { isFcmConfigured, isTelegramConfigured } from './services/notifications';
import { useScheduleState } from './hooks/useScheduleState';
import { ID_PREFIXES } from './utils/id';

import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Bell, Upload, Download, FileText, RotateCcw, Calendar, Menu, Settings } from 'lucide-react';
import { STORAGE_KEYS, runMigrations, setStorageItem } from './utils/storage';

type PageType = 'schedule' | 'employees' | 'shifts' | 'duties' | 'templates' | 'ai' | 'handover' | 'report' | 'outofstock' | 'responsibility' | 'roomservice' | 'wastelist' | 'dailymenu' | 'allergens' | 'menu' | 'settings' | 'users' | 'permissions';

interface ImportData {
  employees?: Employee[];
  shifts?: Shift[];
  duties?: Duty[];
  assignments?: Assignment[];
  aiRules?: string;
}


function AppContent() {
  const { user } = useAuth();
  const { canManageUsers, canAccessSettings } = usePermissionCheck();

  const {
    employees,
    shifts,
    duties,
    assignments,
    weekAssignments,
    aiRules,
    chatMessages,
    currentWeekStart,
    currentWeekId,
    scheduleState,
    setChatMessages,
    addEmployee,
    removeEmployee,
    updateEmployee,
    addShift,
    addShifts,
    removeShift,
    updateShift,
    addDuty,
    removeDuty,
    manualAssign,
    removeAssignment,
    navigateWeek,
    handleUpdateAiRules,
    handleResetAll,
    setEmployees,
    setShifts,
    setDuties,
    setAssignments,
  } = useScheduleState();

  // Initialize notifications
  const {
    requestPermission,
    registerToken,
    hasPermission,
    isFcmReady,
    isTelegramReady,
    fcmToken,
  } = useNotifications();

  // Local UI State
  const [currentPage, setCurrentPage] = useState<PageType>('schedule');
  const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; onClick?: () => void }[]>([
    { label: 'Raspored' }
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Initialize data loading
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
      } finally {
        // Data loaded
      }
    };
    loadInitialData();
  }, []);

  // Navigate to page with breadcrumbs
  const navigateTo = (page: PageType, label: string) => {
    setCurrentPage(page);
    setBreadcrumbs([
      { label: 'Raspored', onClick: () => navigateTo('schedule', 'Raspored') },
      { label }
    ]);
    setIsSidebarOpen(false);
  };

  // Helper to get user ID
  const getUserId = () => user?.id || 'anonymous';

  useEffect(() => {
    document.body.setAttribute('data-print-date', new Date().toLocaleDateString('hr-HR'));
  }, []);

  useEffect(() => {
    const initializeNotifications = async () => {
      if (!isFcmConfigured() && !isTelegramConfigured()) {
        console.log('Notification services not configured');
        return;
      }
      const permissionGranted = await requestPermission();
      if (permissionGranted && fcmToken) {
        await registerToken();
      }
    };
    const initialized = sessionStorage.getItem('notifications_initialized');
    if (!initialized) {
      initializeNotifications();
      sessionStorage.setItem('notifications_initialized', 'true');
    }
  }, [requestPermission, registerToken, fcmToken]);

  useEffect(() => {
    const handleNotification = (event: CustomEvent) => {
      const { title, body } = event.detail;
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} bg-white shadow-lg rounded-lg p-4 max-w-sm`}>
          <div className="flex items-center gap-3">
            <Bell className="text-blue-500" size={20} />
            <div>
              <p className="font-medium text-slate-800">{title}</p>
              <p className="text-sm text-slate-600">{body}</p>
            </div>
          </div>
        </div>
      ), { duration: 5000 });
    };
    window.addEventListener('restohub:notification', handleNotification as EventListener);
    return () => window.removeEventListener('restohub:notification', handleNotification as EventListener);
  }, []);

  useEffect(() => {
    runMigrations();
  }, []);

  if (!user) {
    return (
      <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
        <Toaster position="top-center" />
        <Login />
      </div>
    );
  }

  const handleAiMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now()
    };
    setChatMessages(prev => [...prev, userMsg]);

    if (!isAiConfigured()) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: '⚠️ **Konfiguracija nedostaje.**\n\nNije pronađen `VITE_MINIMAX_API_KEY`. Molimo unesite ključ u `.env.local` fajl ili ga podesite u postavkama sistema.\n\nBez ovoga ne mogu generisati raspored.',
        timestamp: Date.now(),
      };
      setTimeout(() => setChatMessages(prev => [...prev, errorMsg]), 500);
      return;
    }

    setIsAiLoading(true);
    setAiError(null);

    try {
      const response = await processScheduleRequest(text, scheduleState);
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.message,
        timestamp: Date.now(),
        status: 'pending',
        pendingAssignments: response.assignments,
        pendingEmployees: response.newEmployees,
      };
      setChatMessages(prev => [...prev, modelMsg]);
      toast.success('AI je generisao prijedlog');
    } catch (error) {
      const errorText = error instanceof Error ? error.message : 'Došlo je do neočekivane greške.';
      setAiError(errorText);
      const modelErrorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: `❌ **Greška:** ${errorText}\n\nMolim pokušajte ponovo kasnije.`,
        timestamp: Date.now(),
      };
      setChatMessages(prev => [...prev, modelErrorMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyChanges = (messageId: string) => {
    const message = chatMessages.find(m => m.id === messageId);
    if (!message?.pendingAssignments) return;

    const newAssignments: Assignment[] = message.pendingAssignments.map(a => ({
      ...a,
      id: `${ID_PREFIXES.ASSIGNMENT}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      weekId: currentWeekId,
    }));

    setAssignments(prev => {
      const updated = [...prev, ...newAssignments];
      setStorageItem(STORAGE_KEYS.ASSIGNMENTS, updated);
      return updated;
    });

    setChatMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, status: 'applied' as const } : m
    ));
    toast.success('Izmjene primijenjene');
  };

  const handleDiscardChanges = (messageId: string) => {
    setChatMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, status: 'discarded' as const } : m
    ));
    toast.success('Izmjene odbacene');
  };

  const handleImportData = (data: ImportData) => {
    try {
      if (data.employees) {
        setEmployees(data.employees);
        setStorageItem(STORAGE_KEYS.EMPLOYEES, data.employees);
      }
      if (data.shifts) {
        setShifts(data.shifts);
        setStorageItem(STORAGE_KEYS.SHIFTS, data.shifts);
      }
      if (data.duties) {
        setDuties(data.duties);
        setStorageItem(STORAGE_KEYS.DUTIES, data.duties);
      }
      if (data.aiRules !== undefined) {
        handleUpdateAiRules(data.aiRules);
      }
      if (data.assignments) {
        setAssignments(data.assignments);
        setStorageItem(STORAGE_KEYS.ASSIGNMENTS, data.assignments);
      }
      toast.success('Podaci uvezeni!');
    } catch {
      toast.error('Greška pri uvozu podataka');
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      <Toaster position="top-center" />

      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out bg-white ${isSidebarOpen
          ? 'translate-x-0 lg:w-80 border-r border-slate-200'
          : '-translate-x-full lg:w-0 lg:overflow-hidden lg:border-none'
          }`}
      >
        <Sidebar
          employees={employees}
          duties={duties}
          shifts={shifts}
          assignments={assignments}
          aiRules={aiRules}
          currentPage={currentPage}
          onPageChange={(page) => navigateTo(page as PageType, page.charAt(0).toUpperCase() + page.slice(1))}
          onAddEmployee={addEmployee}
          onRemoveEmployee={removeEmployee}
          onUpdateEmployee={updateEmployee}
          onAddDuty={addDuty}
          onRemoveDuty={removeDuty}
          onAddShift={addShift}
          onRemoveShift={removeShift}
          onUpdateShift={updateShift}
          onUpdateAiRules={handleUpdateAiRules}
          onResetAll={handleResetAll}
          onImportData={handleImportData}
          onClose={() => setIsSidebarOpen(false)}
          canManageUsers={canManageUsers}
          canAccessSettings={canAccessSettings}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-auto relative">
        <Header
          breadcrumbs={breadcrumbs}
          userName={user?.name}
          userRole={user?.role === 'admin' ? 'Administrator' : user?.role === 'manager' ? 'Menadžer' : 'Radnik'}
        />

        {currentPage === 'schedule' && (
          <ScheduleGrid
            shifts={shifts}
            assignments={weekAssignments}
            employees={employees}
            duties={duties}
            currentWeekStart={currentWeekStart}
            onRemoveAssignment={removeAssignment}
            onManualAssign={manualAssign}
            onNavigateWeek={navigateWeek}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onToggleChat={() => setIsChatOpen(!isChatOpen)}
          />
        )}

        {currentPage === 'handover' && (
          <ShiftHandover onClose={() => navigateTo('schedule', 'Raspored')} />
        )}

        {currentPage === 'report' && (
          <DailyReport onClose={() => navigateTo('schedule', 'Raspored')} />
        )}

        {currentPage === 'outofstock' && (
          <OutOfStock onClose={() => navigateTo('schedule', 'Raspored')} />
        )}

        {currentPage === 'responsibility' && (
          <ResponsibilityPlan onClose={() => navigateTo('schedule', 'Raspored')} />
        )}

        {currentPage === 'roomservice' && (
          <RoomService onClose={() => navigateTo('schedule', 'Raspored')} />
        )}

        {currentPage === 'wastelist' && (
          <WasteList onClose={() => navigateTo('schedule', 'Raspored')} />
        )}

        {currentPage === 'dailymenu' && (
          <DailyMenu onClose={() => navigateTo('schedule', 'Raspored')} />
        )}

        {currentPage === 'allergens' && (
          <AllergenGuide onClose={() => navigateTo('schedule', 'Raspored')} />
        )}

        {currentPage === 'menu' && (
          <MenuCard onClose={() => navigateTo('schedule', 'Raspored')} />
        )}

        {/* Employees Page */}
        {currentPage === 'employees' && (
          <EmployeesPage
            employees={employees}
            onAddEmployee={addEmployee}
            onRemoveEmployee={removeEmployee}
            onUpdateEmployee={updateEmployee}
          />
        )}

        {/* Shifts Page */}
        {currentPage === 'shifts' && (
          <ShiftsPage
            shifts={shifts}
            onAddShift={addShift}
            onAddShifts={addShifts}
            onRemoveShift={removeShift}
            onUpdateShift={updateShift}
          />
        )}

        {/* Duties Page */}
        {currentPage === 'duties' && (
          <div className="flex-1 bg-slate-100 p-6 overflow-auto">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Upravljanje dužnostima</h2>
              <p className="text-slate-600">Ovdje će biti lista dužnosti (glavni kuvar, pomoćni, itd.).</p>
            </div>
          </div>
        )}

        {/* Templates Page */}
        {currentPage === 'templates' && (
          <div className="flex-1 bg-slate-100 p-6 overflow-auto">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Šabloni rasporeda</h2>
              <p className="text-slate-600">Ovdje će biti sačuvani šabloni za brzo kreiranje rasporeda.</p>
            </div>
          </div>
        )}

        {/* AI Page */}
        {currentPage === 'ai' && (
          <div className="flex-1 bg-slate-100 p-6 overflow-auto">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">AI Pravila</h2>
              <p className="text-slate-600">Ovdje će biti pravila za AI generisanje rasporeda.</p>
            </div>
          </div>
        )}

        {currentPage === 'settings' && (
          <div className="flex-1 flex items-center justify-center bg-slate-100 p-8 overflow-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
              <div className="flex items-center gap-4 mb-8">
                <Settings size={32} className="text-slate-400" />
                <div>
                  <h2 className="text-xl font-bold text-slate-700">Postavke</h2>
                  <p className="text-slate-500">Upravljanje postavkama aplikacije</p>
                </div>
              </div>

              {/* Notification Status */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Obavijesti</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* FCM Status */}
                  <div className={`p-4 rounded-xl border-2 ${hasPermission && isFcmReady
                    ? 'border-green-200 bg-green-50'
                    : 'border-slate-200 bg-slate-50'
                    }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Bell size={20} className={hasPermission && isFcmReady ? 'text-green-600' : 'text-slate-400'} />
                      <span className="font-medium text-slate-700">Push obavijesti</span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {hasPermission
                        ? isFcmReady
                          ? '✅ Aktivne'
                          : '⚠️ Konfiguracija nedostaje'
                        : '❌ Onemogućeno'}
                    </p>
                    {!hasPermission && (
                      <button
                        onClick={requestPermission}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        Omogući obavijesti
                      </button>
                    )}
                  </div>

                  {/* Telegram Status */}
                  <div className={`p-4 rounded-xl border-2 ${isTelegramReady
                    ? 'border-green-200 bg-green-50'
                    : 'border-slate-200 bg-slate-50'
                    }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <svg viewBox="0 0 24 24" width={20} height={20} fill={isTelegramReady ? '#22c55e' : '#94a3b8'} className="mt-1">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.48-.94-2.4-1.54-1.06-.7-.37-1.09.23-1.71.14-.15 2.54-2.32 2.59-2.52.01-.03.01-.13-.05-.18-.06-.05-.16-.02-.23-.01-.09.02-1.4 1.02-3.8 3.07-.2.17-.38.26-.54.26-.31 0-.48-.22-.54-.52-.06-.33-.19-1.05-.23-1.33-.02-.15-.06-.3-.15-.43-.09-.13-.22-.21-.36-.21-.17 0-.34.09-.49.21-.21.18-.86.76-1.25 1.13-.11.1-.2.19-.29.3-.11.14-.21.27-.18.56.03.37.4.77.78 1.05 2.22 1.63 3.79 2.65 4.49 3.14.88.62 1.58 1.18 1.87 1.42.53.44.91.82 1.08 1.35.11.35.09.79-.05 1.19-.19.53-.63 1.08-1.21 1.24-.39.11-.77.08-1.15-.1-.45-.22-.86-.52-1.26-.86-.24-.21-.48-.43-.73-.63-.11-.09-.23-.17-.35-.25.25-.09.48-.16.7-.24.56-.2 1.04-.33 1.44-.56.76-.44 1.43-1.05 1.92-1.79.51-.76.8-1.65.84-2.6.01-.18.01-.36 0-.54.05-1.03-.05-2.07-.28-3.1z" />
                      </svg>
                      <span className="font-medium text-slate-700">Telegram</span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {isTelegramReady
                        ? '✅ Povezan'
                        : '⚠️ Konfiguracija nedostaje'}
                    </p>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="font-medium text-slate-700 mb-2">ID Korisnika</h4>
                <p className="text-sm text-slate-500 font-mono">{getUserId()}</p>
                <p className="text-xs text-slate-400 mt-2">Koristi se za registraciju obavijesti</p>
              </div>

              {/* Import/Export Section */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">💾 Podaci</h3>

                {/* Import */}
                <label className="btn btn-secondary w-full flex items-center justify-center gap-2 mb-3 cursor-pointer">
                  <Upload size={18} /> Uvoz podataka
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const data = JSON.parse(event.target?.result as string);
                            handleImportData(data);
                            toast.success('Podaci uvezeni!');
                          } catch {
                            toast.error('Greška pri uvozu');
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>

                {/* Export JSON */}
                <button
                  onClick={() => {
                    const data = {
                      employees,
                      shifts,
                      duties,
                      assignments: weekAssignments,
                      aiRules,
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `restohub-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success('JSON izvezen!');
                  }}
                  className="btn btn-secondary w-full flex items-center justify-center gap-2 mb-3"
                >
                  <Download size={18} /> Izvoz JSON
                </button>

                {/* Export CSV */}
                <button
                  onClick={() => {
                    if (weekAssignments.length === 0) {
                      toast.error('Nema dodjela za export');
                      return;
                    }
                    const headers = ['Dan', 'Smjena', 'Vrijeme', 'Radnik', 'Uloga'];
                    const rows = weekAssignments.map(a => {
                      const shift = shifts.find(s => s.id === a.shiftId);
                      const emp = employees.find(e => e.id === a.employeeId);
                      const day = shift?.day || '';
                      const time = shift ? `${shift.startTime}-${shift.endTime}` : '';
                      return [day, shift?.label || '', time, emp?.name || '', emp?.role || ''].join(',');
                    });
                    const csv = [headers.join(','), ...rows].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `raspored-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success('CSV izvezen!');
                  }}
                  className="btn btn-secondary w-full flex items-center justify-center gap-2 mb-3"
                >
                  <FileText size={18} /> Izvoz CSV
                </button>

                {/* Reset All */}
                <button
                  onClick={() => {
                    if (window.confirm('Da li ste sigurni da želite resetovati sve podatke?')) {
                      handleResetAll();
                      toast.success('Svi podaci su resetovani!');
                    }
                  }}
                  className="btn btn-danger w-full flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} /> Resetuj sve
                </button>
              </div>

              {/* Back to Schedule */}
              <button
                onClick={() => {
                  setCurrentPage('schedule');
                  setIsSidebarOpen(true);
                }}
                className="btn btn-primary w-full flex items-center justify-center gap-2 mt-6"
              >
                <Calendar size={18} /> Vrati se na Raspored
              </button>
            </div>
          </div>
        )}

        {/* Users Management Page - Admin Only */}
        {currentPage === 'users' && (
          <div className="flex-1 bg-slate-100 p-6 overflow-auto">
            <UserManagement />
          </div>
        )}

        {/* Permissions Page - Admin Only */}
        {currentPage === 'permissions' && (
          <div className="flex-1 bg-slate-100 p-6 overflow-auto">
            <PermissionsEditor />
          </div>
        )}

        {!isSidebarOpen && (
          <button
            className="lg:hidden absolute top-6 left-6 z-[60] p-3 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-100"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
        )}
      </div>

      <div
        className={`fixed lg:static inset-y-0 right-0 z-50 transition-all duration-300 ease-in-out bg-white ${isChatOpen
          ? 'translate-x-0 lg:w-96 border-l border-slate-200 shadow-xl lg:shadow-none'
          : 'translate-x-full lg:w-0 lg:overflow-hidden lg:border-none'
          }`}
      >
        <ChatInterface
          messages={chatMessages}
          onSendMessage={handleAiMessage}
          onCancelAi={() => setIsAiLoading(false)}
          onApplyChanges={handleApplyChanges}
          onDiscardChanges={handleDiscardChanges}
          isLoading={isAiLoading}
          onClose={() => setIsChatOpen(false)}
          error={aiError}
          onClearError={() => setAiError(null)}
        />
      </div>

      {(isSidebarOpen || isChatOpen) && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => { setIsSidebarOpen(false); setIsChatOpen(false); }}
        />
      )}
    </div>
  );
}

export function RestoHubApp() {
  return (
    <AuthProvider>
      <PermissionsProvider>
        <AppContent />
      </PermissionsProvider>
    </AuthProvider>
  );
}
