"use client";

import { useState, useMemo } from "react";
import { Goal, DailyTask, GoalPhase } from "@/types";
import { TASK_COLORS } from "@/lib/colors";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  ArrowLeft,
  Flame,
  Clock,
  Calendar,
  Check,
  ExternalLink,
  Brain,
  ChevronDown,
  ChevronUp,
  Trash2,
  Link2,
} from "lucide-react";

interface GoalDetailProps {
  goal: Goal;
  tasks: DailyTask[];
  onBack: () => void;
  onDelete: (goalId: string) => void;
  displayColor?: string;
}

type DetailTab = "plan" | "history";

type PhaseTaskPlan = {
  day: number;
  title: string;
  resource: string;
  platform: string;
  url: string;
  estimatedMinutes?: number;
};

const PHASE_TASKS_MAP: Record<string, PhaseTaskPlan[]> = {
  "基础入门": [
    { day: 1, title: "了解核心概念和基本术语", resource: "入门必看：零基础全解析", platform: "B站", url: "https://www.bilibili.com/video/BV1vp4y1x7FW/" },
    { day: 2, title: "跟练基础教程第 1 课", resource: "英语零基础五合一", platform: "网易云课堂", url: "https://study.163.com/course/introduction/1213597803.htm" },
    { day: 3, title: "阅读入门指南前3章", resource: "《掌控习惯》- 微信读书", platform: "微信读书", url: "https://weread.qq.com/book-detail?type=1&senderVid=13960881&v=bcb32150719afe3bbcbad52" },
    { day: 4, title: "完成基础概念小测验", resource: "学霸是怎样学习的？高效方法", platform: "知乎", url: "https://www.zhihu.com/question/21061778/answer/567040990" },
    { day: 5, title: "跟练基础教程第 2 课", resource: "大人小孩·零基础趣味英语", platform: "网易云课堂", url: "https://study.163.com/series/1001417001.htm" },
    { day: 6, title: "观看入门讲座（附笔记）", resource: "Smash fear, learn anything", platform: "TED", url: "https://www.ted.com/talks/tim_ferriss_smash_fear_learn_anything" },
    { day: 7, title: "复习本周内容并做笔记", resource: "我用了4年的读书笔记体系", platform: "B站", url: "https://www.bilibili.com/video/BV15rg9znEsp/" },
    { day: 8, title: "练习核心动作 / 操作", resource: "零基础手绘课·随学随用", platform: "B站", url: "https://www.bilibili.com/video/BV1Sb411a7LE/" },
    { day: 9, title: "完成基础练习 Set A", resource: "Learning How to Learn", platform: "Coursera", url: "https://www.coursera.org/learn/learning-how-to-learn" },
    { day: 10, title: "跟练基础教程第 3 课", resource: "英语小白零基础课堂·20季", platform: "网易云课堂", url: "https://ke.study.163.com/wap/course/detail/100083543" },
    { day: 11, title: "阅读入门指南第4-5章", resource: "《掌控习惯》- 微信读书", platform: "微信读书", url: "https://weread.qq.com/book-detail?type=1&senderVid=13960881&v=bcb32150719afe3bbcbad52" },
    { day: 12, title: "完成基础练习 Set B", resource: "Learning How to Learn", platform: "Coursera", url: "https://www.coursera.org/learn/learning-how-to-learn" },
    { day: 13, title: "观看进阶概念预习视频", resource: "TED-ED 700集最好英语合集", platform: "B站", url: "https://www.bilibili.com/video/BV1Dk4y1q781/" },
    { day: 14, title: "阶段总结 + 输出回顾", resource: "学霸是怎样学习的？高效方法", platform: "知乎", url: "https://www.zhihu.com/question/21061778/answer/567040990" },
    { day: 15, title: "阶段测试 · 检验成果", resource: "如何自学一个领域？全指南", platform: "知乎", url: "https://www.zhihu.com/question/21061778/answer/567040990" },
  ],
  "技能提升": [
    { day: 1, title: "学习进阶技巧第 1 课", resource: "听力&口语跟读金素材12集全", platform: "B站", url: "https://www.bilibili.com/video/BV1dtYqzeEv2/" },
    { day: 2, title: "专题深度练习 · 技巧A", resource: "Learning How to Learn", platform: "Coursera", url: "https://www.coursera.org/learn/learning-how-to-learn" },
    { day: 3, title: "观看行业专家分享", resource: "The nerd's guide to learning online", platform: "TED", url: "https://www.ted.com/talks/john_green_the_nerd_s_guide_to_learning_everything_online" },
    { day: 4, title: "阅读进阶方法论", resource: "《掌控习惯》- 微信读书", platform: "微信读书", url: "https://weread.qq.com/book-detail?type=1&senderVid=13960881&v=bcb32150719afe3bbcbad52" },
    { day: 5, title: "专题深度练习 · 技巧B", resource: "Learning How to Learn", platform: "Coursera", url: "https://www.coursera.org/learn/learning-how-to-learn" },
    { day: 6, title: "学习进阶技巧第 2 课", resource: "英语零基础五合一", platform: "网易云课堂", url: "https://study.163.com/course/introduction/1213597803.htm" },
    { day: 7, title: "输出学习笔记和心得", resource: "真正读懂一本书·笔记方法", platform: "B站", url: "https://www.bilibili.com/video/BV1Pg411G7CW/" },
    { day: 8, title: "实战模拟练习 · 场景1", resource: "TED精读合集100集", platform: "B站", url: "https://www.bilibili.com/video/BV1vp4y1x7FW/" },
    { day: 9, title: "听专题播客（通勤学）", resource: "高效学习法·音频合集", platform: "喜马拉雅", url: "https://m.ximalaya.com/a/6472943706009600" },
    { day: 10, title: "学习进阶技巧第 3 课", resource: "大人小孩·零基础趣味英语", platform: "网易云课堂", url: "https://study.163.com/series/1001417001.htm" },
    { day: 11, title: "专题深度练习 · 技巧C", resource: "Learning How to Learn", platform: "Coursera", url: "https://www.coursera.org/learn/learning-how-to-learn" },
    { day: 12, title: "实战模拟练习 · 场景2", resource: "TED-ED 700集最好英语合集", platform: "B站", url: "https://www.bilibili.com/video/BV1Dk4y1q781/" },
    { day: 13, title: "阅读案例分析", resource: "《掌控习惯》- 微信读书", platform: "微信读书", url: "https://weread.qq.com/book-detail?type=1&senderVid=13960881&v=bcb32150719afe3bbcbad52" },
    { day: 14, title: "阶段总结 + 作品输出", resource: "学霸是怎样学习的？高效方法", platform: "知乎", url: "https://www.zhihu.com/question/21061778/answer/567040990" },
    { day: 15, title: "阶段测试 · 技能验证", resource: "学霸是怎样学习的？高效方法", platform: "知乎", url: "https://www.zhihu.com/question/21061778/answer/567040990" },
  ],
  "综合实践": [
    { day: 1, title: "模拟实战场景 · 项目启动", resource: "零基础绘画入门全套教程", platform: "B站", url: "https://www.bilibili.com/video/BV1eHwPewEhv/" },
    { day: 2, title: "完成实战项目 Day 1 任务", resource: "听力&口语跟读金素材12集全", platform: "B站", url: "https://www.bilibili.com/video/BV1dtYqzeEv2/" },
    { day: 3, title: "深度研读行业标杆作品", resource: "100天演讲口才速成", platform: "喜马拉雅", url: "https://www.ximalaya.com/a/6537197698945024" },
    { day: 4, title: "完成实战项目 Day 2 任务", resource: "Learning How to Learn", platform: "Coursera", url: "https://www.coursera.org/learn/learning-how-to-learn" },
    { day: 5, title: "学习高级技巧与优化方法", resource: "英语小白零基础课堂·20季", platform: "网易云课堂", url: "https://ke.study.163.com/wap/course/detail/100083543" },
    { day: 6, title: "完成实战项目 Day 3 任务", resource: "Learning How to Learn", platform: "Coursera", url: "https://www.coursera.org/learn/learning-how-to-learn" },
    { day: 7, title: "复盘本周实战进展", resource: "《掌控习惯》- 微信读书", platform: "微信读书", url: "https://weread.qq.com/book-detail?type=1&senderVid=13960881&v=bcb32150719afe3bbcbad52" },
    { day: 8, title: "观看行业大咖深度访谈", resource: "How to learn any language", platform: "TED", url: "https://www.ted.com/talks/rahaf_abuobeid_how_to_learn_any_language" },
    { day: 9, title: "完成综合挑战 · 上半部分", resource: "TED精读合集100集", platform: "B站", url: "https://www.bilibili.com/video/BV1vp4y1x7FW/" },
    { day: 10, title: "完成综合挑战 · 下半部分", resource: "TED-ED 700集最好英语合集", platform: "B站", url: "https://www.bilibili.com/video/BV1Dk4y1q781/" },
    { day: 11, title: "学习跨领域融合技巧", resource: "高效学习法·音频合集", platform: "喜马拉雅", url: "https://m.ximalaya.com/a/6472943706009600" },
    { day: 12, title: "优化实战项目成果", resource: "英语零基础五合一", platform: "网易云课堂", url: "https://study.163.com/course/introduction/1213597803.htm" },
    { day: 13, title: "完成个人作品初稿", resource: "学霸是怎样学习的？高效方法", platform: "知乎", url: "https://www.zhihu.com/question/21061778/answer/567040990" },
    { day: 14, title: "收集反馈并迭代改进", resource: "《掌控习惯》- 微信读书", platform: "微信读书", url: "https://weread.qq.com/book-detail?type=1&senderVid=13960881&v=bcb32150719afe3bbcbad52" },
    { day: 15, title: "阶段测试 · 综合评估", resource: "学霸是怎样学习的？高效方法", platform: "知乎", url: "https://www.zhihu.com/question/21061778/answer/567040990" },
  ],
  "自由运用": [
    { day: 1, title: "制定个人创作计划", resource: "The first 20 hours - Josh Kaufman", platform: "YouTube", url: "https://www.youtube.com/watch?v=5MgBikgcWnY" },
    { day: 2, title: "创作个人原创作品 · 第1天", resource: "零基础绘画入门全套教程", platform: "B站", url: "https://www.bilibili.com/video/BV1eHwPewEhv/" },
    { day: 3, title: "挑战高级难度任务", resource: "Learning How to Learn", platform: "Coursera", url: "https://www.coursera.org/learn/learning-how-to-learn" },
    { day: 4, title: "学习展示与表达技巧", resource: "Smash fear, learn anything", platform: "TED", url: "https://www.ted.com/talks/tim_ferriss_smash_fear_learn_anything" },
    { day: 5, title: "创作个人原创作品 · 第2天", resource: "零基础手绘课·随学随用", platform: "B站", url: "https://www.bilibili.com/video/BV1Sb411a7LE/" },
    { day: 6, title: "研究行业前沿动态", resource: "100天演讲口才速成", platform: "喜马拉雅", url: "https://www.ximalaya.com/a/6537197698945024" },
    { day: 7, title: "分享阶段性成果", resource: "学霸是怎样学习的？高效方法", platform: "知乎", url: "https://www.zhihu.com/question/21061778/answer/567040990" },
    { day: 8, title: "创作个人原创作品 · 第3天", resource: "简笔画小可爱·教你画小猫", platform: "B站", url: "https://www.bilibili.com/video/BV1mE411W7tC/" },
    { day: 9, title: "听行业前辈经验分享", resource: "高效学习法·音频合集", platform: "喜马拉雅", url: "https://m.ximalaya.com/a/6472943706009600" },
    { day: 10, title: "挑战极限难度任务", resource: "Learning How to Learn", platform: "Coursera", url: "https://www.coursera.org/learn/learning-how-to-learn" },
    { day: 11, title: "完善和优化所有作品", resource: "英语零基础五合一", platform: "网易云课堂", url: "https://study.163.com/course/introduction/1213597803.htm" },
    { day: 12, title: "建立个人学习体系", resource: "《掌控习惯》- 微信读书", platform: "微信读书", url: "https://weread.qq.com/book-detail?type=1&senderVid=13960881&v=bcb32150719afe3bbcbad52" },
    { day: 13, title: "撰写学习总结与心得", resource: "学霸是怎样学习的？高效方法", platform: "知乎", url: "https://www.zhihu.com/question/21061778/answer/567040990" },
    { day: 14, title: "分享成果到社区", resource: "学霸是怎样学习的？高效方法", platform: "知乎", url: "https://www.zhihu.com/question/21061778/answer/567040990" },
    { day: 15, title: "🎉 目标达成 · 里程碑庆祝", resource: "高效学习法·音频合集", platform: "喜马拉雅", url: "https://m.ximalaya.com/a/6472943706009600" },
  ],
};

