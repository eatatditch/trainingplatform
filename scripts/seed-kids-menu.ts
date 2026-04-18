/**
 * Seed the six items from the printed Kids menu into SearchIndex.
 *
 * Usage (from repo root):
 *   npx tsx scripts/seed-kids-menu.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the
 * environment (or in .env.local, which this script loads automatically).
 *
 * Idempotent: re-running updates the existing rows instead of duplicating.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
      "Set them in .env.local or export them before running.",
  );
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface KidsItem {
  id: string;
  title: string;
  category: string;
  price: string;
  badge: string;
  description: string;
  ingredients: string;
  allergens: string[];
  dietary: string[];
  modifications: string;
  extraTags: string[];
}

const KIDS_ITEMS: KidsItem[] = [
  {
    id: "food-kids-fried-chicken-tacos",
    title: "Kids Fried Chicken Tacos",
    category: "Kids",
    price: "$10.85",
    badge: "Kids",
    description:
      "Fried chicken, corn tortillas, mixed cheese. Served with a side fruit cup and a beverage.",
    ingredients:
      "fried chicken, corn tortillas, mixed cheese, fruit cup (pineapple, watermelon), beverage",
    allergens: ["dairy", "gluten"],
    dietary: [],
    modifications:
      "Fruit cup can be swapped for fries at no charge. Confirm gluten cross-contact from shared fryer.",
    extraTags: ["kids", "kids-meal", "tacos", "chicken"],
  },
  {
    id: "food-kids-steak-tacos",
    title: "Kids Steak Tacos",
    category: "Kids",
    price: "$10.85",
    badge: "Kids",
    description:
      "Grilled steak, corn tortillas, mixed cheese. Served with a side fruit cup and a beverage.",
    ingredients:
      "grilled steak, corn tortillas, mixed cheese, fruit cup (pineapple, watermelon), beverage",
    allergens: ["dairy"],
    dietary: ["gluten-friendly"],
    modifications: "Fruit cup can be swapped for fries at no charge.",
    extraTags: ["kids", "kids-meal", "tacos", "steak"],
  },
  {
    id: "food-kids-baja-fish-tacos",
    title: "Kids Baja Fish Tacos",
    category: "Kids",
    price: "$10.85",
    badge: "Kids",
    description:
      "Fried fish, corn tortillas, mixed cheese. Served with a side fruit cup and a beverage.",
    ingredients:
      "fried fish, corn tortillas, mixed cheese, fruit cup (pineapple, watermelon), beverage",
    allergens: ["fish", "dairy", "gluten"],
    dietary: ["pescatarian"],
    modifications:
      "Fruit cup can be swapped for fries at no charge. Confirm gluten cross-contact from shared fryer.",
    extraTags: ["kids", "kids-meal", "tacos", "fish", "fried"],
  },
  {
    id: "food-kids-grilled-fish-tacos",
    title: "Kids Grilled Fish Tacos",
    category: "Kids",
    price: "$10.85",
    badge: "Kids",
    description:
      "Grilled fish, corn tortillas, mixed cheese. Served with a side fruit cup and a beverage.",
    ingredients:
      "grilled fish, corn tortillas, mixed cheese, fruit cup (pineapple, watermelon), beverage",
    allergens: ["fish", "dairy"],
    dietary: ["pescatarian", "gluten-friendly"],
    modifications: "Fruit cup can be swapped for fries at no charge.",
    extraTags: ["kids", "kids-meal", "tacos", "fish", "grilled"],
  },
  {
    id: "food-kids-quesadilla",
    title: "Kids Quesadilla",
    category: "Kids",
    price: "$10.85",
    badge: "Kids, Customizable",
    description:
      "Corn tortillas, mixed cheese. Served with a side fruit cup and a beverage. Add beans +$1, fried chicken +$1, or steak +$1.",
    ingredients: "corn tortillas, mixed cheese, fruit cup (pineapple, watermelon), beverage",
    allergens: ["dairy"],
    dietary: ["vegetarian"],
    modifications:
      "Fruit cup can be swapped for fries at no charge. Add-ons: beans (+$1), fried chicken (+$1), steak (+$1). Adding fried chicken introduces shared-fryer gluten risk.",
    extraTags: ["kids", "kids-meal", "quesadilla"],
  },
  {
    id: "food-kids-fruit-cup",
    title: "Fruit Cup",
    category: "Kids",
    price: "$3.25",
    badge: "Kids, Side",
    description:
      "Fresh pineapple & watermelon cubes. Available as the default kids side or à la carte.",
    ingredients: "pineapple, watermelon",
    allergens: [],
    dietary: ["vegan", "vegetarian", "gluten-free", "dairy-free"],
    modifications: "None — whole fruit only.",
    extraTags: ["kids", "kids-meal", "side", "fruit"],
  },
];

function serializeContent(item: KidsItem): string {
  const lines: string[] = [];
  lines.push(`Category: ${item.category}`);
  lines.push(`Price: ${item.price}`);
  if (item.badge) lines.push(`Badge: ${item.badge}`);
  lines.push(`Description: ${item.description}`);
  lines.push(`Ingredients: ${item.ingredients}`);
  lines.push(`Contains: ${item.allergens.length ? item.allergens.join(", ") : "none"}`);
  lines.push(`Dietary: ${item.dietary.length ? item.dietary.join(", ") : "none"}`);
  if (item.modifications) lines.push(`Modifications: ${item.modifications}`);
  return lines.join("\n");
}

function buildTags(item: KidsItem): string[] {
  const set = new Set<string>();
  set.add("food");
  set.add(item.category.toLowerCase());
  for (const a of item.allergens) set.add(`contains-${a}`);
  for (const d of item.dietary) set.add(d);
  for (const t of item.extraTags) set.add(t.toLowerCase());
  return Array.from(set);
}

async function main() {
  console.log(`Seeding ${KIDS_ITEMS.length} kids menu items into SearchIndex...`);

  const rows = KIDS_ITEMS.map((item) => ({
    id: item.id,
    moduleId: "mod-menu-food",
    contentType: "food",
    title: item.title,
    content: serializeContent(item),
    tags: buildTags(item),
  }));

  const { error } = await db.from("SearchIndex").upsert(rows, { onConflict: "id" });

  if (error) {
    console.error("Upsert failed:", error.message);
    process.exit(1);
  }

  for (const r of rows) console.log(`  ✓ ${r.id}  —  ${r.title}`);
  console.log(`\nDone. ${rows.length} items upserted.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
