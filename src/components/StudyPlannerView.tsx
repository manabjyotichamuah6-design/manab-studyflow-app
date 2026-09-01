import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Filter,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ListTodo,
  CheckSquare,
  Flame,
  Tag,
  BookOpen,
  Layers,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ListPlus,
  ArrowUpDown,
} from 'lucide-react';
import { StudyPlanTask, SubjectItem } from '../types';
import { parseBulkTasksInput } from '../utils/taskParser';

interface StudyPlannerViewProps {
  tasks: StudyPlanTask[];
  subjects: SubjectItem[];
  onSaveTask: (task: StudyPlanTask) => void;
  onSaveTasksBulk?: (tasks: StudyPlanTask[]) => void;
  onReorderTasks?: (tasks: StudyPlanTask[]) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onGeneratePlanWithAI: (subject: string, topic: string, days: number, minutes: number) => void;
}

type FilterTab = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';
type ViewMode = 'calendar' | 'list';
type ModalAddMode = 'bulk' | 'single';

export const StudyPlannerView: React.FC<StudyPlannerViewProps> = ({
  tasks,
  subjects,
  onSaveTask,
  onSaveTasksBulk,
  onReorderTasks,
  onToggleTask,
  onDeleteTask,
  onGeneratePlanWithAI,
}) => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [modalAddMode, setModalAddMode] = useState<ModalAddMode>('bulk');
  const [showAiModal, setShowAiModal] = useState<boolean>(false);

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);

  // Calendar navigation state
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => new Date());

  // Bulk input state
  const [bulkInputText, setBulkInputText] = useState<string>('');
  const [bulkDefaultSubject, setBulkDefaultSubject] = useState<string>(subjects[0]?.name || 'Science');
  const [bulkDefaultMinutes, setBulkDefaultMinutes] = useState<number>(30);
  const [bulkDefaultPriority, setBulkDefaultPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Manual Task form
  const [subject, setSubject] = useState<string>(subjects[0]?.name || 'Science');
  const [topic, setTopic] = useState<string>('');
  const [availableMinutes, setAvailableMinutes] = useState<number>(30);
  const [targetDate, setTargetDate] = useState<string>(selectedDate || todayStr);
  const [deadlineTime, setDeadlineTime] = useState<string>('18:00');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState<'revision' | 'homework' | 'exam' | 'quiz' | 'project' | 'general'>('revision');
  const [notes, setNotes] = useState<string>('');

  // AI Schedule Form
  const [aiSubject, setAiSubject] = useState<string>(subjects[0]?.name || 'Science');
  const [aiTopic, setAiTopic] = useState<string>('Atmospheric Layers');
  const [aiDays, setAiDays] = useState<number>(4);
  const [aiMinutes, setAiMinutes] = useState<number>(45);

  const handleOpenAddModalForDate = (dateString?: string, mode: ModalAddMode = 'bulk') => {
    if (dateString) {
      setTargetDate(dateString);
      setSelectedDate(dateString);
    }
    setModalAddMode(mode);
    setShowAddModal(true);
  };

  // Real-time preview of parsed bulk tasks in modal
  const parsedBulkPreview = useMemo(() => {
    if (!bulkInputText.trim()) return [];
    return parseBulkTasksInput(
      bulkInputText,
      subjects,
      targetDate || selectedDate || todayStr,
      bulkDefaultSubject,
      bulkDefaultMinutes,
      bulkDefaultPriority
    );
  }, [bulkInputText, subjects, targetDate, selectedDate, todayStr, bulkDefaultSubject, bulkDefaultMinutes, bulkDefaultPriority]);

  const handleCreateSingleTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const newTask: StudyPlanTask = {
      id: `task-${Date.now()}`,
      subject,
      topic: topic.trim(),
      availableMinutes: Number(availableMinutes) || 30,
      targetDate: targetDate || todayStr,
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
    setShowAddModal(false);
  };

  const handleCreateBulkTasks = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedBulkPreview.length === 0) return;

    if (onSaveTasksBulk) {
      onSaveTasksBulk(parsedBulkPreview);
    } else {
      parsedBulkPreview.forEach((t) => onSaveTask(t));
    }
    setBulkInputText('');
    setShowAddModal(false);
  };

  const handleTriggerAiPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;
    onGeneratePlanWithAI(aiSubject, aiTopic.trim(), aiDays, aiMinutes);
    setShowAiModal(false);
  };

  // Reordering logic
  const handleMoveTask = (taskId: string, direction: 'up' | 'down') => {
    if (!onReorderTasks) return;

    const currentIndex = tasks.findIndex((t) => t.id === taskId);
    if (currentIndex < 0) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= tasks.length) return;

    const updatedTasks = [...tasks];
    const [moved] = updatedTasks.splice(currentIndex, 1);
    updatedTasks.splice(targetIndex, 0, moved);

    onReorderTasks(updatedTasks);
  };

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

    const fromIndex = tasks.findIndex((t) => t.id === draggedTaskId);
    const toIndex = tasks.findIndex((t) => t.id === targetDropId);

    if (fromIndex >= 0 && toIndex >= 0) {
      const updatedTasks = [...tasks];
      const [draggedItem] = updatedTasks.splice(fromIndex, 1);
      updatedTasks.splice(toIndex, 0, draggedItem);
      onReorderTasks(updatedTasks);
    }

    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  // Calendar Calculation
  const calendarGrid = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDay.getDay(); // 0 for Sunday
    const daysInMonth = lastDay.getDate();

    const days = [];

    // Empty cells before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, dateStr: '', isCurrentMonth: false });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const monthPadded = String(month + 1).padStart(2, '0');
      const dayPadded = String(d).padStart(2, '0');
      const dateStr = `${year}-${monthPadded}-${dayPadded}`;
      const dayTasks = tasks.filter((t) => t.targetDate === dateStr);
      const pendingCount = dayTasks.filter((t) => !t.completed).length;
      const completedDayCount = dayTasks.filter((t) => t.completed).length;

      days.push({
        day: d,
        dateStr,
        isCurrentMonth: true,
        tasks: dayTasks,
        totalTasks: dayTasks.length,
        pendingCount,
        completedDayCount,
        hasOverdue: dateStr < todayStr && pendingCount > 0,
      });
    }

    return days;
  }, [currentMonthDate, tasks, todayStr]);

  // Tasks for the selected date
  const selectedDayTasks = useMemo(() => {
    return tasks.filter((t) => t.targetDate === selectedDate);
  }, [tasks, selectedDate]);

  // Filtered tasks for List View
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Subject filter
      if (selectedSubjectFilter !== 'all' && t.subject !== selectedSubjectFilter) {
        return false;
      }
      // Status filter
      if (activeFilter === 'today') return t.targetDate === todayStr;
      if (activeFilter === 'upcoming') return t.targetDate > todayStr && !t.completed;
      if (activeFilter === 'overdue') return t.targetDate < todayStr && !t.completed;
      if (activeFilter === 'completed') return t.completed;
      return true;
    });
  }, [tasks, selectedSubjectFilter, activeFilter, todayStr]);

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF8F5] border border-[#E8E4D9] p-5 sm:p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono-code uppercase tracking-wider font-bold text-[#2D6A4F] bg-[#E3EDE5] px-2.5 py-0.5 rounded-full">
              Study Calendar & Timetable
            </span>
          </div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1C1E1B]">
            Interactive Study Planner
          </h1>
          <p className="text-xs text-[#6B7267] mt-0.5">
            Manage your daily revisions, assign deadlines, and reorder tasks seamlessly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="bg-white border border-[#D5CFBF] p-1 rounded-2xl flex items-center shadow-xs">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-[#1B4332] text-white shadow-xs'
                  : 'text-[#555A50] hover:text-[#1C1E1B]'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#1B4332] text-white shadow-xs'
                  : 'text-[#555A50] hover:text-[#1C1E1B]'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>Timetable List</span>
            </button>
          </div>

          {/* AI Generator Button */}
          <button
            onClick={() => setShowAiModal(true)}
            className="px-3.5 py-2 rounded-2xl border border-[#2D6A4F] bg-[#E3EDE5] text-[#1B4332] hover:bg-[#D5E5D8] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>AI Multi-Day Plan</span>
          </button>

          {/* Add Tasks at Once Button */}
          <button
            onClick={() => handleOpenAddModalForDate(selectedDate, 'bulk')}
            className="px-4 py-2 rounded-2xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
          >
            <ListPlus className="w-4 h-4" />
            <span>Add Tasks at Once</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Month Calendar Grid (8 cols) */}
          <div className="lg:col-span-8 bg-[#FAF8F5] rounded-3xl border border-[#E8E4D9] p-5 sm:p-6 shadow-sm space-y-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4D9]">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#1B4332]" />
                <h2 className="font-serif-display text-xl font-bold text-[#1C1E1B]">
                  {currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentMonthDate(
                      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1)
                    )
                  }
                  className="p-2 rounded-xl border border-[#D5CFBF] bg-white hover:bg-[#FAF8F5] text-[#4B5047] cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentMonthDate(new Date());
                    setSelectedDate(todayStr);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-[#1B4332] bg-[#E3EDE5] rounded-xl hover:bg-[#D5E5D8] cursor-pointer"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentMonthDate(
                      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1)
                    )
                  }
                  className="p-2 rounded-xl border border-[#D5CFBF] bg-white hover:bg-[#FAF8F5] text-[#4B5047] cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono-code text-xs font-bold text-[#6B7267] py-1">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calendarGrid.map((cell, idx) => {
                if (!cell.day) {
                  return <div key={`empty-${idx}`} className="h-20 sm:h-24 bg-transparent" />;
                }

                const isSelected = cell.dateStr === selectedDate;
                const isToday = cell.dateStr === todayStr;

                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => setSelectedDate(cell.dateStr)}
                    className={`min-h-[85px] sm:min-h-[105px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                      isSelected
                        ? 'bg-white border-[#1B4332] ring-2 ring-[#1B4332]/20 shadow-md'
                        : isToday
                        ? 'bg-[#E3EDE5]/40 border-[#2D6A4F] hover:bg-white'
                        : 'bg-white border-[#E8E4D9] hover:border-[#2D6A4F] hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                          isToday
                            ? 'bg-[#1B4332] text-white'
                            : isSelected
                            ? 'bg-[#E3EDE5] text-[#1B4332]'
                            : 'text-[#1C1E1B]'
                        }`}
                      >
                        {cell.day}
                      </span>

                      {cell.totalTasks > 0 && (
                        <span
                          className={`text-[9px] font-mono-code px-1.5 py-0.2 rounded-full font-bold ${
                            cell.pendingCount === 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : cell.hasOverdue
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {cell.totalTasks}
                        </span>
                      )}
                    </div>

                    {/* Task Pills Preview */}
                    <div className="space-y-1 my-1 overflow-hidden">
                      {cell.tasks?.slice(0, 2).map((t) => (
                        <div
                          key={t.id}
                          className={`text-[10px] truncate px-1.5 py-0.5 rounded font-medium ${
                            t.completed
                              ? 'bg-[#F4EFE6] text-[#8A9085] line-through'
                              : 'bg-[#E3EDE5] text-[#1B4332]'
                          }`}
                          title={t.topic}
                        >
                          {t.topic}
                        </div>
                      ))}
                      {cell.tasks && cell.tasks.length > 2 && (
                        <div className="text-[9px] text-[#6B7267] font-mono-code pl-1">
                          +{cell.tasks.length - 2} more
                        </div>
                      )}
                    </div>

                    {/* Hover quick add button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAddModalForDate(cell.dateStr, 'bulk');
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-[#1B4332] hover:underline font-bold text-left flex items-center gap-0.5"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>Add</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day Detail & Tasks List (4 cols) */}
          <div className="lg:col-span-4 bg-[#FAF8F5] rounded-3xl border border-[#E8E4D9] p-5 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E4D9]">
                <div>
                  <span className="text-[10px] font-mono-code uppercase font-bold text-[#6B7267]">
                    Selected Date
                  </span>
                  <h3 className="font-serif-display text-lg font-bold text-[#1C1E1B]">
                    {selectedDate === todayStr ? 'Today' : selectedDate}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenAddModalForDate(selectedDate, 'bulk')}
                  className="px-3 py-1.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  <span>Add Tasks</span>
                </button>
              </div>

              {/* Tasks for the selected day with Drag & Drop */}
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {selectedDayTasks.length === 0 ? (
                  <div className="p-6 bg-white rounded-2xl border border-dashed border-[#D5CFBF] text-center space-y-2">
                    <CalendarDays className="w-6 h-6 text-[#8A9085] mx-auto" />
                    <p className="text-xs text-[#6B7267]">
                      No study tasks scheduled for this day.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenAddModalForDate(selectedDate, 'bulk')}
                      className="text-xs font-bold text-[#1B4332] hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
                    >
                      <ListPlus className="w-3.5 h-3.5" />
                      <span>Write Tasks at Once</span>
                    </button>
                  </div>
                ) : (
                  selectedDayTasks.map((task, idx) => {
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
                        className={`p-3 rounded-2xl border transition-all flex items-start justify-between gap-2 group ${
                          isDragging
                            ? 'opacity-40 border-dashed border-[#1B4332] bg-[#E3EDE5]'
                            : isDragOver
                            ? 'border-2 border-[#1B4332] bg-[#E3EDE5]/30'
                            : task.completed
                            ? 'bg-[#F4EFE6]/60 border-[#E8E4D9] opacity-75'
                            : 'bg-white border-[#E8E4D9] hover:border-[#2D6A4F]'
                        }`}
                      >
                        <div className="flex items-start gap-2 flex-1">
                          <div
                            className="mt-1 text-[#8A9085] hover:text-[#1B4332] cursor-grab active:cursor-grabbing p-0.5"
                            title="Drag to reorder"
                          >
                            <GripVertical className="w-3.5 h-3.5" />
                          </div>

                          <button
                            type="button"
                            onClick={() => onToggleTask(task.id)}
                            className="mt-0.5 text-[#1B4332] cursor-pointer shrink-0"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] fill-[#E3EDE5]" />
                            ) : (
                              <Circle className="w-4 h-4 text-[#8A9085]" />
                            )}
                          </button>

                          <div className="space-y-1 flex-1">
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-[9px] font-mono-code font-bold bg-[#E3EDE5] text-[#1B4332] px-1.5 py-0.2 rounded">
                                {task.subject}
                              </span>
                              {formattedTime && (
                                <span className="text-[9px] font-mono-code font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5 text-amber-700" />
                                  <span>{formattedTime}</span>
                                </span>
                              )}
                              <span
                                className={`text-[9px] font-mono-code font-bold px-1.5 py-0.2 rounded ${
                                  task.priority === 'high'
                                    ? 'bg-rose-100 text-rose-800'
                                    : task.priority === 'medium'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {task.priority.toUpperCase()}
                              </span>
                            </div>

                            <h4
                              className={`text-xs font-bold text-[#1C1E1B] ${
                                task.completed ? 'line-through text-[#8A9085]' : ''
                              }`}
                            >
                              {task.topic}
                            </h4>

                            {task.notes && (
                              <p className="text-[11px] text-[#6B7267]">{task.notes}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMoveTask(task.id, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-[#8A9085] hover:text-[#1B4332] disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveTask(task.id, 'down')}
                            disabled={idx === selectedDayTasks.length - 1}
                            className="p-1 text-[#8A9085] hover:text-[#1B4332] disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1 text-[#8A9085] hover:text-rose-600 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Button to add all tasks at once below existing tasks */}
                {selectedDayTasks.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleOpenAddModalForDate(selectedDate, 'bulk')}
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#2D6A4F]/50 hover:border-[#1B4332] bg-[#E3EDE5]/30 hover:bg-[#E3EDE5]/60 text-[#1B4332] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.99] mt-2"
                  >
                    <ListPlus className="w-3.5 h-3.5" />
                    <span>Add Tasks at Once for {selectedDate === todayStr ? 'Today' : selectedDate}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E4D9] text-xs text-[#6B7267] flex items-center justify-between">
              <span>🌱 Daily study cadence</span>
              <span className="font-bold text-[#1B4332]">
                {selectedDayTasks.filter((t) => t.completed).length}/{selectedDayTasks.length} Completed
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* List / Timetable View */
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E8E4D9] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {(['all', 'today', 'upcoming', 'overdue', 'completed'] as FilterTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    activeFilter === tab
                      ? 'bg-[#1B4332] text-white shadow-xs'
                      : 'bg-white text-[#555A50] hover:bg-[#F4EFE6] border border-[#E8E4D9]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#4B5047]">Subject:</span>
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-[#D5CFBF] bg-white text-[#1C1E1B]"
              >
                <option value="all">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="p-12 bg-[#FAF8F5] rounded-3xl border border-dashed border-[#D5CFBF] text-center space-y-3">
              <ListTodo className="w-8 h-8 text-[#8A9085] mx-auto" />
              <h3 className="font-serif-display font-bold text-lg text-[#1C1E1B]">
                No tasks match your current filter
              </h3>
              <p className="text-xs text-[#6B7267]">
                Try adjusting your filters or click below to add tasks.
              </p>
              <button
                onClick={() => handleOpenAddModalForDate(todayStr, 'bulk')}
                className="px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ListPlus className="w-4 h-4" />
                <span>Add Tasks at Once</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task, index) => {
                const formattedTime = formatDeadline(task.deadlineTime);
                const isOverdue = task.targetDate < todayStr && !task.completed;
                const isDueToday = task.targetDate === todayStr;
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
                    className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                      isDragging
                        ? 'opacity-40 border-dashed border-[#1B4332] bg-[#E3EDE5]'
                        : isDragOver
                        ? 'border-2 border-[#1B4332] bg-[#E3EDE5]/30'
                        : task.completed
                        ? 'bg-[#F4EFE6]/60 border-[#E8E4D9] opacity-75'
                        : isOverdue
                        ? 'bg-rose-50/40 border-rose-200 hover:border-rose-400'
                        : 'bg-white border-[#E8E4D9] hover:border-[#2D6A4F] shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 flex-1">
                      {/* Drag Handle */}
                      <div
                        className="mt-1 text-[#8A9085] hover:text-[#1B4332] cursor-grab active:cursor-grabbing p-0.5 rounded touch-none"
                        title="Drag to reorder position"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleTask(task.id)}
                        className="mt-0.5 text-[#1B4332] hover:scale-110 transition-transform cursor-pointer shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-[#2D6A4F] fill-[#E3EDE5]" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#8A9085] hover:text-[#1B4332]" />
                        )}
                      </button>

                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono-code font-bold bg-[#E3EDE5] text-[#1B4332] px-2 py-0.5 rounded-md">
                            {task.subject}
                          </span>

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

                          {task.category && (
                            <span className="text-[10px] font-mono-code bg-[#F4EFE6] text-[#555A50] px-2 py-0.5 rounded-md capitalize">
                              {task.category}
                            </span>
                          )}

                          <span className="text-xs font-mono-code font-bold text-[#1C1E1B] flex items-center gap-1">
                            <CalendarIcon className="w-3.5 h-3.5 text-[#2D6A4F]" />
                            <span>{isDueToday ? 'Today' : task.targetDate}</span>
                          </span>

                          {formattedTime && (
                            <span className="text-[10px] font-mono-code font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>{formattedTime}</span>
                            </span>
                          )}

                          {isOverdue && (
                            <span className="text-[10px] font-mono-code font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">
                              ⚠️ Overdue
                            </span>
                          )}
                        </div>

                        <h4
                          className={`font-semibold text-base text-[#1C1E1B] ${
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

                    <div className="flex items-center gap-3 text-xs text-[#6B7267] self-end sm:self-center">
                      <span className="flex items-center gap-1 font-mono-code">
                        <Clock className="w-3.5 h-3.5 text-[#2D6A4F]" />
                        <span>{task.availableMinutes}m</span>
                      </span>

                      {/* Move Up/Down Controls */}
                      <div className="flex items-center bg-[#FAF8F5] border border-[#E8E4D9] rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveTask(task.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-[#6B7267] hover:text-[#1B4332] disabled:opacity-20 cursor-pointer"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveTask(task.id, 'down')}
                          disabled={index === filteredTasks.length - 1}
                          className="p-1 text-[#6B7267] hover:text-[#1B4332] disabled:opacity-20 cursor-pointer"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 text-[#8A9085] hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add Task Button below list */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenAddModalForDate(selectedDate || todayStr, 'bulk')}
                  className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-[#2D6A4F]/40 hover:border-[#1B4332] bg-[#E3EDE5]/30 hover:bg-[#E3EDE5]/60 text-[#1B4332] text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#1B4332] text-white flex items-center justify-center">
                    <ListPlus className="w-4 h-4" />
                  </div>
                  <span>Add Tasks at Once (Write with . , or 1. 2. 3.)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Task Modal (Bulk or Single) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B4332]/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-[#FAF8F5] rounded-3xl border border-[#E8E4D9] shadow-2xl p-6 sm:p-7 text-[#1C1E1B] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E4D9]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#1B4332] text-white flex items-center justify-center">
                  {modalAddMode === 'bulk' ? <ListPlus className="w-4 h-4" /> : <CalendarDays className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-serif-display text-xl font-bold text-[#1C1E1B]">
                    {modalAddMode === 'bulk' ? 'Add All Tasks at Once' : 'Add Single Task'}
                  </h3>
                  <p className="text-xs text-[#6B7267]">
                    {modalAddMode === 'bulk'
                      ? 'Type multiple topics separated by commas, periods, or 1. 2. 3.'
                      : `Schedule study session for ${targetDate || selectedDate}`}
                  </p>
                </div>
              </div>

              {/* Mode Tabs */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E8E4D9]">
                <button
                  type="button"
                  onClick={() => setModalAddMode('bulk')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    modalAddMode === 'bulk'
                      ? 'bg-[#1B4332] text-white'
                      : 'text-[#555A50] hover:text-[#1C1E1B]'
                  }`}
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  <span>Write All at Once</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalAddMode('single')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    modalAddMode === 'single'
                      ? 'bg-[#1B4332] text-white'
                      : 'text-[#555A50] hover:text-[#1C1E1B]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Single</span>
                </button>
              </div>
            </div>

            {modalAddMode === 'bulk' ? (
              <form onSubmit={handleCreateBulkTasks} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#4B5047] mb-1.5">
                    Write All Tasks at Once (Separated by Commas, Fullstops, or 1. 2. 3.) *
                  </label>
                  <textarea
                    rows={4}
                    value={bulkInputText}
                    onChange={(e) => setBulkInputText(e.target.value)}
                    placeholder={`Examples:
1. Photosynthesis light reactions
2. Calculus integration methods
3. Chemistry chemical bonding
4. History French revolution
Or:
Revise Biology Chapter 3, Solve 10 Math problems. Practice Physics numericals. English essay writing`}
                    className="w-full p-3.5 text-sm rounded-2xl border border-[#D5CFBF] bg-white text-[#1C1E1B] focus:ring-2 focus:ring-[#1B4332] focus:outline-none placeholder:text-[#8A9085]/70"
                    autoFocus
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-2xl border border-[#E8E4D9]">
                  <div>
                    <label className="block text-[11px] font-bold text-[#4B5047] mb-1">Target Date</label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#D5CFBF] bg-[#FAF8F5] text-[#1C1E1B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4B5047] mb-1">Default Subject</label>
                    <select
                      value={bulkDefaultSubject}
                      onChange={(e) => setBulkDefaultSubject(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#D5CFBF] bg-[#FAF8F5] text-[#1C1E1B]"
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
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#D5CFBF] bg-[#FAF8F5] text-[#1C1E1B]"
                    >
                      <option value={20}>20 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes</option>
                    </select>
                  </div>
                </div>

                {parsedBulkPreview.length > 0 && (
                  <div className="bg-[#E3EDE5]/60 border border-[#2D6A4F]/20 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1B4332]">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
                        <span>{parsedBulkPreview.length} Individual Tasks Identified:</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
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

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E4D9]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7267] hover:bg-[#EFEBE0] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={parsedBulkPreview.length === 0}
                    className="px-5 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <ListPlus className="w-4 h-4" />
                    <span>
                      Add All {parsedBulkPreview.length > 0 ? `(${parsedBulkPreview.length})` : ''} Tasks to Schedule
                    </span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateSingleTask} className="space-y-4">
                {/* Topic / Task Title */}
                <div>
                  <label className="block text-xs font-bold text-[#4B5047] mb-1">
                    Topic / Task Description *
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Atmospheric Layers, Trigonometry Proofs"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D5CFBF] bg-white text-[#1C1E1B] focus:ring-2 focus:ring-[#1B4332] focus:outline-none"
                    autoFocus
                    required
                  />
                </div>

                {/* Subject & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#4B5047] mb-1">Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
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
                    <label className="block text-xs font-bold text-[#4B5047] mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5CFBF] bg-white text-[#1C1E1B]"
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

                {/* Date & Deadline Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#4B5047] mb-1">
                      Target Date *
                    </label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5CFBF] bg-white text-[#1C1E1B]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4B5047] mb-1 flex items-center justify-between">
                      <span>Deadline Time</span>
                      <span className="text-[10px] text-[#8A9085] font-normal">Optional</span>
                    </label>
                    <input
                      type="time"
                      value={deadlineTime}
                      onChange={(e) => setDeadlineTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5CFBF] bg-white text-[#1C1E1B]"
                    />
                  </div>
                </div>

                {/* Priority & Minutes */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#4B5047] mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5CFBF] bg-white text-[#1C1E1B]"
                    >
                      <option value="high">🔥 High Priority</option>
                      <option value="medium">⚡ Medium Priority</option>
                      <option value="low">🌱 Low Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4B5047] mb-1">
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={240}
                      step={5}
                      value={availableMinutes}
                      onChange={(e) => setAvailableMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5CFBF] bg-white text-[#1C1E1B]"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-[#4B5047] mb-1">
                    Notes & Reminders (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Review key formulas and complete practice set"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D5CFBF] bg-white text-[#1C1E1B]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E4D9]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7267] hover:bg-[#EFEBE0] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!topic.trim()}
                    className="px-5 py-2 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    Save Task to Calendar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* AI Multi-Day Plan Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B4332]/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#FAF8F5] rounded-3xl border border-[#E8E4D9] shadow-2xl p-6 sm:p-7 text-[#1C1E1B]">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-[#2D6A4F]" />
              <h3 className="font-serif-display text-xl font-bold">Generate AI Study Plan</h3>
            </div>
            <p className="text-xs text-[#6B7267] mb-4">
              Let StudyFlow construct a structured multi-day revision roadmap.
            </p>

            <form onSubmit={handleTriggerAiPlan} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#4B5047] mb-1">Subject</label>
                <select
                  value={aiSubject}
                  onChange={(e) => setAiSubject(e.target.value)}
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
                <label className="block text-xs font-semibold text-[#4B5047] mb-1">Topic or Exam Scope</label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. Newton's Laws of Motion, Photosynthesis"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#D5CFBF] bg-white text-[#1C1E1B] focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4B5047] mb-1">Days Schedule</label>
                  <select
                    value={aiDays}
                    onChange={(e) => setAiDays(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5CFBF] bg-white text-[#1C1E1B]"
                  >
                    <option value={3}>3 Days</option>
                    <option value={4}>4 Days</option>
                    <option value={5}>5 Days</option>
                    <option value={7}>7 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4B5047] mb-1">Minutes / Day</label>
                  <select
                    value={aiMinutes}
                    onChange={(e) => setAiMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5CFBF] bg-white text-[#1C1E1B]"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E4D9]">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7267] hover:bg-[#EFEBE0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!aiTopic.trim()}
                  className="px-5 py-2 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Plan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
