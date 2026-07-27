CREATE TABLE "categories" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar(120) PRIMARY KEY NOT NULL,
	"category_id" varchar(64) NOT NULL,
	"name" varchar(180) NOT NULL,
	"description" text NOT NULL,
	"price_cents" integer NOT NULL,
	"unit" varchar(80) NOT NULL,
	"unit_type" varchar(40) NOT NULL,
	"tag" varchar(80) NOT NULL,
	"stock_label" varchar(80) NOT NULL,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"availability" varchar(40) NOT NULL,
	"art" varchar(40) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "products_active_sort_idx" ON "products" USING btree ("active","sort_order");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_price_idx" ON "products" USING btree ("price_cents");