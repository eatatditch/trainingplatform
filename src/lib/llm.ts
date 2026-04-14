import Anthropic from "@anthropic-ai/sdk";
import { db } from "./db";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

const MODEL = "claude-haiku-4-5-20251001";

async function buildMenuContext(): Promise<string> {
  const [foodRes, recipeRes, configRes, ingRes, linkRes, defRes] = await Promise.all([
    db.from("SearchIndex").select("id, title, content, tags").eq("contentType", "food"),
    db.from("SearchIndex").select("title, content, tags").eq("contentType", "recipe"),
    db.from("KitchenConfig").select("key, value, label, notes").then(
      (r) => r,
      () => ({ data: [] as any[] })
    ),
    db.from("Ingredient").select("id, name, allergens, substitutes, notes").then(
      (r) => r,
      () => ({ data: [] as any[] })
    ),
    db.from("FoodItemIngredient").select("*").then(
      (r) => r,
      () => ({ data: [] as any[] })
    ),
    db.from("DietaryDefinition").select("*").order("sortOrder").then(
      (r) => r,
      () => ({ data: [] as any[] })
    ),
  ]);

  const sections: string[] = [];

  const defs = (defRes as any).data || [];
  if (defs.length > 0) {
    sections.push(
      "# DIETARY TERM DEFINITIONS (use these exact meanings; do not invent or soften)\n\n" +
        defs
          .map(
            (d: any) =>
              `- **${d.label}** (${d.key}): ${d.short_description} ${d.full_description}${
                d.safe_for_celiac === true
                  ? " [SAFE FOR CELIAC]"
                  : d.safe_for_celiac === false
                  ? " [NOT SAFE FOR CELIAC]"
                  : ""
              }`
          )
          .join("\n")
    );
  }

  const config = (configRes as any).data || [];
  if (config.length > 0) {
    sections.push(
      "# KITCHEN CONFIG (CRITICAL — applies to all items)\n\n" +
        config
          .map(
            (c: any) =>
              `- ${c.label || c.key}: ${JSON.stringify(c.value)}${c.notes ? ` — ${c.notes}` : ""}`
          )
          .join("\n")
    );
  }

  const ingredients = (ingRes as any).data || [];
  if (ingredients.length > 0) {
    sections.push(
      "# INGREDIENT LIBRARY (allergens flow from these to any linked dish)\n\n" +
        ingredients
          .map(
            (i: any) =>
              `- ${i.name}: contains [${(i.allergens || []).join(", ") || "none"}]${
                i.substitutes?.length ? `, substitutes: [${i.substitutes.join(", ")}]` : ""
              }${i.notes ? ` — ${i.notes}` : ""}`
          )
          .join("\n")
    );
  }

  const links = (linkRes as any).data || [];
  const ingredientsByFoodId: Record<string, string[]> = {};
  const ingredientById: Record<string, any> = {};
  for (const ing of ingredients) ingredientById[ing.id] = ing;
  for (const link of links) {
    const name = ingredientById[link.ingredientId]?.name;
    if (!name) continue;
    if (!ingredientsByFoodId[link.foodItemId]) ingredientsByFoodId[link.foodItemId] = [];
    ingredientsByFoodId[link.foodItemId].push(name);
  }

  if (foodRes.data && foodRes.data.length > 0) {
    sections.push(
      "# FOOD MENU\n\n" +
        foodRes.data
          .map((f: any) => {
            const linked = ingredientsByFoodId[f.id] || [];
            return `## ${f.title}\n${f.content}\nTags: ${(f.tags || []).join(", ")}${
              linked.length ? `\nLinked ingredients: ${linked.join(", ")}` : ""
            }`;
          })
          .join("\n\n---\n\n")
    );
  }

  if (recipeRes.data && recipeRes.data.length > 0) {
    sections.push(
      "# COCKTAIL RECIPES\n\n" +
        recipeRes.data
          .map(
            (r: any) =>
              `## ${r.title}\n${r.content}\nTags: ${(r.tags || []).join(", ")}`
          )
          .join("\n\n---\n\n")
    );
  }

  return sections.join("\n\n═══════════════════════════════════════\n\n");
}

const SYSTEM_PROMPT = `You are SpecOS, an instant-answer assistant for Ditch restaurant staff during service. They are mid-shift and need fast, accurate answers about the menu, cocktails, and operations.

Rules:
1. Answer ONLY from the provided menu/recipe/config context. Never invent items, prices, or ingredients.
2. Be concise. Staff are busy. Short, punchy answers.
3. For any allergy or dietary question, ALWAYS:
   - Give a clear verdict ("safe", "warning", or "info")
   - Use the DIETARY TERM DEFINITIONS section verbatim — do not soften "gluten-friendly" to imply safety for celiac.
   - Check the KITCHEN CONFIG for cross-contamination flags (shared fryer, shared grill, etc.)
   - Include: "Confirm with kitchen before serving."
4. If the answer requires multiple items (e.g. "vegan options"), list them.
5. If the question is outside scope or the context doesn't cover it, say so — don't guess.

Respond ONLY with a JSON object matching this exact shape:
{
  "verdict": "safe" | "warning" | "info",
  "title": "short headline, under 60 chars",
  "answer": "2-4 sentence answer for the staff member",
  "items": ["Item Name 1", "Item Name 2"]
}

Do not wrap in markdown. Do not add commentary. Just the JSON object.`;

export interface LLMAnswer {
  verdict: "safe" | "warning" | "info";
  title: string;
  answer: string;
  items?: string[];
}

export async function askLLM(query: string): Promise<LLMAnswer | null> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("[llm] skipped — ANTHROPIC_API_KEY not set");
    return null;
  }

  console.log("[llm] invoking for query:", query);

  try {
    const context = await buildMenuContext();
    console.log("[llm] context built, length:", context.length);

    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: [
        { type: "text", text: SYSTEM_PROMPT },
        {
          type: "text",
          text: `MENU & OPERATIONS CONTEXT:\n\n${context}`,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: query }],
    });

    console.log("[llm] response usage:", JSON.stringify(msg.usage));

    const textBlock = msg.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      console.warn("[llm] no text block in response");
      return null;
    }

    const raw = textBlock.text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    try {
      const parsed = JSON.parse(raw) as LLMAnswer;
      if (!parsed.verdict || !parsed.answer) {
        console.warn("[llm] parsed JSON missing required fields:", raw);
        return null;
      }
      console.log("[llm] success:", parsed.title);
      return parsed;
    } catch (parseErr) {
      console.error("[llm] JSON parse failed. Raw response:", raw);
      return null;
    }
  } catch (err: any) {
    console.error("[llm] API error:", err?.message || err, err?.status);
    return null;
  }
}

export function shouldUseLLM(query: string): boolean {
  const trimmed = query.trim();
  if (trimmed.length < 6) return false;
  const lower = trimmed.toLowerCase();
  if (/\?|^(what|which|how|why|when|can|should|is|are|does|do|recommend|suggest)\b/i.test(lower)) {
    return true;
  }
  if (/\b(allerg|low[- ]carb|keto|healthy|kid|vegetarian|vegan|pair|go with)\b/i.test(lower)) {
    return true;
  }
  const words = trimmed.split(/\s+/).filter((w) => w.length > 1);
  return words.length >= 4;
}
