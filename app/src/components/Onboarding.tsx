"use client";

import { useState, useEffect } from "react";
import { Sparkles, Zap, Rocket } from "lucide-react";
import { getCardBackgroundColor } from "@/lib/colors";

const PAGE_BACKGROUND = "#FBFBFB";
const PRIMARY_TEXT = "#222222";
const BLOCK_YELLOW = "#F9E6AB";
const BLOCK_PINK = "#F7DFE8";
const BLOCK_BLUE = "#D1DFFA";

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [page, setPage] = useState(0);

  return (
    <div
      className="mobile-container flex flex-col relative overflow-hidden"
      style={{ backgroundColor: PAGE_BACKGROUND, color: PRIMARY_TEXT }}
    >
      <div className="flex-1 flex flex-col" key={page} style={{ animation: "slide-up 0.4s ease-out" }}>
        {page === 0 && <PageOne />}
        {page === 1 && <PageTwo />}
      </div>

      <div className="px-6 pb-[max(env(safe-area-inset-bottom,24px),24px)]">
        {page === 0 ? (
          <button onClick={() => setPage(1)}
            className="w-full py-3.5 rounded-2xl font-extrabold text-[15px] text-white flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
            style={{ backgroundColor: PRIMARY_TEXT }}>
            <Zap size={17} />
            还有一招更绝的
          </button>
        ) : (
          <button onClick={onComplete}
            className="w-full py-4 rounded-2xl font-extrabold text-[16px] text-white flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
            style={{ backgroundColor: PRIMARY_TEXT }}>
            <Rocket size={18} />
            现在冲向未来！
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================ */
/*  Page 1 — 你负责提出目标，AI 负责搞定一切                       */
/* ============================================================ */
function PageOne() {
  const [showPlanningMotion, setShowPlanningMotion] = useState(true);
  const [showPhases, setShowPhases] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
  const [statusText, setStatusText] = useState("✓ 正在生成阶段计划");
  useEffect(() => {
    const timers = [
      setTimeout(() => setStatusText("✓ 正在拆解目标"), 260),
      setTimeout(() => setStatusText("✓ 正在匹配课程"), 760),
      setTimeout(() => setShowPlanningMotion(false), 1380),
      setTimeout(() => setStatusText("✓ 正在生成阶段计划"), 1500),
      setTimeout(() => setShowPhases(true), 1600),
      setTimeout(() => setStatusText("✓ 正在展开第一阶段"), 3020),
      setTimeout(() => setExpandedPhase(0), 3140),
      setTimeout(() => setStatusText("✓ 正在整理课程内容"), 3880),
      setTimeout(() => setStatusText("✓ 规划完成"), 4760),
      setTimeout(() => setExpandedPhase(null), 4940),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  const platforms = [
    "B站", "TED", "Coursera", "微信读书", "喜马拉雅",
    "网易公开课", "YouTube", "多邻国",
  ];
  const phases = [
    { p: "P1", t: "听力启蒙", d: "1-15天", c: "#E06262" },
    { p: "P2", t: "跟读模仿", d: "16-30天", c: "#F29E55" },
    { p: "P3", t: "场景对话", d: "31-45天", c: "#5E93DD" },
    { p: "P4", t: "自由表达", d: "46-60天", c: "#5FC9B3" },
  ];
  const phaseCourses = [
    { title: "TED 演讲精听入门", meta: "TED · 每天 1 节" },
    { title: "英语耳朵唤醒训练", meta: "网易公开课 · 7 节" },
    { title: "高频场景听力清单", meta: "B站 · 跟练合集" },
    { title: "影子跟读练习", meta: "YouTube · 口语专项" },
    { title: "场景词块速记", meta: "微信读书 · 配套清单" },
    { title: "晨读打卡课", meta: "喜马拉雅 · 音频训练" },
  ];

  return (
    <div className="flex-1 flex flex-col px-6 pt-[max(env(safe-area-inset-top,44px),52px)]">
      {/* Title */}
      <div className="text-center mb-5">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-[24px] mb-4"
          style={{ backgroundColor: BLOCK_PINK }}
        >
          <span className="text-4xl">🧠</span>
        </div>
        <h1 className="text-[24px] font-extrabold leading-snug" style={{ color: PRIMARY_TEXT }}>
          你负责<span style={{ color: "#E06262" }}>提出目标</span>
          <br />
          AI 负责<span style={{ color: "#5E93DD" }}>搞定一切</span>
        </h1>
        <p className="text-[13px] font-medium mt-1.5" style={{ color: "rgba(34,34,34,0.7)" }}>
          说出目标 → 15 秒获得<strong style={{ color: PRIMARY_TEXT }}>专属学习方案</strong>
        </p>
      </div>

      {/* Demo Card */}
      <div
        className="rounded-[30px] p-4 mb-3 overflow-hidden flex flex-col h-[282px] shrink-0"
        style={{ backgroundColor: BLOCK_YELLOW }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">💬</span>
          <span className="text-[16px] font-bold" style={{ color: PRIMARY_TEXT }}>「我想 60 天学会英语口语」</span>
        </div>
        <p
          className="text-[12px] font-medium mb-2.5"
          style={{ color: "rgba(34,34,34,0.66)" }}
        >
          🔬 基于认知负荷理论与刻意练习，AI 帮你排好路径
        </p>
        <div
          className="relative overflow-hidden transition-[height] duration-500 ease-out"
          style={{ height: expandedPhase === 0 ? "188px" : "194px" }}
        >
          {showPlanningMotion && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <div className="px-4 py-2 rounded-full bg-white/80">
                <span className="text-[10px] font-bold" style={{ color: "#5E93DD" }}>
                  {`⚡ ${statusText.replace("✓ ", "")}`}
                </span>
              </div>
            </div>
          )}

          <div
            className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out"
            style={{
              opacity: showPlanningMotion ? 1 : 0,
              transform: showPlanningMotion ? "translateY(0)" : "translateY(-12px)",
              pointerEvents: "none",
            }}
          >
            <div
              className="flex flex-col items-center"
              style={{ willChange: "transform, opacity" }}
            >
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{
                      backgroundColor: "#5E93DD",
                      opacity: 0.35,
                      animationDelay: `${dot * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div
            className="absolute inset-0 transition-all duration-500 ease-out"
            style={{
              opacity: showPlanningMotion ? 0 : 1,
              transform: showPlanningMotion ? "translateY(18px)" : "translateY(0)",
            }}
          >
            <div className="flex flex-col">
              {phases.map((item, i) => {
                const isExpanded = expandedPhase === i;
                const isFirstExpanded = expandedPhase === 0 && i === 0;
                const shouldHideWhenExpanded = expandedPhase === 0 && i > 1;
                const shouldShow = showPhases && !shouldHideWhenExpanded;
                return (
                  <div
                    key={item.p}
                    className="overflow-hidden"
                    style={{
                      opacity: shouldShow ? 1 : 0,
                      transform: shouldShow ? "translate3d(0, 0, 0)" : "translate3d(0, 14px, 0)",
                      height: shouldShow ? (isExpanded ? 138 : 44) : 0,
                      marginBottom: shouldShow && i !== phases.length - 1 ? "6px" : "0",
                      transitionProperty: "opacity, transform, height, margin-bottom",
                      transitionDuration: "280ms, 360ms, 520ms, 520ms",
                      transitionTimingFunction:
                        "ease, cubic-bezier(0.22, 1, 0.36, 1), cubic-bezier(0.22, 1, 0.36, 1), cubic-bezier(0.22, 1, 0.36, 1)",
                      transitionDelay:
                        showPhases && expandedPhase === null ? `${i * 180}ms` : "0ms",
                      willChange: "opacity, transform, height, margin-bottom",
                    }}
                  >
                <div
                  className="rounded-[18px] overflow-hidden"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.62)",
                    transition: "all 260ms ease",
                  }}
                >
                  <div className="flex items-center gap-2 px-2.5 h-11">
                    <div
                      className="w-[22px] h-[22px] rounded-md text-[9px] font-extrabold text-white flex items-center justify-center shrink-0"
                      style={{ backgroundColor: item.c }}
                    >
                      {item.p}
                    </div>
                    <span className="text-[12px] font-bold flex-1" style={{ color: PRIMARY_TEXT }}>{item.t}</span>
                    <span className="text-[12px] font-medium" style={{ color: "rgba(34,34,34,0.45)" }}>{item.d} · 15min/天</span>
                  </div>

                  {isFirstExpanded && (
                    <div
                      className="px-2.5 pb-2.5"
                      style={{
                        opacity: isExpanded ? 1 : 0,
                        transform: isExpanded ? "translateY(0)" : "translateY(-8px)",
                        transition:
                          "opacity 360ms ease, transform 420ms cubic-bezier(0.22, 1, 0.36, 1)",
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-[11px] font-bold" style={{ color: "#5E93DD" }}>AI 已为你规划课程</span>
                        <div className="h-[1px] flex-1 bg-black/8" />
                      </div>
                      <div className="h-[48px] overflow-hidden">
                        <div
                          className="flex flex-col gap-1.5"
                          style={{
                            animation: "plan-course-scroll 2s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards",
                          }}
                        >
                          {phaseCourses.map((course) => (
                            <div
                              key={course.title}
                              className="flex items-center gap-2 rounded-[14px] bg-white/88 px-2 py-2"
                            >
                              <div className="w-5 h-5 rounded-full bg-[#5E93DD]/12 flex items-center justify-center shrink-0">
                                <span className="text-[10px]">📘</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold truncate" style={{ color: PRIMARY_TEXT }}>
                                  {course.title}
                                </p>
                                <p className="text-[10px] font-normal truncate" style={{ color: "#666666" }}>
                                  {course.meta}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Platforms */}
      <div
        className="rounded-[26px] p-3 flex flex-col gap-1.5"
        style={{ backgroundColor: BLOCK_PINK }}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-[16px] font-bold whitespace-nowrap" style={{ color: "#E06262" }}>📚 自动匹配优质资源</p>
          <span
            className="px-2.5 py-1 rounded-full text-[11px] font-extrabold"
            style={{ backgroundColor: "#FFFFFF", color: "#E06262" }}
          >
            100+ 平台
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {platforms.map((p, i) => (
            <span
              key={p}
              className="px-2 py-0.5 rounded-lg text-[12px] font-normal"
              style={{
                animation: `slide-up 0.2s ease-out ${0.4 + i * 0.04}s both`,
                backgroundColor: "rgba(255,255,255,0.78)",
                color: "#666666",
              }}
            >
              {p}
            </span>
          ))}
          <span
            className="px-2 py-0.5 rounded-lg text-[12px] font-normal"
            style={{
              animation: `slide-up 0.2s ease-out ${0.4 + platforms.length * 0.04}s both`,
              backgroundColor: "rgba(255,255,255,0.78)",
              color: "#666666",
            }}
          >
            ...
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================ */
/*  Page 2 — 绕过意志力，让坚持唾手可得                            */
/* ============================================================ */
function PageTwo() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex-1 flex flex-col px-6 pt-[max(env(safe-area-inset-top,44px),52px)]">
      {/* Title */}
      <div className="text-center mb-5">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-[24px] mb-4"
          style={{ backgroundColor: BLOCK_YELLOW }}
        >
          <span className="text-4xl">⚡</span>
        </div>
        <h1 className="text-[24px] font-extrabold leading-snug" style={{ color: PRIMARY_TEXT }}>
          绕过意志力
          <br />
          让坚持<span style={{ color: "#7DBB46" }}>唾手可得</span>
        </h1>
      </div>

      {/* Card 1: Desire */}
      <div
        className="rounded-[28px] p-3.5 mb-2.5"
        style={{
          animation: "slide-up 0.3s ease-out",
            backgroundColor: getCardBackgroundColor(0),
        }}
      >
        <div className="flex items-start gap-2.5">
          <span className="text-2xl mt-0.5">🔥</span>
          <div className="flex-1">
              <p className="text-[16px] font-extrabold mb-1" style={{ color: PRIMARY_TEXT }}>先点燃你的「想要」</p>
            <p className="text-[12px] font-medium leading-relaxed" style={{ color: "rgba(34,34,34,0.78)" }}>
              看得到终点的人跑得更远。<br />
              <strong style={{ color: "#E06262" }}>把模糊的「想变好」变成每日小胜利。</strong>
            </p>
            <span className="inline-block mt-1.5 text-[10px] font-bold" style={{ color: "rgba(34,34,34,0.45)" }}>
              📖 《积极思考的另一面》
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Anchor */}
      {step >= 1 && (
        <div
          className="rounded-[28px] p-3.5 mb-2.5"
          style={{
            animation: "slide-up 0.3s ease-out",
            backgroundColor: getCardBackgroundColor(1),
          }}
        >
          <div className="flex items-start gap-2.5">
            <span className="text-2xl mt-0.5">🪝</span>
            <div className="flex-1">
              <p className="text-[16px] font-extrabold mb-1" style={{ color: PRIMARY_TEXT }}>把学习「挂」在旧习惯上</p>
              <p className="text-[12px] font-medium leading-relaxed" style={{ color: "rgba(34,34,34,0.78)" }}>
                <strong style={{ color: "#C79200" }}>刷牙后听英语，午饭后读书。</strong><br />
                新习惯搭旧习惯的便车，自然就做了。
              </p>
              <span className="inline-block mt-1.5 text-[10px] font-bold" style={{ color: "rgba(34,34,34,0.45)" }}>
                📖 《掌控习惯》
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Card 3: Micro */}
      {step >= 2 && (
        <div
          className="rounded-[28px] p-3.5"
          style={{
            animation: "slide-up 0.3s ease-out",
            backgroundColor: getCardBackgroundColor(2),
          }}
        >
          <div className="flex items-start gap-2.5">
            <span className="text-2xl mt-0.5">🧩</span>
            <div className="flex-1">
              <p className="text-[16px] font-extrabold mb-1" style={{ color: PRIMARY_TEXT }}>小到不可能失败</p>
              <p className="text-[12px] font-medium leading-relaxed" style={{ color: "rgba(34,34,34,0.78)" }}>
                <strong style={{ color: "#6B78E6" }}>每个任务只要 5 分钟。</strong><br />
                任务越小，开始越容易，坚持越久。
              </p>
              <span className="inline-block mt-1.5 text-[10px] font-bold" style={{ color: "rgba(34,34,34,0.45)" }}>
                📖 《微习惯》
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
