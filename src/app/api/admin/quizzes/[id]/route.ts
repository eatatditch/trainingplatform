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

  // Build update payload — only include provided fields
  const updatePayload: any = {};
  if (data.title !== undefined) updatePayload.title = data.title;
  if (data.description !== undefined) updatePayload.description = data.description;
  if (data.passingScore !== undefined) updatePayload.passingScore = data.passingScore;
  if (data.retryLimit !== undefined) updatePayload.retryLimit = data.retryLimit;
  if (data.isRequired !== undefined) updatePayload.isRequired = data.isRequired;
  if ("moduleId" in data) updatePayload.moduleId = data.moduleId; // null = detach from module
  if ("sectionId" in data) updatePayload.sectionId = data.sectionId; // null = detach from section

  const { data: quiz, error } = await db
    .from("Quiz")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If questions provided, replace them
  if (data.questions) {
    await db.from("QuizQuestion").delete().eq("quizId", id);
    await db.from("QuizQuestion").insert(
      data.questions.map((q: any, i: number) => ({
        quizId: id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options || null,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "",
        sortOrder: i,
      }))
    );
  }

  return NextResponse.json(quiz);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  await db.from("Quiz").delete().eq("id", id);
  return NextResponse.json({ success: true });
}
