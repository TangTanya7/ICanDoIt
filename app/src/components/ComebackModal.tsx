"use client";

import { useState, useEffect, useCallback } from "react";
import { StreakFire } from "@/components/Doodles";

interface ComebackModalProps {
  daysAway: number;
  previousStreak: number;
  completedTasks: number;
  onClose: () => void;
}

interface ComebackContent {
  greeting: string;
  body: string;
  accent: string;
  bg: string;
  emoji: string;
}

function getComebackContent(
  daysAway: number,
  previousStreak: number,
  completedTasks: number
): ComebackContent {
  if (daysAway <= 1) {
    return {
      emoji: "😎",
      greeting: "充完电回来啦！",
      body: `休息一天刚刚好，${previousStreak} 天的进度稳稳的。`,
      accent: "#7DBB46",
      bg: "#E8F5D9",
    };
  }
  if (daysAway <= 2) {
    return {
      emoji: "✌️",
      greeting: "嘿！你自己回来了！",
      body: "我都还没来得及喊你，你就到了。\n就冲这个自觉性，必须夸一句。",
      accent: "#5E93DD",
      bg: "#DEEAFA",
    };
  }
  if (daysAway <= 3) {
    return {
      emoji: "🤩",
      greeting: "没人催你，你自己来了！",
      body: "说真的，能主动回来的人不多。\n你是那种说到做到的人。",
      accent: "#D5A623",
      bg: "#FDF4D7",
    };
  }
  if (daysAway <= 5) {
    return {
      emoji: "🔥",
      greeting: "你居然自己回来了！",
      body: `${completedTasks} 个任务的底子还在，一个没丢。\n这波回归，属实靠谱。`,
      accent: "#E06262",
      bg: "#FCE4E4",
    };
  }
  if (daysAway <= 7) {
    return {
      emoji: "💪",
      greeting: "一周了，你还是回来了！",
      body: "很多人走了就不会再打开了。\n但你不一样——你回来了，太酷了。",
      accent: "#8B6695",
      bg: "#F0E4F5",
    };
  }
  if (daysAway <= 14) {
    return {
      emoji: "🏆",
      greeting: "你竟然回来了！",
      body: "隔了这么久还能打开，这种自驱力真的稀有。\n之前攒的进度全都在，等你继续。",
      accent: "#5FC9B3",
      bg: "#DDF5F0",
    };
  }
  return {
    emoji: "🌟",
    greeting: "等到你了！",
      body: "不管隔了多久，你选择回来这件事本身\n就已经赢了大多数人。",
    accent: "#F29E55",
    bg: "#FEF0E0",
  };
}

export default function ComebackModal({
  daysAway,
  previousStreak,
  completedTasks,
  onClose,
}: ComebackModalProps) {
  const [phase, setPhase] = useState<"enter" | "visible" | "exit">("enter");
  const content = getComebackContent(daysAway, previousStreak, completedTasks);

  useEffect(() => {
    const t = setTimeout(() => setPhase("visible"), 30);
    return () => clearTimeout(t);
  }, []);

  const handleClose = useCallback(() => {
    setPhase("exit");
    setTimeout(onClose, 350);
  }, [onClose]);

  const overlayOpacity = phase === "visible" ? 1 : 0;
  const cardTransform =
    phase === "enter"
      ? "translateY(40px) scale(0.95)"
      : phase === "exit"
      ? "translateY(20px) scale(0.97)"
      : "translateY(0) scale(1)";
  const cardOpacity = phase === "visible" ? 1 : 0;

  return (
    <div className="absolute inset-0 z-[60] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/35"
        style={{
          opacity: overlayOpacity,
          transition: "opacity 0.3s ease",
        }}
        onClick={handleClose}
      />

      {/* Card */}
      <div
        className="relative w-full mx-4 mb-6 rounded-[32px] overflow-hidden"
        style={{
          backgroundColor: content.bg,
          transform: cardTransform,
          opacity: cardOpacity,
          transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease",
        }}
      >
        <div className="px-6 pt-7 pb-6">
          {/* Emoji */}
          <div
            className="text-[52px] mb-4 leading-none"
            style={{ animation: phase === "visible" ? "bounce-in 0.6s ease-out 0.15s both" : undefined }}
          >
            {content.emoji}
          </div>

          {/* Greeting */}
          <h2 className="text-[24px] font-extrabold text-[#222222] leading-tight mb-2">
            {content.greeting}
          </h2>

          {/* Body */}
          <p className="text-[15px] font-medium text-[#222222]/70 leading-relaxed whitespace-pre-line mb-5">
            {content.body}
          </p>

          {/* Streak reminder */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-[20px] mb-5"
            style={{ backgroundColor: "rgba(255,255,255,0.65)" }}
          >
            <StreakFire size={22} />
            <div className="flex-1">
              <p className="text-[13px] font-extrabold text-[#222222]">
                之前连续 {previousStreak} 天
              </p>
              <p className="text-[11px] font-medium text-black/45">
                累计完成 {completedTasks} 个任务
              </p>
            </div>
            <div
              className="text-[11px] font-extrabold px-2.5 py-1 rounded-full text-white"
              style={{ backgroundColor: content.accent }}
            >
              都还在
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleClose}
            className="w-full py-3.5 rounded-[20px] text-[15px] font-extrabold text-white flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
            style={{ backgroundColor: "#222222" }}
          >
            继续我的旅程
          </button>
        </div>
      </div>
    </div>
  );
}
