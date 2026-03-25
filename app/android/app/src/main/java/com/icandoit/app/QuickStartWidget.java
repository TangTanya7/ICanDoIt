package com.icandoit.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class QuickStartWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        updateAllWidgets(context, appWidgetManager, appWidgetIds);
        MidnightRefreshReceiver.scheduleMidnightAlarm(context);
    }

    @Override
    public void onEnabled(Context context) {
        MidnightRefreshReceiver.scheduleMidnightAlarm(context);
    }

    @Override
    public void onDisabled(Context context) {
        MidnightRefreshReceiver.cancelMidnightAlarm(context);
    }

    public static void updateAllWidgets(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        SharedPreferences prefs = context.getSharedPreferences(
                TaskSyncPlugin.PREFS_NAME, Context.MODE_PRIVATE);
        String tasksJson = prefs.getString(TaskSyncPlugin.KEY_TASKS, "[]");

        String todayStr = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());

        String taskTitle = null;
        String taskGoal = null;
        int todayTotal = 0;
        int todayDone = 0;

        try {
            JSONArray tasks = new JSONArray(tasksJson);
            for (int i = 0; i < tasks.length(); i++) {
                JSONObject task = tasks.getJSONObject(i);
                String date = task.optString("date", "");
                if (!date.equals(todayStr)) continue;

                todayTotal++;
                String status = task.optString("status", "pending");
                if ("completed".equals(status)) {
                    todayDone++;
                    continue;
                }

                if (taskTitle == null) {
                    taskTitle = task.optString("title", "学习任务");
                    taskGoal = task.optString("goalTitle", "");
                }
            }
        } catch (Exception e) {
            // JSON parse error, use defaults
        }

        for (int widgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_quick_start);

            if (taskTitle != null) {
                views.setTextViewText(R.id.widget_title, taskTitle);
                String subtitle = taskGoal != null && !taskGoal.isEmpty()
                        ? taskGoal + " · " + todayDone + "/" + todayTotal
                        : todayDone + "/" + todayTotal + " 已完成";
                views.setTextViewText(R.id.widget_subtitle, subtitle);
                views.setTextViewText(R.id.widget_action, "GO ›");
            } else if (todayTotal > 0 && todayDone == todayTotal) {
                views.setTextViewText(R.id.widget_title, "今日任务已完成 ✓");
                views.setTextViewText(R.id.widget_subtitle, todayDone + " 个任务全部搞定");
                views.setTextViewText(R.id.widget_action, "👏");
            } else {
                views.setTextViewText(R.id.widget_title, "开始学习");
                views.setTextViewText(R.id.widget_subtitle, "打开 ICanDoIt");
                views.setTextViewText(R.id.widget_action, "GO ›");
            }

            Intent intent = new Intent(context, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                    context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

            appWidgetManager.updateAppWidget(widgetId, views);
        }
    }
}
