"use client";

import {
  CalendarDays,
  Target,
  Sparkles,
  User,
} from "lucide-react";

type Tab = "tasks" | "goals" | "companion" | "profile";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: typeof CalendarDays }[] = [
  { id: "tasks", label: "今日", icon: CalendarDays },
  { id: "goals", label: "目标", icon: Target },
  { id: "companion", label: "愿景", icon: Sparkles },
  { id: "profile", label: "我的", icon: User },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="absolute bottom-0 left-0 right-0 z-50 pb-2"
    >
      <div className="mx-3 flex items-center justify-around pt-2 pb-1.5 rounded-[28px] bg-white/92 backdrop-blur-xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex flex-col items-center gap-0.5 px-4 py-1 rounded-2xl transition-all duration-200
                ${isActive ? "scale-105" : "active:scale-90"}
              `}
            >
              <div
                className={`
                  w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-200
                  ${
                    isActive
                      ? "bg-[#222222]"
                      : "bg-transparent"
                  }
                `}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-colors ${
                    isActive ? "text-white" : "text-black/30"
                  }`}
                />
              </div>
              <span
                className={`text-[11px] font-bold transition-colors ${
                  isActive ? "text-[#222222]" : "text-black/30"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
