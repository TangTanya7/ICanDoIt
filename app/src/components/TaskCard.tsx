"use client";

import { DailyTask } from "@/types";
import { TASK_COLORS, getCardBackgroundColor, getCardAccentColor } from "@/lib/colors";
import { ExternalLink, Check, Clock, ChevronRight } from "lucide-react";
import { useState } from "react";

interface TaskCardProps {
  task: DailyTask;
  index: number;
  onToggle: (taskId: string) => void;
}

export default function TaskCard({ task, index, onToggle }: TaskCardProps) {
  const colors = TASK_COLORS[task.color];
  const cardBackgroundColor = getCardBackgroundColor(index);
  const cardAccentColor = getCardAccentColor(index);
  const isDone = task.status === "completed";
  const [isChecking, setIsChecking] = useState(false);

  const handleToggle = () => {
    setIsChecking(true);
    setTimeout(() => {
      onToggle(task.id);
      setIsChecking(false);
    }, 300);
  };

  return (
    <div
      className="relative"
      style={{
        animation: `slide-up 0.4s ease-out ${index * 0.1}s both`,
      }}
    >
      <div
        className={`
          relative overflow-hidden rounded-[28px]
          transition-all duration-300
          ${isDone ? "opacity-70" : "active:scale-[0.985]"}
        `}
        style={{
          backgroundColor: cardBackgroundColor,
        }}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div
              className="w-11 h-11 rounded-[16px] flex items-center justify-center text-xl shrink-0"
              style={{
                backgroundColor: "rgba(255,255,255,0.7)",
              }}
            >
              {task.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="text-[11px] font-extrabold px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: "#222222",
                  }}
                >
                  {task.goalTitle}
                </span>
                <span className="text-[11px] text-black/45 flex items-center gap-0.5 font-semibold">
                  <Clock size={10} />
                  {task.estimatedMinutes}min
                </span>
              </div>

              <h3
                className={`text-[15px] font-extrabold leading-snug mt-1 ${
                  isDone ? "line-through text-black/35" : "text-[#222222]"
                }`}
              >
                {task.title}
              </h3>

              <p className="text-[13px] text-black/65 mt-0.5 leading-relaxed font-medium">
                {task.description}
              </p>
            </div>

            <button
              onClick={handleToggle}
              className={`
                w-8 h-8 rounded-[12px] shrink-0 flex items-center justify-center
                transition-all duration-300 mt-0.5
                ${
                  isDone || isChecking
                    ? ""
                    : "bg-white/72 active:scale-90"
                }
              `}
              style={{
                backgroundColor: isDone || isChecking ? "#222222" : "rgba(255,255,255,0.72)",
              }}
            >
              {(isDone || isChecking) && (
                <Check
                  size={16}
                  strokeWidth={3.5}
                  className="text-white"
                  style={{ animation: "check-pop 0.3s ease-out" }}
                />
              )}
            </button>
          </div>

          {/* Resource Link - prominently displayed */}
          {task.resourceUrl && (
            <a
              href={task.resourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                mt-3 flex items-center gap-2.5 p-3 rounded-[14px] transition-all
                group
                ${isDone ? "opacity-50" : "hover:brightness-[0.97] active:scale-[0.98]"}
              `}
              style={{
                backgroundColor: "#FFFFFF",
              }}
            >
              <div
                className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#222222" }}
              >
                <ExternalLink size={15} className="text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="text-[13px] font-bold truncate leading-tight"
                  style={{ color: cardAccentColor }}
                >
                  {task.resourceTitle}
                </p>
                {task.resourcePlatform && (
                  <p className="text-[11px] text-black/50 mt-0.5 font-semibold">
                    📍 {task.resourcePlatform} · 点击打开
                  </p>
                )}
              </div>

              <ChevronRight
                size={18}
                style={{ color: cardAccentColor }}
                className="shrink-0 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
              />
            </a>
          )}
        </div>

      </div>
    </div>
  );
}
