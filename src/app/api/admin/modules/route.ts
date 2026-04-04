import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const sectionId = request.nextUrl.searchParams.get("sectionId");
  const modules = await db.module.findMany({
    where: sectionId ? { sectionId } : {},
    include: { section: true, quiz: true, assets: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(modules);
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const data = await request.json();
  const slug = slugify(data.title);

  const mod = await db.module.create({
    data: {
      sectionId: data.sectionId,
      title: data.title,
      description: data.description || "",
      slug,
      content: data.content || "",
      estimatedMinutes: data.estimatedMinutes || null,
      isRequired: data.isRequired || false,
      isActive: true,
      sortOrder: data.sortOrder || 0,
      tags: data.tags || [],
    },
  });

  return NextResponse.json(mod);
}
