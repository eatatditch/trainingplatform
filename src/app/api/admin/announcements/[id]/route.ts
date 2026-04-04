import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const data = await request.json();

  const announcement = await db.announcement.update({
    where: { id },
    data: {
      title: data.title,
      content: data.content,
      priority: data.priority,
      isActive: data.isActive,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });

  return NextResponse.json(announcement);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  await db.announcement.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
