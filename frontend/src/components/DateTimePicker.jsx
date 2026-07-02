import React, { useState, useEffect, useRef } from "react";

export default function DateTimePicker({ value, onChange, placeholder = "Select Date & Time" }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse initial value (expected format YYYY-MM-DDTHH:MM)
  const initialDate = value ? new Date(value) : new Date();
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth()); // 0-11
  const [hours, setHours] = useState(value ? initialDate.getHours() : 12);
  const [minutes, setMinutes] = useState(value ? initialDate.getMinutes() : 0);

  const containerRef = useRef(null);

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setSelectedDate(d);
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
        setHours(d.getHours());
        setMinutes(d.getMinutes());
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Helper to format date/time back to parent
  const handleDateSelect = (day) => {
    const newDate = new Date(currentYear, currentMonth, day, hours, minutes);
    setSelectedDate(newDate);
    triggerChange(newDate);
  };

  const handleTimeChange = (type, val) => {
    let intVal = parseInt(val, 10);
    if (isNaN(intVal)) intVal = 0;
    
    let updatedHours = hours;
    let updatedMinutes = minutes;

    if (type === "hours") {
      updatedHours = Math.max(0, Math.min(23, intVal));
      setHours(updatedHours);
    } else if (type === "minutes") {
      updatedMinutes = Math.max(0, Math.min(59, intVal));
      setMinutes(updatedMinutes);
    }

    if (selectedDate) {
      const newDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        updatedHours,
        updatedMinutes
      );
      setSelectedDate(newDate);
      triggerChange(newDate);
    } else {
      const newDate = new Date(currentYear, currentMonth, new Date().getDate(), updatedHours, updatedMinutes);
      setSelectedDate(newDate);
      triggerChange(newDate);
    }
  };

  const triggerChange = (date) => {
    const pad = (num) => String(num).padStart(2, "0");
    const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    onChange(formatted);
  };

  // Calendar calculations
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  const prevDaysInMonth = getDaysInMonth(currentYear, currentMonth - 1);

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Render calendar days
  const renderCalendarCells = () => {
    const cells = [];
    
    // Add prefix days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDay = prevDaysInMonth - i;
      cells.push(
        <button
          key={`prev-${prevDay}`}
          type="button"
          disabled
          className="text-slate-500/30 dark:text-slate-600/30 text-xs py-1.5 w-8 h-8 rounded-lg cursor-not-allowed"
        >
          {prevDay}
        </button>
      );
    }

    // Add days of current month
    const now = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth &&
        selectedDate.getFullYear() === currentYear;
      
      const isToday = now.getDate() === day &&
        now.getMonth() === currentMonth &&
        now.getFullYear() === currentYear;

      cells.push(
        <button
          key={`day-${day}`}
          type="button"
          onClick={() => handleDateSelect(day)}
          className={`text-xs py-1.5 w-8 h-8 rounded-lg font-medium transition cursor-pointer flex items-center justify-center ${
            isSelected
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : isToday
              ? "border border-indigo-500/50 text-indigo-500 font-bold hover:bg-slate-500/10"
              : "text-[var(--text-primary)] hover:bg-slate-500/10"
          }`}
        >
          {day}
        </button>
      );
    }

    // Add suffix days from next month to fill grid rows (6 rows x 7 days = 42 total cells)
    const totalCellsSoFar = firstDayIndex + daysInMonth;
    const remainingCells = 42 - totalCellsSoFar;
    for (let day = 1; day <= remainingCells; day++) {
      cells.push(
        <button
          key={`next-${day}`}
          type="button"
          disabled
          className="text-slate-500/30 dark:text-slate-600/30 text-xs py-1.5 w-8 h-8 rounded-lg cursor-not-allowed"
        >
          {day}
        </button>
      );
    }

    return cells;
  };

  const getDisplayValue = () => {
    if (!selectedDate) return "";
    return selectedDate.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      {/* Trigger Input Box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-3 rounded-xl saas-input text-sm cursor-pointer select-none text-[var(--text-secondary)] focus:ring-2"
      >
        <span className={selectedDate ? "text-[var(--text-primary)] font-medium" : "text-slate-400 dark:text-slate-500"}>
          {getDisplayValue() || placeholder}
        </span>
        <span className="text-xs text-indigo-400">📅</span>
      </div>

      {/* Popover Calendar Container */}
      {isOpen && (
        <div className="absolute left-0 mt-2 z-50 saas-card rounded-2xl border p-4 shadow-xl max-w-sm w-[320px] animate-fade-in text-left">
          {/* Header Month / Year control */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg border saas-border text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/10 transition cursor-pointer"
            >
              ◀
            </button>
            <div className="text-xs font-bold text-[var(--text-primary)] tracking-wide">
              {months[currentMonth]} {currentYear}
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg border saas-border text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/10 transition cursor-pointer"
            >
              ▶
            </button>
          </div>

          {/* Days of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {daysOfWeek.map((day) => (
              <span key={day} className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                {day}
              </span>
            ))}
          </div>

          {/* Days Calendar Cells Grid */}
          <div className="grid grid-cols-7 gap-1 justify-items-center">
            {renderCalendarCells()}
          </div>

          {/* Divider */}
          <div className="h-px bg-[var(--border-color)] my-4" />

          {/* Time Picker selection */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Select Time
            </span>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                min="0"
                max="23"
                value={String(hours).padStart(2, "0")}
                onChange={(e) => handleTimeChange("hours", e.target.value)}
                className="w-11 px-1.5 py-1 text-center bg-slate-500/5 text-xs font-semibold rounded-lg border saas-border focus:ring-1 focus:ring-indigo-500/55 focus:outline-none"
              />
              <span className="text-xs font-bold text-[var(--text-secondary)]">:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={String(minutes).padStart(2, "0")}
                onChange={(e) => handleTimeChange("minutes", e.target.value)}
                className="w-11 px-1.5 py-1 text-center bg-slate-500/5 text-xs font-semibold rounded-lg border saas-border focus:ring-1 focus:ring-indigo-500/55 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
