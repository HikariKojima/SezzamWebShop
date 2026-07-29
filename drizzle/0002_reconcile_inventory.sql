WITH completed_quantities AS (
	SELECT "product_id", SUM("quantity")::integer AS "quantity"
	FROM "order_items"
	INNER JOIN "orders" ON "orders"."id" = "order_items"."order_id"
	WHERE "orders"."status" = 'completed'
	GROUP BY "product_id"
)
UPDATE "products"
SET "stock_quantity" = GREATEST(
	"products"."stock_quantity" - COALESCE("completed_quantities"."quantity", 0),
	0
)
FROM "completed_quantities"
WHERE "products"."id" = "completed_quantities"."product_id";
--> statement-breakpoint
UPDATE "products"
SET "reserved_quantity" = COALESCE(
	(
		SELECT SUM("order_items"."quantity")::integer
		FROM "order_items"
		INNER JOIN "orders" ON "orders"."id" = "order_items"."order_id"
		WHERE "order_items"."product_id" = "products"."id"
			AND "orders"."status" IN ('pending', 'confirmed', 'ready')
	),
	0
);
