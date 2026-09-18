ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "images" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "has_dual_side" boolean DEFAULT false NOT NULL;
