import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user || !["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const role = request.nextUrl.searchParams.get("role");
  const location = request.nextUrl.searchParams.get("location");

  const users = await db.user.findMany({
    where: {
      ...(role ? { role: role as any } : {}),
      ...(location ? { location } : {}),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      location: true,
      phone: true,
      hireDate: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          completions: true,
          assignments: true,
        },
      },
    },
    orderBy: { lastName: "asc" },
  });

  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const adminUser = await getUser();
  if (!adminUser || !["SUPER_ADMIN", "ADMIN"].includes(adminUser.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const data = await request.json();

  const existing = await db.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return NextResponse.json({ error: "Email already exists" }, { status: 400 });
  }

  const supabaseAdmin = await createAdminClient();
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: data.password || "ditch2024",
    email_confirm: true,
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const newUser = await db.user.create({
    data: {
      authId: authData.user.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || "EMPLOYEE",
      location: data.location || "",
      phone: data.phone || "",
      hireDate: data.hireDate ? new Date(data.hireDate) : new Date(),
      isActive: true,
    },
  });

  return NextResponse.json({ id: newUser.id, email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName });
}