const PHASE_TASK_KEY_MAP: Record<string, keyof typeof PHASE_TASKS_MAP> = {
  听力启蒙: "基础入门",
  跟读模仿: "技能提升",
  场景对话: "综合实践",
  自由表达: "自由运用",
  习惯养成: "基础入门",
  深度阅读: "技能提升",
  输出实践: "综合实践",
  基础造型: "基础入门",
  可爱动物: "技能提升",
  场景插画: "综合实践",
  个人风格: "自由运用",
};

const PHASE_TASK_MINUTES_MAP: Record<keyof typeof PHASE_TASKS_MAP, number[]> = {
  基础入门: [12, 18, 15, 10, 20, 16, 14, 22, 18, 20, 15, 18, 16, 14, 12],
  技能提升: [20, 22, 16, 15, 22, 20, 14, 25, 18, 20, 22, 25, 16, 18, 20],
  综合实践: [18, 25, 20, 25, 18, 25, 15, 16, 28, 28, 18, 20, 30, 18, 20],
  自由运用: [12, 30, 28, 16, 30, 18, 15, 30, 18, 30, 22, 16, 20, 18, 10],
};

const PLATFORM_COLORS: Record<string, string> = {
  "B站": "#FB7299",
  "TED": "#E62B1E",
  "微信读书": "#1AAD19",
  "网易云课堂": "#C20C0C",
  "知乎": "#0066FF",
  "得到": "#DE9B47",
  "Coursera": "#0056D2",
  "YouTube": "#FF0000",
  "喜马拉雅": "#F5602E",
};

