import { WeekDay } from "@/types";
import {
  startOfWeek,
  addDays,
  format,
  isToday,
  isBefore,
  startOfDay,
} from "date-fns";

export function getWeekDays(referenceDate: Date = new Date()): WeekDay[] {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const days: WeekDay[] = [];
  const dayLabels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const todayFlag = isToday(date);
    const pastDay = isBefore(startOfDay(date), startOfDay(new Date()));

    let status: WeekDay["status"] = "future";
    if (todayFlag) {
      status = "pending";
    } else if (pastDay) {
      status = "rest";
    }

    days.push({
      date,
      dateStr,
      dayOfMonth: date.getDate(),
      dayOfWeek: dayLabels[i],
      isToday: todayFlag,
      status,
      tasksTotal: 0,
      tasksCompleted: 0,
    });
  }
  return days;
}
