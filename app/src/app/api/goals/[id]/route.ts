import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;

  const goal = await prisma.goal.findFirst({
    where: { id, userId },
  });

  if (!goal) {
    return NextResponse.json({ error: "目标不存在" }, { status: 404 });
  }

  await prisma.dailyTask.deleteMany({ where: { goalId: id } });
  await prisma.goalPhase.deleteMany({ where: { goalId: id } });
  await prisma.goalResource.deleteMany({ where: { goalId: id } });
  await prisma.goal.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
