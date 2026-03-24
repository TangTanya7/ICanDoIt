"use client";

import { DailyTask } from "@/types";
import { format, isToday, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Sparkles, PartyPopper } from "lucide-react";

interface DayHeaderProps {
  dateStr: string;
  tasks: DailyTask[];
}

const ENCOURAGEMENTS = [
  "今天也是元气满满的一天 ✨",
  "一小步，一大步 🚀",
  "坚持就是超能力 💪",
  "你比昨天更棒了 🌟",
  "每一天都在变好 🌈",
];

export default function DayHeader({ dateStr, tasks }: DayHeaderProps) {
  const date = parseISO(dateStr);
  const todayFlag = isToday(date);
  const completed = tasks.filter((t) => t.status === "completed").length;
  const total = tasks.length;
  const allDone = total > 0 && completed === total;

  const dayIndex = date.getDay();
  const encouragement = ENCOURAGEMENTS[dayIndex % ENCOURAGEMENTS.length];

  return (
    <div className="px-5 pt-6 pb-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[30px] font-extrabold text-[#222222] flex items-center gap-2 leading-none">
            {todayFlag ? (
              <>
                今天的任务
                {allDone ? (
                  <PartyPopper size={20} className="text-[#222222]" />
                ) : (
                  <Sparkles size={18} className="text-[#222222]" />
                )}
              </>
            ) : (
              format(date, "M月d日 EEEE", { locale: zhCN })
            )}
          </h1>

          {todayFlag && (
            <p className="text-[13px] text-black/55 mt-2 font-medium">
              {allDone ? "太棒了，今天的任务全部搞定！🎉" : encouragement}
            </p>
          )}
        </div>

        {total > 0 && (
          <div className="flex items-end gap-1">
            <span className="text-2xl font-extrabold text-[#222222] leading-none">
              {completed}
            </span>
            <span className="text-sm font-bold text-black/40 leading-none pb-[1px]">
              /{total}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
