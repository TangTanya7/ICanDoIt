import { DailyTask, Goal, StreakInfo, WeekDay } from "@/types";
import {
  startOfWeek,
  addDays,
  format,
  isToday,
  isBefore,
  startOfDay,
} from "date-fns";

export const mockGoals: Goal[] = [
  {
    id: "g1",
    title: "学习英语口语",
    category: "language",
    icon: "🗣️",
    startDate: "2026-03-01",
    endDate: "2026-04-30",
    totalDays: 60,
    completedDays: 15,
    currentStreak: 5,
    bestStreak: 7,
    color: "coral",
    description: "从零基础到能进行日常英语对话",
    dailyMinutes: 25,
    status: "active",
    phases: [
      {
        id: "g1p1",
        phaseNumber: 1,
        title: "听力启蒙",
        description: "培养英语语感，大量输入",
        skills: ["基础发音", "日常短语", "听力理解"],
        startDay: 1,
        endDay: 15,
        totalTasks: 15,
        completedTasks: 15,
        status: "completed",
      },
      {
        id: "g1p2",
        phaseNumber: 2,
        title: "跟读模仿",
        description: "跟读 TED/播客，模仿语调节奏",
        skills: ["语调模仿", "连读技巧", "场景表达"],
        startDay: 16,
        endDay: 30,
        totalTasks: 15,
        completedTasks: 4,
        status: "active",
      },
      {
        id: "g1p3",
        phaseNumber: 3,
        title: "场景对话",
        description: "模拟真实场景进行对话练习",
        skills: ["餐厅点餐", "问路出行", "社交闲聊"],
        startDay: 31,
        endDay: 45,
        totalTasks: 15,
        completedTasks: 0,
        status: "upcoming",
      },
      {
        id: "g1p4",
        phaseNumber: 4,
        title: "自由表达",
        description: "脱稿表达观点，自信开口",
        skills: ["观点表达", "即兴回答", "讲故事"],
        startDay: 46,
        endDay: 60,
        totalTasks: 15,
        completedTasks: 0,
        status: "upcoming",
      },
    ],
  },
  {
    id: "g2",
    title: "每天阅读",
    category: "reading",
    icon: "📚",
    startDate: "2026-03-10",
    endDate: "2026-05-10",
    totalDays: 60,
    completedDays: 8,
    currentStreak: 5,
    bestStreak: 5,
    color: "blue",
    description: "养成每日阅读习惯，读完3本好书",
    dailyMinutes: 20,
    status: "active",
    phases: [
      {
        id: "g2p1",
        phaseNumber: 1,
        title: "习惯养成",
        description: "阅读《掌控习惯》，学习习惯建设方法论",
        skills: ["阅读习惯", "笔记方法", "知识提取"],
        startDay: 1,
        endDay: 20,
        totalTasks: 20,
        completedTasks: 8,
        status: "active",
      },
      {
        id: "g2p2",
        phaseNumber: 2,
        title: "深度阅读",
        description: "阅读《认知觉醒》，提升思维深度",
        skills: ["批判思维", "深度笔记", "知识关联"],
        startDay: 21,
        endDay: 40,
        totalTasks: 20,
        completedTasks: 0,
        status: "upcoming",
      },
      {
        id: "g2p3",
        phaseNumber: 3,
        title: "输出实践",
        description: "阅读《学会写作》，用输出倒逼输入",
        skills: ["读书笔记", "书评写作", "知识分享"],
        startDay: 41,
        endDay: 60,
        totalTasks: 20,
        completedTasks: 0,
        status: "upcoming",
      },
    ],
  },
  {
    id: "g3",
    title: "学画画",
    category: "art",
    icon: "🎨",
    startDate: "2026-03-15",
    endDate: "2026-06-15",
    totalDays: 90,
    completedDays: 4,
    currentStreak: 3,
    bestStreak: 3,
    color: "green",
    description: "零基础学简笔画和色块插画",
    dailyMinutes: 15,
    status: "active",
    phases: [
      {
        id: "g3p1",
        phaseNumber: 1,
        title: "基础造型",
        description: "学习基础形状和线条，从几何体开始",
        skills: ["基础线条", "几何形状", "比例关系"],
        startDay: 1,
        endDay: 15,
        totalTasks: 15,
        completedTasks: 4,
        status: "active",
      },
      {
        id: "g3p2",
        phaseNumber: 2,
        title: "可爱动物",
        description: "用色块画各种萌系小动物",
        skills: ["动物造型", "色块填充", "表情设计"],
        startDay: 16,
        endDay: 40,
        totalTasks: 25,
        completedTasks: 0,
        status: "upcoming",
      },
      {
        id: "g3p3",
        phaseNumber: 3,
        title: "场景插画",
        description: "组合元素创作完整场景插画",
        skills: ["构图设计", "色彩搭配", "场景组合"],
        startDay: 41,
        endDay: 70,
        totalTasks: 30,
        completedTasks: 0,
        status: "upcoming",
      },
      {
        id: "g3p4",
        phaseNumber: 4,
        title: "个人风格",
        description: "形成自己的绘画风格，创作原创作品",
        skills: ["风格探索", "原创设计", "系列创作"],
        startDay: 71,
        endDay: 90,
        totalTasks: 20,
        completedTasks: 0,
        status: "upcoming",
      },
    ],
  },
];

const today = new Date();
const todayStr = format(today, "yyyy-MM-dd");
const yesterdayStr = format(addDays(today, -1), "yyyy-MM-dd");
const twoDaysAgoStr = format(addDays(today, -2), "yyyy-MM-dd");
const tomorrowStr = format(addDays(today, 1), "yyyy-MM-dd");

