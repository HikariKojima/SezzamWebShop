CREATE TABLE IF NOT EXISTS "site_settings" (
	"id" varchar(64) PRIMARY KEY DEFAULT 'homepage' NOT NULL,
	"hero_tagline" text,
	"hero_title" text,
	"hero_subtitle" text,
	"hero_image_url" text,
	"spotlight_quote" text,
	"spotlight_image_url" text,
	"spotlight_title" text,
	"spotlight_subtitle" text,
	"contact_phone" text,
	"contact_email" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
