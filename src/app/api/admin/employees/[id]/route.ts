import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getUser();
  if (!currentUser || !["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(currentUser.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const employee = await db.user.findUnique({
    where: { id },
    select: {
      id: true, email: true, firstName: true, lastName: true, role: true,
      location: true, phone: true, hireDate: true, isActive: true, createdAt: true,
      assignments: { include: { module: { include: { section: true } } } },
      completions: { include: { module: true } },
      quizAttempts: { include: { quiz: true }, orderBy: { completedAt: "desc" } },
      trainingPaths: { include: { trainingPath: true } },
    },
  });

  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(employee);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminUser = await getUser();
  if (!adminUser || !["SUPER_ADMIN", "ADMIN"].includes(adminUser.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const data = await request.json();

  if (data.password) {
    const existingUser = await db.user.findUnique({ where: { id }, select: { authId: true } });
    if (existingUser?.authId) {
      const supabaseAdmin = await createAdminClient();
      await supabaseAdmin.auth.admin.updateUserById(existingUser.authId, { password: data.password });
    }
  }

  const updateData: any = {};
  if (data.firstName) updateData.firstName = data.firstName;
  if (data.lastName) updateData.lastName = data.lastName;
  if (data.email) updateData.email = data.email;
  if (data.role) updateData.role = data.role;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const updatedUser = await db.user.update({ where: { id }, data: updateData });

  return NextResponse.json({ id: updatedUser.id, email: updatedUser.email, firstName: updatedUser.firstName, lastName: updatedUser.lastName });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const deleteUser = await getUser();
  if (!deleteUser || !["SUPER_ADMIN"].includes(deleteUser.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  await db.user.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