function getPhaseTasksForPhase(phase: GoalPhase): PhaseTaskPlan[] {
  const phaseKey = PHASE_TASK_KEY_MAP[phase.title] ?? "基础入门";
  return PHASE_TASKS_MAP[phaseKey].map((task, index) => ({
    ...task,
    estimatedMinutes:
      task.estimatedMinutes ?? PHASE_TASK_MINUTES_MAP[phaseKey][index] ?? 15,
  }));
}

export default function GoalDetail({ goal, tasks, onBack, onDelete, displayColor }: GoalDetailProps) {
  const colors = TASK_COLORS[goal.color];
  const [activeTab, setActiveTab] = useState<DetailTab>("plan");
  const [expandedPhase, setExpandedPhase] = useState<string | null>(
    goal.phases.find((p) => p.status === "active")?.id ?? null
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const goalTasks = useMemo(
    () => tasks.filter((t) => t.goalId === goal.id),
    [tasks, goal.id]
  );

  const tasksByDate = useMemo(() => {
    const grouped: Record<string, DailyTask[]> = {};
    goalTasks.forEach((t) => {
      if (!grouped[t.date]) grouped[t.date] = [];
      grouped[t.date].push(t);
    });
    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
  }, [goalTasks]);

  const progress = goal.totalDays > 0 ? goal.completedDays / goal.totalDays : 0;

  return (
    <div className="flex-1 overflow-y-auto pb-28 no-scrollbar bg-[#FBFBFB]">
      <div className="px-5 pt-4 pb-5">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-[13px] font-bold text-black/55 active:scale-95 transition-transform"
          >
            <ArrowLeft size={18} />
            返回
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1 text-[12px] font-bold text-[#E06262] active:scale-95 transition-transform px-2 py-1 rounded-lg"
          >
            <Trash2 size={14} />
            删除
          </button>
        </div>

        <div
          className="rounded-[32px] p-4 mb-3"
          style={{ backgroundColor: displayColor ?? colors.block }}
        >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-14 h-14 rounded-[18px] flex items-center justify-center text-3xl"
            style={{ backgroundColor: "rgba(255,255,255,0.72)" }}
          >
            {goal.icon}
          </div>
          <div className="flex-1">
            <h1 className="text-[22px] font-extrabold text-[#222222]">{goal.title}</h1>
            <p className="text-[13px] text-black/60 font-medium mt-0.5">{goal.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1">
            <Flame size={14} className="text-[#222222]" />
            <span className="text-[13px] font-bold text-[#222222]">{goal.currentStreak}天</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={13} className="text-black/40" />
            <span className="text-[13px] font-semibold text-black/60">第{goal.completedDays + 1}天</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={13} className="text-black/40" />
            <span className="text-[13px] font-semibold text-black/60">每天{goal.dailyMinutes}min</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-black/60">
              总进度 · {goal.completedDays}/{goal.totalDays}天
            </span>
            <span className="text-[12px] font-extrabold text-[#222222]">
              {Math.round(progress * 100)}%
            </span>
          </div>
          <div className="h-2 bg-white/55 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progress * 100}%`, backgroundColor: "#222222" }}
            />
          </div>
        </div>
        </div>
      </div>

      <div className="px-4 mb-3">
        <div className="flex rounded-[24px] p-1 bg-[#F7DFE8]">
          <button
            onClick={() => setActiveTab("plan")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[18px] text-[13px] font-bold transition-all ${
              activeTab === "plan" ? "bg-white text-[#222222]" : "text-black/55"
            }`}
          >
            <Brain size={15} />
            规划方案
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[18px] text-[13px] font-bold transition-all ${
              activeTab === "history" ? "bg-white text-[#222222]" : "text-black/55"
            }`}
          >
            <Calendar size={15} />
            历史记录
          </button>
        </div>
      </div>

      {activeTab === "plan" ? (
        <PlanView
          goal={goal}
          colors={colors}
          expandedPhase={expandedPhase}
          onTogglePhase={(id) => setExpandedPhase((prev) => (prev === id ? null : id))}
        />
      ) : (
        <HistoryView tasksByDate={tasksByDate} colors={colors} goalTasks={goalTasks} />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8" onClick={() => setShowDeleteConfirm(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative bg-white rounded-[30px] p-6 w-full max-w-[300px]"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "bounce-in 0.3s ease-out" }}>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🗑️</div>
              <h3 className="text-[16px] font-extrabold text-[#222222] mb-1">确定删除目标？</h3>
              <p className="text-[13px] text-black/60 font-medium">
                「{goal.title}」的所有规划和历史记录将被清除，此操作不可撤销
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#F7DFE8] text-[13px] font-bold text-[#222222] active:scale-95 transition-all"
              >
                再想想
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); onDelete(goal.id); }}
                className="flex-1 py-2.5 rounded-xl bg-[#222222] text-[13px] font-bold text-white active:scale-95 transition-all"
              >
                确定删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Plan View ===== */
function PlanView({
  goal, colors, expandedPhase, onTogglePhase,
}: {
  goal: Goal;
  colors: { bg: string; text: string; light: string; border: string; block: string; pill: string };
  expandedPhase: string | null;
  onTogglePhase: (id: string) => void;
}) {
  return (
    <div className="px-4">
      <div className="flex items-start gap-2 px-1 mb-4">
        <Brain size={15} className="text-black/35 shrink-0 mt-[1px]" />
        <p className="text-[12px] font-medium text-black/45 leading-[1.5]">
          AI 规划师已为你定制专属计划，共 {goal.phases.length} 个阶段，从基础到进阶循序渐进
        </p>
      </div>

      {!!goal.customResources?.length && (
        <div className="rounded-[24px] p-3 bg-white mb-4">
          <p className="text-[12px] font-extrabold text-[#222222] mb-2">🔗 你上传的学习资料</p>
          <div className="flex flex-col gap-2">
            {goal.customResources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2.5 rounded-[18px] bg-[#FBFBFB]"
              >
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0">
                  <Link2 size={14} className="text-[#222222]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-[#222222] truncate">{resource.title}</p>
                  <p className="text-[10px] font-medium text-black/45 truncate">{resource.url}</p>
                </div>
                <ExternalLink size={14} className="text-black/35 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <div className="absolute left-[19px] top-4 bottom-4 w-[3px] rounded-full" style={{ backgroundColor: colors.border }} />
        <div className="flex flex-col gap-3">
          {goal.phases.map((phase, i) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              index={i}
              isLast={i === goal.phases.length - 1}
              colors={colors}
              isExpanded={expandedPhase === phase.id}
              onToggle={() => onTogglePhase(phase.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PhaseCard({
  phase, index, colors, isExpanded, onToggle,
}: {
  phase: GoalPhase;
  index: number;
  isLast: boolean;
  colors: { bg: string; text: string; light: string; border: string; block: string; pill: string };
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const progress = phase.totalTasks > 0 ? phase.completedTasks / phase.totalTasks : 0;
  const isActive = phase.status === "active";
  const isDone = phase.status === "completed";
  const phaseTasks = getPhaseTasksForPhase(phase);

  return (
    <div className="relative pl-11" style={{ animation: `slide-up 0.4s ease-out ${index * 0.08}s both` }}>
      {/* Timeline Dot */}
      <div className={`absolute left-[11px] top-4 w-[18px] h-[18px] rounded-full border-[3px] z-10 ${
        isDone ? "bg-[#222222] border-[#222222]" : isActive ? "bg-white" : "bg-white border-black/10"
      }`}
        style={isActive ? { borderColor: "#222222" } : isDone ? { borderColor: "#222222", backgroundColor: "#222222" } : {}}>
        {isDone && <Check size={10} className="text-white m-auto mt-[1px] ml-[1px]" strokeWidth={3} />}
        {isActive && <div className="w-2 h-2 rounded-full m-auto mt-[2px]" style={{ backgroundColor: colors.bg }} />}
      </div>

      <button onClick={onToggle} className="w-full text-left">
        <div className={`rounded-[28px] p-3.5 transition-all ${isExpanded ? "rounded-b-none" : ""}`}
          style={{
            backgroundColor: isActive ? colors.block : isDone ? "#F9E6AB" : "#FFFFFF",
          }}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full text-white"
                style={{ backgroundColor: isDone ? "#222222" : isActive ? "#222222" : "#B2BEC3" }}>
                阶段{phase.phaseNumber}
              </span>
              <h4 className="text-[14px] font-extrabold text-[#222222]">{phase.title}</h4>
            </div>
            {isExpanded ? <ChevronUp size={16} className="text-black/35" /> : <ChevronDown size={16} className="text-black/35" />}
          </div>
          <p className="text-[12px] text-black/60 font-medium mb-2">{phase.description}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-[5px] bg-white/55 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${progress * 100}%`, backgroundColor: "#222222" }} />
            </div>
            <span className="text-[11px] font-bold text-black/45 shrink-0">{phase.completedTasks}/{phase.totalTasks}</span>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="rounded-b-[28px] overflow-hidden -mt-1"
          style={{ backgroundColor: "#FFFFFF", animation: "slide-up 0.25s ease-out" }}>
          {phase.skills.length > 0 && (
            <div className="px-3.5 pt-3 pb-2 border-b border-black/6">
              <p className="text-[11px] font-bold text-black/55 mb-1.5">🎯 本阶段技能点</p>
              <div className="flex flex-wrap gap-1.5">
                {phase.skills.map((skill) => (
                  <span key={skill} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: colors.block, color: "#222222" }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="px-3 py-2 flex flex-col gap-1 max-h-[480px] overflow-y-auto">
            <p className="text-[11px] font-bold text-black/55 px-0.5 py-1">
              📋 每日任务（第{phase.startDay}天 ~ 第{phase.endDay}天）
            </p>
            {phaseTasks.map((task) => {
              const absoluteDay = phase.startDay + task.day - 1;
              const isTaskDone = task.day <= phase.completedTasks;
              const platformColor = PLATFORM_COLORS[task.platform] ?? "#999";

              return (
                <div key={task.day}
                  className="flex gap-2.5 p-2.5 rounded-[18px] transition-all bg-[#FBFBFB]">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-extrabold ${
                    isTaskDone ? "bg-[#222222] text-white" : "text-white"
                  }`} style={!isTaskDone ? { backgroundColor: colors.bg + "80" } : {}}>
                    {isTaskDone ? <Check size={12} strokeWidth={3} /> : absoluteDay}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-[12px] font-bold leading-tight ${isTaskDone ? "text-black/35 line-through" : "text-[#222222]"}`}>
                      {task.title}
                    </p>
                    <a href={task.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 mt-1 group">
                      <Link2 size={10} style={{ color: platformColor }} className="shrink-0" />
                      <span className="text-[12px] font-semibold truncate group-hover:underline" style={{ color: platformColor }}>
                        {task.resource}
                      </span>
                      <span className="text-[12px] font-bold text-white px-1.5 py-0.5 rounded shrink-0 leading-none"
                        style={{ backgroundColor: platformColor }}>
                        {task.platform}
                      </span>
                    </a>
                  </div>

                  <span className="text-[10px] font-semibold text-black/35 shrink-0 mt-0.5">
                    {task.estimatedMinutes}min
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== History View ===== */
function HistoryView({
  tasksByDate, colors, goalTasks,
}: {
  tasksByDate: [string, DailyTask[]][];
  colors: { bg: string; text: string; light: string; border: string; block: string; pill: string };
  goalTasks: DailyTask[];
}) {
  const completedCount = goalTasks.filter((t) => t.status === "completed").length;

  return (
    <div className="px-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 p-3 text-center rounded-[24px]" style={{ backgroundColor: "#F9E6AB" }}>
          <p className="text-2xl font-extrabold text-[#222222]">{completedCount}</p>
          <p className="text-[11px] font-bold text-black/55">已完成</p>
        </div>
        <div className="flex-1 p-3 text-center rounded-[24px]" style={{ backgroundColor: "#F7DFE8" }}>
          <p className="text-2xl font-extrabold text-[#222222]">{goalTasks.length}</p>
          <p className="text-[11px] font-bold text-black/55">总任务</p>
        </div>
        <div className="flex-1 p-3 text-center rounded-[24px]" style={{ backgroundColor: "#D1DFFA" }}>
          <p className="text-2xl font-extrabold text-[#222222]">
            {goalTasks.length > 0 ? Math.round((completedCount / goalTasks.length) * 100) : 0}%
          </p>
          <p className="text-[11px] font-bold text-black/55">完成率</p>
        </div>
      </div>

      {tasksByDate.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">📭</p>
          <p className="text-sm text-black/55 font-medium">暂无历史记录</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {tasksByDate.map(([dateStr, dateTasks]) => (
            <div key={dateStr}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#222222]" />
                <span className="text-[12px] font-bold text-black/55">
                  {format(parseISO(dateStr), "M月d日 EEEE", { locale: zhCN })}
                </span>
                <span className="text-[11px] font-semibold text-black/35">
                  {dateTasks.filter((t) => t.status === "completed").length}/{dateTasks.length}
                </span>
              </div>
              <div className="pl-3 flex flex-col gap-2">
                {dateTasks.map((task) => (
                  <HistoryTaskItem key={task.id} task={task} colors={colors} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryTaskItem({
  task, colors,
}: {
  task: DailyTask;
  colors: { bg: string; text: string; light: string; border: string; block: string; pill: string };
}) {
  const isDone = task.status === "completed";
  return (
    <div className={`flex items-center gap-3 p-3 rounded-[20px] transition-all ${isDone ? "" : "opacity-60"}`}
      style={{ backgroundColor: isDone ? colors.block : "#FFFFFF" }}>
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isDone ? "bg-[#222222]" : "bg-black/10"}`}>
        {isDone ? <Check size={14} className="text-white" strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-black/25" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-bold truncate ${isDone ? "text-[#222222]" : "text-black/35 line-through"}`}>{task.title}</p>
        <p className="text-[11px] text-black/55 font-medium truncate">{task.description}</p>
      </div>
      {task.resourceUrl && isDone && (
        <a href={task.resourceUrl} target="_blank" rel="noopener noreferrer"
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-[#222222]">
          <ExternalLink size={13} className="text-white" />
        </a>
      )}
      <span className="text-[11px] font-semibold text-black/35 shrink-0">{task.estimatedMinutes}min</span>
    </div>
  );
}
