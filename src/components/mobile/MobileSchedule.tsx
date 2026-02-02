// Mobile simplified schedule view for RestoHub
import { useState, useMemo } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Employee, Shift, Assignment, Duty, DayOfWeek } from '../../types';
import { MobileHeader, SafeArea } from '../MobileLayout';

interface MobileScheduleProps {
  shifts: Shift[];
  assignments: Assignment[];
  employees: Employee[];
  duties: Duty[];
  currentWeekStart: Date;
  onNavigateWeek: (direction: number) => void;
  onManualAssign: (shiftId: string, employeeId: string) => void;
  onRemoveAssignment: (id: string) => void;
}

export function MobileSchedule({
  shifts,
  assignments,
  employees,
  duties,
  currentWeekStart,
  onNavigateWeek,
  onManualAssign,
  onRemoveAssignment,
}: MobileScheduleProps) {
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null);

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentWeekStart, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentWeekStart]);

  const todayShifts = useMemo(() => {
    const dayMap: Record<number, DayOfWeek> = {
      0: DayOfWeek.SUNDAY, 1: DayOfWeek.MONDAY, 2: DayOfWeek.TUESDAY,
      3: DayOfWeek.WEDNESDAY, 4: DayOfWeek.THURSDAY, 5: DayOfWeek.FRIDAY, 6: DayOfWeek.SATURDAY
    };
    return shifts.filter(s => s.day === dayMap[selectedDay.getDay()]);
  }, [shifts, selectedDay]);

  const getAssignmentsForShift = (shiftId: string) => {
    return assignments.filter(a => a.shiftId === shiftId);
  };

  const getEmployeeName = (id: string) => {
    return employees.find(e => e.id === id)?.name || 'Nepoznato';
  };

  const getShiftLabel = (shift: Shift) => {
    const duty = duties.find(d => d.id === shift.label);
    return duty?.label || shift.label;
  };

  const handleQuickAssign = (shiftId: string, employeeId: string) => {
    onManualAssign(shiftId, employeeId);
    setShowAssignModal(null);
  };

  return (
    <div className="mobile-schedule">
      <style>{`
        .mobile-schedule {
          min-height: 100vh;
          background: #f8fafc;
        }
        .day-tabs {
          display: flex;
          overflow-x: auto;
          padding: 12px 16px;
          gap: 8px;
          background: white;
          border-bottom: 1px solid #e2e8f0;
        }
        .day-tab {
          flex-shrink: 0;
          padding: 10px 16px;
          border: none;
          border-radius: 10px;
          background: #f1f5f9;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .day-tab.active {
          background: #1e40af;
          color: white;
        }
        .day-tab.today {
          border: 2px solid #3b82f6;
        }
        .day-tab .day-name {
          font-size: 12px;
          font-weight: 500;
          opacity: 0.8;
        }
        .day-tab .day-num {
          font-size: 18px;
          font-weight: 700;
        }
        .shift-card {
          background: white;
          border-radius: 12px;
          padding: 16px;
          margin: 12px 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }
        .shift-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .shift-time {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
        }
        .shift-label {
          font-size: 13px;
          color: #64748b;
          background: #f1f5f9;
          padding: 4px 10px;
          border-radius: 6px;
        }
        .assigned-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .assigned-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #eff6ff;
          color: #1e40af;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
        }
        .assigned-chip .remove {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 0;
          font-size: 16px;
          line-height: 1;
        }
        .add-btn {
          width: 100%;
          padding: 10px;
          border: 2px dashed #cbd5e1;
          border-radius: 10px;
          background: transparent;
          color: #64748b;
          font-size: 14px;
          cursor: pointer;
          margin-top: 12px;
        }
        .add-btn:active {
          border-color: #1e40af;
          color: #1e40af;
        }
        .assign-modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: flex-end;
          z-index: 200;
        }
        .assign-modal-content {
          background: white;
          width: 100%;
          border-radius: 20px 20px 0 0;
          padding: 20px;
          max-height: 70vh;
          overflow-y: auto;
        }
        .assign-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .employee-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .employee-option:hover {
          background: #f1f5f9;
        }
        .employee-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: #64748b;
        }
        @media (prefers-color-scheme: dark) {
          .mobile-schedule { background: #0f172a; }
          .day-tabs { background: #1e293b; border-color: #334155; }
          .day-tab { background: #334155; color: #94a3b8; }
          .day-tab.active { background: #1e40af; }
          .shift-card { background: #1e293b; box-shadow: none; }
          .shift-time { color: #f1f5f9; }
          .shift-label { background: #334155; color: #94a3b8; }
          .assigned-chip { background: #1e3a8a; color: #93c5fd; }
          .assign-modal-content { background: #1e293b; }
          .employee-option:hover { background: #334155; }
          .employee-avatar { background: #334155; color: #94a3b8; }
        }
      `}</style>

      <MobileHeader 
        title="Raspored" 
        subtitle={`Tjedan ${format(currentWeekStart, 'd. MMM', { locale: hr })}`}
      />

      <SafeArea>
        {/* Week Navigation */}
        <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
          <button onClick={() => onNavigateWeek(-1)} style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span style={{ fontWeight: 600, color: '#1e293b' }}>
            {format(currentWeekStart, 'd. MMM - d. MMM yyyy.', { locale: hr })}
          </span>
          <button onClick={() => onNavigateWeek(1)} style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        {/* Day Tabs */}
        <div className="day-tabs">
          {weekDays.map(day => {
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDay);
            return (
              <button
                key={day.toISOString()}
                className={`day-tab ${isSelected ? 'active' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => setSelectedDay(day)}
              >
                <div className="day-name">{format(day, 'EEE', { locale: hr })}</div>
                <div className="day-num">{format(day, 'd')}</div>
              </button>
            );
          })}
        </div>

        {/* Shifts for Selected Day */}
        <div style={{ paddingBottom: 80 }}>
          {todayShifts.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
              Nema smjena za ovaj dan
            </div>
          ) : (
            todayShifts.map(shift => {
              const shiftAssignments = getAssignmentsForShift(shift.id);
              return (
                <div key={shift.id} className="shift-card">
                  <div className="shift-header">
                    <div>
                      <div className="shift-time">{shift.startTime} - {shift.endTime}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{getShiftLabel(shift)}</div>
                    </div>
                  </div>
                  
                  <div className="assigned-list">
                    {shiftAssignments.length === 0 ? (
                      <span style={{ color: '#94a3b8', fontSize: 13 }}>Nema dodijeljenih radnika</span>
                    ) : (
                      shiftAssignments.map(assignment => (
                        <span key={assignment.id} className="assigned-chip">
                          {getEmployeeName(assignment.employeeId)}
                          <button 
                            className="remove"
                            onClick={() => onRemoveAssignment(assignment.id)}
                          >×</button>
                        </span>
                      ))
                    )}
                  </div>

                  <button 
                    className="add-btn"
                    onClick={() => setShowAssignModal(shift.id)}
                  >
                    + Dodaj radnika
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Assignment Modal */}
        {showAssignModal && (
          <div className="assign-modal" onClick={() => setShowAssignModal(null)}>
            <div className="assign-modal-content" onClick={e => e.stopPropagation()}>
              <div className="assign-modal-header">
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Odaberi radnika</h3>
                <button 
                  onClick={() => setShowAssignModal(null)}
                  style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}
                >×</button>
              </div>
              <div>
                {employees.map(employee => (
                  <div 
                    key={employee.id}
                    className="employee-option"
                    onClick={() => handleQuickAssign(showAssignModal, employee.id)}
                  >
                    <div className="employee-avatar">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{employee.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{employee.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </SafeArea>
    </div>
  );
}