export const mockTasks: DailyTask[] = [
  // today
  {
    id: "t1",
    goalId: "g1",
    goalTitle: "学习英语口语",
    title: "看一集TED演讲",
    description: "跟读并记录3个新表达",
    date: todayStr,
    status: "pending",
    color: "coral",
    icon: "🗣️",
    resourceUrl: "https://www.bilibili.com/video/BV14y4y1F7Af/",
    resourceTitle: "【TEDx】如何在六个月内学会任何一门外语",
    resourcePlatform: "B站",
    estimatedMinutes: 25,
  },
  {
    id: "t2",
    goalId: "g2",
    goalTitle: "每天阅读",
    title: "阅读《掌控习惯》第3章",
    description: "重点标注习惯叠加的方法",
    date: todayStr,
    status: "pending",
    color: "blue",
    icon: "📚",
    resourceUrl: "https://weread.qq.com/book-detail?type=1&senderVid=13960881&v=bcb32150719afe3bbcbad52",
    resourceTitle: "《掌控习惯》- 微信读书",
    resourcePlatform: "微信读书",
    estimatedMinutes: 20,
  },
  {
    id: "t3",
    goalId: "g3",
    goalTitle: "学画画",
    title: "临摹一个简笔小动物",
    description: "用色块风格画一只猫",
    date: todayStr,
    status: "pending",
    color: "green",
    icon: "🎨",
    resourceUrl: "https://www.bilibili.com/video/BV1mE411W7tC/",
    resourceTitle: "简笔画小可爱 - 教你画小猫小狗",
    resourcePlatform: "B站",
    estimatedMinutes: 15,
  },
  // yesterday (all done)
  {
    id: "t4",
    goalId: "g1",
    goalTitle: "学习英语口语",
    title: "学习10个日常短语",
    description: "早餐场景对话练习",
    date: yesterdayStr,
    status: "completed",
    color: "coral",
    icon: "🗣️",
    estimatedMinutes: 20,
    completedAt: `${yesterdayStr}T09:30:00`,
  },
  {
    id: "t5",
    goalId: "g2",
    goalTitle: "每天阅读",
    title: "阅读《掌控习惯》第2章",
    description: "理解习惯回路的四步模型",
    date: yesterdayStr,
    status: "completed",
    color: "blue",
    icon: "📚",
    estimatedMinutes: 20,
    completedAt: `${yesterdayStr}T21:00:00`,
  },
  {
    id: "t6",
    goalId: "g3",
    goalTitle: "学画画",
    title: "画3个基础形状",
    description: "圆形、三角形、方形的变形练习",
    date: yesterdayStr,
    status: "completed",
    color: "green",
    icon: "🎨",
    estimatedMinutes: 15,
    completedAt: `${yesterdayStr}T20:15:00`,
  },
  // 2 days ago
  {
    id: "t7",
    goalId: "g1",
    goalTitle: "学习英语口语",
    title: "听力练习15分钟",
    description: "BBC Learning English 跟读",
    date: twoDaysAgoStr,
    status: "completed",
    color: "coral",
    icon: "🗣️",
    estimatedMinutes: 15,
    completedAt: `${twoDaysAgoStr}T08:00:00`,
  },
  {
    id: "t8",
    goalId: "g2",
    goalTitle: "每天阅读",
    title: "阅读《掌控习惯》第1章",
    description: "了解习惯的复利效应",
    date: twoDaysAgoStr,
    status: "completed",
    color: "blue",
    icon: "📚",
    estimatedMinutes: 20,
    completedAt: `${twoDaysAgoStr}T22:00:00`,
  },
  // tomorrow
  {
    id: "t9",
    goalId: "g1",
    goalTitle: "学习英语口语",
    title: "情景对话练习",
    description: "餐厅点餐场景角色扮演",
    date: tomorrowStr,
    status: "pending",
    color: "coral",
    icon: "🗣️",
    estimatedMinutes: 20,
  },
  {
    id: "t10",
    goalId: "g2",
    goalTitle: "每天阅读",
    title: "阅读《掌控习惯》第4章",
    description: "学习如何让习惯变得有吸引力",
    date: tomorrowStr,
    status: "pending",
    color: "blue",
    icon: "📚",
    estimatedMinutes: 20,
  },
];

export function getTasksForDate(dateStr: string): DailyTask[] {
  return mockTasks.filter((t) => t.date === dateStr);
}

export function getWeekDays(referenceDate: Date = new Date()): WeekDay[] {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const days: WeekDay[] = [];
  const dayLabels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const tasks = getTasksForDate(dateStr);
    const completed = tasks.filter((t) => t.status === "completed").length;
    const todayFlag = isToday(date);
    const pastDay = isBefore(startOfDay(date), startOfDay(new Date()));

    let status: WeekDay["status"] = "future";
    if (todayFlag) {
      status = completed === tasks.length && tasks.length > 0 ? "completed" : "pending";
    } else if (pastDay) {
      if (tasks.length === 0) status = "rest";
      else if (completed === tasks.length) status = "completed";
      else if (completed > 0) status = "partial";
      else status = "missed";
    }

    days.push({
      date,
      dateStr,
      dayOfMonth: date.getDate(),
      dayOfWeek: dayLabels[i],
      isToday: todayFlag,
      status,
      tasksTotal: tasks.length,
      tasksCompleted: completed,
    });
  }
  return days;
}

export const mockStreak: StreakInfo = {
  currentStreak: 5,
  bestStreak: 7,
  totalCompleted: 42,
  thisWeekCompleted: 8,
  thisWeekTotal: 14,
};
