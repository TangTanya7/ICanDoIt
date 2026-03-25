import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !/^1\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: "请输入正确的11位手机号" },
        { status: 400 }
      );
    }

    if (code !== "123456") {
      return NextResponse.json({ error: "验证码错误" }, { status: 401 });
    }

    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: `用户${phone.slice(-4)}`,
        },
      });
    }

    const token = await signToken(user.id);
    await setAuthCookie(token);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
