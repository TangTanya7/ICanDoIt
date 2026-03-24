"use client";

interface EmptyStateProps {
  isToday: boolean;
  isPast: boolean;
}

export default function EmptyState({ isToday: todayFlag, isPast }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <div
        className="w-full max-w-[320px] rounded-[32px] p-8 text-center"
        style={{
          animation: "slide-up 0.35s ease-out",
          backgroundColor: todayFlag ? "#F9E6AB" : isPast ? "#F7DFE8" : "#D1DFFA",
        }}
      >
        <div
          className="text-6xl mb-4"
          style={{ animation: "float 3s ease-in-out infinite" }}
        >
          {todayFlag ? "🌱" : isPast ? "😴" : "🔮"}
        </div>
        <h3 className="text-[24px] font-extrabold text-[#222222] mb-1 leading-none">
          {todayFlag
            ? "今天没有安排任务"
            : isPast
            ? "这天是休息日"
            : "未来的日子"}
        </h3>
        <p className="text-[14px] text-black/60 text-center font-medium leading-relaxed">
          {todayFlag
            ? "去设置一个新目标，开始你的旅程吧！"
            : isPast
            ? "适当的休息也是坚持的一部分。"
            : "计划还没排到这里，继续加油就好。"}
        </p>
      </div>
    </div>
  );
}
