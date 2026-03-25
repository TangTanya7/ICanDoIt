import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;

  const task = await prisma.dailyTask.findFirst({
    where: { id, userId },
  });

  if (!task) {
    return NextResponse.json({ error: "任务不存在" }, { status: 404 });
  }

  const body = await req.json();
  const { status, completedAt } = body;

  const updated = await prisma.dailyTask.update({
    where: { id },
    data: {
      status: status ?? task.status,
      completedAt: completedAt ?? (status === "completed" ? new Date().toISOString() : null),
    },
  });

  return NextResponse.json({ task: updated });
}
