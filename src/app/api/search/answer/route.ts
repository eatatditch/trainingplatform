import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query) {
    return NextResponse.json({ answer: null, results: [] });
  }

  const queryLower = query.toLowerCase();
  const searchTerms = queryLower.split(/\s+/).filter((t) => t.length > 2);

  // Search across all module content for matching text
  const { data: modules } = await db
    .from("Module")
    .select("id, title, slug, description, content, tags, section:Section(title, slug)")
    .eq("isActive", true);

  if (!modules || modules.length === 0) {
    return NextResponse.json({ answer: null, results: [] });
  }

  // Strip HTML tags for text search
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();

  // Score and rank modules by relevance to the query
  const scored = modules.map((mod: any) => {
    const plainContent = stripHtml(mod.content || "");
    const allText = `${mod.title} ${mod.description || ""} ${plainContent} ${(mod.tags || []).join(" ")}`.toLowerCase();

    let score = 0;

    // Exact phrase match in content (highest value)
    if (allText.includes(queryLower)) score += 100;

    // Individual term matches
    for (const term of searchTerms) {
      if (mod.title?.toLowerCase().includes(term)) score += 30;
      if (mod.description?.toLowerCase().includes(term)) score += 20;
      if (plainContent.toLowerCase().includes(term)) score += 10;
      if ((mod.tags || []).some((t: string) => t.toLowerCase().includes(term))) score += 15;
    }

    // Find the best matching snippet from content
    let snippet = "";
    if (score > 0 && plainContent) {
      const idx = plainContent.toLowerCase().indexOf(queryLower);
      if (idx !== -1) {
        const start = Math.max(0, idx - 80);
        const end = Math.min(plainContent.length, idx + queryLower.length + 200);
        snippet = (start > 0 ? "..." : "") + plainContent.substring(start, end).trim() + (end < plainContent.length ? "..." : "");
      } else {
        // Find first matching term
        for (const term of searchTerms) {
          const termIdx = plainContent.toLowerCase().indexOf(term);
          if (termIdx !== -1) {
            const start = Math.max(0, termIdx - 60);
            const end = Math.min(plainContent.length, termIdx + 250);
            snippet = (start > 0 ? "..." : "") + plainContent.substring(start, end).trim() + (end < plainContent.length ? "..." : "");
            break;
          }
        }
      }
    }

    // Extract structured answer for recipe/ingredient questions
    let directAnswer = "";
    if (plainContent) {
      // Look for recipe-style content near the query match
      const lines = plainContent.split(/(?:Glass:|Procedure:|Ingredients:|Garnish:|\n)/i);
      for (const line of lines) {
        const lineLower = line.toLowerCase().trim();
        for (const term of searchTerms) {
          if (lineLower.includes(term) && line.trim().length > 10) {
            directAnswer = line.trim().substring(0, 300);
            break;
          }
        }
        if (directAnswer) break;
      }

      // For "what's in" / "recipe" / "ingredients" type questions
      if (queryLower.includes("what") || queryLower.includes("recipe") || queryLower.includes("ingredient") || queryLower.includes("how to make") || queryLower.includes("spec")) {
        // Find the section of content that contains the drink/food name
        const contentSections = (mod.content || "").split(/<h[23][^>]*>/i);
        for (const section of contentSections) {
          const sectionText = stripHtml(section).toLowerCase();
          for (const term of searchTerms) {
            if (sectionText.includes(term) && section.length > 20) {
              directAnswer = stripHtml(section).substring(0, 500).trim();
              break;
            }
          }
          if (directAnswer.length > 50) break;
        }
      }

      // For "is it gluten free" / "vegan" / "vegetarian" type questions
      if (queryLower.includes("gluten") || queryLower.includes("vegan") || queryLower.includes("vegetarian") || queryLower.includes("allergy") || queryLower.includes("dairy") || queryLower.includes("nut")) {
        const dietaryTerms = ["gf", "gluten-free", "gluten free", "vegetarian", "vegan", "contains nuts", "dairy"];
        for (const dt of dietaryTerms) {
          if (plainContent.toLowerCase().includes(dt)) {
            const dtIdx = plainContent.toLowerCase().indexOf(dt);
            const start = Math.max(0, dtIdx - 100);
            const end = Math.min(plainContent.length, dtIdx + 200);
            directAnswer = plainContent.substring(start, end).trim();
            break;
          }
        }
      }
    }

    return {
      id: mod.id,
      title: mod.title,
      description: mod.description,
      sectionTitle: mod.section?.title || "",
      sectionSlug: mod.section?.slug || "",
      moduleSlug: mod.slug,
      tags: mod.tags || [],
      score,
      snippet,
      directAnswer,
    };
  })
  .filter((m: any) => m.score > 0)
  .sort((a: any, b: any) => b.score - a.score);

  // Build the answer response
  const topResult = scored[0];
  let answer = null;

  if (topResult && topResult.score >= 10) {
    answer = {
      text: topResult.directAnswer || topResult.snippet || topResult.description,
      source: {
        title: topResult.title,
        section: topResult.sectionTitle,
        sectionSlug: topResult.sectionSlug,
        moduleSlug: topResult.moduleSlug,
      },
      confidence: topResult.score >= 100 ? "high" : topResult.score >= 30 ? "medium" : "low",
    };
  }

  const results = scored.slice(0, 10).map((m: any) => ({
    id: m.id,
    type: "module",
    title: m.title,
    description: m.snippet || m.description,
    sectionTitle: m.sectionTitle,
    sectionSlug: m.sectionSlug,
    moduleSlug: m.moduleSlug,
    tags: m.tags,
  }));

  return NextResponse.json({ answer, results });
}
