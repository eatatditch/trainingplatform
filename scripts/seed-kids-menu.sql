-- Seed the six items from the printed Kids menu into SearchIndex.
--
-- HOW TO RUN (no laptop required):
--   1. Open your Supabase project dashboard.
--   2. Left sidebar → SQL Editor → New query.
--   3. Paste this whole file in.
--   4. Click Run.
--
-- Idempotent: ON CONFLICT updates the existing row, so re-running is safe.

INSERT INTO "SearchIndex" (id, "moduleId", "contentType", title, content, tags) VALUES
(
  'food-kids-fried-chicken-tacos',
  'mod-menu-food',
  'food',
  'Kids Fried Chicken Tacos',
  E'Category: Kids\nPrice: $10.85\nBadge: Kids\nDescription: Fried chicken, corn tortillas, mixed cheese. Served with a side fruit cup and a beverage.\nIngredients: fried chicken, corn tortillas, mixed cheese, fruit cup (pineapple, watermelon), beverage\nContains: dairy, gluten\nDietary: none\nModifications: Fruit cup can be swapped for fries at no charge. Confirm gluten cross-contact from shared fryer.',
  ARRAY['food','kids','contains-dairy','contains-gluten','kids-meal','tacos','chicken']
),
(
  'food-kids-steak-tacos',
  'mod-menu-food',
  'food',
  'Kids Steak Tacos',
  E'Category: Kids\nPrice: $10.85\nBadge: Kids\nDescription: Grilled steak, corn tortillas, mixed cheese. Served with a side fruit cup and a beverage.\nIngredients: grilled steak, corn tortillas, mixed cheese, fruit cup (pineapple, watermelon), beverage\nContains: dairy\nDietary: gluten-friendly\nModifications: Fruit cup can be swapped for fries at no charge.',
  ARRAY['food','kids','contains-dairy','gluten-friendly','kids-meal','tacos','steak']
),
(
  'food-kids-baja-fish-tacos',
  'mod-menu-food',
  'food',
  'Kids Baja Fish Tacos',
  E'Category: Kids\nPrice: $10.85\nBadge: Kids\nDescription: Fried fish, corn tortillas, mixed cheese. Served with a side fruit cup and a beverage.\nIngredients: fried fish, corn tortillas, mixed cheese, fruit cup (pineapple, watermelon), beverage\nContains: fish, dairy, gluten\nDietary: pescatarian\nModifications: Fruit cup can be swapped for fries at no charge. Confirm gluten cross-contact from shared fryer.',
  ARRAY['food','kids','contains-fish','contains-dairy','contains-gluten','pescatarian','kids-meal','tacos','fish','fried']
),
(
  'food-kids-grilled-fish-tacos',
  'mod-menu-food',
  'food',
  'Kids Grilled Fish Tacos',
  E'Category: Kids\nPrice: $10.85\nBadge: Kids\nDescription: Grilled fish, corn tortillas, mixed cheese. Served with a side fruit cup and a beverage.\nIngredients: grilled fish, corn tortillas, mixed cheese, fruit cup (pineapple, watermelon), beverage\nContains: fish, dairy\nDietary: pescatarian, gluten-friendly\nModifications: Fruit cup can be swapped for fries at no charge.',
  ARRAY['food','kids','contains-fish','contains-dairy','pescatarian','gluten-friendly','kids-meal','tacos','fish','grilled']
),
(
  'food-kids-quesadilla',
  'mod-menu-food',
  'food',
  'Kids Quesadilla',
  E'Category: Kids\nPrice: $10.85\nBadge: Kids, Customizable\nDescription: Corn tortillas, mixed cheese. Served with a side fruit cup and a beverage. Add beans +$1, fried chicken +$1, or steak +$1.\nIngredients: corn tortillas, mixed cheese, fruit cup (pineapple, watermelon), beverage\nContains: dairy\nDietary: vegetarian\nModifications: Fruit cup can be swapped for fries at no charge. Add-ons: beans (+$1), fried chicken (+$1), steak (+$1). Adding fried chicken introduces shared-fryer gluten risk.',
  ARRAY['food','kids','contains-dairy','vegetarian','kids-meal','quesadilla']
),
(
  'food-kids-fruit-cup',
  'mod-menu-food',
  'food',
  'Fruit Cup',
  E'Category: Kids\nPrice: $3.25\nBadge: Kids, Side\nDescription: Fresh pineapple & watermelon cubes. Available as the default kids side or a la carte.\nIngredients: pineapple, watermelon\nContains: none\nDietary: vegan, vegetarian, gluten-free, dairy-free\nModifications: None - whole fruit only.',
  ARRAY['food','kids','vegan','vegetarian','gluten-free','dairy-free','kids-meal','side','fruit']
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  tags = EXCLUDED.tags,
  "moduleId" = EXCLUDED."moduleId",
  "contentType" = EXCLUDED."contentType";
