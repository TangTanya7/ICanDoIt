"use client";

import { Goal } from "@/types";
import { TASK_COLORS, getCardBackgroundColor } from "@/lib/colors";
import { ChevronRight, Flame, Clock } from "lucide-react";

interface GoalCardProps {
  goal: Goal;
  index: number;
  onClick: (goal: Goal, displayColor: string) => void;
}

export default function GoalCard({ goal, index, onClick }: GoalCardProps) {
  const colors = TASK_COLORS[goal.color];
  const cardBackgroundColor = getCardBackgroundColor(index);
  const progress = goal.totalDays > 0 ? goal.completedDays / goal.totalDays : 0;
  const activePhase = goal.phases.find((p) => p.status === "active");
  const phaseProgress = activePhase
    ? activePhase.completedTasks / activePhase.totalTasks
    : 0;

  return (
    <button
      onClick={() => onClick(goal, cardBackgroundColor)}
      className="w-full text-left"
      style={{ animation: `slide-up 0.4s ease-out ${index * 0.1}s both` }}
    >
      <div
        className="p-4 relative overflow-hidden rounded-[30px]"
        style={{ backgroundColor: cardBackgroundColor }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-[18px] flex items-center justify-center text-2xl shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.7)" }}
          >
            {goal.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[16px] font-extrabold text-[#222222] truncate">
              {goal.title}
            </h3>
            <p className="text-[12px] text-black/60 font-medium mt-0.5">
              {goal.description}
            </p>
          </div>
          <ChevronRight size={20} className="text-black/35 shrink-0" />
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1">
            <Flame size={13} className="text-[#222222]" />
            <span className="text-[12px] font-bold text-[#222222]">
              {goal.currentStreak}天连续
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} className="text-black/40" />
            <span className="text-[12px] font-semibold text-black/60">
              每天{goal.dailyMinutes}分钟
            </span>
          </div>
          <span className="text-[12px] font-bold text-[#222222]">
            已完成 {goal.completedDays}/{goal.totalDays} 天
          </span>
        </div>

        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-black/60">
              总进度
            </span>
            <span className="text-[11px] font-extrabold text-[#222222]">
              {Math.round(progress * 100)}%
            </span>
          </div>
          <div className="h-[7px] bg-white/55 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress * 100}%`,
                backgroundColor: "#222222",
              }}
            />
          </div>
        </div>

        {activePhase && (
          <div
            className="flex items-center gap-2 p-2.5 rounded-[20px] mt-3"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-extrabold text-white shrink-0"
              style={{ backgroundColor: "#222222" }}
            >
              P{activePhase.phaseNumber}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-[#222222] truncate">
                当前阶段：{activePhase.title}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="flex-1 h-[5px] bg-black/8 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${phaseProgress * 100}%`,
                      backgroundColor: "#222222",
                    }}
                  />
                </div>
                <span className="text-[10px] font-bold text-black/45 shrink-0">
                  {activePhase.completedTasks}/{activePhase.totalTasks}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
