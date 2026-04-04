import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json({
        authenticated: false,
        error: authError.message,
        code: authError.status,
      });
    }

    if (!authUser) {
      return NextResponse.json({
        authenticated: false,
        error: "No auth user found in session cookies",
      });
    }

    // Check profile
    const { data: profile, error: profileError } = await db
      .from("User")
      .select("id, email, firstName, lastName, role")
      .eq("authId", authUser.id)
      .eq("isActive", true)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({
        authenticated: true,
        authUser: { id: authUser.id, email: authUser.email },
        profileFound: false,
        profileError: profileError?.message || "No matching User row",
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: profile,
    });
  } catch (err: any) {
    return NextResponse.json({
      authenticated: false,
      error: `Server exception: ${err.message}`,
    }, { status: 500 });
  }
}
