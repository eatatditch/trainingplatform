import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";

// Public GET — used by training platform menu page to render definitions.
export async function GET() {
  const { data } = await db
    .from("DietaryDefinition")
    .select("*")
    .order("sortOrder");
  return NextResponse.json(data || []);
}

async function assertAdmin() {
  const user = await getUser();
  if (!user || !["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(user.role)) return false;
  return true;
}

export async function PUT(request: NextRequest) {
  if (!(await assertAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { key, label, short_description, full_description, safe_for_celiac, icon, sortOrder } =
    await request.json();
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });

  const { error } = await db
    .from("DietaryDefinition")
    .upsert({
      key,
      label,
      short_description,
      full_description,
      safe_for_celiac,
      icon,
      sortOrder,
      updatedAt: new Date().toISOString(),
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!(await assertAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const key = request.nextUrl.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
  await db.from("DietaryDefinition").delete().eq("key", key);
  return NextResponse.json({ ok: true });
}
