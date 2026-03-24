import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ title: "" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json({ title: "" });
    }

    const html = await res.text();

    let title = "";

    const ogMatch = html.match(
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
    ) ?? html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i
    );
    if (ogMatch) {
      title = ogMatch[1];
    }

    if (!title) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        title = titleMatch[1];
      }
    }

    title = title
      .replace(/[_\-|]?\s*(哔哩哔哩|bilibili|Bilibili|B站).*$/i, "")
      .replace(/[_\-|]?\s*YouTube$/i, "")
      .replace(/[_\-|]?\s*TED\s*(Talk)?$/i, "")
      .replace(/[_\-|]?\s*(知乎|豆瓣|得到|喜马拉雅).*$/i, "")
      .replace(/^\s+|\s+$/g, "")
      .slice(0, 60);

    return NextResponse.json({ title });
  } catch {
    return NextResponse.json({ title: "" });
  }
}
