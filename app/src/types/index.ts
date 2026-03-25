export interface User {
  id: string;
  phone: string;
  name: string;
  avatarUrl: string | null;
}

export interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  icon: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  completedDays: number;
  currentStreak: number;
  bestStreak: number;
  color: TaskColor;
  description?: string;
  dailyMinutes: number;
  phases: GoalPhase[];
  customResources?: GoalResource[];
  status: "active" | "paused" | "completed";
}

export interface GoalResource {
  id: string;
  url: string;
  title: string;
  type: "url";
}

export type GoalCategory =
  | "language"
  | "reading"
  | "art"
  | "fitness"
  | "music"
  | "coding"
  | "writing"
  | "other";

export const GOAL_CATEGORY_META: Record<GoalCategory, { label: string; icon: string }> = {
  language: { label: "语言学习", icon: "🗣️" },
  reading:  { label: "阅读写作", icon: "📚" },
  art:      { label: "艺术创作", icon: "🎨" },
  fitness:  { label: "运动健身", icon: "💪" },
  music:    { label: "音乐乐器", icon: "🎵" },
  coding:   { label: "编程技术", icon: "💻" },
  writing:  { label: "写作表达", icon: "✍️" },
  other:    { label: "其他目标", icon: "🎯" },
};

export interface GoalPhase {
  id: string;
  phaseNumber: number;
  title: string;
  description: string;
  skills: string[];
  startDay: number;
  endDay: number;
  totalTasks: number;
  completedTasks: number;
  status: "completed" | "active" | "upcoming";
}

export type TaskColor =
  | "coral"
  | "orange"
  | "blue"
  | "green"
  | "purple"
  | "pink"
  | "teal"
  | "yellow";

export type TaskStatus = "pending" | "completed" | "skipped" | "rest";

export interface DailyTask {
  id: string;
  goalId: string;
  goalTitle: string;
  title: string;
  description: string;
  date: string;
  status: TaskStatus;
  color: TaskColor;
  icon: string;
  resourceUrl?: string;
  resourceTitle?: string;
  resourcePlatform?: string;
  estimatedMinutes: number;
  completedAt?: string;
}

export interface DayInfo {
  date: Date;
  dateStr: string;
  dayOfMonth: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  isPast: boolean;
  isFuture: boolean;
  status: "completed" | "partial" | "missed" | "rest" | "pending" | "future";
  tasksTotal: number;
  tasksCompleted: number;
}

export interface WeekDay {
  date: Date;
  dateStr: string;
  dayOfMonth: number;
  dayOfWeek: string;
  isToday: boolean;
  status: DayInfo["status"];
  tasksTotal: number;
  tasksCompleted: number;
}

export interface StreakInfo {
  currentStreak: number;
  bestStreak: number;
  totalCompleted: number;
  thisWeekCompleted: number;
  thisWeekTotal: number;
}
