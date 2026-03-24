"use client";

import { useEffect, useState } from "react";

export interface TaskFeedbackInfo {
  completedCount: number;
  totalCount: number;
  totalCompleted: number;
  currentStreak: number;
  isAllDone: boolean;
}

interface TaskFeedbackToastProps {
  feedback: TaskFeedbackInfo;
  onDone: () => void;
}

function pickFeedback(f: TaskFeedbackInfo): { emoji: string; text: string } {
  if (f.isAllDone) {
    if (f.currentStreak >= 30) {
      return { emoji: "🏆", text: `今日满分！你已经连续 ${f.currentStreak} 天全勤了，太强了` };
    }
    if (f.currentStreak >= 7) {
      return { emoji: "🔥", text: `今日全部搞定！连续 ${f.currentStreak} 天，稳得一批` };
    }
    return { emoji: "✨", text: "今天的任务全部完成！明天继续" };
  }

  if (f.totalCompleted === 1) {
    return { emoji: "🎉", text: "完成了你的第一个任务！好的开始" };
  }
  if (f.totalCompleted === 10) {
    return { emoji: "💪", text: "累计完成 10 个任务了，开始有感觉了吧" };
  }
  if (f.totalCompleted === 50) {
    return { emoji: "🚀", text: "50 个任务！已经超过 90% 的人了" };
  }
  if (f.totalCompleted === 100) {
    return { emoji: "👑", text: "第 100 个任务！你是认真的" };
  }
  if (f.totalCompleted % 50 === 0 && f.totalCompleted > 100) {
    return { emoji: "⭐", text: `累计 ${f.totalCompleted} 个任务，持续进化中` };
  }

  const remaining = f.totalCount - f.completedCount;
  if (remaining === 1) {
    return { emoji: "⚡", text: "就差最后一个了，冲！" };
  }

  const phrases = [
    { emoji: "👍", text: `搞定！今天 ${f.completedCount}/${f.totalCount}` },
    { emoji: "✅", text: `又完成一个，还剩 ${remaining} 个` },
    { emoji: "💫", text: `${f.completedCount}/${f.totalCount}，节奏不错` },
  ];
  return phrases[f.totalCompleted % phrases.length];
}

export default function TaskFeedbackToast({ feedback, onDone }: TaskFeedbackToastProps) {
  const [phase, setPhase] = useState<"enter" | "visible" | "exit">("enter");
  const content = pickFeedback(feedback);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("visible"), 30);
    const t2 = setTimeout(() => setPhase("exit"), feedback.isAllDone ? 2800 : 2000);
    const t3 = setTimeout(onDone, feedback.isAllDone ? 3200 : 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone, feedback.isAllDone]);

  const isVisible = phase === "visible";

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      <div
        className={`
          inline-flex items-center gap-2 px-4 py-2.5 rounded-[20px]
          pointer-events-auto
          ${feedback.isAllDone ? "shadow-lg" : "shadow-md"}
        `}
        style={{
          backgroundColor: feedback.isAllDone ? "#222222" : "#FFFFFF",
          transform: isVisible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.95)",
          opacity: phase === "exit" ? 0 : isVisible ? 1 : 0,
          transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease",
        }}
      >
        <span className="text-base leading-none">{content.emoji}</span>
        <span
          className={`text-[13px] font-bold ${
            feedback.isAllDone ? "text-white" : "text-[#222222]"
          }`}
        >
          {content.text}
        </span>
      </div>
    </div>
  );
}
