import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Check,
  Tag,
  BookOpen,
  Sparkles,
  CalendarDays,
  Flame,
  CheckSquare,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ListPlus,
  AlignLeft,
  ArrowUpDown,
} from 'lucide-react';
import { StudyPlanTask, SubjectItem, AppView } from '../types';
import { parseBulkTasksInput } from '../utils/taskParser';

interface HomeStudyTrackerProps {
  tasks: StudyPlanTask[];
  subjects: SubjectItem[];
  onSaveTask: (task: StudyPlanTask) => void;
  onSaveTasksBulk?: (tasks: StudyPlanTask[]) => void;
  onReorderTasks?: (tasks: StudyPlanTask[]) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onNavigate: (view: AppView) => void;
}

type AddMode = 'bulk' | 'single';

export const HomeStudyTracker: React.FC<HomeStudyTrackerProps> = ({
  tasks,
  subjects,
  onSaveTask,
  onSaveTasksBulk,
  onReorderTasks,
  onToggleTask,
  onDeleteTask,
  onNavigate,
}) => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [addMode, setAddMode] = useState<AddMode>('bulk');
  const [showMiniCalendar, setShowMiniCalendar] = useState<boolean>(false);

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);

  // Calendar month state for mini-calendar picker
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(() => new Date());

  // Bulk input state
  const [bulkInputText, setBulkInputText] = useState<string>('');
  const [bulkDefaultSubject, setBulkDefaultSubject] = useState<string>(subjects[0]?.name || 'Science');
  const [bulkDefaultMinutes, setBulkDefaultMinutes] = useState<number>(30);
  const [bulkDefaultPriority, setBulkDefaultPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Single task form state
  const [subject, setSubject] = useState<string>(subjects[0]?.name || 'Science');
  const [topic, setTopic] = useState<string>('');
  const [deadlineTime, setDeadlineTime] = useState<string>('18:00');
  const [availableMinutes, setAvailableMinutes] = useState<number>(30);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState<'revision' | 'homework' | 'exam' | 'quiz' | 'project' | 'general'>('revision');
  const [notes, setNotes] = useState<string>('');

  // Quick 7-days strip
  const dateStrip = useMemo(() => {
    const days = [];
    const base = new Date();
    for (let i = -1; i <= 6; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = d.getDate();
      const monthShort = d.toLocaleDateString('en-US', { month: 'short' });
      const isToday = dateStr === todayStr;

      // Count tasks for this day
      const dayTasks = tasks.filter((t) => t.targetDate === dateStr);
      const remainingCount = dayTasks.filter((t) => !t.completed).length;

      days.push({
        dateStr,
        dayName,
        dayNumber,
        monthShort,
        isToday,
        totalTasks: dayTasks.length,
        remainingCount,
      });
    }
    return days;
  }, [tasks, todayStr]);

  // Tasks for the currently selected date (preserves stored array order)
  const selectedDateTasks = useMemo(() => {
    return tasks.filter((t) => t.targetDate === selectedDate);
  }, [tasks, selectedDate]);

  const completedCount = selectedDateTasks.filter((t) => t.completed).length;
  const totalCount = selectedDateTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Selected date formatted
  const selectedDateDisplay = useMemo(() => {
    try {
      const [year, month, day] = selectedDate.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      const isToday = selectedDate === todayStr;
      const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const isTomorrow = selectedDate === tomorrowStr;

      const prefix = isToday ? 'Today, ' : isTomorrow ? 'Tomorrow, ' : '';
      return `${prefix}${dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
    } catch {
      return selectedDate;
    }
  }, [selectedDate, todayStr]);

  // Real-time preview of parsed bulk tasks
  const parsedBulkPreview = useMemo(() => {
    if (!bulkInputText.trim()) return [];
    return parseBulkTasksInput(
      bulkInputText,
      subjects,
      selectedDate,
      bulkDefaultSubject,
      bulkDefaultMinutes,
      bulkDefaultPriority
    );
  }, [bulkInputText, subjects, selectedDate, bulkDefaultSubject, bulkDefaultMinutes, bulkDefaultPriority]);

  // Handle single task creation
  const handleCreateSingleTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const newTask: StudyPlanTask = {
      id: `task-${Date.now()}`,
      subject,
      topic: topic.trim(),
      availableMinutes: Number(availableMinutes) || 30,
      targetDate: selectedDate,
      deadlineTime: deadlineTime || undefined,
      priority,
      category,
      completed: false,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      order: tasks.length,
    };

    onSaveTask(newTask);
    setTopic('');
    setNotes('');
    setShowAddForm(false);
  };

  // Handle bulk tasks addition at once
  const handleAddBulkTasks = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedBulkPreview.length === 0) return;

    if (onSaveTasksBulk) {
      onSaveTasksBulk(parsedBulkPreview);
    } else {
      parsedBulkPreview.forEach((task) => onSaveTask(task));
    }

    setBulkInputText('');
    setShowAddForm(false);
  };

  // Reordering logic: move task up or down within the day's tasks
  const handleMoveTask = (taskId: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    if (!onReorderTasks) return;

    const currentDayTasks = [...selectedDateTasks];
    const currentIndex = currentDayTasks.findIndex((t) => t.id === taskId);
    if (currentIndex < 0) return;

    let targetIndex = currentIndex;
    if (direction === 'up' && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < currentDayTasks.length - 1) {
      targetIndex = currentIndex + 1;
    } else if (direction === 'top') {
      targetIndex = 0;
    } else if (direction === 'bottom') {
      targetIndex = currentDayTasks.length - 1;
    } else {
      return;
    }

    // Swap / reposition within day tasks
    const [moved] = currentDayTasks.splice(currentIndex, 1);
    currentDayTasks.splice(targetIndex, 0, moved);

    // Merge reordered day tasks back into the full tasks array
    const otherTasks = tasks.filter((t) => t.targetDate !== selectedDate);
    const updatedFullList = [...otherTasks, ...currentDayTasks];

    onReorderTasks(updatedFullList);
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTaskId !== id) {
      setDragOverTaskId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetDropId: string) => {
    e.preventDefault();
    if (!draggedTaskId || draggedTaskId === targetDropId || !onReorderTasks) {
      setDraggedTaskId(null);
      setDragOverTaskId(null);
      return;
    }

    const currentDayTasks = [...selectedDateTasks];
    const fromIndex = currentDayTasks.findIndex((t) => t.id === draggedTaskId);
    const toIndex = currentDayTasks.findIndex((t) => t.id === targetDropId);

    if (fromIndex >= 0 && toIndex >= 0) {
      const [draggedItem] = currentDayTasks.splice(fromIndex, 1);
      currentDayTasks.splice(toIndex, 0, draggedItem);

      const otherTasks = tasks.filter((t) => t.targetDate !== selectedDate);
      const updatedFullList = [...otherTasks, ...currentDayTasks];
      onReorderTasks(updatedFullList);
    }

    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  // Calendar month navigation
  const miniCalendarDays = useMemo(() => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, dateStr: '', isCurrentMonth: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const monthPadded = String(month + 1).padStart(2, '0');
      const dayPadded = String(d).padStart(2, '0');
      const dateStr = `${year}-${monthPadded}-${dayPadded}`;
      const dayTasks = tasks.filter((t) => t.targetDate === dateStr);
      const pendingCount = dayTasks.filter((t) => !t.completed).length;

      days.push({
        day: d,
        dateStr,
        isCurrentMonth: true,
        totalTasks: dayTasks.length,
        pendingCount,
      });
    }

    return days;
  }, [calendarViewDate, tasks]);

  const formatDeadline = (timeStr?: string) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':');
    if (!hours) return timeStr;
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes || '00'} ${ampm}`;
  };

  return (
    <div
      id="home-study-tracker-box"
      className="bg-[#FAF8F5] rounded-3xl border border-[#E8E4D9] p-5 sm:p-7 shadow-sm text-[#1C1E1B] space-y-6"
    >
      {/* 1. Header with Title & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono-code font-bold uppercase tracking-widest text-[#2D6A4F] bg-[#E3EDE5] px-3 py-0.5 rounded-full inline-block">
              Daily Study Tracker & Planner
            </span>
            {totalCount > 0 && (
              <span className="text-[11px] font-mono-code font-semibold text-[#6B7267] bg-white border border-[#E8E4D9] px-2.5 py-0.5 rounded-full">
                {completedCount}/{totalCount} Done
              </span>
            )}
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1E1B]">
            {selectedDateDisplay}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add Tasks Button */}
          <button
            type="button"
            id="btn-add-tasks-all-at-once"
            onClick={() => {
              setAddMode('bulk');
              setShowAddForm(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <ListPlus className="w-4 h-4" />
            <span>Add Tasks at Once</span>
          </button>

          {/* Mini Calendar Picker Toggle */}
          <button
            type="button"
            id="btn-toggle-mini-calendar"
            onClick={() => setShowMiniCalendar(!showMiniCalendar)}
            className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              showMiniCalendar
                ? 'bg-[#1B4332] border-[#1B4332] text-white shadow-xs'
                : 'border-[#D5CFBF] bg-white hover:bg-[#F4EFE6] text-[#4B5047]'
            }`}
            title="Pick specific date from calendar"
          >
            <CalendarDays className="w-4 h-4" />
            <span className="hidden sm:inline">Calendar</span>
          </button>

          {/* Full Study Planner Link */}
          <button
            type="button"
            id="btn-nav-full-planner"
            onClick={() => onNavigate('plan')}
            className="px-3.5 py-2.5 rounded-xl border border-[#D5CFBF] bg-white hover:bg-[#F4EFE6] text-[#1B4332] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>Full Timetable</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Interactive Horizontal Date-Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {dateStrip.map((item) => {
          const isSelected = item.dateStr === selectedDate;
          return (
            <button
              key={item.dateStr}
              type="button"
              id={`date-chip-${item.dateStr}`}
              onClick={() => {
                setSelectedDate(item.dateStr);
              }}
              className={`shrink-0 px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center min-w-[72px] text-center ${
                isSelected
                  ? 'bg-[#1B4332] border-[#1B4332] text-white shadow-md ring-2 ring-[#1B4332]/20 scale-105'
                  : item.isToday
                  ? 'bg-[#E3EDE5] border-[#2D6A4F] text-[#1B4332] hover:bg-[#D5E5D8]'
                  : 'bg-white border-[#E8E4D9] hover:border-[#2D6A4F] text-[#4B5047]'
              }`}
            >
              <span
                className={`text-[10px] font-mono-code uppercase font-semibold ${
                  isSelected ? 'text-[#95D5B2]' : item.isToday ? 'text-[#2D6A4F]' : 'text-[#8A9085]'
                }`}
              >
                {item.isToday ? 'Today' : item.dayName}
              </span>
              <span className="font-serif-display text-lg font-bold my-0.5">{item.dayNumber}</span>
              <span
                className={`text-[9px] font-mono-code px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : item.totalTasks > 0
                    ? item.remainingCount > 0
                      ? 'bg-amber-100 text-amber-900 font-bold'
                      : 'bg-emerald-100 text-emerald-900 font-bold'
                    : 'text-[#8A9085]'
                }`}
              >
                {item.totalTasks > 0 ? `${item.totalTasks} task${item.totalTasks > 1 ? 's' : ''}` : '0'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mini Calendar Dropdown / Expander */}
      {showMiniCalendar && (
        <div className="bg-white rounded-3xl border border-[#E8E4D9] p-5 shadow-lg animate-fade-in space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E4D9]">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#1B4332]" />
              <span className="font-bold text-sm text-[#1C1E1B]">
                {calendarViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setCalendarViewDate(
                    new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1)
                  )
                }
                className="p-1.5 rounded-lg border border-[#E8E4D9] hover:bg-[#FAF8F5] text-[#4B5047] cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setCalendarViewDate(new Date());
                  setSelectedDate(todayStr);
                }}
                className="px-2 py-1 text-xs font-bold text-[#1B4332] bg-[#E3EDE5] rounded-lg cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() =>
                  setCalendarViewDate(
                    new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1)
                  )
                }
                className="p-1.5 rounded-lg border border-[#E8E4D9] hover:bg-[#FAF8F5] text-[#4B5047] cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
              <span key={idx} className="text-[10px] font-mono-code font-bold text-[#8A9085] py-1">
                {day}
              </span>
            ))}
            {miniCalendarDays.map((cell, idx) => {
              if (!cell.day) {
                return <div key={`empty-${idx}`} className="h-8" />;
              }
              const isSelected = cell.dateStr === selectedDate;
              const isToday = cell.dateStr === todayStr;
              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => {
                    setSelectedDate(cell.dateStr);
                    setShowMiniCalendar(false);
                  }}
                  className={`h-8 rounded-xl text-xs font-bold flex items-center justify-center relative transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1B4332] text-white shadow-xs'
                      : isToday
                      ? 'bg-[#E3EDE5] text-[#1B4332] border border-[#2D6A4F]'
                      : 'hover:bg-[#FAF8F5] text-[#1C1E1B]'
                  }`}
                >
                  <span>{cell.day}</span>
                  {cell.totalTasks > 0 && (
                    <span
                      className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-[#2D6A4F]'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ADD TASK WORKSPACE (Bulk Write All at Once or Single Task) */}
      {showAddForm && (
        <div className="bg-white rounded-3xl border border-[#2D6A4F]/30 p-5 sm:p-6 shadow-md animate-fade-in space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E4D9]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#1B4332] text-white flex items-center justify-center">
                {addMode === 'bulk' ? <ListPlus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="font-serif-display font-bold text-lg text-[#1C1E1B]">
                  {addMode === 'bulk' ? 'Add All Tasks at Once' : 'Add Single Study Task'}
                </h3>
                <p className="text-xs text-[#6B7267]">
                  {addMode === 'bulk'
                    ? 'Write or paste multiple tasks separated by comma, fullstop, or numbering (1. 2. 3.)'
                    : `Schedule for ${selectedDateDisplay}`}
                </p>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E8E4D9]">
              <button
                type="button"
                onClick={() => setAddMode('bulk')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  addMode === 'bulk'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#555A50] hover:text-[#1C1E1B]'
                }`}
              >
                <ListPlus className="w-3.5 h-3.5" />
                <span>Write All at Once</span>
              </button>
              <button
                type="button"
                onClick={() => setAddMode('single')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  addMode === 'single'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#555A50] hover:text-[#1C1E1B]'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Single Task</span>
              </button>
            </div>
          </div>

          {/* BULK / WRITE ALL AT ONCE MODE */}
          {addMode === 'bulk' ? (
            <form onSubmit={handleAddBulkTasks} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4B5047] mb-1.5">
                  Type or Paste All Your Tasks (Separated by Commas, Fullstops, or 1. 2. 3.) *
                </label>
                <textarea
                  rows={4}
                  value={bulkInputText}
                  onChange={(e) => setBulkInputText(e.target.value)}
                  placeholder={`Examples you can type or paste:
1. Photosynthesis light reaction
2. Calculus limits and derivatives
3. Chemistry chemical bonding
4. History French revolution
Or:
Revise Biology Chapter 3, Solve 10 Math equations. Practice Physics numericals. English essay writing`}
                  className="w-full p-3.5 text-sm rounded-2xl border border-[#D5CFBF] bg-[#FAF8F5] focus:bg-white text-[#1C1E1B] focus:ring-2 focus:ring-[#1B4332] focus:outline-none placeholder:text-[#8A9085]/70 font-sans"
                  autoFocus
                  required
                />
              </div>

              {/* Default Settings Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E8E4D9]">
                <div>
                  <label className="block text-[11px] font-bold text-[#4B5047] mb-1">Default Subject</label>
                  <select
                    value={bulkDefaultSubject}
                    onChange={(e) => setBulkDefaultSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5CFBF] bg-white text-[#1C1E1B]"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4B5047] mb-1">Default Duration</label>
                  <select
                    value={bulkDefaultMinutes}
                    onChange={(e) => setBulkDefaultMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5CFBF] bg-white text-[#1C1E1B]"
                  >
                    <option value={20}>20 minutes each</option>
                    <option value={30}>30 minutes each</option>
                    <option value={45}>45 minutes each</option>
                    <option value={60}>60 minutes each</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4B5047] mb-1">Default Priority</label>
                  <select
                    value={bulkDefaultPriority}
                    onChange={(e) => setBulkDefaultPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5CFBF] bg-white text-[#1C1E1B]"
                  >
                    <option value="high">🔥 High Priority</option>
                    <option value="medium">⚡ Medium Priority</option>
                    <option value="low">🌱 Low Priority</option>
                  </select>
                </div>
              </div>

              {/* Live Detection Preview */}
              {parsedBulkPreview.length > 0 && (
                <div className="bg-[#E3EDE5]/50 border border-[#2D6A4F]/20 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#1B4332]">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      <span>{parsedBulkPreview.length} Individual Tasks Automatically Detected:</span>
                    </span>
                    <span className="text-[11px] font-mono-code font-normal text-[#555A50]">
                      Target: {selectedDateDisplay}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                    {parsedBulkPreview.map((pt, idx) => (
                      <div
                        key={pt.id}
                        className="bg-white border border-[#D5CFBF] rounded-xl px-2.5 py-1 text-xs text-[#1C1E1B] flex items-center gap-1.5 shadow-2xs"
                      >
                        <span className="font-mono-code text-[10px] font-bold text-[#2D6A4F] bg-[#E3EDE5] w-4 h-4 rounded-full flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-medium">{pt.topic}</span>
                        <span className="text-[9px] font-mono-code text-[#6B7267] bg-[#FAF8F5] px-1.5 py-0.2 rounded border border-[#E8E4D9]">
                          {pt.subject}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E4D9]">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#6B7267] hover:bg-[#F4EFE6] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={parsedBulkPreview.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <ListPlus className="w-4 h-4" />
                  <span>
                    Add All {parsedBulkPreview.length > 0 ? `(${parsedBulkPreview.length})` : ''} Tasks to Schedule
                  </span>
                </button>
              </div>
            </form>
          ) : (
            /* SINGLE TASK MODE */
            <form onSubmit={handleCreateSingleTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4B5047] mb-1">
                  Topic / Task Description *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Atmospheric Layers, Calculus Integration, French Vocabulary"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CFBF] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-sm text-[#1C1E1B]"
                  autoFocus
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4B5047] mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5CFBF] bg-[#FAF8F5] text-[#1C1E1B]"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B5047] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5CFBF] bg-[#FAF8F5] text-[#1C1E1B]"
                  >
                    <option value="revision">Chapter Revision</option>
                    <option value="homework">Homework / Assignment</option>
                    <option value="exam">Exam Preparation</option>
                    <option value="quiz">Practice Quiz</option>
                    <option value="project">Project / Lab Work</option>
                    <option value="general">General Study</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4B5047] mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5CFBF] bg-[#FAF8F5] text-[#1C1E1B]"
                  >
                    <option value="high">🔥 High</option>
                    <option value="medium">⚡ Medium</option>
                    <option value="low">🌱 Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B5047] mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="240"
                    step="5"
                    value={availableMinutes}
                    onChange={(e) => setAvailableMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5CFBF] bg-[#FAF8F5] text-[#1C1E1B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B5047] mb-1">Deadline Time</label>
                  <input
                    type="time"
                    value={deadlineTime}
                    onChange={(e) => setDeadlineTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5CFBF] bg-[#FAF8F5] text-[#1C1E1B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B5047] mb-1">
                  Notes & Reminders (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Complete questions 1 to 15"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D5CFBF] bg-[#FAF8F5] text-[#1C1E1B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E4D9]">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#6B7267] hover:bg-[#F4EFE6] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
                >
                  Save Task
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 4. Progress bar for selected date */}
      {totalCount > 0 && (
        <div className="bg-white rounded-2xl border border-[#E8E4D9] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#1B4332]" />
            <span className="text-xs font-bold text-[#1C1E1B]">
              Day Progress: {completedCount} of {totalCount} tasks completed ({progressPercent}%)
            </span>
          </div>
          <div className="w-full sm:w-48 bg-[#E8E4D9] h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[#1B4332] h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* 5. Tasks List for Selected Date with Reordering / Drag & Drop */}
      <div className="space-y-3">
        {selectedDateTasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-[#D5CFBF] p-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#E3EDE5] text-[#1B4332] flex items-center justify-center mx-auto">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#1C1E1B]">
                No study tasks scheduled for {selectedDateDisplay}
              </h4>
              <p className="text-xs text-[#6B7267] mt-0.5 max-w-md mx-auto">
                Add all your revision topics at once by typing them with commas, fullstops, or numbering.
              </p>
            </div>
            <button
              onClick={() => {
                setAddMode('bulk');
                setShowAddForm(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <ListPlus className="w-4 h-4" />
              <span>Add Tasks at Once</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Helper tip for reordering */}
            {selectedDateTasks.length > 1 && (
              <div className="flex items-center justify-between text-[11px] text-[#6B7267] px-1 font-mono-code">
                <span className="flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span>Drag handle or use arrows to rearrange tasks order</span>
                </span>
                <span>{selectedDateTasks.length} tasks scheduled</span>
              </div>
            )}

            {selectedDateTasks.map((task, index) => {
              const formattedTime = formatDeadline(task.deadlineTime);
              const isDragging = draggedTaskId === task.id;
              const isDragOver = dragOverTaskId === task.id;

              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragOver={(e) => handleDragOver(e, task.id)}
                  onDrop={(e) => handleDrop(e, task.id)}
                  onDragEnd={handleDragEnd}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                    isDragging
                      ? 'opacity-40 border-dashed border-[#1B4332] bg-[#E3EDE5]'
                      : isDragOver
                      ? 'border-2 border-[#1B4332] bg-[#E3EDE5]/30'
                      : task.completed
                      ? 'bg-[#F4EFE6]/60 border-[#E8E4D9] opacity-75'
                      : 'bg-white border-[#E8E4D9] hover:border-[#2D6A4F] hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-2.5 sm:gap-3 flex-1">
                    {/* Drag Handle */}
                    <div
                      className="mt-1 text-[#8A9085] hover:text-[#1B4332] cursor-grab active:cursor-grabbing p-0.5 rounded touch-none"
                      title="Drag to reorder position"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Toggle Completion */}
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      className="mt-0.5 text-[#1B4332] hover:scale-110 transition-transform cursor-pointer shrink-0"
                      title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-[#2D6A4F] fill-[#E3EDE5]" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#8A9085] hover:text-[#1B4332]" />
                      )}
                    </button>

                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Task Number / Position */}
                        <span className="text-[10px] font-mono-code font-bold bg-[#FAF8F5] border border-[#E8E4D9] text-[#6B7267] px-1.5 py-0.2 rounded">
                          #{index + 1}
                        </span>

                        {/* Subject Badge */}
                        <span className="text-[10px] font-mono-code font-bold bg-[#E3EDE5] text-[#1B4332] px-2 py-0.5 rounded-md">
                          {task.subject}
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-mono-code font-bold px-2 py-0.5 rounded-md border ${
                            task.priority === 'high'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : task.priority === 'medium'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {task.priority === 'high'
                            ? '🔥 High'
                            : task.priority === 'medium'
                            ? '⚡ Medium'
                            : '🌱 Low'}
                        </span>

                        {/* Category Badge */}
                        {task.category && (
                          <span className="text-[10px] font-mono-code bg-[#F4EFE6] text-[#555A50] px-2 py-0.5 rounded-md capitalize">
                            {task.category}
                          </span>
                        )}

                        {/* Deadline Time */}
                        {formattedTime && (
                          <span className="text-[10px] font-mono-code font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>{formattedTime}</span>
                          </span>
                        )}

                        {/* Estimated Minutes */}
                        <span className="text-[10px] text-[#6B7267] flex items-center gap-0.5">
                          <span>⏱ {task.availableMinutes}m</span>
                        </span>
                      </div>

                      <h4
                        className={`font-semibold text-sm text-[#1C1E1B] ${
                          task.completed ? 'line-through text-[#8A9085]' : ''
                        }`}
                      >
                        {task.topic}
                      </h4>

                      {task.notes && (
                        <p className="text-xs text-[#6B7267] mt-0.5">{task.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Move Up/Down Controls & Delete */}
                  <div className="flex items-center gap-1 self-end sm:self-center">
                    <div className="flex items-center bg-[#FAF8F5] border border-[#E8E4D9] rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => handleMoveTask(task.id, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded text-[#6B7267] hover:text-[#1B4332] hover:bg-white disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveTask(task.id, 'down')}
                        disabled={index === selectedDateTasks.length - 1}
                        className="p-1 rounded text-[#6B7267] hover:text-[#1B4332] hover:bg-white disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 rounded-lg text-[#8A9085] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Prominent "Add Tasks at Once" Button Below the Tasks List */}
            <div className="pt-2">
              <button
                type="button"
                id="btn-add-tasks-at-once-bottom"
                onClick={() => {
                  setAddMode('bulk');
                  setShowAddForm(true);
                  setTimeout(() => {
                    const el = document.getElementById('home-study-tracker-box');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }, 50);
                }}
                className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-[#2D6A4F]/40 hover:border-[#1B4332] bg-[#E3EDE5]/30 hover:bg-[#E3EDE5]/60 text-[#1B4332] text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
              >
                <div className="w-6 h-6 rounded-lg bg-[#1B4332] text-white flex items-center justify-center shadow-2xs">
                  <ListPlus className="w-4 h-4" />
                </div>
                <span>Add Tasks at Once for {selectedDateDisplay} (Type with . , or 1. 2. 3.)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
