UPDATE "orders"
SET "status" = 'pending', "updated_at" = NOW()
WHERE "status" = 'confirmed';
