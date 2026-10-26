CREATE TABLE "crops" (
	"id" serial PRIMARY KEY NOT NULL,
	"common_name" varchar(160) NOT NULL,
	"slug" varchar(160) NOT NULL,
	"family_id" integer NOT NULL,
	"nutrient_demand" varchar(24) DEFAULT 'sedang' NOT NULL,
	"soil_impact" varchar(24) DEFAULT 'netral' NOT NULL,
	"days_to_harvest" integer,
	"min_ph" numeric(3, 1),
	"max_ph" numeric(3, 1),
	"emoji" varchar(12),
	"description" text,
	CONSTRAINT "crops_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "farms" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL,
	"name" varchar(160) NOT NULL,
	"location" varchar(200),
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plant_families" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"local_name" varchar(120),
	"description" text,
	"pest_risk" text,
	CONSTRAINT "plant_families_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "plantings" (
	"id" serial PRIMARY KEY NOT NULL,
	"plot_id" integer NOT NULL,
	"crop_id" integer NOT NULL,
	"planted_on" date NOT NULL,
	"harvested_on" date,
	"status" varchar(24) DEFAULT 'berjalan' NOT NULL,
	"yield_kg" numeric(10, 2),
	"notes" text,
	"pest_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plots" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"name" varchar(160) NOT NULL,
	"area" numeric(10, 2),
	"area_unit" varchar(24) DEFAULT 'm2' NOT NULL,
	"soil_type" varchar(80),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(120) NOT NULL,
	"full_name" varchar(160),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "soil_tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"plot_id" integer NOT NULL,
	"tested_on" date NOT NULL,
	"ph" numeric(4, 1) NOT NULL,
	"n" numeric(10, 2),
	"p" numeric(10, 2),
	"k" numeric(10, 2),
	"organic_matter" numeric(6, 2),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "crops" ADD CONSTRAINT "crops_family_id_plant_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."plant_families"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farms" ADD CONSTRAINT "farms_owner_id_profiles_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plantings" ADD CONSTRAINT "plantings_plot_id_plots_id_fk" FOREIGN KEY ("plot_id") REFERENCES "public"."plots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plantings" ADD CONSTRAINT "plantings_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plots" ADD CONSTRAINT "plots_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soil_tests" ADD CONSTRAINT "soil_tests_plot_id_plots_id_fk" FOREIGN KEY ("plot_id") REFERENCES "public"."plots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "crops_family_idx" ON "crops" USING btree ("family_id");--> statement-breakpoint
CREATE INDEX "farms_owner_idx" ON "farms" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "plantings_plot_idx" ON "plantings" USING btree ("plot_id");--> statement-breakpoint
CREATE INDEX "plots_farm_idx" ON "plots" USING btree ("farm_id");--> statement-breakpoint
CREATE INDEX "soil_tests_plot_idx" ON "soil_tests" USING btree ("plot_id");