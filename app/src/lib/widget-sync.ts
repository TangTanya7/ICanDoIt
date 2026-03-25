import { Capacitor, registerPlugin } from "@capacitor/core";
import type { DailyTask } from "@/types";

interface TaskSyncPlugin {
  syncTasks(options: { tasks: string }): Promise<void>;
}

const TaskSync = registerPlugin<TaskSyncPlugin>("TaskSync");

export async function syncWidgetData(tasks: DailyTask[]) {
  if (!Capacitor.isNativePlatform()) return;

  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 7);

  const todayStr = today.toISOString().slice(0, 10);
  const endStr = endDate.toISOString().slice(0, 10);

  const next7Days = tasks.filter(
    (t) => t.date >= todayStr && t.date <= endStr
  );

  try {
    await TaskSync.syncTasks({ tasks: JSON.stringify(next7Days) });
  } catch {
    // Web 环境或插件未注册时静默失败
  }
}
