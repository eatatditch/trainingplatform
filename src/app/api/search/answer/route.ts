import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query) {
    return NextResponse.json({ answer: null, results: [] });
  }

  const queryLower = query.toLowerCase();
  const searchTerms = queryLower.split(/\s+/).filter((t) => t.length > 2);

  // Step 1: Search the SearchIndex for individual recipes FIRST
  // This gives precise answers for "what's in the hang 10 marg" type questions
  const { data: indexResults } = await db
    .from("SearchIndex")
    .select("*, module:Module(title, slug, section:Section(title, slug))")
    .eq("contentType", "recipe");

  // Score recipe index entries
  const scoredRecipes = (indexResults || []).map((item: any) => {
    const titleLower = item.title.toLowerCase();
    const contentLower = item.content.toLowerCase();
    const allTags = (item.tags || []).map((t: string) => t.toLowerCase());

    let score = 0;

    // Exact recipe name in query (highest priority)
    // Strip common words to find the drink name
    const drinkTerms = queryLower
      .replace(/how do (i|you) make (a |an |the )?/gi, "")
      .replace(/what('s| is| goes) in (a |an |the )?/gi, "")
      .replace(/recipe for (a |an |the )?/gi, "")
      .replace(/\b(recipe|spec|ingredients|what|how|make|whats)\b/gi, "")
      .trim();

    if (drinkTerms && titleLower.includes(drinkTerms)) score += 200;
    if (drinkTerms && contentLower.includes(drinkTerms)) score += 100;

    // Tag matches
    for (const term of searchTerms) {
      if (allTags.includes(term)) score += 50;
      if (allTags.some((t: string) => t.includes(term))) score += 30;
      if (titleLower.includes(term)) score += 40;
      if (contentLower.includes(term)) score += 10;
    }

    // Boost exact phrase match
    if (contentLower.includes(queryLower)) score += 150;

    return {
      ...item,
      score,
      sectionTitle: item.module?.section?.title || "",
      sectionSlug: item.module?.section?.slug || "",
      moduleSlug: item.module?.slug || "",
      moduleTitle: item.module?.title || "",
    };
  })
  .filter((item: any) => item.score > 0)
  .sort((a: any, b: any) => b.score - a.score);

  // Step 2: Also search modules (for non-recipe questions)
  const { data: modules } = await db
    .from("Module")
    .select("id, title, slug, description, content, tags, section:Section(title, slug)")
    .eq("isActive", true);

  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();

  const scoredModules = (modules || []).map((mod: any) => {
    const plainContent = stripHtml(mod.content || "");
    const allText = `${mod.title} ${mod.description || ""} ${plainContent} ${(mod.tags || []).join(" ")}`.toLowerCase();

    let score = 0;
    if (allText.includes(queryLower)) score += 50;
    for (const term of searchTerms) {
      if (mod.title?.toLowerCase().includes(term)) score += 15;
      if (mod.description?.toLowerCase().includes(term)) score += 10;
      if (plainContent.toLowerCase().includes(term)) score += 5;
      if ((mod.tags || []).some((t: string) => t.toLowerCase().includes(term))) score += 8;
    }

    let snippet = "";
    if (score > 0 && plainContent) {
      for (const term of searchTerms) {
        const idx = plainContent.toLowerCase().indexOf(term);
        if (idx !== -1) {
          const start = Math.max(0, idx - 60);
          const end = Math.min(plainContent.length, idx + 200);
          snippet = (start > 0 ? "..." : "") + plainContent.substring(start, end).trim() + (end < plainContent.length ? "..." : "");
          break;
        }
      }
    }

    return {
      id: mod.id,
      title: mod.title,
      description: snippet || mod.description,
      sectionTitle: mod.section?.title || "",
      sectionSlug: mod.section?.slug || "",
      moduleSlug: mod.slug,
      tags: mod.tags || [],
      score,
    };
  })
  .filter((m: any) => m.score > 0)
  .sort((a: any, b: any) => b.score - a.score);

  // Build response — recipe answers take absolute priority
  let answer = null;

  if (scoredRecipes.length > 0 && scoredRecipes[0].score >= 30) {
    const top = scoredRecipes[0];
    answer = {
      text: top.content,
      source: {
        title: top.moduleTitle,
        section: top.sectionTitle,
        sectionSlug: top.sectionSlug,
        moduleSlug: top.moduleSlug,
      },
      confidence: top.score >= 150 ? "high" : top.score >= 50 ? "medium" : "low",
    };
  } else if (scoredModules.length > 0 && scoredModules[0].score >= 10) {
    const top = scoredModules[0];
    answer = {
      text: top.description,
      source: {
        title: top.title,
        section: top.sectionTitle,
        sectionSlug: top.sectionSlug,
        moduleSlug: top.moduleSlug,
      },
      confidence: top.score >= 50 ? "high" : top.score >= 20 ? "medium" : "low",
    };
  }

  // Combine results — recipes first, then modules (deduplicated)
  const recipeResults = scoredRecipes.slice(0, 5).map((r: any) => ({
    id: r.moduleId || r.id,
    type: "recipe" as const,
    title: r.title,
    description: r.content.substring(0, 150) + "...",
    sectionTitle: r.sectionTitle,
    sectionSlug: r.sectionSlug,
    moduleSlug: r.moduleSlug,
    tags: r.tags,
  }));

  const moduleResults = scoredModules.slice(0, 10).map((m: any) => ({
    id: m.id,
    type: "module" as const,
    title: m.title,
    description: m.description,
    sectionTitle: m.sectionTitle,
    sectionSlug: m.sectionSlug,
    moduleSlug: m.moduleSlug,
    tags: m.tags,
  }));

  // Deduplicate by moduleSlug
  const seen = new Set<string>();
  const results = [...recipeResults, ...moduleResults].filter((r) => {
    const key = r.moduleSlug || r.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return NextResponse.json({ answer, results: results.slice(0, 15) });
}
