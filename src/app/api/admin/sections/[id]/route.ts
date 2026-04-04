import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const data = await request.json();

  const section = await db.section.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      slug: data.title ? slugify(data.title) : undefined,
      icon: data.icon,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    },
  });

  return NextResponse.json(section);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  await db.section.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
