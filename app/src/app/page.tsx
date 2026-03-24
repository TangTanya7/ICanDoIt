"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  format,
  addWeeks,
  addMonths,
  isToday,
  isBefore,
  startOfDay,
  parseISO,
  startOfMonth,
} from "date-fns";
import WeekCalendar from "@/components/WeekCalendar";
import MonthCalendar from "@/components/MonthCalendar";
import TaskCard from "@/components/TaskCard";
import DayHeader from "@/components/DayHeader";
import EmptyState from "@/components/EmptyState";
import BottomNav from "@/components/BottomNav";
import GoalsTab from "@/components/GoalsTab";
import GoalDetail from "@/components/GoalDetail";
import CreateGoal from "@/components/CreateGoal";
import Onboarding from "@/components/Onboarding";
import ComebackModal from "@/components/ComebackModal";
import TaskFeedbackToast, { TaskFeedbackInfo } from "@/components/TaskFeedbackToast";
import { DoodleCorner } from "@/components/Doodles";
import { getWeekDays, mockStreak, mockTasks, mockGoals } from "@/lib/mock-data";
import { DailyTask, Goal } from "@/types";

type CalendarView = "week" | "month";
type GoalView = "list" | "detail" | "create";
type Tab = "tasks" | "goals" | "companion" | "profile";

