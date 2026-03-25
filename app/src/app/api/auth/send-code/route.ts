import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || !/^1\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: "请输入正确的11位手机号" },
        { status: 400 }
      );
    }

    // 模拟发送验证码，固定验证码 123456
    return NextResponse.json({ ok: true, message: "验证码已发送" });
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
}
