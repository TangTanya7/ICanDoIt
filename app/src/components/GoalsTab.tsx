"use client";

import { Goal } from "@/types";
import GoalCard from "@/components/GoalCard";
import { Plus, Sparkles } from "lucide-react";

interface GoalsTabProps {
  goals: Goal[];
  onGoalClick: (goal: Goal, displayColor: string) => void;
  onCreateGoal: () => void;
}

export default function GoalsTab({
  goals,
  onGoalClick,
  onCreateGoal,
}: GoalsTabProps) {
  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  return (
    <div className="flex-1 overflow-y-auto pb-28 no-scrollbar relative bg-[#FBFBFB]">
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start justify-between mb-3 gap-3">
          <div>
            <h1 className="text-[28px] font-extrabold text-[#222222] leading-none">
              我的目标
            </h1>
            <p className="text-[13px] text-black/55 font-medium mt-2">
              {activeGoals.length > 0
                ? `${activeGoals.length} 个目标进行中，继续往前。`
                : "还没有目标，先定一个大的。"}
            </p>
          </div>
          <button
            onClick={onCreateGoal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-[13px] text-white active:scale-95 transition-all"
            style={{
              backgroundColor: "#222222",
            }}
          >
            <Plus size={16} strokeWidth={3} />
            新目标
          </button>
        </div>
      </div>

      {activeGoals.length > 0 && (
        <div className="px-4 flex flex-col gap-3 mb-4">
          {activeGoals.map((goal, i) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              index={i}
              onClick={onGoalClick}
            />
          ))}
        </div>
      )}

      {activeGoals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-8">
          <div className="text-6xl mb-4" style={{ animation: "float 3s ease-in-out infinite" }}>
            🎯
          </div>
          <h3 className="text-lg font-extrabold text-[#222222] mb-2">
            开启你的第一个目标
          </h3>
          <p className="text-sm text-black/55 text-center mb-6">
            告诉我你想做什么，AI 规划师会帮你
            <br />
            拆解成科学的每日小任务
          </p>
          <button
            onClick={onCreateGoal}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white active:scale-95 transition-all"
            style={{
              backgroundColor: "#222222",
            }}
          >
            <Sparkles size={18} />
            创建目标
          </button>
        </div>
      )}

      {completedGoals.length > 0 && (
        <div className="px-4">
          <h2 className="text-[14px] font-extrabold text-black/35 mb-2 px-1">
            已完成的目标
          </h2>
          <div className="flex flex-col gap-2">
            {completedGoals.map((goal, i) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                index={i + activeGoals.length}
                onClick={onGoalClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
