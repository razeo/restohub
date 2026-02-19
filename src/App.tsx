import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Settings, 
  MessageSquare, 
  Menu, 
  X, 
  Clock, 
  FileText,
  LogOut,
  MapPin,
  Star
} from 'lucide-react';
import { EmployeesPage } from './components/Employees/EmployeesPage';
import { SimpleSchedule } from './components/Schedule/SimpleSchedule';
import { ShiftsPage } from './components/Shifts/ShiftsPage';
import { DutiesPage } from './components/Duties/DutiesPage';
import { ZonesPage } from './components/Zones/ZonesPage';
import { SpecialDutiesPage } from './components/SpecialDuties/SpecialDutiesPage';
import { ChatInterface } from './components/Chat/ChatInterface';
import { Sidebar } from './components/Sidebar/Sidebar';
import { useScheduleState } from './hooks/useScheduleState';
import { Toaster } from 'react-hot-toast';

function App() {
  const {
    employees,
    shifts,
    duties,
    zones, // New
    specialDuties, // New
    weekAssignments,
    chatMessages,
    currentWeekStart,
    currentWeekId,
    scheduleState,
    setChatMessages,
    setAssignments,
    addEmployee,
    removeEmployee,
    updateEmployee,
    addShift,
    addShifts,
    removeShift,
    updateShift,
    addDuty,
    removeDuty,
    updateDuty,
    addZone,      // New
    removeZone,   // New
    updateZone,   // New
    addSpecialDuty,    // New
    removeSpecialDuty, // New
    updateSpecialDuty, // New
    manualAssign,
    removeAssignment,
    navigateWeek,
    handleUpdateAiRules,
    handleResetAll,
  } = useScheduleState();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('schedule');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendMessage = async (text: string) => {
    // Add user message immediately
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      text,
      timestamp: Date.now(),
    };
    setChatMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const response = await processScheduleRequest(text, scheduleState);
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model' as const,
        text: response.message,
        timestamp: Date.now(),
        pendingAssignments: response.assignments,
        pendingEmployees: response.newEmployees,
        status: 'pending' as const
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model' as const,
        text: "Izvinite, došlo je do greške prilikom obrade zahtjeva. Molim vas pokušajte ponovo.",
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyChanges = (messageId: string) => {
    const message = chatMessages.find(m => m.id === messageId);
    if (!message || !message.pendingAssignments) return;

    // Handle new employees if present
    if (message.pendingEmployees) {
      message.pendingEmployees.forEach(emp => {
        addEmployee(emp.name, emp.role as any);
      });
    }

    // Apply assignments
    const newAssignments = message.pendingAssignments.map(pa => ({
      ...pa,
      id: Math.random().toString(36).substr(2, 9),
      weekId: currentWeekId
    }));

    // Update assignments state
    // We filter out existing assignments for the affected shifts to avoid duplicates if needed,
    // or just append. The prompt logic suggests "complete list" or similar, 
    // but in this simple implementation, let's assume valid diffs or complete replacements.
    // For now, let's just add new ones (and maybe filter out old ones if they overlap).
    // A safer approach for "Apply" is to merge.
    
    // Simple 1merge strategy: remove assignments for same shift/employee before adding new ones
    // or just rely on the user to request resets.
    
    // Ideally we would merge intelligently. For this demo:
    setAssignments(prev => {
        const kept = prev.filter(a => a.weekId !== currentWeekId); // Remove all for this week?? No, that's too aggressive.
        // Let's just append for now as the specialized tools are better for specific edits.
        // Or if the AI returns a FULL schedule, we replace.
        // Let's assume the AI appends/updates.
        return [...prev, ...newAssignments];
    });

    // Mark message as applied
    setChatMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, status: 'applied' } : m
    ));
  };

  const handleDiscardChanges = (messageId: string) => {
    setChatMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, status: 'discarded' } : m
    ));
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'employees':
        return (
          <EmployeesPage
            employees={employees}
            onAdd={addEmployee}
            onRemove={removeEmployee}
            onUpdate={updateEmployee}
          />
        );
      case 'shifts':
        return (
          <ShiftsPage
            shifts={shifts}
            onAdd={addShift}
            onAddBulk={addShifts}
            onRemove={removeShift}
            onUpdate={updateShift}
          />
        );
      case 'duties':
        return (
          <DutiesPage
            duties={duties}
            onAdd={addDuty}
            onRemove={removeDuty}
            onUpdate={updateDuty}
          />
        );
      case 'zones':
        return (
          <ZonesPage
            zones={zones}
            onAddZone={(z) => addZone(z.label, z.color, z.description)}
            onRemoveZone={removeZone}
            onUpdateZone={(z) => updateZone(z.id, z)}
          />
        );
      case 'specialDuties':
        return (
          <SpecialDutiesPage
            specialDuties={specialDuties}
            onAddSpecialDuty={(sd) => addSpecialDuty(sd.label, sd.color, sd.description)}
            onRemoveSpecialDuty={removeSpecialDuty}
            onUpdateSpecialDuty={(sd) => updateSpecialDuty(sd.id, sd)}
          />
        );
      case 'schedule':
      default:
        return (
          <SimpleSchedule
            currentWeekStart={currentWeekStart}
            employees={employees}
            shifts={shifts}
            assignments={weekAssignments}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden'}
      `}>
         <Sidebar
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            employees={employees}
         />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-200">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500"
            >
              {isSidebarOpen ? <Menu size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              RestoHub
            </h1>
          </div>

          <div className="flex items-center gap-2">
             <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isChatOpen 
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
              }`}
            >
              <MessageSquare size={20} />
            </button>
            <button
              onClick={handleResetAll}
               className="p-2 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-lg transition-colors"
                title="Resetuj sve podatke"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 relative">
          {renderContent()}
        </main>
        
        {/* Chat Panel - Floating Overlay */}
        {isChatOpen && (
          <div className="absolute top-0 right-0 h-full w-full md:w-[400px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out translate-x-0">
             <ChatInterface
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                isProcessing={isProcessing}
                onApplyChanges={handleApplyChanges}
                onDiscardChanges={handleDiscardChanges}
                aiRules={scheduleState.aiRules || ''}
                onUpdateAiRules={handleUpdateAiRules}
             />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
