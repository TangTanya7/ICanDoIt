package com.icandoit.app;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "TaskSync")
public class TaskSyncPlugin extends Plugin {

    public static final String PREFS_NAME = "icandoit_widget_prefs";
    public static final String KEY_TASKS = "widget_tasks";

    @PluginMethod
    public void syncTasks(PluginCall call) {
        String tasksJson = call.getString("tasks", "[]");

        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putString(KEY_TASKS, tasksJson).apply();

        AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
        ComponentName widgetComponent = new ComponentName(context, QuickStartWidget.class);
        int[] widgetIds = widgetManager.getAppWidgetIds(widgetComponent);
        if (widgetIds.length > 0) {
            QuickStartWidget.updateAllWidgets(context, widgetManager, widgetIds);
        }

        call.resolve();
    }
}
