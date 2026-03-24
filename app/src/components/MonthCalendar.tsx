"use client";

import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isToday,
  isSameMonth,
  isBefore,
  startOfDay,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StreakFire } from "@/components/Doodles";
import { DailyTask } from "@/types";

interface MonthCalendarProps {
  currentMonth: Date;
  selectedDate: string;
  tasks: DailyTask[];
  currentStreak: number;
  onSelectDate: (dateStr: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToggleView: () => void;
}

const WEEKDAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"];

export default function MonthCalendar({
  currentMonth,
  selectedDate,
  tasks,
  currentStreak,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onToggleView,
}: MonthCalendarProps) {
  const monthLabel = format(currentMonth, "yyyy年M月", { locale: zhCN });

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: {
      date: Date;
      dateStr: string;
      dayOfMonth: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      tasksTotal: number;
      tasksCompleted: number;
      isPast: boolean;
    }[] = [];

    let cursor = calStart;
    while (cursor <= calEnd) {
      const dateStr = format(cursor, "yyyy-MM-dd");
      const dayTasks = tasks.filter((t) => t.date === dateStr);
      const completed = dayTasks.filter((t) => t.status === "completed").length;

      days.push({
        date: new Date(cursor),
        dateStr,
        dayOfMonth: cursor.getDate(),
        isCurrentMonth: isSameMonth(cursor, currentMonth),
        isToday: isToday(cursor),
        tasksTotal: dayTasks.length,
        tasksCompleted: completed,
        isPast: isBefore(startOfDay(cursor), startOfDay(new Date())),
      });
      cursor = addDays(cursor, 1);
    }
    return days;
  }, [currentMonth, tasks]);

  return (
    <div
      className="mx-4 mt-2 mb-3 px-4 pt-4 pb-4 rounded-[32px]"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 min-w-0">
          {currentStreak > 0 && (
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#222222] text-white text-[12px] font-extrabold leading-none whitespace-nowrap shrink-0">
              <StreakFire size={16} />
              <span>连续{currentStreak}天</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-0 shrink-0">
          <button
            onClick={onPrevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-xl active:scale-90 transition-all"
          >
            <ChevronLeft size={18} className="text-[#222222]/55" />
          </button>
          <button
            onClick={onToggleView}
            className="px-3 h-8 flex items-center justify-center rounded-full bg-[#F7F7F7] text-[11px] font-extrabold text-[#222222] active:scale-95 transition-all whitespace-nowrap"
          >
            周视图
          </button>
          <button
            onClick={onNextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-xl active:scale-90 transition-all"
          >
            <ChevronRight size={18} className="text-[#222222]/55" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-[11px] font-bold text-black/45 py-1"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {calendarDays.map((day) => {
          const isSelected = day.dateStr === selectedDate;
          const allDone =
            day.tasksTotal > 0 && day.tasksCompleted === day.tasksTotal;
          const isFuture = !day.isToday && !day.isPast;
          const dayNumberStyles = allDone
            ? {
                backgroundColor: "#222222",
                color: "#FFFFFF",
              }
            : isSelected && day.isToday
            ? {
                backgroundColor: "#FFFFFF",
                color: "#D76D9C",
              }
            : isSelected
            ? {
                backgroundColor: "rgba(255,255,255,0.9)",
                color: "#222222",
              }
            : day.isToday
            ? {
                backgroundColor: "rgba(215,109,156,0.18)",
                color: "#D76D9C",
              }
            : isFuture
            ? {
                backgroundColor: "rgba(255,255,255,0.35)",
                color: "rgba(34,34,34,0.45)",
              }
            : {
                backgroundColor: "#FFFFFF",
                color: "#222222",
              };

          return (
            <button
              key={day.dateStr}
              onClick={() => onSelectDate(day.dateStr)}
              className={`
                flex flex-col items-center justify-center py-1 rounded-xl transition-all
                ${!day.isCurrentMonth ? "opacity-30" : ""}
              `}
            >
              <div
                className="w-9 h-9 rounded-[12px] flex items-center justify-center text-[13px] font-bold transition-all"
                style={{
                  ...dayNumberStyles,
                  outline: isSelected ? "2px solid rgba(255,255,255,0.75)" : "none",
                  outlineOffset: "0px",
                }}
              >
                {allDone && !isSelected ? "✓" : day.dayOfMonth}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
