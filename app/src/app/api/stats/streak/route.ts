import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const allTasks = await prisma.dailyTask.findMany({
    where: { userId },
    select: { date: true, status: true },
  });

  const dateMap = new Map<string, { total: number; completed: number }>();
  for (const t of allTasks) {
    const entry = dateMap.get(t.date) || { total: 0, completed: 0 };
    entry.total++;
    if (t.status === "completed") entry.completed++;
    dateMap.set(t.date, entry);
  }

  let currentStreak = 0;
  let bestStreak = 0;
  let streak = 0;

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  const sortedDates = Array.from(dateMap.keys()).sort().reverse();

  let checkingCurrent = true;
  for (const dateStr of sortedDates) {
    const entry = dateMap.get(dateStr)!;
    if (entry.total > 0 && entry.completed === entry.total) {
      streak++;
      if (checkingCurrent) currentStreak = streak;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      if (checkingCurrent && dateStr !== todayStr) {
        checkingCurrent = false;
      }
      if (checkingCurrent && dateStr === todayStr) {
        continue;
      }
      bestStreak = Math.max(bestStreak, streak);
      streak = 0;
      checkingCurrent = false;
    }
  }
  bestStreak = Math.max(bestStreak, streak);

  const totalCompleted = allTasks.filter((t) => t.status === "completed").length;

  const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");

  let thisWeekCompleted = 0;
  let thisWeekTotal = 0;
  for (const t of allTasks) {
    if (t.date >= weekStart && t.date <= weekEnd) {
      thisWeekTotal++;
      if (t.status === "completed") thisWeekCompleted++;
    }
  }

  return NextResponse.json({
    streak: {
      currentStreak,
      bestStreak,
      totalCompleted,
      thisWeekCompleted,
      thisWeekTotal,
    },
  });
}