export default function Home() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [calendarView, setCalendarView] = useState<CalendarView>("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [activeTab, setActiveTab] = useState<Tab>("tasks");
  const [tasks, setTasks] = useState<DailyTask[]>(mockTasks);
  const [showReminderSheet, setShowReminderSheet] = useState(false);
  const [showStatsSheet, setShowStatsSheet] = useState(false);
  const [showFeedbackSheet, setShowFeedbackSheet] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [reminderAnchor, setReminderAnchor] = useState("brush");
  const [reminderHour, setReminderHour] = useState(8);
  const [reminderMinute, setReminderMinute] = useState(0);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const REMINDER_ANCHORS = [
    { value: "morning", label: "起床后",  icon: "☀️", defaultHour: 8,  defaultMinute: 0  },
    { value: "brush",   label: "刷牙后",  icon: "🪥", defaultHour: 8,  defaultMinute: 10 },
    { value: "lunch",   label: "午饭后",  icon: "🍚", defaultHour: 12, defaultMinute: 30 },
    { value: "commute", label: "通勤时",  icon: "🚶", defaultHour: 8,  defaultMinute: 30 },
    { value: "dinner",  label: "晚饭后",  icon: "🍽️", defaultHour: 19, defaultMinute: 0  },
    { value: "sleep",   label: "睡觉前",  icon: "🌙", defaultHour: 22, defaultMinute: 0  },
  ];
  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const currentAnchorLabel = REMINDER_ANCHORS.find(a => a.value === reminderAnchor)?.label ?? "刷牙后";
  const reminderTimeLabel = `${String(reminderHour).padStart(2, "0")}:${String(reminderMinute).padStart(2, "0")}`;

  // Goals state
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [goalView, setGoalView] = useState<GoalView>("list");
  const [goalCreateFromOnboarding, setGoalCreateFromOnboarding] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedGoalDisplayColor, setSelectedGoalDisplayColor] = useState<string | null>(null);

  const [comebackDays, setComebackDays] = useState<number | null>(null);
  const [taskFeedback, setTaskFeedback] = useState<TaskFeedbackInfo | null>(null);
  const [simpleToast, setSimpleToast] = useState<{ emoji: string; text: string } | null>(null);

  const showSimpleToast = useCallback((emoji: string, text: string) => {
    setSimpleToast({ emoji, text });
    setTimeout(() => setSimpleToast(null), 3000);
  }, []);

  useEffect(() => {
    const shouldForceOnboarding = process.env.NODE_ENV === "development";
    setShowOnboarding(shouldForceOnboarding || !localStorage.getItem("icandoit_onboarded"));
    setIsHydrated(true);
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    localStorage.setItem("icandoit_onboarded", "1");
    setShowOnboarding(false);
    setActiveTab("goals");
    setGoalView("create");
    setGoalCreateFromOnboarding(true);
  }, []);

  const referenceDate = useMemo(
    () => addWeeks(new Date(), weekOffset),
    [weekOffset]
  );

  const currentMonth = useMemo(
    () => startOfMonth(addMonths(new Date(), monthOffset)),
    [monthOffset]
  );

  const weekDays = useMemo(() => {
    const days = getWeekDays(referenceDate);
    return days.map((day) => {
      const dayTasks = tasks.filter((t) => t.date === day.dateStr);
      const completed = dayTasks.filter(
        (t) => t.status === "completed"
      ).length;
      const pastDay = isBefore(startOfDay(day.date), startOfDay(new Date()));

      let status = day.status;
      if (isToday(day.date)) {
        status =
          completed === dayTasks.length && dayTasks.length > 0
            ? "completed"
            : "pending";
      } else if (pastDay) {
        if (dayTasks.length === 0) status = "rest";
        else if (completed === dayTasks.length) status = "completed";
        else if (completed > 0) status = "partial";
        else status = "missed";
      }

      return {
        ...day,
        tasksTotal: dayTasks.length,
        tasksCompleted: completed,
        status,
      };
    });
  }, [referenceDate, tasks]);

  const selectedTasks = useMemo(
    () => tasks.filter((t) => t.date === selectedDate),
    [tasks, selectedDate]
  );

  const handleToggle = useCallback((taskId: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === taskId);
      if (!target) return prev;

      const isCompleting = target.status !== "completed";
      const next = prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: (isCompleting ? "completed" : "pending") as DailyTask["status"],
              completedAt: isCompleting ? new Date().toISOString() : undefined,
            }
          : t
      );

      if (isCompleting) {
        const todayTasks = next.filter((t) => t.date === selectedDate);
        const todayDone = todayTasks.filter((t) => t.status === "completed").length;
        const allCompleted = next.filter((t) => t.status === "completed").length;

        setTaskFeedback({
          completedCount: todayDone,
          totalCount: todayTasks.length,
          totalCompleted: allCompleted,
          currentStreak: mockStreak.currentStreak,
          isAllDone: todayDone === todayTasks.length,
        });
      }

      return next;
    });
  }, [selectedDate]);

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    if (tab === "goals") {
      setGoalView("list");
      setSelectedGoal(null);
    }
  }, []);

  const handleGoalClick = useCallback((goal: Goal, displayColor: string) => {
    setSelectedGoal(goal);
    setSelectedGoalDisplayColor(displayColor);
    setGoalView("detail");
  }, []);

  const handleGoalCreate = useCallback((newGoal: Goal) => {
    setGoals((prev) => [newGoal, ...prev]);
    setGoalView("list");
  }, []);

  const handleGoalDelete = useCallback((goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
    setSelectedGoal(null);
    setSelectedGoalDisplayColor(null);
    setGoalView("list");
  }, []);

  const selectedDateObj = parseISO(selectedDate);
  const isTodaySelected = isToday(selectedDateObj);
  const isPastSelected = isBefore(
    startOfDay(selectedDateObj),
    startOfDay(new Date())
  );

  if (!isHydrated) {
    return null;
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="mobile-container flex flex-col relative overflow-hidden bg-[#FBFBFB]">

      {/* ===== TASKS TAB ===== */}
      {activeTab === "tasks" && (
        <>
          <div
            className="relative"
            style={{
              background: "#FBFBFB",
            }}
          >
            <AppHeader />

            {calendarView === "week" ? (
              <WeekCalendar
                weekDays={weekDays}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                currentStreak={mockStreak.currentStreak}
                onPrevWeek={() => setWeekOffset((o) => o - 1)}
                onNextWeek={() => setWeekOffset((o) => o + 1)}
                onToggleView={() => setCalendarView("month")}
              />
            ) : (
              <MonthCalendar
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                tasks={tasks}
                currentStreak={mockStreak.currentStreak}
                onSelectDate={setSelectedDate}
                onPrevMonth={() => setMonthOffset((o) => o - 1)}
                onNextMonth={() => setMonthOffset((o) => o + 1)}
                onToggleView={() => setCalendarView("week")}
              />
            )}
          </div>

          <div className="flex-1 overflow-y-auto pb-28 no-scrollbar">
            <DayHeader dateStr={selectedDate} tasks={selectedTasks} />

            {selectedTasks.length === 0 ? (
              <EmptyState isToday={isTodaySelected} isPast={isPastSelected} />
            ) : (
              <div className="px-4 flex flex-col gap-3 pb-4">
                {selectedTasks.map((task, i) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={i}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            )}

            {selectedTasks.length > 0 && isTodaySelected && (
              <div className="text-center py-6 px-8">
                <div className="inline-flex items-center gap-2">
                  <span className="text-sm font-normal text-[#999999]">
                    每天进步一点点，未来可期
                  </span>
                  <span
                    className="text-lg"
                    style={{ animation: "float 3s ease-in-out infinite", color: "#999999" }}
                  >
                    🌱
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ===== GOALS TAB ===== */}
      {activeTab === "goals" && (
        <>
          <div
            className="relative"
            style={{
              background: "#FBFBFB",
            }}
          >
            <AppHeader />
          </div>

          {goalView === "list" && (
            <GoalsTab
              goals={goals}
              onGoalClick={handleGoalClick}
              onCreateGoal={() => {
                if (goals.length >= 3) {
                  showSimpleToast("🧠", "贪多嚼不烂，先把手头的目标做扎实吧");
                  return;
                }
                setGoalView("create");
                setGoalCreateFromOnboarding(false);
              }}
            />
          )}

          {goalView === "detail" && selectedGoal && (
            <GoalDetail
              goal={selectedGoal}
              tasks={tasks}
              onBack={() => {
                setGoalView("list");
                setSelectedGoal(null);
                setSelectedGoalDisplayColor(null);
              }}
              onDelete={handleGoalDelete}
              displayColor={selectedGoalDisplayColor ?? undefined}
            />
          )}

          {goalView === "create" && (
            <CreateGoal
              onBack={() => setGoalView("list")}
              onComplete={handleGoalCreate}
              hideBack={goalCreateFromOnboarding}
            />
          )}
        </>
      )}

      {/* ===== VISION TAB ===== */}
      {activeTab === "companion" && (
        <>
          <div className="relative" style={{ background: "#FBFBFB" }}>
            <AppHeader />
          </div>
          <div className="flex-1 overflow-y-auto pb-28 no-scrollbar" style={{ background: "#FBFBFB" }}>
            <div className="px-5 pt-3 pb-4">
              <h2 className="text-[26px] font-black text-[#222222] mb-1 leading-tight">未来的你</h2>
              <p className="text-[13px] text-black/50 font-medium mb-5">每次打开，都重新看见你想成为的样子</p>

              <div className="flex flex-col gap-6">
                {[
                  {
                    img: "/vision/cafe-chat.jpg",
                    lines: [
                      "我在伦敦街角的咖啡馆，",
                      "老外跟我聊了半小时，",
                      "结束时他问我：",
                      "'你在英国长大的吧？'",
                    ],
                  },
                  {
                    img: "/vision/travel-explore.jpg",
                    lines: [
                      "我一个人逛完了整个巴塞罗那，",
                      "砍价、问路、搭讪全靠嘴，",
                      "导游都省了，",
                      "钱包感谢我。",
                    ],
                  },
                  {
                    img: "/vision/quiet-study.jpg",
                    lines: [
                      "我现在看美剧不开字幕，",
                      "还能听出演员念错台词。",
                      "朋友问我怎么学的，",
                      "我说：每天 10 分钟而已。",
                    ],
                  },
                  {
                    img: "/vision/stage-speech.jpg",
                    lines: [
                      "全英文会议上我直接开麦，",
                      "老板当场 cue 我做主讲。",
                      "散会后同事发消息：",
                      "'你什么时候这么猛的？'",
                    ],
                  },
                ].map((item, i) => {
                  const isEven = i % 2 === 0;
                  return (
                    <div key={i} className={`flex ${isEven ? "flex-row" : "flex-row-reverse"} items-center gap-4`}>
                      <div className="w-[42%] shrink-0" style={{ transform: `rotate(${isEven ? -8 : 8}deg)` }}>
                        <img
                          src={item.img}
                          alt=""
                          className="w-full aspect-[4/3] object-cover rounded-[22px]"
                        />
                      </div>
                      <div className="flex-1 relative">
                        <span className="text-[28px] font-black leading-none opacity-10 absolute -top-2" style={{ [isEven ? "left" : "right"]: 0 }}>
                          &ldquo;
                        </span>
                        <div className="mt-2">
                          {item.lines.map((line, j) => (
                            <p key={j} className="text-[12px] font-bold text-[#222222] leading-relaxed">{line}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 rounded-[24px] p-5 text-center" style={{ backgroundColor: "#F9E6AB" }}>
                <p className="text-[11px] font-bold text-black/45 mb-2">我就是</p>
                <p className="text-[18px] font-black text-[#222222] leading-snug">
                  &ldquo;那个英语贼溜的人&rdquo;
                </p>
                <p className="text-[12px] text-black/50 font-medium mt-2">
                  别人还在犹豫要不要学，我已经在秀了
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ===== PROFILE TAB ===== */}
      {activeTab === "profile" && (
        <>
          <div className="relative" style={{ background: "#FBFBFB" }}>
            <AppHeader />
          </div>
          <div className="flex-1 overflow-y-auto pb-28 no-scrollbar" style={{ background: "#FBFBFB" }}>
            <div className="px-5 pt-3">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-full bg-[#F7DFE8] flex items-center justify-center text-2xl shrink-0">
                  🙋
                </div>
                <div>
                  <h2 className="text-[20px] font-black text-[#222222] leading-tight">我的</h2>
                  <p className="text-[12px] text-black/45 font-medium">坚持学习第 15 天</p>
                </div>
              </div>

              <div className="rounded-[24px] overflow-hidden mb-4" style={{ backgroundColor: "#FFFFFF" }}>
                <button
                  className="w-full flex items-center justify-between px-4 py-3.5 active:bg-black/3 transition-colors"
                  style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
                  onClick={() => { setShowReminderSheet(true); setShowTimePicker(true); }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[16px]">🪝</span>
                    <span className="text-[14px] font-bold text-[#222222]">学习提醒</span>
                  </div>
                  <span className="text-[13px] text-black/45 font-medium">{currentAnchorLabel} · {reminderTimeLabel} ›</span>
                </button>
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[16px]">⏱</span>
                    <span className="text-[14px] font-bold text-[#222222]">每日时长</span>
                  </div>
                  <span className="text-[13px] text-black/45 font-medium">10 分钟 ›</span>
                </div>
              </div>

              <div className="rounded-[24px] overflow-hidden mb-4" style={{ backgroundColor: "#FFFFFF" }}>
                {[
                  { icon: "📊", label: "学习统计", onClick: () => setShowStatsSheet(true) },
                  { icon: "📤", label: "导出学习记录", onClick: () => showSimpleToast("📤", "导出功能即将上线") },
                ].map((item, i, arr) => (
                  <button
                    key={i}
                    onClick={item.onClick}
                    className="w-full flex items-center justify-between px-4 py-3.5 active:bg-black/3 transition-colors"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[16px]">{item.icon}</span>
                      <span className="text-[14px] font-bold text-[#222222]">{item.label}</span>
                    </div>
                    <span className="text-[13px] text-black/30">›</span>
                  </button>
                ))}
              </div>

              <div className="rounded-[24px] overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
                {[
                  { icon: "💬", label: "意见反馈", onClick: () => setShowFeedbackSheet(true) },
                  { icon: "ℹ️", label: "关于", onClick: () => showSimpleToast("ℹ️", "ICanDoIt! v1.0 · 做更好的自己") },
                ].map((item, i, arr) => (
                  <button
                    key={i}
                    onClick={item.onClick}
                    className="w-full flex items-center justify-between px-4 py-3.5 active:bg-black/3 transition-colors"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[16px]">{item.icon}</span>
                      <span className="text-[14px] font-bold text-[#222222]">{item.label}</span>
                    </div>
                    <span className="text-[13px] text-black/30">›</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation */}
      {!(activeTab === "goals" && goalView === "create") && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}

      {/* Task Feedback Toast */}
      {taskFeedback && (
        <TaskFeedbackToast
          feedback={taskFeedback}
          onDone={() => setTaskFeedback(null)}
        />
      )}

      {/* Simple Toast */}
      {simpleToast && (
        <div
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-3 rounded-[20px] shadow-lg whitespace-nowrap"
          style={{
            backgroundColor: "#222222",
            animation: "slide-up 0.3s ease-out",
          }}
        >
          <span className="text-[16px]">{simpleToast.emoji}</span>
          <span className="text-[13px] font-bold text-white">{simpleToast.text}</span>
        </div>
      )}

      {/* Comeback Modal */}
      {comebackDays !== null && (
        <ComebackModal
          daysAway={comebackDays}
          previousStreak={28}
          completedTasks={68}
          onClose={() => setComebackDays(null)}
        />
      )}

      {/* Debug: comeback demo trigger */}
      {activeTab === "tasks" && comebackDays === null && (
        <ComebackDemoTrigger onSelect={setComebackDays} />
      )}

      {/* ===== Feedback Sheet ===== */}
      {showFeedbackSheet && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end" style={{ background: "rgba(0,0,0,0.3)" }} onClick={() => setShowFeedbackSheet(false)}>
          <div className="rounded-t-[32px] px-5 pt-5 pb-8" style={{ backgroundColor: "#FFFFFF" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[17px] font-black text-[#222222]">意见反馈</h3>
              <button className="text-[13px] font-bold" style={{ color: "#D76D9C" }} onClick={() => setShowFeedbackSheet(false)}>取消</button>
            </div>
            <p className="text-[12px] text-black/45 font-medium mb-3">你的想法对我们很重要，说说遇到的问题或建议 👂</p>
            <textarea
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="例如：我希望能设置多个提醒时间..."
              rows={5}
              className="w-full px-4 py-3 rounded-[20px] text-[14px] font-medium text-[#222222] placeholder:text-black/25 focus:outline-none resize-none"
              style={{ backgroundColor: "#F7F7F7" }}
            />
            <button
              onClick={() => {
                if (!feedbackText.trim()) { showSimpleToast("✍️", "请先写点什么再提交哦"); return; }
                setShowFeedbackSheet(false);
                setFeedbackText("");
                showSimpleToast("💬", "已收到，感谢你的反馈！");
              }}
              className="w-full mt-3 py-3.5 rounded-[20px] font-extrabold text-[15px] text-white transition-all active:scale-[0.98]"
              style={{ backgroundColor: "#222222" }}
            >
              提交反馈
            </button>
          </div>
        </div>
      )}

      {/* ===== Stats Sheet ===== */}
      {showStatsSheet && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end" style={{ background: "rgba(0,0,0,0.3)" }} onClick={() => setShowStatsSheet(false)}>
          <div className="rounded-t-[32px] px-5 pt-5 pb-8" style={{ backgroundColor: "#FFFFFF" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[17px] font-black text-[#222222]">学习统计</h3>
              <button className="text-[13px] font-bold" style={{ color: "#D76D9C" }} onClick={() => setShowStatsSheet(false)}>关闭</button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "累计学习天数", value: `${goals.reduce((s, g) => s + g.completedDays, 0) || 15} 天`, icon: "📅" },
                { label: "当前连续打卡", value: `${goals[0]?.currentStreak ?? 5} 天`, icon: "🔥" },
                { label: "完成任务总数", value: `${tasks.filter(t => t.status === "completed").length} 个`, icon: "✅" },
                { label: "进行中目标", value: `${goals.filter(g => g.status === "active").length} 个`, icon: "🎯" },
              ].map((stat, i) => (
                <div key={i} className="rounded-[20px] p-3.5" style={{ backgroundColor: "#F7F7F7" }}>
                  <p className="text-[20px] mb-0.5">{stat.icon}</p>
                  <p className="text-[22px] font-extrabold text-[#222222] leading-none">{stat.value}</p>
                  <p className="text-[11px] text-black/45 font-medium mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="rounded-[20px] p-4" style={{ backgroundColor: "#F7DFE8" }}>
              <p className="text-[13px] font-extrabold text-[#222222] mb-0.5">🏅 你已坚持 15 天</p>
              <p className="text-[12px] font-medium" style={{ color: "rgba(34,34,34,0.6)" }}>继续保持，21 天形成习惯，你快到了！</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== Reminder Sheet ===== */}
      {showReminderSheet && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end" style={{ background: "rgba(0,0,0,0.3)" }} onClick={() => { setShowReminderSheet(false); setShowTimePicker(false); }}>
          <div className="rounded-t-[32px] px-5 pt-5 pb-8" style={{ backgroundColor: "#FFFFFF" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[17px] font-black text-[#222222]">学习提醒</h3>
              <button className="text-[13px] font-bold" style={{ color: "#D76D9C" }} onClick={() => { setShowReminderSheet(false); setShowTimePicker(false); }}>完成</button>
            </div>

            <p className="text-[12px] text-black/45 font-medium mb-3">完成哪个习惯后开始学习？</p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {REMINDER_ANCHORS.map(opt => (
                <button key={opt.value}
                  onClick={() => { setReminderAnchor(opt.value); setReminderHour(opt.defaultHour); setReminderMinute(opt.defaultMinute); setShowTimePicker(true); }}
                  className="py-2.5 rounded-[18px] text-center transition-all"
                  style={{ backgroundColor: reminderAnchor === opt.value ? "#F7DFE8" : "#F7F7F7", boxShadow: reminderAnchor === opt.value ? "inset 0 0 0 1.5px #D76D9C" : "none" }}>
                  <p className="text-[14px] leading-none mb-0.5">{opt.icon}</p>
                  <p className="text-[11px] font-bold" style={{ color: reminderAnchor === opt.value ? "#D76D9C" : "#222222" }}>{opt.label}</p>
                </button>
              ))}
            </div>

            {showTimePicker && (
              <div style={{ animation: "slide-up 0.25s ease-out" }}>
                <p className="text-[12px] text-black/45 font-medium mb-3">大概几点？</p>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <p className="text-[11px] text-black/35 font-bold text-center mb-1.5">时</p>
                    <div className="h-[160px] overflow-y-auto no-scrollbar rounded-[18px]" style={{ backgroundColor: "#F7F7F7" }}>
                      {HOURS.map(h => (
                        <button key={h} onClick={() => setReminderHour(h)}
                          className="w-full py-2.5 text-center text-[15px] font-bold transition-all"
                          style={{ color: reminderHour === h ? "#D76D9C" : "#222222", backgroundColor: reminderHour === h ? "#F7DFE8" : "transparent" }}>
                          {String(h).padStart(2, "0")}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center text-[22px] font-black text-black/20 pb-1">:</div>
                  <div className="flex-1">
                    <p className="text-[11px] text-black/35 font-bold text-center mb-1.5">分</p>
                    <div className="h-[160px] overflow-y-auto no-scrollbar rounded-[18px]" style={{ backgroundColor: "#F7F7F7" }}>
                      {MINUTES.map(m => (
                        <button key={m} onClick={() => setReminderMinute(m)}
                          className="w-full py-2.5 text-center text-[15px] font-bold transition-all"
                          style={{ color: reminderMinute === m ? "#D76D9C" : "#222222", backgroundColor: reminderMinute === m ? "#F7DFE8" : "transparent" }}>
                          {String(m).padStart(2, "0")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Shared Components ===== */
function AppHeader() {
  return (
    <header className="flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top,44px),44px)] pb-2">
      <div className="flex items-center gap-1.5">
        <h1 className="text-[22px] font-extrabold tracking-tight">
          <span style={{ color: "#E06262" }}>I</span>
          <span style={{ color: "#222222" }}>Can</span>
          <span style={{ color: "#5E93DD" }}>Do</span>
          <span style={{ color: "#7DBB46" }}>It</span>
          <span style={{ color: "#D5A623" }}>!</span>
        </h1>
        <DoodleCorner color="#FFD93D" className="opacity-50" />
      </div>
    </header>
  );
}

function ComebackDemoTrigger({ onSelect }: { onSelect: (d: number) => void }) {
  const [open, setOpen] = useState(false);
  const options = [1, 2, 3, 5, 7, 14, 21];
  return (
    <div className="absolute top-[max(env(safe-area-inset-top,44px),44px)] right-4 z-50">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 rounded-full bg-[#222222] text-white text-[11px] font-extrabold flex items-center justify-center active:scale-90 transition-all"
      >
        💬
      </button>
      {open && (
        <div
          className="absolute right-0 top-10 bg-white rounded-[18px] p-2 flex flex-col gap-1 min-w-[120px]"
          style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
        >
          <p className="text-[10px] font-bold text-black/40 px-2 pt-1">模拟断签回归</p>
          {options.map((d) => (
            <button
              key={d}
              onClick={() => { onSelect(d); setOpen(false); }}
              className="text-left px-3 py-1.5 rounded-xl text-[12px] font-bold text-[#222222] hover:bg-[#F7F7F7] active:bg-[#F0F0F0] transition-colors"
            >
              断签 {d} 天
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
