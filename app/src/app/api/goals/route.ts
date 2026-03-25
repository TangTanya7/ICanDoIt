import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const goals = await prisma.goal.findMany({
    where: { userId },
    include: {
      phases: { orderBy: { phaseNumber: "asc" } },
      resources: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted = goals.map((g) => ({
    ...g,
    phases: g.phases.map((p) => ({
      ...p,
      skills: JSON.parse(p.skills || "[]"),
    })),
    customResources: g.resources,
  }));

  return NextResponse.json({ goals: formatted });
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title, category, icon, startDate, endDate, totalDays,
      color, description, dailyMinutes, phases, customResources, tasks,
    } = body;

    const goal = await prisma.goal.create({
      data: {
        userId,
        title,
        category,
        icon,
        startDate,
        endDate,
        totalDays,
        color,
        description: description || "",
        dailyMinutes,
        status: "active",
        phases: {
          create: (phases || []).map((p: {
            phaseNumber: number;
            title: string;
            description: string;
            skills: string[];
            startDay: number;
            endDay: number;
            totalTasks: number;
            status: string;
          }) => ({
            phaseNumber: p.phaseNumber,
            title: p.title,
            description: p.description,
            skills: JSON.stringify(p.skills || []),
            startDay: p.startDay,
            endDay: p.endDay,
            totalTasks: p.totalTasks,
            completedTasks: 0,
            status: p.status || "upcoming",
          })),
        },
        resources: {
          create: (customResources || []).map((r: {
            url: string;
            title: string;
            type?: string;
          }) => ({
            url: r.url,
            title: r.title,
            type: r.type || "url",
          })),
        },
      },
      include: {
        phases: { orderBy: { phaseNumber: "asc" } },
        resources: true,
      },
    });

    if (tasks && tasks.length > 0) {
      await prisma.dailyTask.createMany({
        data: tasks.map((t: {
          title: string;
          description: string;
          date: string;
          color: string;
          icon: string;
          resourceUrl?: string;
          resourceTitle?: string;
          resourcePlatform?: string;
          estimatedMinutes?: number;
        }) => ({
          userId,
          goalId: goal.id,
          goalTitle: goal.title,
          title: t.title,
          description: t.description || "",
          date: t.date,
          status: "pending",
          color: t.color || goal.color,
          icon: t.icon || goal.icon,
          resourceUrl: t.resourceUrl,
          resourceTitle: t.resourceTitle,
          resourcePlatform: t.resourcePlatform,
          estimatedMinutes: t.estimatedMinutes || dailyMinutes || 15,
        })),
      });
    }

    const formatted = {
      ...goal,
      phases: goal.phases.map((p) => ({
        ...p,
        skills: JSON.parse(p.skills || "[]"),
      })),
      customResources: goal.resources,
    };

    return NextResponse.json({ goal: formatted });
  } catch (e) {
    console.error("Create goal error:", e);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
