-- Phase 1, PR 1 — Add job position to User.
--
-- HOW TO RUN (no laptop required):
--   1. Open your Supabase project dashboard.
--   2. Left sidebar → SQL Editor → New query.
--   3. Paste this whole file in.
--   4. Click Run.
--
-- Idempotent: re-running is safe. Uses ADD COLUMN IF NOT EXISTS.
--
-- Distinct from User.role (permission tier). Position is the floor job:
-- Server, Bartender, Support Staff, Trainer, Line Cook, Prep Cook,
-- Dishwasher, General Manager, Assistant General Manager, Bar Manager,
-- FOH Supervisor, Kitchen Manager, Assistant Kitchen Manager, BOH Supervisor.

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "position" TEXT;

-- Optional: index for position-based queries (list by position, assign paths).
CREATE INDEX IF NOT EXISTS "User_position_idx" ON "User" ("position");
