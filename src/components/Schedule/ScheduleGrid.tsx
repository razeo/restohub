import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Wand2, Calculator, MoreHorizontal, Clock, Star } from 'lucide-react';
import { Employee, Shift, Assignment, Duty, DayOfWeek, ALL_DAYS, Zone, SpecialDuty } from '../../types';
import { formatDate, getDayName } from '../../utils/date';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { DutyAssignmentModal } from './DutyAssignmentModal';

interface ScheduleGridProps {
  currentWeekStart: Date;
  employees: Employee[];
  shifts: Shift[];
  assignments: Assignment[];
  duties: Duty[];
  zones: Zone[];
  specialDuties: SpecialDuty[];
  onNavigateWeek: (direction: number) => void;
  onAssign: (shiftId: string, employeeId: string, day: DayOfWeek, dutyIds?: string[], zoneIds?: string[], specialDutyIds?: string[]) => void;
  onRemoveAssignment: (assignmentId: string) => void;
}

interface PendingAssignment {
  shiftId: string;
  employeeId: string;
  day: DayOfWeek;
  employeeName: string;
  shiftLabel: string;
  initialDutyIds?: string[];
  initialZoneIds?: string[];
  initialSpecialDutyIds?: string[];
}

export function ScheduleGrid({
  currentWeekStart,
  employees,
  shifts,
  assignments,
  duties,
  zones,
  specialDuties,
  onNavigateWeek,
  onAssign,
  onRemoveAssignment,
}: ScheduleGridProps) {
  const [pendingAssignment, setPendingAssignment] = useState<PendingAssignment | null>(null);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const employeeId = draggableId;
    
    // Parse destination ID: "shiftId|day"
    const [shiftId, dayStr] = destination.droppableId.split('|');
    const day = dayStr as DayOfWeek;

    // Check if employee is already assigned to this shift/day
    const existingAssignment = assignments.find(
      a => a.shiftId === shiftId && a.day === day && a.employeeId === employeeId
    );

    if (!existingAssignment) {
      // Open modal for duty selection instead of direct assignment
      handleOpenDutyModal(shiftId, employeeId, day);
    }
  };

  const handleOpenDutyModal = (
    shiftId: string, 
    employeeId: string, 
    day: DayOfWeek, 
    initialDutyIds?: string[],
    initialZoneIds?: string[],
    initialSpecialDutyIds?: string[]
  ) => {
    const employee = employees.find(e => e.id === employeeId);
    const shift = shifts.find(s => s.id === shiftId);
    if (!employee || !shift) return;

    setPendingAssignment({
      shiftId,
      employeeId,
      day,
      employeeName: employee.name,
      shiftLabel: shift.label,
      initialDutyIds,
      initialZoneIds,
      initialSpecialDutyIds
    });
  };

  const handleConfirmAssignment = (dutyIds: string[], zoneIds: string[], specialDutyIds: string[]) => {
    if (pendingAssignment) {
      onAssign(
        pendingAssignment.shiftId, 
        pendingAssignment.employeeId, 
        pendingAssignment.day, 
        dutyIds,
        zoneIds,
        specialDutyIds
      );
      setPendingAssignment(null);
    }
  };

  const getWeekDays = () => {
    const days = [];
    const start = new Date(currentWeekStart);
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push({
        date,
        dayName: ALL_DAYS[i],
        isToday: new Date().toDateString() === date.toDateString()
      });
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Helper to get color for item
  const getItemColor = (id: string, type: 'duty' | 'zone' | 'specialDuty') => {
    if (type === 'duty') return duties.find(d => d.id === id)?.color;
    if (type === 'zone') return zones.find(z => z.id === id)?.color;
    if (type === 'specialDuty') return specialDuties.find(s => s.id === id)?.color;
    return undefined;
  };

  // Helper to get label for item
  const getItemLabel = (id: string, type: 'duty' | 'zone' | 'specialDuty') => {
    if (type === 'duty') return duties.find(d => d.id === id)?.label;
    if (type === 'zone') return zones.find(z => z.id === id)?.label;
    if (type === 'specialDuty') return specialDuties.find(s => s.id === id)?.label;
    return undefined;
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header Controls */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => onNavigateWeek(-1)}
              className="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-shadow shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => onNavigateWeek(1)}
              className="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-shadow shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-blue-600" size={20} />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatDate(currentWeekStart)} - {formatDate(weekDays[6].date)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium">
            <Wand2 size={16} />
            <span>AI Asistent spreman</span>
          </div>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
           <div className="text-sm text-gray-500">
             {assignments.length} dodjela
           </div>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-auto">
          <div className="min-w-[1200px]">
             {/* Grid Header */}
            <div className="grid grid-cols-[200px_repeat(7,1fr)] sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-4 font-medium text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                Smjena / Zaposleni
              </div>
              {weekDays.map(({ date, dayName, isToday }) => (
                <div 
                  key={dayName} 
                  className={`p-3 text-center border-r border-gray-100 dark:border-gray-700 ${
                    isToday ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className={`font-medium ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                    {dayName}
                  </div>
                  <div className={`text-sm ${isToday ? 'text-blue-500 dark:text-blue-300' : 'text-gray-500'}`}>
                    {formatDate(date)}
                  </div>
                </div>
              ))}
            </div>

            {/* Shifts Rows */}
            {shifts.map(shift => (
              <div key={shift.id} className="grid grid-cols-[200px_repeat(7,1fr)] border-b border-gray-100 dark:border-gray-700 min-h-[120px]">
                {/* Shift Label Column */}
                <div className="p-4 border-r border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <div className="font-medium text-gray-900 dark:text-white">{shift.label}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Clock size={12} />
                    {shift.startTime} - {shift.endTime}
                  </div>
                </div>

                {/* Days Columns */}
                {weekDays.map(({ dayName }) => (
                  <Droppable key={`${shift.id}|${dayName}`} droppableId={`${shift.id}|${dayName}`}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-2 border-r border-gray-100 dark:border-gray-700 transition-colors relative ${
                          snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        {assignments
                          .filter(a => a.shiftId === shift.id && a.day === dayName)
                          .map((assignment, index) => {
                             const employee = employees.find(e => e.id === assignment.employeeId);
                             if (!employee) return null;

                             return (
                               <div
                                  key={assignment.id}
                                  className="mb-2 p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 group relative hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
                                  onDoubleClick={() => handleOpenDutyModal(
                                    shift.id, 
                                    employee.id, 
                                    dayName as DayOfWeek, 
                                    assignment.dutyIds,
                                    assignment.zoneIds,
                                    assignment.specialDutyIds
                                  )}
                               >
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                      {employee.name}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveAssignment(assignment.id);
                                      }}
                                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      &times;
                                    </button>
                                  </div>

                                  {/* Duty Tags */}
                                  <div className="flex flex-wrap gap-1">
                                    {assignment.dutyIds?.map(dutyId => (
                                      <div 
                                        key={dutyId}
                                        className="text-[10px] px-1.5 py-0.5 rounded-full text-white truncate max-w-full"
                                        style={{ backgroundColor: getItemColor(dutyId, 'duty') }}
                                      >
                                        {getItemLabel(dutyId, 'duty')}
                                      </div>
                                    ))}
                                  </div>
                                  
                                  {/* Zone Tags */}
                                  {assignment.zoneIds && assignment.zoneIds.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                       {assignment.zoneIds.map(zoneId => (
                                          <div
                                            key={zoneId}
                                            className="text-[10px] px-1.5 py-0.5 rounded-full text-white truncate max-w-full flex items-center gap-0.5"
                                            style={{ backgroundColor: getItemColor(zoneId, 'zone') }}
                                          >
                                            <span className='w-1 h-1 bg-white rounded-full opacity-50'/>
                                            {getItemLabel(zoneId, 'zone')}
                                          </div>
                                       ))}
                                    </div>
                                  )}

                                  {/* Special Duty Tags */}
                                  {assignment.specialDutyIds && assignment.specialDutyIds.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {assignment.specialDutyIds.map(sdId => (
                                          <div
                                             key={sdId}
                                             className="text-[10px] px-1 rounded-sm text-white truncate max-w-full flex items-center justify-center"
                                             style={{ backgroundColor: getItemColor(sdId, 'specialDuty') }}
                                             title={getItemLabel(sdId, 'specialDuty')}
                                          >
                                            <Star size={8} fill="currentColor" className="opacity-80"/>
                                          </div>
                                        ))}
                                    </div>
                                  )}

                               </div>
                             );
                          })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>
      
      {/* Draggable Employee List (Footer) - Optional, simplified for now */}
       <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Dostupni radnici (prevuci na raspored)</p>
          <Droppable droppableId="employee-pool" isDropDisabled={true} direction="horizontal">
            {(provided) => (
              <div 
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex gap-2 overflow-x-auto pb-2"
              >
                {employees.map((employee, index) => (
                  <Draggable key={employee.id} draggableId={employee.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`
                          px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 
                          text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap
                          hover:border-blue-400 hover:shadow-sm transition-all cursor-move
                          ${snapshot.isDragging ? 'ring-2 ring-blue-500 shadow-lg z-50' : ''}
                        `}
                      >
                        {employee.name}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
       </div>

      <DutyAssignmentModal
        isOpen={!!pendingAssignment}
        onClose={() => setPendingAssignment(null)}
        onConfirm={handleConfirmAssignment}
        duties={duties}
        zones={zones}
        specialDuties={specialDuties}
        employeeName={pendingAssignment?.employeeName || ''}
        shiftLabel={pendingAssignment?.shiftLabel || ''}
        initialDutyIds={pendingAssignment?.initialDutyIds}
        initialZoneIds={pendingAssignment?.initialZoneIds}
        initialSpecialDutyIds={pendingAssignment?.initialSpecialDutyIds}
      />
    </div>
  );
}
