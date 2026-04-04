import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const announcements = await db.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: { createdByUser: { select: { firstName: true, lastName: true } } },
  });
  return NextResponse.json(announcements);
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const data = await request.json();

  const announcement = await db.announcement.create({
    data: {
      title: data.title,
      content: data.content,
      priority: data.priority || "NORMAL",
      isActive: true,
      createdById: user.id,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });

  return NextResponse.json(announcement);
}
