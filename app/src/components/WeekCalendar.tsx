"use client";

import { WeekDay } from "@/types";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StreakFire } from "@/components/Doodles";

interface WeekCalendarProps {
  weekDays: WeekDay[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  currentStreak: number;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToggleView?: () => void;
}

export default function WeekCalendar({
  weekDays,
  selectedDate,
  onSelectDate,
  currentStreak,
  onPrevWeek,
  onNextWeek,
  onToggleView,
}: WeekCalendarProps) {
  const referenceDate = weekDays[0]?.date ?? new Date();
  const monthLabel = format(referenceDate, "yyyy年M月", { locale: zhCN });

  const completedCount = weekDays.reduce((a, d) => a + d.tasksCompleted, 0);
  const totalCount = weekDays.reduce((a, d) => a + d.tasksTotal, 0);
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

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
            onClick={onPrevWeek}
            className="w-8 h-8 flex items-center justify-center rounded-xl active:scale-90 transition-all"
          >
            <ChevronLeft size={18} className="text-[#222222]/55" />
          </button>
          {onToggleView && (
            <button
              onClick={onToggleView}
              className="px-3 h-8 flex items-center justify-center rounded-full bg-[#F7F7F7] text-[11px] font-extrabold text-[#222222] active:scale-95 transition-all whitespace-nowrap"
            >
              月视图
            </button>
          )}
          <button
            onClick={onNextWeek}
            className="w-8 h-8 flex items-center justify-center rounded-xl active:scale-90 transition-all"
          >
            <ChevronRight size={18} className="text-[#222222]/55" />
          </button>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const isSelected = day.dateStr === selectedDate;
            const allDone = day.status === "completed" && day.tasksTotal > 0;
            const isToday = day.isToday;
            const isFuture = day.status === "future";
            const dayNumberStyles = allDone
              ? {
                  backgroundColor: "#222222",
                  color: "#FFFFFF",
                }
              : isToday
              ? {
                  backgroundColor: "rgba(215,109,156,0.18)",
                  color: "#D76D9C",
                }
              : isSelected
              ? {
                  backgroundColor: "#F9F9F9",
                  color: "#D76D9C",
                }
              : isFuture
              ? {
                  backgroundColor: "#F7F7F7",
                  color: "rgba(34,34,34,0.45)",
                  opacity: 0.7,
                }
              : {
                  backgroundColor: "#F7F7F7",
                  color: "#222222",
                };

            return (
              <button
                key={day.dateStr}
                onClick={() => onSelectDate(day.dateStr)}
                className="flex flex-col items-center transition-all duration-200"
              >
                {/* Day label */}
                <span
                  className="text-[11px] font-extrabold mb-1"
                  style={{
                    color: isSelected
                      ? "#222222"
                      : isToday
                      ? "#D76D9C"
                      : "rgba(34,34,34,0.45)",
                  }}
                >
                  {day.dayOfWeek}
                </span>

                <div
                  className="w-10 h-10 rounded-[14px] flex items-center justify-center font-black text-[16px] transition-all duration-200"
                  style={{
                    ...dayNumberStyles,
                    boxShadow: isSelected && isFuture ? "inset 0 0 0 2px #D76D9C" : "none",
                  }}
                >
                  {allDone && !isSelected ? "✓" : day.dayOfMonth}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 mx-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] font-extrabold text-[#222222]/72">
            本周进度
          </span>
          <span className="text-[13px] font-black text-[#222222]">
            {completedCount}/{totalCount} 个任务
          </span>
        </div>
        <div className="h-[8px] bg-[#F2F2F2] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progressPercent}%`,
              background: "#222222",
            }}
          />
        </div>
      </div>
    </div>
  );
}
